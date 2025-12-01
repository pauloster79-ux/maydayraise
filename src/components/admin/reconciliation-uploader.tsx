'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { processBankStatement, type ReconciliationSummary } from '@/app/admin/payments/actions';
import { formatCurrency } from '@/lib/utils/reference';

type ResultTableProps<T extends { reference: string; amount: number; description?: string; date?: string }> = {
  title: string;
  rows: T[];
  renderExtra?: (row: T, index: number) => ReactNode;
};

function ResultTable<T extends { reference: string; amount: number; description?: string; date?: string }>({
  title,
  rows,
  renderExtra,
}: ResultTableProps<T>) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Notes</th>
              {renderExtra && <th className="px-4 py-2">Details</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={`${row.reference}-${index}`}>
                <td className="px-4 py-2 font-mono text-xs">{row.reference}</td>
                <td className="px-4 py-2">{formatCurrency(row.amount)}</td>
                <td className="px-4 py-2">{row.date || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{row.description || '—'}</td>
                {renderExtra && <td className="px-4 py-2">{renderExtra(row, index)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReconciliationUploader() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasResults = summary !== null;

  const downloadUnknownCsv = () => {
    if (!summary || summary.unknownReferences.length === 0) return;
    const header = 'Reference,Amount,Date,Description';
    const rows = summary.unknownReferences.map((row) =>
      [row.reference, row.amount, row.date ?? '', row.description ?? '']
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    );
    const blob = new Blob([header, '\n', rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'unmatched-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('statement') as File | null;

    if (!file) {
      setError('Please select a CSV file before uploading.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await processBankStatement(formData);
      setSummary(result);
      if (result.errors.length > 0) {
        setError(result.errors.join(' '));
      }
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      event.currentTarget.reset();
    }
  };

  const headline = useMemo(() => {
    if (!summary) return null;
    return `${summary.matched.length} payments matched · ${formatCurrency(summary.settledTotal)} settled`;
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Upload bank statement</h3>
        <p className="text-sm text-slate-500">
          CSV must include the headers <strong>Date</strong>, <strong>Amount</strong>,{' '}
          <strong>Reference</strong>, and optionally <strong>Description</strong>. We will only read
          outbound credits that match Mayday references (e.g. MAY-1234-5678).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            name="statement"
            accept=".csv,text/csv"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Uploading…' : 'Upload & reconcile'}
          </button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>

      {hasResults && summary && (
        <div className="space-y-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">{headline}</p>
            <p className="text-sm text-emerald-900/80">
              {summary.processedRows} rows processed. {summary.amountMismatches.length} mismatches,{' '}
              {summary.unknownReferences.length} unknown references, {summary.alreadySettled.length}{' '}
              already settled, {summary.duplicateReferences.length} duplicates.
            </p>
          </div>

          <ResultTable
            title="Matched payments"
            rows={summary.matched}
            renderExtra={(row) => (
              <div>
                <p className="font-semibold text-slate-900">{row.applicantName}</p>
                <p className="text-xs text-slate-500">App ID: {row.applicationId}</p>
              </div>
            )}
          />

          <ResultTable
            title="Amount mismatches"
            rows={summary.amountMismatches}
            renderExtra={(row) => (
              <div>
                <p className="font-semibold text-slate-900">{row.applicantName}</p>
                <p className="text-xs text-slate-500">
                  App ID: {row.applicationId} · Expected {formatCurrency(row.expectedAmount)}
                </p>
              </div>
            )}
          />

          <ResultTable
            title="Already settled references"
            rows={summary.alreadySettled}
            renderExtra={(row) => (
              <div>
                <p className="font-semibold text-slate-900">{row.applicantName}</p>
                <p className="text-xs text-slate-500">
                  App ID: {row.applicationId} · Status {row.currentStatus}
                </p>
              </div>
            )}
          />

          <ResultTable title="Duplicate references in upload" rows={summary.duplicateReferences} />

          <div className="space-y-3">
            <ResultTable title="Unknown references" rows={summary.unknownReferences} />
            {summary.unknownReferences.length > 0 && (
              <button
                type="button"
                onClick={downloadUnknownCsv}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Download unknown references CSV
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


