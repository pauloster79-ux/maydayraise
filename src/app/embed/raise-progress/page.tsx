import { VerticalProgressCounter } from '@/components/marketing/vertical-progress-counter';
import { getFundraisingStats } from '@/lib/data/stats';

export const dynamic = 'force-dynamic';

export default async function RaiseProgressPage() {
    const stats = await getFundraisingStats();

    // Calculate days remaining (reusing logic from Hero)
    const endDate = stats.raiseEndDate || new Date('2025-03-28');
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="flex justify-center p-4 bg-transparent">
            <VerticalProgressCounter
                current={stats.totalRaised}
                target={stats.targetAmount}
                minimum={stats.minimumAmount}
                investorCount={stats.investorCount}
                daysRemaining={Math.max(0, daysRemaining)}
            />
        </div>
    );
}
