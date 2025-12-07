import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET() {
    try {
        const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
        try {
            await limiter.check(10, ip); // 10 requests per minute per IP for API
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

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
