'use client';

import { useApplicationStore } from '@/store/application-store';
import { WizardLayout } from '../wizard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { InvestorType } from '@/generated/client/enums';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ageRestrictionMessage = 'You must be 18 or older to invest.';

const isAtLeast18 = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return date <= cutoff;
};

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  // Simple date string validation for now, ideally use a date picker
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }).refine(isAtLeast18, {
    message: ageRestrictionMessage,
  }),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(5, 'Postcode is required'),

  // Conditional fields
  secondaryName: z.string().optional(),
  organizationName: z.string().optional(),
  organizationType: z.string().optional(),
  companyNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function Step2Details() {
  const { data, updateData, setStep } = useApplicationStore();

  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      postcode: data.postcode,
      secondaryName: data.secondaryName,
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      companyNumber: data.companyNumber,
    }
  });

  const onSubmit = (formData: FormData) => {
    updateData({
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth),
    });
    setStep(3);
  };



  const ageWarningActive = errors.dateOfBirth?.message === ageRestrictionMessage;

  return (
    <WizardLayout title="Your Details">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Organization Fields */}
        {data.investorType === InvestorType.ORGANIZATION && (
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-medium text-slate-900">Organisation Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organisation Name</Label>
                <Input id="organizationName" {...register('organizationName')} />
                {errors.organizationName && <span className="text-red-500 text-sm">{errors.organizationName.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNumber">Reg Number (if applicable)</Label>
                <Input id="companyNumber" {...register('companyNumber')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationType">Type (e.g. Ltd Company, Charity)</Label>
                <Input id="organizationType" {...register('organizationType')} />
              </div>
            </div>
          </div>
        )}

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName.message}</span>}
          </div>
        </div>

        {/* Joint Applicant */}
        {data.investorType === InvestorType.JOINT && (
          <div className="space-y-2">
            <Label htmlFor="secondaryName">Second Applicant Name</Label>
            <Input id="secondaryName" {...register('secondaryName')} />
            {errors.secondaryName && <span className="text-red-500 text-sm">{errors.secondaryName.message}</span>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register('phone')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          {errors.dateOfBirth && <span className="text-red-500 text-sm">{errors.dateOfBirth.message}</span>}
          <p
            className={`text-xs ${ageWarningActive ? 'text-red-600 font-semibold' : 'text-slate-500'}`}
          >
            You must be 18 or older to invest.
          </p>
        </div>

        {/* Address with Autocomplete */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-slate-900">Address</h3>

          {/* Address Autocomplete Component */}


          {/* Manual Address Fields */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input id="addressLine1" {...register('addressLine1')} />
            {errors.addressLine1 && <span className="text-red-500 text-sm">{errors.addressLine1.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input id="addressLine2" {...register('addressLine2')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City/Town</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" {...register('postcode')} />
              {errors.postcode && <span className="text-red-500 text-sm">{errors.postcode.message}</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button type="submit" disabled={!isValid}>Continue</Button>
        </div>
      </form>
    </WizardLayout>
  );
}
