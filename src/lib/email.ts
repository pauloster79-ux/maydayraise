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

export const sendApplicationConfirmationEmail = async ({
  email,
  firstName,
  lastName,
  amount,
  reference,
}: {
  email: string;
  firstName: string;
  lastName: string;
  amount: number;
  reference: string;
}) => {
  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Investment Application Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 3px solid #10b981;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Mayday Saxonvale</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Community Share Offer</p>
            </td>
          </tr>
          
          <!-- Success Message -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #065f46;">✓ Application Submitted Successfully</p>
              </div>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">Dear ${firstName} ${lastName},</p>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">Thank you for your investment application to Mayday Saxonvale Community Benefit Society. We're delighted to have your support!</p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">Your application has been received and is now awaiting payment.</p>
            </td>
          </tr>
          
          <!-- Investment Summary -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f1f5f9; border-radius: 6px; padding: 24px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0f172a;">Investment Summary</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Investment Amount:</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #0f172a; text-align: right;">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; border-top: 1px solid #cbd5e1;">Payment Reference:</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #10b981; text-align: right; font-family: 'Courier New', monospace; border-top: 1px solid #cbd5e1;">${reference}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Payment Instructions -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0f172a;">Next Steps: Complete Your Payment</h2>
              
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">Please transfer <strong>${formattedAmount}</strong> to the following bank account:</p>
              
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 20px; margin-bottom: 16px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; font-weight: 500;">Account Name:</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; text-align: right;">Mayday Saxonvale CBS</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; font-weight: 500;">Sort Code:</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; text-align: right; font-family: 'Courier New', monospace;">XX-XX-XX</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; font-weight: 500;">Account Number:</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; text-align: right; font-family: 'Courier New', monospace;">XXXXXXXX</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #78350f; font-weight: 500; border-top: 2px solid #fbbf24; padding-top: 12px;">Reference:</td>
                    <td style="padding: 6px 0; font-size: 15px; color: #78350f; text-align: right; font-family: 'Courier New', monospace; font-weight: 700; border-top: 2px solid #fbbf24; padding-top: 12px;">${reference}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #7f1d1d;"><strong>Important:</strong> Please use the reference code <strong>${reference}</strong> when making your payment. This helps us match your payment to your application quickly.</p>
              </div>
            </td>
          </tr>
          
          <!-- What Happens Next -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0f172a;">What Happens Next?</h2>
              
              <ol style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #334155;">
                <li style="margin-bottom: 8px;">Make your bank transfer using the details above</li>
                <li style="margin-bottom: 8px;">We'll receive and reconcile your payment (usually within 1-3 business days)</li>
                <li style="margin-bottom: 8px;">You'll receive a confirmation email once your payment is processed</li>
                <li style="margin-bottom: 8px;">Your share certificate will be issued and sent to you</li>
              </ol>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #64748b;">If you have any questions about your investment, please contact us at:</p>
              <p style="margin: 0; font-size: 14px; color: #10b981; font-weight: 600;">info@maydaysaxonvale.co.uk</p>
              
              <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">Thank you for supporting Mayday Saxonvale and helping us build a better future for our community.</p>
            </td>
          </tr>
        </table>
        
        <!-- Legal Footer -->
        <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                Mayday Saxonvale Community Benefit Society Ltd<br>
                Registered under the Co-operative and Community Benefit Societies Act 2014
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: `Investment Application Confirmed - ${reference}`,
    html,
  });
};
