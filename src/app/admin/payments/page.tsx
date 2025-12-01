import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils/reference';
import { ReconciliationUploader } from '@/components/admin/reconciliation-uploader';

export default async function PaymentsReconciliationPage() {
  const unsettledApplications = await prisma.application.findMany({
    where: {
      status: { notIn: ['PAID', 'COMPLETED'] },
    },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const pendingCount = unsettledApplications.length;
  const pendingTotal = unsettledApplications.reduce((sum, app) => sum + app.amount, 0);
  const oldestPending = unsettledApplications[0]?.createdAt ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Payment Reconciliation</h2>
        <p className="text-sm text-slate-500">
          Upload a CSV bank statement to automatically match bank transfers against unsettled
          investments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unsettled amount</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(pendingTotal)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pending applications
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{pendingCount}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Oldest pending</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {oldestPending ? oldestPending.toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReconciliationUploader />
      </div>
    </div>
  );
}


