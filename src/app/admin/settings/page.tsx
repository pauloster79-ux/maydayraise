import { prisma } from '@/lib/prisma';
import { SettingsForm } from '@/components/admin/settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    let settings = null;
    try {
        settings = await prisma.settings.findFirst();
    } catch (e) {
        console.warn('Could not fetch settings (migration might be pending)', e);
    }

    const initialSettings = {
        minRaiseAmount: settings?.minRaiseAmount ?? 0,
        targetRaiseAmount: settings?.targetRaiseAmount ?? 0,
        raiseEndDate: settings?.raiseEndDate?.toISOString() ?? '',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <SettingsForm initialSettings={initialSettings} />
            </div>
        </div>
    );
}
