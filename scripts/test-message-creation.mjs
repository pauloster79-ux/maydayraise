import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing message creation...\n');

    // First, create a test shareholder
    const shareholder = await prisma.shareholder.create({
        data: {
            email: 'messagetest@example.com',
            firstName: 'Message',
            lastName: 'Tester',
            investorType: 'INDIVIDUAL',
            addressLine1: '123 Test St',
            city: 'Testville',
            postcode: 'TE1 1ST',
            country: 'UK',
        },
    });

    console.log('Created shareholder:', shareholder.id);

    // Create an application
    const application = await prisma.application.create({
        data: {
            shareholderId: shareholder.id,
            amount: 500,
            shares: 500,
            status: 'PENDING',
            paymentReference: 'TEST123',
            riskAcknowledgments: '{}',
        },
    });

    console.log('Created application:', application.id);

    // Try to create a message
    try {
        const message = await prisma.message.create({
            data: {
                shareholderId: shareholder.id,
                applicationId: application.id,
                content: 'This is a test message to verify message creation works!',
                displayPreference: 'FIRST_NAME_ONLY',
                isVisible: true,
            },
        });

        console.log('\n✅ SUCCESS! Message created:', message.id);
        console.log('Content:', message.content);
        console.log('Display Preference:', message.displayPreference);
    } catch (error) {
        console.error('\n❌ FAILED to create message:');
        console.error(error);
    }

    // Check all messages
    const allMessages = await prisma.message.findMany();
    console.log(`\nTotal messages in database: ${allMessages.length}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
