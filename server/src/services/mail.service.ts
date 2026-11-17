import { env } from '../config/env.js';
import { transporter } from '../config/mail.js';
import { logger } from '../utils/logger.js';

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (env.NODE_ENV === 'development') {
    logger.info({ to, resetUrl }, 'Password reset link (dev only)');
  }
  const minutes = env.RESET_TOKEN_TTL_SEC / 60;

  const text = [
    'Hi!',
    '',
    'We received a request to reset your ICHgram password.',
    `Open this link to set a new password (valid for ${minutes} minutes):`,
    resetUrl,
    '',
    "If you didn't request this, just ignore this email — your password won't change.",
  ].join('\n');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #000000;">
      <h1 style="font-size: 24px; margin: 0 0 24px;">ICHgram</h1>
      <p style="font-size: 14px; line-height: 20px;">
        Hi!<br>
        We received a request to reset your ICHgram password.
      </p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 8px 16px; background: #0095f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Reset password</a>
      </p>
      <p style="font-size: 12px; line-height: 16px; color: #737373;">
        This link is valid for ${minutes} minutes.<br>
        Or copy this link: ${resetUrl}
      </p>
      <p style="font-size: 12px; line-height: 16px; color: #737373;">
        If you didn't request this, just ignore this email — your password won't change.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ICHgram" <${env.MAIL_USER}>`,
    to,
    subject: 'Reset your ICHgram password',
    text,
    html,
  });
}
