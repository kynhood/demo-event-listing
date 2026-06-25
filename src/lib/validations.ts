import { z } from 'zod';

export const bookingFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be under 100 characters'),
  agreeTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
});

export type BookingFormSchema = z.infer<typeof bookingFormSchema>;
