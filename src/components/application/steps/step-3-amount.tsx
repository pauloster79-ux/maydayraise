'use client';

import { useApplicationStore } from '@/store/application-store';
import { WizardLayout } from '../wizard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/reference';
import { InvestorType } from '@/generated/client/enums';
import { useState, useEffect, useMemo } from 'react';

export function Step3Amount() {
  const { data, updateData, setStep } = useApplicationStore();
  const [amount, setAmount] = useState<string>(data.amount > 0 ? data.amount.toString() : '');
  
  // Limits
  const minAmount = 250;
  const maxAmount = data.investorType === InvestorType.ORGANIZATION ? 100000 : 50000;
  const interestRate = 0.06; // 6% target

  const parsedAmount = parseFloat(amount) || 0;
  const shares = Math.floor(parsedAmount); // £1 per share
  const annualInterest = parsedAmount * interestRate;

  const error = useMemo(() => {
    if (parsedAmount > 0) {
      if (parsedAmount < minAmount) {
        return `Minimum investment is ${formatCurrency(minAmount)}`;
      } else if (parsedAmount > maxAmount) {
        return `Maximum investment for this type is ${formatCurrency(maxAmount)}`;
      }
    }
    return null;
  }, [parsedAmount, minAmount, maxAmount]);

  const handleContinue = () => {
    if (parsedAmount < minAmount || parsedAmount > maxAmount) return;
    
    updateData({ amount: parsedAmount });
    setStep(4);
  };

  return (
    <WizardLayout title="Investment Amount">
      <div className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="amount" className="text-lg">How much would you like to invest?</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500">£</span>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-xl py-6"
              placeholder="5000"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <p className="text-sm text-slate-500">
            Minimum: {formatCurrency(minAmount)} • Maximum: {formatCurrency(maxAmount)}
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600">Number of Shares (£1 each)</span>
            <span className="text-2xl font-bold text-slate-900">{shares.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-emerald-100 pt-4">
            <span className="text-slate-600">Target Annual Interest (6%)</span>
            <span className="text-xl font-semibold text-emerald-700">{formatCurrency(annualInterest)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            * Interest rates are a target, not a guarantee. Investment capital is at risk.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button onClick={handleContinue} disabled={!!error || parsedAmount === 0}>Continue</Button>
        </div>
      </div>
    </WizardLayout>
  );
}
