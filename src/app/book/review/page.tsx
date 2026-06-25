'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { formatDate } from '@/lib/utils';

export default function ReviewPage() {
  const router = useRouter();
  const store = useBookingStore();
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
    reset,
  } = store;

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    if (!event || !selectedLocation || !selectedDate || !selectedSlot || !customerName) {
      router.replace('/');
    }
  }, [event, selectedLocation, selectedDate, selectedSlot, customerName, router]);

  if (!event || !selectedLocation || !selectedDate || !selectedSlot || !customerName) {
    return null;
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event!.id,
          location_id: selectedLocation!.id,
          event_date_id: selectedDate!.id,
          time_slot_id: selectedSlot!.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_city: customerCity,
          ticket_quantity: ticketQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Booking failed (${response.status})`);
      }

      const data = await response.json();
      const bookingRef: string = data?.booking?.booking_reference || data?.booking_reference;

      if (!bookingRef) {
        throw new Error('Invalid response from server');
      }

      sessionStorage.setItem('booking_reference', bookingRef);
      reset();
      router.push(`/book/success?ref=${encodeURIComponent(bookingRef)}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSnackbar({ open: true, message });
    } finally {
      setLoading(false);
    }
  }

  const rows: { label: string; value: string }[] = [
    { label: 'Event', value: event.title },
    { label: 'Location', value: `${selectedLocation.city} — ${selectedLocation.location_name}` },
    { label: 'Date', value: formatDate(selectedDate.event_date) },
    {
      label: 'Time',
      value: `${selectedSlot.slot_name} · ${selectedSlot.start_time} – ${selectedSlot.end_time}`,
    },
    { label: 'Tickets', value: `${ticketQuantity} × Free (₹0)` },
  ];

  const customerRows: { label: string; value: string }[] = [
    { label: 'Name', value: customerName },
    { label: 'Email', value: customerEmail },
    { label: 'Phone', value: customerPhone },
    { label: 'City', value: customerCity },
  ];

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
          <StepIndicator current={6} total={6} />

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Review &amp; Confirm</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Please review your booking details before confirming
            </p>
          </div>

          {/* Event Summary */}
          <Card className="p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
              Booking Summary
            </h2>
            <div className="flex flex-col gap-2">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-on-surface-variant min-w-[72px]">{label}</span>
                  <span className="text-sm font-medium text-on-surface text-right">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Details */}
          <Card className="p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
              Your Details
            </h2>
            <div className="flex flex-col gap-2">
              {customerRows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-on-surface-variant min-w-[48px]">{label}</span>
                  <span className="text-sm font-medium text-on-surface text-right break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Total */}
          <Card className="p-4 bg-primary-container border-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-primary-container">Total Amount</span>
              <span className="text-xl font-bold text-on-primary-container">₹0 · Free</span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outlined"
              className="flex-1"
              onClick={() => router.push('/book/details')}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              variant="filled"
              className="flex-1"
              loading={loading}
              onClick={handleConfirm}
            >
              Confirm Booking
            </Button>
          </div>
        </motion.div>
      </div>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        variant="error"
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
