import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PaymentInstructions } from '@/components/application/payment-instructions';
import { formatCurrency } from '@/lib/utils/reference';

type SuccessPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const reference = typeof searchParams.ref === 'string' ? searchParams.ref : undefined;

  const application = reference
    ? await prisma.application.findUnique({
        where: { paymentReference: reference },
        select: { id: true, amount: true, status: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Application Received!</h1>
          <p className="text-slate-600">
            Thank you for investing in Mayday Saxonvale. We&apos;ve emailed your application summary.
          </p>
        </div>

        {reference ? (
          application ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm uppercase tracking-wide text-emerald-800/70">Reference</p>
                <p className="font-mono text-2xl font-semibold tracking-widest text-emerald-900">{reference}</p>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Amount due: <span className="font-bold">{formatCurrency(application.amount)}</span>
                </p>
              </div>
              <PaymentInstructions
                amount={application.amount}
                reference={reference}
                applicationId={application.id}
              />
            </div>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              We couldn&apos;t find an application with reference <strong>{reference}</strong>. Please
              check the link in your email or contact the team if you need assistance.
            </div>
          )
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No reference was provided. Please use the link from your confirmation email so we can show
            your payment instructions.
          </div>
        )}

        <div className="pt-4 text-center">
          <Link href="/" className="text-emerald-600 font-medium hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

