'use client';

import { useApplicationStore } from '@/store/application-store';
import { WizardLayout } from '../wizard-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { submitApplication } from '@/app/actions/application'; // Server Action
import { formatCurrency } from '@/lib/utils/reference';
import { PaymentInstructions } from '../payment-instructions';

// Mock Risks from PRD
const RISKS = [
  "I understand that my capital is at risk and I could lose some or all of the money I invest.",
  "I understand that this is a long-term investment and I may not be able to withdraw my money when I want to.",
  "I understand that interest payments are not guaranteed and depend on the Society's performance.",
  "I have read the Share Offer Document and the Society Rules.",
  "I understand that shares are not transferable (except on death or bankruptcy).",
  "I am over 18 years of age.",
  "I understand that the Society Board has the final say on membership applications.",
  "I am investing for social reasons, not purely for financial gain.",
  "I understand that this investment is not covered by the Financial Services Compensation Scheme (FSCS).",
  "I confirm the money I am investing is my own (or my organization's) and not being invested on behalf of a third party for money laundering purposes."
];

export function Step4Risks() {
  const { data, updateData, setStep } = useApplicationStore();
  const [acks, setAcks] = useState<boolean[]>(new Array(RISKS.length).fill(false));

  const allChecked = acks.every(Boolean) && data.privacyAccepted;

  const toggleAck = (index: number) => {
    const newAcks = [...acks];
    newAcks[index] = !newAcks[index];
    setAcks(newAcks);
  };

  const handleContinue = () => {
    if (!allChecked) return;
    updateData({ risksAccepted: true });
    setStep(5);
  };

  return (
    <WizardLayout title="Risk Acknowledgment">
      <div className="space-y-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
          <p className="text-amber-800 font-medium">
            Please read and acknowledge each statement below to confirm you understand the nature of this investment.
          </p>
        </div>

        <div className="space-y-4">
          {RISKS.map((risk, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Checkbox
                id={`risk-${i}`}
                checked={acks[i]}
                onCheckedChange={() => toggleAck(i)}
              />
              <Label htmlFor={`risk-${i}`} className="text-sm leading-tight cursor-pointer">
                {risk}
              </Label>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 mt-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={data.privacyAccepted}
              onCheckedChange={(c) => updateData({ privacyAccepted: c === true })}
            />
            <Label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
              I accept the Privacy Policy and agree to my data being stored and processed by the Society.
            </Label>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
          <Button onClick={handleContinue} disabled={!allChecked}>Continue</Button>
        </div>
      </div>
    </WizardLayout>
  );
}

export function Step5Review() {
  const { data, setStep, setPaymentDetails } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!data.investorType) {
      alert('Please select an investor type to continue.');
      setStep(1);
      return;
    }
    setSubmissionError(null);
    setIsSubmitting(true);
    const res = await submitApplication({
      ...data,
      investorType: data.investorType,
      dateOfBirth: data.dateOfBirth || new Date(), // Should be valid from step 2
      riskAcknowledgments: { confirmed: true, timestamp: new Date().toISOString() }
    });

    if (res.success && res.reference && res.applicationId) {
      setPaymentDetails(res.reference, res.applicationId);
      setStep(6); // Navigate to step 6
    } else {
      setSubmissionError(res.error || 'Submission failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <WizardLayout title="Review Application">
      <div className="space-y-8">
        <div className="bg-slate-50 p-6 rounded-lg space-y-4">
          <h3 className="font-bold text-lg">Investment Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-slate-500">Amount</div>
            <div className="font-medium">{formatCurrency(data.amount)}</div>

            <div className="text-slate-500">Investor Type</div>
            <div className="font-medium capitalize">
              {data.investorType ? data.investorType.toLowerCase() : 'not set'}
            </div>

            <div className="text-slate-500">Name</div>
            <div className="font-medium">{data.firstName} {data.lastName}</div>

            <div className="text-slate-500">Email</div>
            <div className="font-medium">{data.email}</div>

            <div className="text-slate-500">Phone</div>
            <div className="font-medium">{data.phone}</div>

            <div className="text-slate-500">Date of Birth</div>
            <div className="font-medium">
              {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('en-GB') : 'Not provided'}
            </div>

            <div className="text-slate-500">Address</div>
            <div className="font-medium">
              {data.addressLine1}
              {data.addressLine2 && <>, {data.addressLine2}</>}
              <br />
              {data.city}, {data.postcode}
              <br />
              {data.country}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 text-center">
          By clicking Submit Application, you confirm that all details provided are accurate.
        </p>

        {submissionError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            {submissionError}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(4)} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !data.investorType}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
