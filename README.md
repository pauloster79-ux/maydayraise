This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Bank transfer configuration

The investor payment flow now displays live bank details and references immediately after an application is confirmed. Configure the following environment variables (they are public-facing) so the UI can render accurate instructions:

```bash
NEXT_PUBLIC_BANK_ACCOUNT_NAME="Mayday Community Benefit Society"
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER="00000000"
NEXT_PUBLIC_BANK_SORT_CODE="001122"
# optional international details
NEXT_PUBLIC_BANK_IBAN="GB00FOOB00000000000000"
NEXT_PUBLIC_BANK_BIC="FOOBGB2L"
```

Restart the dev server after changing env values so they propagate to the client bundle.

## Bank statement reconciliation

Admins can reconcile inbound transfers by visiting `/admin/payments` and uploading a CSV export from the bank. The file must include the columns `Date`, `Amount`, `Reference`, and optionally `Description`. The upload flow:

1. Choose the CSV (UTF-8) file and click **Upload & reconcile**.
2. The server parses each row, matches unsettled applications by their payment reference (e.g. `MAY-1234-5678`), and creates confirmed `Payment` records for perfect matches.
3. The results surface matched payments, amount mismatches, already-settled references, duplicates within the file, and unknown references. Unknown references can be downloaded as a CSV for follow-up.

The reconciliation step also revalidates the admin dashboard and application listings so totals refresh immediately.

## Admin access

The admin area is available at `/admin` (e.g., `http://localhost:3000/admin` during development). It provides:

- **Dashboard**: Overview of total funds raised and application status counts
- **Applications**: Complete list of all investment applications with shareholder details
- **Reconciliation**: Bank statement upload and payment matching tools

### Logging in

1. Navigate to `/auth/login` (e.g., `http://localhost:3000/auth/login`)
2. Sign in with an admin user account (email and password)
3. The user must have `role='admin'` in the database
4. After successful login, you'll be redirected to the admin dashboard

Only authenticated users with the admin role can access the admin area. Unauthenticated requests are automatically redirected to the login page.
