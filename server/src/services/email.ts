import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, userId: string) {
  const verifyUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify-email?token=${userId}`;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@zyrostore.com',
      to: email,
      subject: 'Verify your ZYRO STORE account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Welcome to ZYRO STORE!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw - email failure shouldn't block registration
  }
}

export async function sendPasswordResetEmail(email: string, userId: string) {
  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${userId}`;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@zyrostore.com',
      to: email,
      subject: 'Reset your ZYRO STORE password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Password Reset</h1>
          <p>You requested a password reset. Click the link below:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}
