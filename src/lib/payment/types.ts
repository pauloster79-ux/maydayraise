// Re-defining Enums that were removed from Prisma Schema
export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  PAY_BY_BANK = 'PAY_BY_BANK',
  CARD = 'CARD',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT',
}

export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  reference: string; // Internal application reference
  redirectUrl: string;
  user: {
    name: string;
    email: string;
  };
}

export interface PaymentInitiationResponse {
  providerPaymentId: string;
  status: PaymentStatus;
  authUrl?: string; // URL to redirect user to bank
}

export interface PaymentProvider {
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus>;
  handleWebhook(body: unknown, headers: unknown): Promise<{ reference: string; status: PaymentStatus } | null>;
}
