'use client';

import { formatCurrency } from '@/lib/utils/reference';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { batchUpdateApplicationsPaid } from './actions';
import { useState, useEffect } from 'react';

type Application = {
    id: string;
    paymentReference: string | null;
    amount: number;
    status: string;
    isPaid: boolean;
    shareholder: {
        firstName: string;
        lastName: string;
        email: string;
    };
};

type ApplicationsTableProps = {
    initialApplications: Application[];
    isReconciling: boolean;
    onReconciliationComplete: () => void;
};

export function ApplicationsTable({
    initialApplications,
    isReconciling,
    onReconciliationComplete
}: ApplicationsTableProps) {
    const [localApps, setLocalApps] = useState(initialApplications);
    const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when initialApplications change
    useEffect(() => {
        setLocalApps(initialApplications);
    }, [initialApplications]);

    // Reset pending changes when exiting reconciliation mode
    useEffect(() => {
        if (!isReconciling) {
            setPendingChanges(new Map());
        }
    }, [isReconciling]);

    const handlePaidToggle = (appId: string, currentPaid: boolean) => {
        if (!isReconciling) return;

        const newPaidStatus = !currentPaid;

        // Update local state
        setLocalApps(prev =>
            prev.map(app =>
                app.id === appId ? { ...app, isPaid: newPaidStatus } : app
            )
        );

        // Track pending change
        setPendingChanges(prev => {
            const updated = new Map(prev);
            updated.set(appId, newPaidStatus);
            return updated;
        });
    };

    const handleSaveChanges = async () => {
        if (pendingChanges.size === 0) return;

        setIsSaving(true);

        const updates = Array.from(pendingChanges.entries()).map(([id, isPaid]) => ({
            id,
            isPaid,
        }));

        const result = await batchUpdateApplicationsPaid(updates);

        if (result.success) {
            setPendingChanges(new Map());
            onReconciliationComplete();
        } else {
            alert('Failed to save changes. Please try again.');
        }

        setIsSaving(false);
    };

    const handleCancelChanges = () => {
        // Revert local changes
        setLocalApps(initialApplications);
        setPendingChanges(new Map());
        onReconciliationComplete();
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-auto max-h-[75vh]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Paid</th>
                            <th className="px-6 py-3">Ref</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {localApps.map(app => {
                            const hasPendingChange = pendingChanges.has(app.id);
                            return (
                                <tr
                                    key={app.id}
                                    className={`hover:bg-slate-50 ${hasPendingChange ? 'bg-amber-50' : ''}`}
                                >
                                    <td className="px-6 py-3">
                                        <Checkbox
                                            checked={app.isPaid}
                                            disabled={!isReconciling}
                                            onCheckedChange={() => handlePaidToggle(app.id, app.isPaid)}
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-mono text-slate-500">{app.paymentReference}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900">
                                        {app.shareholder.firstName} {app.shareholder.lastName}
                                        <div className="text-xs text-slate-400">{app.shareholder.email}</div>
                                    </td>
                                    <td className="px-6 py-3">{formatCurrency(app.amount)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${app.isPaid ? 'bg-emerald-100 text-emerald-800' :
                                            'bg-amber-100 text-amber-800'
                                            }`}>
                                            {app.isPaid ? 'PAID' : app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Link
                                            href={`/admin/applications/${app.id}`}
                                            className="text-emerald-600 hover:underline font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isReconciling && (
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCancelChanges}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving || pendingChanges.size === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : `Save Changes${pendingChanges.size > 0 ? ` (${pendingChanges.size})` : ''}`}
                    </button>
                </div>
            )}
        </div>
    );
}
