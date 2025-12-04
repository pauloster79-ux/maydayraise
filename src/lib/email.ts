import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (payload: EmailPayload) => {
  if (!resend) {
    console.log('⚠️ RESEND_API_KEY is missing. Logging email to console instead.');
    console.log(payload);
    return { success: true, id: 'mock-id' };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

