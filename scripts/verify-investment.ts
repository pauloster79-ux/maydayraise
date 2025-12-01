import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'test.user.final@example.com';
    console.log(`Checking for shareholder with email: ${email}`);

    const shareholder = await prisma.shareholder.findUnique({
        where: { email },
        include: { applications: true },
    });

    if (!shareholder) {
        console.error('Shareholder not found!');
        process.exit(1);
    }

    console.log('Shareholder found:', shareholder);

    if (shareholder.applications.length === 0) {
        console.error('No applications found for shareholder!');
        process.exit(1);
    }

    const application = shareholder.applications[0];
    console.log('Application found:', application);

    if (application.amount !== 500) {
        console.error(`Incorrect application amount. Expected 500, got ${application.amount}`);
        process.exit(1);
    }

    console.log('Verification successful!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
