'use server';

import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';
import { normalizeReference } from '@/lib/utils/reference';

type StatementRow = {
  Date?: string;
  Amount?: string;
  Reference?: string;
  Description?: string;
};

type UploadedRowResult = {
  reference: string;
  amount: number;
  description?: string;
  date?: string;
};

type MatchedResult = UploadedRowResult & {
  applicationId: string;
  applicantName: string;
};

type MismatchResult = UploadedRowResult & {
  applicationId: string;
  applicantName: string;
  expectedAmount: number;
};

type AlreadySettledResult = UploadedRowResult & {
  applicationId: string;
  applicantName: string;
  currentStatus: string;
};

export type ReconciliationSummary = {
  processedRows: number;
  settledTotal: number;
  matched: MatchedResult[];
  amountMismatches: MismatchResult[];
  alreadySettled: AlreadySettledResult[];
  unknownReferences: UploadedRowResult[];
  duplicateReferences: UploadedRowResult[];
  errors: string[];
};

const DATE_REGEX = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/;

function parseStatementDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const ddmmyy = value.match(DATE_REGEX);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const yyyy = year.length === 2 ? `20${year}` : year;
    const iso = `${yyyy}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`;
    const fallback = new Date(iso);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }
  }

  return null;
}

function parseAmount(value?: string): number | null {
  if (typeof value !== 'string') return null;
  const normalised = value.replace(/[,\s£]/g, '');
  const amount = Number(normalised);
  if (!Number.isFinite(amount)) return null;
  return amount;
}

function readCsv(text: string): StatementRow[] {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as StatementRow[];
}

export async function processBankStatement(formData: FormData): Promise<ReconciliationSummary> {
  const summary: ReconciliationSummary = {
    processedRows: 0,
    settledTotal: 0,
    matched: [],
    amountMismatches: [],
    alreadySettled: [],
    unknownReferences: [],
    duplicateReferences: [],
    errors: [],
  };

  const file = formData.get('statement');
  if (!(file instanceof File)) {
    summary.errors.push('No statement file uploaded.');
    return summary;
  }

  const text = await file.text();

  let rows: StatementRow[];
  try {
    rows = readCsv(text);
  } catch {
    summary.errors.push('Unable to parse CSV file. Please ensure it has headers Date, Amount, Reference.');
    return summary;
  }

  if (rows.length === 0) {
    summary.errors.push('CSV file is empty.');
    return summary;
  }

  const uniqueNormalizedRefs = new Set(
    rows
      .map((row) => normalizeReference(row.Reference ?? ''))
      .filter((ref) => ref.length > 0),
  );

  const applications = await prisma.application.findMany({
    where: {
      paymentReference: { not: null },
    },
    select: {
      id: true,
      amount: true,
      status: true,
      paymentReference: true,
      shareholder: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  type ApplicationRecord = (typeof applications)[number];
  const applicationMap = new Map<string, ApplicationRecord[]>();
  applications.forEach((application) => {
    if (!application.paymentReference) return;
    const key = normalizeReference(application.paymentReference);
    if (!uniqueNormalizedRefs.has(key)) {
      return;
    }
    if (!applicationMap.has(key)) {
      applicationMap.set(key, []);
    }
    applicationMap.get(key)!.push(application);
  });

  const processedReferences = new Set<string>();

  for (const row of rows) {
    const originalReference = row.Reference?.trim() ?? '';
    const normalizedReference = normalizeReference(originalReference);
    const parsedAmount = parseAmount(row.Amount);
    const parsedDate = parseStatementDate(row.Date);

    if (!originalReference || !normalizedReference) {
      summary.errors.push('Row missing payment reference and was skipped.');
      continue;
    }

    if (processedReferences.has(normalizedReference)) {
      summary.duplicateReferences.push({
        reference: originalReference,
        amount: parsedAmount ?? 0,
        description: row.Description,
        date: row.Date,
      });
      continue;
    }

    processedReferences.add(normalizedReference);
    summary.processedRows += 1;

    if (parsedAmount === null) {
      summary.errors.push(`Invalid amount "${row.Amount}" for reference ${originalReference}.`);
      continue;
    }

    const candidates = applicationMap.get(normalizedReference) ?? [];

    if (candidates.length === 0) {
      summary.unknownReferences.push({
        reference: originalReference,
        amount: parsedAmount,
        description: row.Description,
        date: row.Date,
      });
      continue;
    }

    const unsettled = candidates.find(
      (candidate) => candidate.status !== 'PAID' && candidate.status !== 'COMPLETED',
    );

    const targetApplication = unsettled ?? candidates[0];

    const applicantName = `${targetApplication.shareholder.firstName} ${targetApplication.shareholder.lastName}`;

    if (targetApplication.status === 'PAID' || targetApplication.status === 'COMPLETED') {
      summary.alreadySettled.push({
        reference: originalReference,
        amount: parsedAmount,
        description: row.Description,
        date: row.Date,
        applicationId: targetApplication.id,
        applicantName,
        currentStatus: targetApplication.status,
      });
      continue;
    }

    const amountMatches = Math.abs(parsedAmount - targetApplication.amount) < 0.5;
    if (!amountMatches) {
      summary.amountMismatches.push({
        reference: originalReference,
        amount: parsedAmount,
        description: row.Description,
        date: row.Date,
        applicationId: targetApplication.id,
        applicantName,
        expectedAmount: targetApplication.amount,
      });
      continue;
    }

    const confirmedAt = parsedDate ?? new Date();

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          applicationId: targetApplication.id,
          amount: parsedAmount,
          paymentMethod: 'BANK_TRANSFER',
          bankReference: originalReference,
          providerReference: null,
          status: 'CONFIRMED',
          confirmedAt,
        },
      });

      await tx.application.update({
        where: { id: targetApplication.id },
        data: { status: 'PAID' },
      });
    });

    summary.settledTotal += parsedAmount;
    summary.matched.push({
      reference: originalReference,
      amount: parsedAmount,
      description: row.Description,
      date: row.Date,
      applicationId: targetApplication.id,
      applicantName,
    });
  }

  await revalidatePath('/admin');
  await revalidatePath('/admin/applications');

  return summary;
}


