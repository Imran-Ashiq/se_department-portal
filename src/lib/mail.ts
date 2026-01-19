import nodemailer from 'nodemailer';

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Send an email using Nodemailer with Gmail
 * @param to - Recipient email address(es)
 * @param subject - Email subject
 * @param html - Email HTML content
 * @returns Promise with the send result
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Generate HTML template for user invitation email
 */
export function getInvitationEmailHtml(email: string, tempPassword: string, role: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Departmental Portal</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Departmental Portal</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">You've Been Invited!</h2>
          
          <p style="font-size: 16px; color: #4b5563;">
            You have been invited to join the Departmental Portal as <strong>${role === 'SUPER_ADMIN' ? 'Head of Department' : 'Admin'}</strong>.
          </p>
          
          <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${tempPassword}</code></p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            <strong>⚠️ Important:</strong> Please change your password immediately after logging in for security purposes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Login Now
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            This is an automated message from the Departmental Portal. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML template for password reset email
 */
export function getPasswordResetEmailHtml(resetToken: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p style="font-size: 16px; color: #4b5563;">
            We received a request to reset your password for your Departmental Portal account.
          </p>
          
          <p style="font-size: 16px; color: #4b5563;">
            Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
            ${resetLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280;">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            This is an automated message from the Departmental Portal. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}
