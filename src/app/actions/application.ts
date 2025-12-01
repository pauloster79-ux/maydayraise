'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateReferenceCode } from '@/lib/utils/reference';
// import { ApplicationStatus, InvestorType } from '@prisma/client'; // Removed Enums for SQLite
import { revalidatePath } from 'next/cache';

// Zod Schemas for Validation
const PersonalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(5, 'Postcode is required'),
  country: z.string().default('United Kingdom'),
});

const JointApplicantSchema = z.object({
  secondaryName: z.string().optional(),
});

const OrganizationSchema = z.object({
  organizationName: z.string().optional(),
  organizationType: z.string().optional(),
  companyNumber: z.string().optional(),
});

const InvestmentSchema = z.object({
  amount: z.number().min(250, 'Minimum investment is £250').max(100000, 'Maximum investment is £100,000'),
});

const ApplicationSchema = PersonalInfoSchema
  .merge(JointApplicantSchema)
  .merge(OrganizationSchema)
  .merge(InvestmentSchema)
  .extend({
    investorType: z.string(), // Was Enum
    riskAcknowledgments: z.any(), // Should be strictly typed in a real app
    message: z.string().optional(),
    displayNamePreference: z.string().optional(),
  });

export type CreateApplicationState = {
  errors?: {
    [K in keyof z.infer<typeof ApplicationSchema>]?: string[];
  };
  message?: string;
  applicationId?: string;
  reference?: string;
};

export async function createApplication(prevState: CreateApplicationState, formData: FormData): Promise<CreateApplicationState> {
  // This function would typically handle the full multi-step form submission
  // For now, let's assume we receive a structured object or we parse FormData manually
  // In a multi-step wizard, we might save partial state or submit all at once at the end.

  // Example: Parsing a complete submission
  // const rawData = Object.fromEntries(formData.entries());
  console.log(formData);

  // For demonstration, we'll parse a simplified version or assume proper input
  // In reality, we'd use React Hook Form to manage state and send a JSON payload

  // Let's mock receiving a JSON payload for the Server Action for simplicity
  // or just return a mock success for now as we build the frontend form later

  return { message: 'Not implemented yet' };
}


// API to create an application from JSON data (client-side wizard will call this)
export async function submitApplication(data: z.infer<typeof ApplicationSchema>) {
  const validatedFields = ApplicationSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Validation failed', details: validatedFields.error.flatten() };
  }

  const {
    investorType,
    firstName, lastName, email, phone, dateOfBirth,
    addressLine1, addressLine2, city, postcode, country,
    secondaryName,
    organizationName, organizationType, companyNumber,
    amount,
    riskAcknowledgments,
    message,
    displayNamePreference
  } = validatedFields.data;

  try {
    // 1. Create or Update Shareholder
    // Check if shareholder exists by email? 
    // For this share offer, we might want to create a new record or link.
    // Let's assume unique email per shareholder for simplicity or create new.

    const shareholder = await prisma.shareholder.upsert({
      where: { email },
      update: {
        firstName, lastName, phone, dateOfBirth,
        addressLine1, addressLine2, city, postcode, country,
        secondaryName: investorType === 'JOINT' ? secondaryName : undefined,
        organizationName: investorType === 'ORGANIZATION' ? organizationName : undefined,
        organizationType: investorType === 'ORGANIZATION' ? organizationType : undefined,
        companyNumber: investorType === 'ORGANIZATION' ? companyNumber : undefined,
        investorType
      },
      create: {
        email,
        firstName, lastName, phone, dateOfBirth,
        addressLine1, addressLine2, city, postcode, country,
        secondaryName: investorType === 'JOINT' ? secondaryName : undefined,
        organizationName: investorType === 'ORGANIZATION' ? organizationName : undefined,
        organizationType: investorType === 'ORGANIZATION' ? organizationType : undefined,
        companyNumber: investorType === 'ORGANIZATION' ? companyNumber : undefined,
        investorType
      }
    });

    // 2. Create Application
    const reference = generateReferenceCode();

    const application = await prisma.application.create({
      data: {
        shareholderId: shareholder.id,
        amount,
        shares: Math.floor(amount), // 1 share = £1
        status: 'PENDING',
        paymentReference: reference, // Pre-generate for bank transfer availability
        riskAcknowledgments: JSON.stringify(riskAcknowledgments ?? {}), // Store as string for SQLite
      }
    });

    // 3. Create Message if provided
    if (message && message.trim().length > 0) {
      await prisma.message.create({
        data: {
          shareholderId: shareholder.id,
          applicationId: application.id,
          content: message,
          displayPreference: displayNamePreference || 'FIRST_NAME_ONLY',
          isVisible: true, // Default to visible, admin can hide
        }
      });
    }

    try {
      revalidatePath('/admin/applications');
      revalidatePath('/'); // Update home screen
    } catch (err) {
      console.warn('Failed to revalidate paths:', err);
    }
    return { success: true, applicationId: application.id, reference };

  } catch (error) {
    console.error('Failed to submit application:', error);
    return { error: 'Database error' };
  }
}

