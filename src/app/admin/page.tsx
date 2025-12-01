import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils/reference';

export default async function AdminDashboard() {
  const totalRaised = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: 'CONFIRMED' }
  });

  const appCounts = await prisma.application.groupBy({
    by: ['status'],
    _count: true,
  });

  const recentApps = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { shareholder: true }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium uppercase">Total Raised</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {formatCurrency(totalRaised._sum.amount || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium uppercase">Investments</h3>
          <div className="mt-2 space-y-1">
            {appCounts.map(c => (
              <div key={c.status} className="flex justify-between text-sm">
                <span>{c.status === 'PENDING' ? 'Unpaid Investments' : c.status}</span>
                <span className="font-bold">{c._count}</span>
              </div>
            ))}
            {appCounts.length === 0 && <span className="text-slate-400">No applications yet</span>}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Investments</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentApps.map(app => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">
                  {app.shareholder.firstName} {app.shareholder.lastName}
                </td>
                <td className="px-6 py-3">{formatCurrency(app.amount)}</td>
                <td className="px-6 py-3 text-slate-500">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                    }`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentApps.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

