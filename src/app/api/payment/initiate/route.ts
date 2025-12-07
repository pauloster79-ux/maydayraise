import { NextRequest, NextResponse } from 'next/server';
import { MockPaymentProvider } from '@/lib/payment/mock';
import { prisma } from '@/lib/prisma';
import { PaymentMethod, PaymentStatus } from '@/lib/payment/types';
import { z } from 'zod';

const paymentProvider = new MockPaymentProvider();

const InitiatePaymentSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = InitiatePaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
    }

    const { applicationId } = validation.data;

    const application = await prisma.application.findUnique({
      where: { id: applicationId }, // validation.data.applicationId is guaranteed to be string

      include: { shareholder: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Create a Payment record
    const payment = await prisma.payment.create({
      data: {
        applicationId: application.id,
        amount: application.amount,
        paymentMethod: PaymentMethod.PAY_BY_BANK,
        status: PaymentStatus.PENDING,
        bankReference: application.paymentReference,
      }
    });

    // Initiate with Provider
    const response = await paymentProvider.initiatePayment({
      amount: application.amount,
      currency: 'GBP',
      reference: application.paymentReference || payment.id,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invest/track?appId=${application.id}`,
      user: {
        name: `${application.shareholder.firstName} ${application.shareholder.lastName}`,
        email: application.shareholder.email,
      }
    });

    // Update Payment with provider ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerReference: response.providerPaymentId,
      }
    });

    return NextResponse.json({ url: response.authUrl });
  } catch (error) {
    console.error('Payment initiation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

