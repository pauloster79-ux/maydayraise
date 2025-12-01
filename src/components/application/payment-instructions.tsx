'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Copy, CheckCircle2, LinkIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/reference';
import { getBankDetails, formatSortCode } from '@/lib/payment/bank-details';

type PaymentInstructionsProps = {
  amount: number;
  reference: string;
  applicationId?: string;
  showTrackLink?: boolean;
};

type CopyField = 'reference' | 'accountNumber' | 'sortCode' | 'iban';

export function PaymentInstructions({
  amount,
  reference,
  applicationId,
  showTrackLink = true,
}: PaymentInstructionsProps) {
  const bankDetails = getBankDetails();
  const [recentCopy, setRecentCopy] = useState<CopyField | null>(null);

  const handleCopy = useCallback(async (value: string, field: CopyField) => {
    try {
      await navigator.clipboard.writeText(value);
      setRecentCopy(field);
      setTimeout(() => setRecentCopy((current) => (current === field ? null : current)), 2000);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  }, []);

  const renderCopyButton = (value: string, field: CopyField) => (
    <button
      type="button"
      onClick={() => handleCopy(value, field)}
      className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900"
    >
      {recentCopy === field ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-lg font-semibold text-emerald-900">Make a Bank Transfer</h3>
        <p className="mt-2 text-sm text-emerald-900/80">
          Please use the reference below when making your payment so we can match it to your
          application. We&apos;ll confirm by email once the funds arrive.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(amount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Reference</p>
          <div className="mt-1 flex items-center justify-between rounded-md border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-lg font-semibold tracking-widest text-emerald-800">
            <span>{reference}</span>
            {renderCopyButton(reference, 'reference')}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-base font-semibold text-slate-900">Bank Details</h4>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">GBP Transfers</p>
        </div>

        {bankDetails.configured ? (
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Account Name</dt>
              <dd className="font-medium text-slate-900">{bankDetails.details.accountName}</dd>
            </div>
            <div>
              <dt className="text-slate-500 flex items-center justify-between">
                <span>Account Number</span>
                {renderCopyButton(bankDetails.details.accountNumber, 'accountNumber')}
              </dt>
              <dd className="font-mono text-base text-slate-900">{bankDetails.details.accountNumber}</dd>
            </div>
            <div>
              <dt className="text-slate-500 flex items-center justify-between">
                <span>Sort Code</span>
                {renderCopyButton(formatSortCode(bankDetails.details.sortCode), 'sortCode')}
              </dt>
              <dd className="font-mono text-base text-slate-900">
                {formatSortCode(bankDetails.details.sortCode)}
              </dd>
            </div>

            {bankDetails.details.iban && (
              <div>
                <dt className="text-slate-500 flex items-center justify-between">
                  <span>IBAN</span>
                  {renderCopyButton(bankDetails.details.iban, 'iban')}
                </dt>
                <dd className="font-mono text-base text-slate-900 break-all">{bankDetails.details.iban}</dd>
              </div>
            )}

            {bankDetails.details.bic && (
              <div>
                <dt className="text-slate-500">BIC / SWIFT</dt>
                <dd className="font-mono text-base text-slate-900">{bankDetails.details.bic}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Bank details not configured</p>
            <p className="mt-1">
              Payment instructions are temporarily unavailable. Please contact the Mayday team for
              assistance.
            </p>
          </div>
        )}
      </div>

      {showTrackLink && applicationId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-slate-500" />
            <span>Track the status of your investment at any time.</span>
          </div>
          <Link
            href={`/invest/track?appId=${applicationId}`}
            className="font-medium text-emerald-700 hover:text-emerald-900"
          >
            Open tracking
          </Link>
        </div>
      )}
    </div>
  );
}


