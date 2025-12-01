'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const settingsSchema = z.object({
    minRaiseAmount: z.coerce.number().min(0, 'Minimum raise amount must be positive'),
    targetRaiseAmount: z.coerce.number().min(0, 'Target raise amount must be positive'),
    raiseEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date',
    }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
    initialSettings: {
        minRaiseAmount: number;
        targetRaiseAmount: number;
        raiseEndDate: string; // ISO string
    };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const form = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            minRaiseAmount: initialSettings.minRaiseAmount || 0,
            targetRaiseAmount: initialSettings.targetRaiseAmount || 0,
            // Format date for input type="date" (YYYY-MM-DD)
            raiseEndDate: initialSettings.raiseEndDate
                ? new Date(initialSettings.raiseEndDate).toISOString().split('T')[0]
                : '',
        },
    });

    const onSubmit = async (data: SettingsFormValues) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    raiseEndDate: new Date(data.raiseEndDate).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            setMessage({ type: 'success', text: 'Settings updated successfully' });
            router.refresh();
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="minRaiseAmount">Minimum Raise Amount (£)</Label>
                <Input
                    id="minRaiseAmount"
                    type="number"
                    step="0.01"
                    {...form.register('minRaiseAmount')}
                />
                {form.formState.errors.minRaiseAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.minRaiseAmount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="targetRaiseAmount">Target Raise Amount (£)</Label>
                <Input
                    id="targetRaiseAmount"
                    type="number"
                    step="0.01"
                    {...form.register('targetRaiseAmount')}
                />
                {form.formState.errors.targetRaiseAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.targetRaiseAmount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="raiseEndDate">Raise End Date</Label>
                <Input
                    id="raiseEndDate"
                    type="date"
                    {...form.register('raiseEndDate')}
                />
                {form.formState.errors.raiseEndDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.raiseEndDate.message}</p>
                )}
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
            </Button>
        </form>
    );
}
