import 'dotenv/config';

import { submitApplication } from '@/app/actions/application';

async function main() {
  const res = await submitApplication({
    investorType: 'INDIVIDUAL',
    firstName: 'Test',
    lastName: 'User',
    email: `test+${Date.now()}@example.com`,
    phone: '0123456789',
    dateOfBirth: new Date('1990-01-01'),
    addressLine1: '123 Test Street',
    addressLine2: 'Suite 1',
    city: 'Frome',
    postcode: 'BA11 1AB',
    country: 'United Kingdom',
    amount: 500,
    riskAcknowledgments: {
      confirmed: true,
      timestamp: new Date().toISOString(),
    },
  });

  console.log('submitApplication response:', res);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


