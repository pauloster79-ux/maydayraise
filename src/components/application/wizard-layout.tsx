'use client';

import { useApplicationStore } from '@/store/application-store';
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const WIZARD_STEPS = [
  'Investor Type',
  'Your Details',
  'Investment Amount',
  'Risk Acknowledgment',
  'Review Application',
  'Make Payment',
] as const;

const TOTAL_STEPS = WIZARD_STEPS.length;

export function WizardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { step } = useApplicationStore();

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Mayday Saxonvale"
              width={200}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
          <div className="text-sm text-slate-500">Step {step} of {TOTAL_STEPS}</div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100 mt-4">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Breadcrumb */}
        <nav className="container mx-auto px-4 mt-4" aria-label="Investment progress">
          <ol className="flex flex-wrap gap-2 text-xs md:text-sm">
            {WIZARD_STEPS.map((label, index) => {
              const isComplete = index + 1 < step;
              const isCurrent = index + 1 === step;
              const pillClasses = [
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition-colors',
                isCurrent
                  ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                  : isComplete
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-100 border-transparent text-slate-500',
              ].join(' ');
              const badgeClasses = [
                'inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                isCurrent
                  ? 'bg-white text-slate-900'
                  : isComplete
                    ? 'bg-white text-emerald-700'
                    : 'bg-white text-slate-500',
              ].join(' ');

              return (
                <li key={label}>
                  <span className={pillClasses} aria-current={isCurrent ? 'step' : undefined}>
                    <span className={badgeClasses}>{index + 1}</span>
                    <span className="whitespace-nowrap">{label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">{title}</h1>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>Questions? Contact us at support@maydaysaxonvale.co.uk</p>
      </footer>
    </div>
  );
}
