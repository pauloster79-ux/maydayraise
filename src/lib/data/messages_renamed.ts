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

  console.log('FORMATTING:', firstName, lastName, preference);

  switch (preference) {
    case 'FULL_NAME':
      return `FULL: ${firstName} ${lastName}`;
    case 'FIRST_NAME_ONLY':
      // User requested full name even for this preference
      return `FIRST: ${firstName} ${lastName}`;
    case 'ANONYMOUS':
      return 'ANON: Community Investor';
    default:
      return `DEFAULT: ${preference}`;
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
  ['investor-messages-v4'],
  { revalidate: 60 }
);

