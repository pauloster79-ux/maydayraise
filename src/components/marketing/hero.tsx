import Link from 'next/link';
import Image from 'next/image';
import { VerticalProgressCounter } from './vertical-progress-counter';
import { getFundraisingStats } from '@/lib/data/stats';

export async function Hero() {
  const stats = await getFundraisingStats();

  // Calculate days remaining
  const endDate = stats.raiseEndDate || new Date('2025-03-28');
  const today = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <section className="relative bg-white pt-20 lg:pt-32 pb-8 overflow-hidden">
      {/* Background pattern or image could go here */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-white pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Content */}
          <div className="text-slate-900 space-y-6">
            <Image
              src="/logo.png"
              alt="Mayday Saxonvale"
              width={300}
              height={80}
              className="mb-6"
              priority
            />
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Own a piece of <span className="text-emerald-500">Saxonvale&apos;s</span> future.
            </h1>
            <p className="text-lg text-slate-700 max-w-xl">
              Join the community buyout to regenerate Frome&apos;s town centre.
              Invest in community shares and help us build a sustainable future for everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/invest?new=true"
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-slate-900 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Invest Now
              </Link>
              <Link
                href="/documents/share-offer.pdf"
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Read Offer Doc
              </Link>
            </div>

            <p className="text-sm text-slate-600 pt-2">
              Capital at risk. Please read the share offer document fully before investing.
            </p>
          </div>

          {/* Counter Card */}
          <div className="lg:pl-12">
            <VerticalProgressCounter
              current={stats.totalRaised}
              target={stats.targetAmount}
              minimum={stats.minimumAmount}
              investorCount={stats.investorCount}
              daysRemaining={Math.max(0, daysRemaining)}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

