import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils/reference';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TrackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const appId = searchParams.appId as string;

  if (!appId) {
    return <div>Invalid Application ID</div>;
  }

  const application = await prisma.application.findUnique({
    where: { id: appId },
    include: { 
      shareholder: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      certificate: true,
    }
  });

  if (!application) return notFound();

  const payment = application.payments[0];
  const isPaid = application.status === 'PAID' || application.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-emerald-500 p-6 text-slate-900">
          <h1 className="text-2xl font-bold">Investment Status</h1>
          <p className="opacity-90">Reference: {application.paymentReference}</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Status Steps */}
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10" />
            
            <div className="flex flex-col items-center bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold text-sm">✓</div>
              <span className="text-xs mt-2 font-medium">Applied</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${payment ? 'bg-emerald-500 text-slate-900' : 'bg-gray-200 text-gray-500'}`}>
                {payment ? '✓' : '2'}
              </div>
              <span className="text-xs mt-2 font-medium">Payment</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isPaid ? 'bg-emerald-500 text-slate-900' : 'bg-gray-200 text-gray-500'}`}>
                {isPaid ? '✓' : '3'}
              </div>
              <span className="text-xs mt-2 font-medium">Confirmed</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${application.certificate ? 'bg-emerald-500 text-slate-900' : 'bg-gray-200 text-gray-500'}`}>
                {application.certificate ? '✓' : '4'}
              </div>
              <span className="text-xs mt-2 font-medium">Certificate</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-6 border-t pt-6">
            <div>
              <p className="text-sm text-slate-500">Investor</p>
              <p className="font-semibold">{application.shareholder.firstName} {application.shareholder.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Amount</p>
              <p className="font-semibold">{formatCurrency(application.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                application.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                application.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {application.status}
              </span>
            </div>
            {application.certificate && (
              <div>
                <p className="text-sm text-slate-500">Certificate</p>
                <p className="font-semibold text-emerald-600">Issued: {application.certificate.certificateNumber}</p>
              </div>
            )}
          </div>
          
          {/* Action if Pending Payment */}
          {!isPaid && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Payment Required</h3>
              <p className="text-sm text-blue-800 mb-4">
                We haven&apos;t received confirmation of your payment yet. If you chose Bank Transfer, please use reference <strong>{application.paymentReference}</strong>.
              </p>
              {/* In a real app, we might re-offer the Pay by Bank button here */}
            </div>
          )}

          <div className="pt-4 text-center">
             <Link href="/" className="text-slate-500 hover:text-slate-800 text-sm">
               Back to Home
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

