import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

/**
 * This script creates CONFIRMED payment records for all PENDING applications
 * that don't already have payments. This is useful for development/testing
 * to see investments reflected in the raise bar.
 * 
 * In production, payments are created through the bank reconciliation process.
 */
async function confirmPendingPayments() {
    console.log('🔍 Finding pending applications without payments...\n');

    // Find all applications that don't have any payments yet
    const pendingApplications = await prisma.application.findMany({
        where: {
            payments: {
                none: {}
            }
        },
        include: {
            shareholder: true,
            payments: true
        }
    });

    if (pendingApplications.length === 0) {
        console.log('✅ No pending applications found. All applications already have payments.');
        return;
    }

    console.log(`Found ${pendingApplications.length} application(s) without payments:\n`);

    for (const app of pendingApplications) {
        console.log(`  - ${app.shareholder.firstName} ${app.shareholder.lastName}`);
        console.log(`    Amount: £${app.amount.toLocaleString()}`);
        console.log(`    Reference: ${app.paymentReference}`);
        console.log(`    Status: ${app.status}\n`);
    }

    console.log('💳 Creating CONFIRMED payment records...\n');

    let createdCount = 0;

    for (const app of pendingApplications) {
        try {
            // Create a confirmed payment for this application
            const payment = await prisma.payment.create({
                data: {
                    applicationId: app.id,
                    amount: app.amount,
                    paymentMethod: 'BANK_TRANSFER',
                    bankReference: app.paymentReference || undefined,
                    status: 'CONFIRMED',
                    confirmedAt: new Date(),
                }
            });

            // Update the application status to PAID
            await prisma.application.update({
                where: { id: app.id },
                data: { status: 'PAID' }
            });

            console.log(`✅ Created payment for ${app.shareholder.firstName} ${app.shareholder.lastName} (£${app.amount.toLocaleString()})`);
            createdCount++;
        } catch (error) {
            console.error(`❌ Failed to create payment for application ${app.id}:`, error);
        }
    }

    console.log(`\n✨ Successfully created ${createdCount} confirmed payment(s)!`);
    console.log('\n📊 The raise bar should now reflect these investments.');
    console.log('   Refresh your homepage to see the updated total.\n');
}

confirmPendingPayments()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
