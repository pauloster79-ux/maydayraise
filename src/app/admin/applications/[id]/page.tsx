import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils/reference';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      shareholder: true,
      payments: true,
      certificate: true
    }
  });

  if (!application) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Application Details</h2>
        <div className="space-x-2">
          {/* Actions like Manual Approve could go here */}
          <Button variant="outline">Download PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investor Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2">Investor Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd>{application.shareholder.firstName} {application.shareholder.lastName}</dd>

            <dt className="text-slate-500">Investor Type</dt>
            <dd className="capitalize">{application.shareholder.investorType.replace('_', ' ').toLowerCase()}</dd>

            <dt className="text-slate-500">Email</dt>
            <dd>{application.shareholder.email}</dd>

            <dt className="text-slate-500">Phone</dt>
            <dd>{application.shareholder.phone || '-'}</dd>

            <dt className="text-slate-500">Address</dt>
            <dd>
              {application.shareholder.addressLine1}<br />
              {application.shareholder.addressLine2 && <>{application.shareholder.addressLine2}<br /></>}
              {application.shareholder.city}, {application.shareholder.postcode}
            </dd>
          </dl>
        </div>

        {/* Investment Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2">Investment Details</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-bold uppercase">{application.status}</dd>

            <dt className="text-slate-500">Investment Date</dt>
            <dd>{new Date(application.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>

            <dt className="text-slate-500">Amount</dt>
            <dd className="font-bold text-lg">{formatCurrency(application.amount)}</dd>

            <dt className="text-slate-500">Shares</dt>
            <dd>{application.shares}</dd>

            <dt className="text-slate-500">Ref Code</dt>
            <dd className="font-mono bg-slate-100 inline-block px-2 rounded">{application.paymentReference}</dd>
          </dl>
        </div>

        {/* Payment History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4 md:col-span-2">
          <h3 className="font-bold text-lg border-b pb-2">Payment History</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Method</th>
                <th className="py-2">Status</th>
                <th className="py-2">Provider Ref</th>
              </tr>
            </thead>
            <tbody>
              {application.payments.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="py-2">{formatCurrency(p.amount)}</td>
                  <td className="py-2">{p.paymentMethod}</td>
                  <td className="py-2">{p.status}</td>
                  <td className="py-2 font-mono text-xs">{p.providerReference || '-'}</td>
                </tr>
              ))}
              {application.payments.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-slate-400">No payments recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

