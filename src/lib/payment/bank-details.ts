export type BankDetails = {
  accountName: string;
  accountNumber: string;
  sortCode: string;
  iban?: string;
  bic?: string;
};

export type BankDetailsState =
  | { configured: true; details: BankDetails }
  | { configured: false; missing: string[] };

const CONFIG_KEYS = {
  accountName: 'NEXT_PUBLIC_BANK_ACCOUNT_NAME',
  accountNumber: 'NEXT_PUBLIC_BANK_ACCOUNT_NUMBER',
  sortCode: 'NEXT_PUBLIC_BANK_SORT_CODE',
  iban: 'NEXT_PUBLIC_BANK_IBAN',
  bic: 'NEXT_PUBLIC_BANK_BIC',
} as const;

let cachedState: BankDetailsState | null = null;

function readEnv(key: keyof typeof CONFIG_KEYS): string | undefined {
  return process.env[CONFIG_KEYS[key]]?.trim();
}

function hydrate(): BankDetailsState {
  const accountName = readEnv('accountName');
  const accountNumber = readEnv('accountNumber');
  const sortCode = readEnv('sortCode');
  const iban = readEnv('iban');
  const bic = readEnv('bic');

  const missing = [
    accountName ? null : CONFIG_KEYS.accountName,
    accountNumber ? null : CONFIG_KEYS.accountNumber,
    sortCode ? null : CONFIG_KEYS.sortCode,
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return {
      configured: false,
      missing,
    };
  }

  return {
    configured: true,
    details: {
      accountName: accountName!,
      accountNumber: accountNumber!,
      sortCode: sortCode!,
      iban: iban || undefined,
      bic: bic || undefined,
    },
  };
}

export function getBankDetails(): BankDetailsState {
  if (!cachedState) {
    cachedState = hydrate();
  }
  return cachedState;
}

export function formatSortCode(sortCode: string): string {
  const digits = sortCode.replace(/\D/g, '').slice(0, 6);
  if (digits.length !== 6) {
    return sortCode;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}


