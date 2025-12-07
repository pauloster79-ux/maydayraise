import React from 'react';
import { formatCurrency } from '@/lib/utils/reference';

interface ProgressCounterProps {
  current: number;
  target: number;
  minimum: number;
  investorCount: number;
  daysRemaining?: number;
}

export function ProgressCounter({ current, target, minimum, investorCount, daysRemaining }: ProgressCounterProps) {
  // Calculate percentage based on minimum first (as per PRD requirement for color coding zones)
  // "red (<50% min), amber (50-100% min), yellow (>100% min)"
  const percentageOfMin = (current / minimum) * 100;
  const percentageOfMax = Math.min((current / target) * 100, 100);

  let barColor = 'bg-red-500';
  if (percentageOfMin >= 100) {
    barColor = 'bg-emerald-500';
  } else if (percentageOfMin >= 50) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(current)}</h2>
        <p className="text-slate-500">raised of {formatCurrency(minimum)} minimum target</p>
      </div>

      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${percentageOfMax}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-slate-600 mb-4">
        <span>0%</span>
        <span className="font-semibold text-slate-900">{Math.round(percentageOfMin)}% of min</span>
        <span>Target: {formatCurrency(target)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-center">
        <div>
          <span className="block text-2xl font-bold text-slate-900">{investorCount}</span>
          <span className="text-slate-500">Investors</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-slate-900">{daysRemaining ?? 30}</span>
          <span className="text-slate-500">Days Left</span>
        </div>
      </div>
    </div>
  );
}
