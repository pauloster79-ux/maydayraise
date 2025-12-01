import { prisma } from '@/lib/prisma';
// import { DisplayNamePreference } from '@prisma/client'; // Removed, using string
import { unstable_cache } from 'next/cache';

export type InvestorMessage = {
  id: string;
  content: string;
  date: Date;
  author: string;
  location: string;
};

function formatAuthorName(
  firstName: string,
  lastName: string,
  preference: string,
  orgName?: string | null
): string {
  if (orgName) return orgName;

  switch (preference) {
    case 'FULL_NAME':
      return `${firstName} ${lastName}`;
    case 'FIRST_NAME_ONLY':
      // User requested full name even for this preference
      return `${firstName} ${lastName}`;
    case 'ANONYMOUS':
      return 'Community Investor';
    default:
      return 'Community Investor';
  }
}

export const getInvestorMessages = unstable_cache(
  async (): Promise<InvestorMessage[]> => {
    const messages = await prisma.message.findMany({
      where: {
        isVisible: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      include: {
        shareholder: true,
      }
    });

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      date: msg.createdAt,
      author: formatAuthorName(
        msg.shareholder.firstName,
        msg.shareholder.lastName,
        msg.displayPreference,
        msg.shareholder.organizationName
      ),
      location: msg.shareholder.city || 'Frome', // Default or actual city
    }));
  },
  ['investor-messages-v6'],
  { revalidate: 60 }
);
