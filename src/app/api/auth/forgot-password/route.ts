import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/mail';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiresAt = addHours(new Date(), 1); // Token expires in 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: resetTokenExpiresAt,
      },
    });

    // Send password reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - Departmental Portal',
        html: getPasswordResetEmailHtml(resetToken),
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Return success anyway to prevent email enumeration
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent',
      // For development only - remove this in production
      debugToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
