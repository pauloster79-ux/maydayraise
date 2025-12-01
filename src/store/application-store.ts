import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InvestorType, DisplayNamePreference } from '@/generated/client/enums';

export type ApplicationData = {
  investorType: InvestorType | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  
  secondaryName?: string;
  
  organizationName?: string;
  organizationType?: string;
  companyNumber?: string;
  
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  
  amount: number;
  
  risksAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
  
  message?: string;
  displayNamePreference: DisplayNamePreference;
  beneficiaryName?: string;
};

interface ApplicationStore {
  step: number;
  data: ApplicationData;
  setStep: (step: number) => void;
  updateData: (data: Partial<ApplicationData>) => void;
  reset: () => void;
}

const initialData: ApplicationData = {
  investorType: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: null,
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  amount: 0,
  risksAccepted: false,
  privacyAccepted: false,
  marketingAccepted: false,
  displayNamePreference: DisplayNamePreference.FIRST_NAME_ONLY,
};

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      step: 1,
      data: initialData,
      setStep: (step) => set({ step }),
      updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
      reset: () => set({ step: 1, data: initialData }),
    }),
    {
      name: 'mayday-application-storage',
    }
  )
);

