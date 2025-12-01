import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const applications = await prisma.application.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                paymentReference: true,
                amount: true,
                status: true,
                isPaid: true,
                shareholder: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
