'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleApplicationPaid(applicationId: string, isPaid: boolean) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                isPaid,
                paidAt: isPaid ? new Date() : null,
                status: isPaid ? 'PAID' : 'PENDING',
            },
        });

        // Revalidate the admin page and homepage to reflect changes
        revalidatePath('/admin/applications');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to update application paid status:', error);
        return { success: false, error: 'Failed to update payment status' };
    }
}

export async function batchUpdateApplicationsPaid(updates: { id: string; isPaid: boolean }[]) {
    try {
        // Use a transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            updates.map(update =>
                prisma.application.update({
                    where: { id: update.id },
                    data: {
                        isPaid: update.isPaid,
                        paidAt: update.isPaid ? new Date() : null,
                        status: update.isPaid ? 'PAID' : 'PENDING',
                    },
                })
            )
        );

        // Revalidate the admin page and homepage to reflect changes
        revalidatePath('/admin/applications');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to batch update application paid status:', error);
        return { success: false, error: 'Failed to update payment statuses' };
    }
}
