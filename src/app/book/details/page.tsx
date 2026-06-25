'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '@/store/bookingStore';
import { bookingFormSchema, BookingFormSchema } from '@/lib/validations';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export default function DetailsPage() {
  const router = useRouter();
  const {
    event,
    selectedLocation,
    selectedDate,
    selectedSlot,
    ticketQuantity,
    customerName,
    customerEmail,
    customerPhone,
    customerCity,
    setCustomerInfo,
  } = useBookingStore();

  useEffect(() => {
    if (!event || !selectedLocation || !selectedDate || !selectedSlot) {
      router.replace('/');
    }
  }, [event, selectedLocation, selectedDate, selectedSlot, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormSchema>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: customerName || '',
      email: customerEmail || '',
      phone: customerPhone || '',
      city: customerCity || '',
      agreeTerms: false,
    },
  });

  if (!event || !selectedLocation || !selectedDate || !selectedSlot) {
    return null;
  }

  function onSubmit(data: BookingFormSchema) {
    setCustomerInfo({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
    });
    router.push('/book/review');
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >
          {/* Step Indicator */}
          <StepIndicator current={5} total={6} />

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Your Details</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Fill in your information to complete the booking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Card className="p-5 flex flex-col gap-4">
              <TextField
                label="Full Name"
                type="text"
                autoComplete="name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <TextField
                label="Email Address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <TextField
                label="Phone Number"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                error={errors.phone?.message}
                supportingText={!errors.phone ? '10-digit Indian mobile number' : undefined}
                {...register('phone')}
              />

              <TextField
                label="City"
                type="text"
                autoComplete="address-level2"
                error={errors.city?.message}
                {...register('city')}
              />
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-5 h-5 rounded border-outline accent-primary flex-shrink-0 cursor-pointer"
                  {...register('agreeTerms')}
                />
                <span className="text-sm text-on-surface leading-relaxed">
                  I agree to the{' '}
                  <span className="text-primary font-medium underline underline-offset-2">
                    Terms &amp; Conditions
                  </span>{' '}
                  and{' '}
                  <span className="text-primary font-medium underline underline-offset-2">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-error mt-2 px-1">{errors.agreeTerms.message}</p>
              )}
            </Card>

            {/* Booking Summary hint */}
            <Card className="p-4 bg-secondary-container border-0">
              <p className="text-xs text-on-secondary-container font-medium">
                {ticketQuantity} free ticket{ticketQuantity > 1 ? 's' : ''} for {event.title}
              </p>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                className="flex-1"
                onClick={() => router.push('/book/tickets')}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="filled"
                className="flex-1"
                loading={isSubmitting}
              >
                Review Booking
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
