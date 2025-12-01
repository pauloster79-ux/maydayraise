import { prisma } from '@/lib/prisma';
// import { PaymentStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type FundraisingStats = {
  totalRaised: number;
  investorCount: number;
  targetAmount: number;
  minimumAmount: number;
  percentage: number;
  raiseEndDate?: Date;
};

// Cache the result for 60 seconds to avoid hammering the DB on high traffic
// Cache the result for 60 seconds to avoid hammering the DB on high traffic
// export const getFundraisingStats = unstable_cache(
export const getFundraisingStats = async (): Promise<FundraisingStats> => {
  // Default values
  let targetAmount = 2700000; // £2.7m
  let minimumAmount = 1300000; // £1.3m
  let raiseEndDate = new Date('2025-03-28');

  try {
    // @ts-ignore - Settings model might not exist yet
    const settings = await prisma.settings.findFirst();
    if (settings) {
      targetAmount = settings.targetRaiseAmount || targetAmount;
      minimumAmount = settings.minRaiseAmount || minimumAmount;
      if (settings.raiseEndDate) {
        raiseEndDate = settings.raiseEndDate;
      }
    }
  } catch (e) {
    // Ignore error if table doesn't exist yet
  }

  // Aggregate amounts from paid applications
  const aggregate = await prisma.application.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      isPaid: true,
    },
  });

  // Count paid applications (investors)
  const investorCount = await prisma.application.count({
    where: {
      isPaid: true
    }
  });

  const totalRaised = aggregate._sum.amount || 0;
  const percentage = (totalRaised / minimumAmount) * 100;

  return {
    totalRaised,
    investorCount,
    targetAmount,
    minimumAmount,
    percentage,
    raiseEndDate,
  };
};
//   },
//   ['fundraising-stats'],
//   { revalidate: 60 }
// );

