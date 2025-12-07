import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const SettingsSchema = z.object({
    minRaiseAmount: z.coerce.number().min(0),
    targetRaiseAmount: z.coerce.number().min(0),
    raiseEndDate: z.string().datetime(),
});

export async function GET() {
    try {
        const settings = await prisma.settings.findFirst();
        return NextResponse.json(settings || {});
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        // Check if user is logged in. In a real app, also check role === 'admin'
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Zod Validation
        const result = SettingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: result.error.flatten()
            }, { status: 400 });
        }

        const { minRaiseAmount, targetRaiseAmount, raiseEndDate } = result.data;

        const existing = await prisma.settings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.settings.update({
                where: { id: existing.id },
                data: {
                    minRaiseAmount,
                    targetRaiseAmount,
                    raiseEndDate: new Date(raiseEndDate),
                },
            });
        } else {
            settings = await prisma.settings.create({
                data: {
                    minRaiseAmount,
                    targetRaiseAmount,
                    raiseEndDate: new Date(raiseEndDate),
                },
            });
        }

        revalidatePath('/');
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
