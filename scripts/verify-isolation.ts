
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Starting verification of isolated shareholder records...');

    const testEmail = `test-iso-${Date.now()}@example.com`;

    // 1. Create First Application
    console.log('\n--- Creating Application 1 ---');
    const app1Data = {
        investorType: 'INDIVIDUAL',
        firstName: 'John',
        lastName: 'Doe',
        email: testEmail,
        addressLine1: '123 Test St',
        city: 'Test City',
        postcode: 'TE1 1ST',
        country: 'United Kingdom',
        amount: 1000,
        riskAcknowledgments: { agreed: true },
    };

    // Simulate server action logic manually since we are in script
    const shareholder1 = await prisma.shareholder.create({
        data: {
            email: app1Data.email,
            firstName: app1Data.firstName,
            lastName: app1Data.lastName,
            addressLine1: app1Data.addressLine1,
            city: app1Data.city,
            postcode: app1Data.postcode,
            country: app1Data.country,
            investorType: app1Data.investorType,
        }
    });

    const app1 = await prisma.application.create({
        data: {
            shareholderId: shareholder1.id,
            amount: app1Data.amount,
            shares: app1Data.amount,
            status: 'PENDING',
            riskAcknowledgments: JSON.stringify(app1Data.riskAcknowledgments),
            paymentReference: `REF1-${Date.now()}`
        }
    });

    console.log(`Application 1 Created. Shareholder ID: ${shareholder1.id}`);


    // 2. Create Second Application with DIFFERENT details but SAME email
    console.log('\n--- Creating Application 2 (New Details) ---');
    const app2Data = {
        ...app1Data,
        lastName: 'Smith', // Changed Name
        city: 'New City',  // Changed City
        amount: 5000,
    };

    const shareholder2 = await prisma.shareholder.create({
        data: {
            email: app2Data.email,
            firstName: app2Data.firstName,
            lastName: app2Data.lastName,
            addressLine1: app2Data.addressLine1,
            city: app2Data.city,
            postcode: app2Data.postcode,
            country: app2Data.country,
            investorType: app2Data.investorType,
        }
    });

    const app2 = await prisma.application.create({
        data: {
            shareholderId: shareholder2.id, // Should be different
            amount: app2Data.amount,
            shares: app2Data.amount,
            status: 'PENDING',
            riskAcknowledgments: JSON.stringify(app2Data.riskAcknowledgments),
            paymentReference: `REF2-${Date.now()}`
        }
    });

    console.log(`Application 2 Created. Shareholder ID: ${shareholder2.id}`);

    // 3. Verify Isolation
    console.log('\n--- Verifying Isolation ---');

    const fetchedApp1 = await prisma.application.findUnique({
        where: { id: app1.id },
        include: { shareholder: true }
    });

    const fetchedApp2 = await prisma.application.findUnique({
        where: { id: app2.id },
        include: { shareholder: true }
    });

    if (!fetchedApp1 || !fetchedApp2) {
        console.error('Failed to fetch applications');
        process.exit(1);
    }

    console.log(`App 1 Shareholder Name: ${fetchedApp1.shareholder.lastName} (Expected: Doe)`);
    console.log(`App 2 Shareholder Name: ${fetchedApp2.shareholder.lastName} (Expected: Smith)`);
    console.log(`App 1 Shareholder Email: ${fetchedApp1.shareholder.email}`);
    console.log(`App 2 Shareholder Email: ${fetchedApp2.shareholder.email}`);

    const isIsolated =
        fetchedApp1.shareholder.lastName === 'Doe' &&
        fetchedApp2.shareholder.lastName === 'Smith' &&
        fetchedApp1.shareholder.id !== fetchedApp2.shareholder.id;

    if (isIsolated) {
        console.log('\n✅ SUCCESS: Records are perfectly isolated.');
    } else {
        console.error('\n❌ FAILURE: Records are NOT isolated.');
        console.error('IDs match?', fetchedApp1.shareholder.id === fetchedApp2.shareholder.id);
    }

    // Count shareholders for this email
    const count = await prisma.shareholder.count({ where: { email: testEmail } });
    console.log(`\nTotal Shareholders with email '${testEmail}': ${count} (Expected: 2)`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
