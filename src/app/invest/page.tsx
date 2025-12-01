'use client';

import { useApplicationStore } from '@/store/application-store';
import { Step1InvestorType } from '@/components/application/steps/step-1-type';
import { Step2Details } from '@/components/application/steps/step-2-details';
import { Step3Amount } from '@/components/application/steps/step-3-amount';
import { Step4Risks, Step5Review } from '@/components/application/steps/step-4-5-risk-review';
import { useEffect, useState } from 'react';

export default function InvestPage() {
  const { step, reset } = useApplicationStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check for new application request
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('new') === 'true') {
      reset();
      // Clean up the URL
      window.history.replaceState({}, '', '/invest');
    }
  }, [reset]);

  if (!isMounted) return null; // Prevent hydration mismatch for persistent store

  switch (step) {
    case 1: return <Step1InvestorType />;
    case 2: return <Step2Details />;
    case 3: return <Step3Amount />;
    case 4: return <Step4Risks />;
    case 5: return <Step5Review />;
    default: return <Step1InvestorType />;
  }
}

