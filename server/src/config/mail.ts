import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

export async function verifyMailer() {
  try {
    await transporter.verify();
    logger.info('Mail transporter ready');
  } catch (err) {
    logger.warn({ err }, 'Mail transporter verify failed - password reset emails will not be sent');
  }
}
