import { NextRequest, NextResponse } from 'next/server';
import { MockPaymentProvider } from '@/lib/payment/mock';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, ApplicationStatus } from '@/lib/payment/types';
import { generateCertificateStream } from '@/lib/pdf/certificate';
import { sendEmail } from '@/lib/email';
import { formatCurrency } from '@/lib/utils/reference';

const paymentProvider = new MockPaymentProvider();

export async function POST(req: NextRequest) {
  try {
    // In reality, we'd verify webhook signature here
    const body = await req.json();

    const result = await paymentProvider.handleWebhook(body, req.headers);

    if (!result) {
      return NextResponse.json({ received: true, processed: false });
    }

    // Find payment by reference (either bank ref or provider ref)
    // Our mock uses bank reference (Application.paymentReference) passed back in webhook
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerReference: result.reference },
          { bankReference: result.reference }
        ]
      },
      include: { application: { include: { shareholder: true } } }
    });

    if (!payment) {
      console.warn(`Payment not found for reference: ${result.reference}`);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      return NextResponse.json({ received: true, message: 'Already confirmed' });
    }

    if (result.status === PaymentStatus.CONFIRMED) {
      // 1. Update Payment Status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CONFIRMED,
          confirmedAt: new Date()
        }
      });

      // 2. Update Application Status
      await prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: ApplicationStatus.PAID } // Or COMPLETED if no other steps
      });

      // 3. Generate Share Certificate
      const certNumber = `SC-${Date.now().toString().slice(-6)}`;
      const certProps = {
        name: `${payment.application.shareholder.firstName} ${payment.application.shareholder.lastName}`,
        shares: payment.application.shares,
        amount: payment.application.amount,
        date: new Date().toLocaleDateString('en-GB'),
        certificateNumber: certNumber
      };

      // In a real app, we'd save this stream to S3/Blob storage and save the URL
      // For now, we'll just log we did it
      // const pdfStream = await generateCertificateStream(certProps);
      await generateCertificateStream(certProps);
      console.log('Generated Certificate Stream');

      await prisma.certificate.create({
        data: {
          applicationId: payment.applicationId,
          certificateNumber: certNumber,
          issueDate: new Date(),
          pdfLocation: `s3://bucket/certificates/${certNumber}.pdf`, // Mock path
        }
      });

      // 4. Send Confirmation Email
      await sendEmail({
        to: payment.application.shareholder.email,
        subject: 'Mayday Saxonvale - Investment Confirmed',
        html: `
          <h1>Thank you for your investment!</h1>
          <p>We have received your payment of ${formatCurrency(payment.amount)}.</p>
          <p>Your Share Certificate (No. ${certNumber}) has been issued.</p>
          <p>You can view your investment status <a href="${process.env.NEXT_PUBLIC_APP_URL}/invest/track?appId=${payment.applicationId}">here</a>.</p>
        `
      });
    } else if (result.status === PaymentStatus.FAILED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });
    }

    return NextResponse.json({ received: true, status: result.status });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

