'use client';

import { useApplicationStore } from '@/store/application-store';
import { WizardLayout } from '../wizard-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PaymentInstructions } from '../payment-instructions';

export function Step6Payment() {
    const { data, updateData, reset, paymentReference, paymentApplicationId } = useApplicationStore();

    if (!paymentReference || !paymentApplicationId) {
        // If no payment details, redirect back to step 1
        return (
            <WizardLayout title="Make Payment">
                <div className="space-y-6">
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                        No payment details found. Please start a new application.
                    </div>
                    <Button onClick={() => window.location.href = '/invest?new=true'}>
                        Start New Application
                    </Button>
                </div>
            </WizardLayout>
        );
    }

    return (
        <WizardLayout title="Make Payment">
            <div className="space-y-8">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                    <p className="font-semibold">Application submitted!</p>
                    <p className="text-sm mt-1">
                        Please make your bank transfer using the reference below. We&apos;ll send you a confirmation email once your payment is received.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Write a message (Optional)</Label>
                        <textarea
                            id="message"
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Share why you are investing..."
                            value={data.message || ''}
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                        <p className="text-xs text-slate-500">
                            Your message will appear on the investment home screen.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="anonymous"
                            checked={data.displayNamePreference === 'ANONYMOUS'}
                            onCheckedChange={(checked) =>
                                updateData({
                                    displayNamePreference: checked ? 'ANONYMOUS' : 'FIRST_NAME_ONLY'
                                })
                            }
                        />
                        <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                            Make my investment anonymous (hide my name)
                        </Label>
                    </div>
                </div>

                <PaymentInstructions
                    amount={data.amount}
                    reference={paymentReference}
                    applicationId={paymentApplicationId}
                    showTrackLink={false}
                />

                <div className="flex justify-center pt-4">
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                            reset();
                            window.location.href = '/';
                        }}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </WizardLayout>
    );
}
