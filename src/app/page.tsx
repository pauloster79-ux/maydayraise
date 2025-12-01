import { Hero } from '@/components/marketing/hero';
import { InvestorWall } from '@/components/marketing/investor-wall';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Hero />
      <InvestorWall />
    </main>
  );
}
