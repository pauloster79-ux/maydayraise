import Link from 'next/link';

export default function InvestButtonPage() {
    return (
        <div className="flex justify-center items-center h-full min-h-[80px] w-full bg-transparent">
            <Link
                href="/invest?new=true"
                target="_top"
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-slate-900 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
                Invest Now
            </Link>
        </div>
    );
}
