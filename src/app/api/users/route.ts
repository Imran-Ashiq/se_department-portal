import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendEmail, getInvitationEmailHtml } from '@/lib/mail';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN', 'CLERK', 'TEACHER']),
});

// GET /api/users - List all ADMIN and SUPER_ADMIN users (SUPER_ADMIN only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN', 'CLERK', 'TEACHER'],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

// POST /api/users/invite - Invite a new faculty member (SUPER_ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only HOD can invite new faculty' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = inviteSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create user with a temporary password
    const tempPassword = randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Send invitation email with credentials
    try {
      await sendEmail({
        to: validatedData.email,
        subject: 'Welcome to Departmental Portal - Your Account Details',
        html: getInvitationEmailHtml(validatedData.email, tempPassword, validatedData.role),
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Continue even if email fails - user is created
    }

    return NextResponse.json(
      {
        message: 'Faculty member invited successfully',
        user,
        // For development only - remove this in production
        debugPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error inviting user:', error);
    return NextResponse.json(
      { error: 'An error occurred while inviting user' },
      { status: 500 }
    );
  }
}
