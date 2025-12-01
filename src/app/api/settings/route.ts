import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const body = await request.json();
        const { minRaiseAmount, targetRaiseAmount, raiseEndDate } = body;

        // Basic validation
        if (typeof minRaiseAmount !== 'number' || typeof targetRaiseAmount !== 'number' || !raiseEndDate) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

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

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
