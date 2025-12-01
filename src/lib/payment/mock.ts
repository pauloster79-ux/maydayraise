import { PaymentProvider, PaymentInitiationRequest, PaymentInitiationResponse, PaymentStatus } from './types';

export class MockPaymentProvider implements PaymentProvider {
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    console.log('Mock Payment Initiated:', request);
    return {
      providerPaymentId: `mock_${Date.now()}`,
      status: PaymentStatus.PENDING,
      authUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invest/track?appId=${request.reference}&mock_payment=true`,
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus> {
    console.log('Checking status for:', providerPaymentId);
    return PaymentStatus.CONFIRMED;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleWebhook(body: unknown, _headers: unknown): Promise<{ reference: string; status: PaymentStatus } | null> {
    const payload = body as { reference: string; status: string };
    return {
      reference: payload.reference,
      status: payload.status === 'success' ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
    };
  }
}
