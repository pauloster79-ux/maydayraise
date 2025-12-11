'use client';

import { useApplicationStore } from '@/store/application-store';
import { InvestorType } from '@/generated/client/enums';
import { WizardLayout } from '../wizard-layout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export function Step1InvestorType() {
  const { data, updateData, setStep } = useApplicationStore();

  const handleContinue = () => {
    if (!data.investorType) return;
    setStep(2);
  };

  return (
    <WizardLayout title="Investor Type">
      <div className="space-y-8">
        <RadioGroup
          value={data.investorType ?? ''}
          onValueChange={(val) => updateData({ investorType: val as InvestorType })}
          className="grid gap-4"
        >
          <div>
            <RadioGroupItem value={InvestorType.INDIVIDUAL} id="individual" className="peer sr-only" />
            <Label
              htmlFor="individual"
              className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-lg font-semibold">Individual</span>
              <span className="text-sm text-muted-foreground mt-1">
                I am investing as myself. Shares will be held in my name.
              </span>
            </Label>
          </div>



          <div>
            <RadioGroupItem value={InvestorType.ORGANIZATION} id="organization" className="peer sr-only" />
            <Label
              htmlFor="organization"
              className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-lg font-semibold">Organisation</span>
              <span className="text-sm text-muted-foreground mt-1">
                I am investing on behalf of a business, charity, or club.
              </span>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex justify-end pt-4">
          <Button onClick={handleContinue} size="lg" disabled={!data.investorType}>
            Continue
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}

