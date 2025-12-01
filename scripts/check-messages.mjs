import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking messages in database...\n');

    const messages = await prisma.message.findMany({
        include: {
            shareholder: true,
            application: true,
        },
    });

    console.log(`Found ${messages.length} messages:\n`);

    messages.forEach((msg, i) => {
        console.log(`Message ${i + 1}:`);
        console.log(`  Content: ${msg.content}`);
        console.log(`  Display Preference: ${msg.displayPreference}`);
        console.log(`  Shareholder: ${msg.shareholder.firstName} ${msg.shareholder.lastName}`);
        console.log(`  Application ID: ${msg.applicationId}`);
        console.log(`  Is Visible: ${msg.isVisible}`);
        console.log(`  Created At: ${msg.createdAt}`);
        console.log('');
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
