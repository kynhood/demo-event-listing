'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { formatDate } from '@/lib/utils';
import { BookingConfirmation } from '@/types';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('ref') || sessionStorage.getItem('booking_reference') || '';

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    if (!bookingRef) {
      router.replace('/');
      return;
    }

    async function fetchConfirmation() {
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingRef)}`);
        if (!response.ok) {
          throw new Error(`Could not load booking details (${response.status})`);
        }
        const data: BookingConfirmation = await response.json();
        setConfirmation(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load booking confirmation.';
        setError(message);
        setSnackbar({ open: true, message });
      } finally {
        setLoading(false);
      }
    }

    fetchConfirmation();
  }, [bookingRef, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Loading your booking…</p>
        </div>
      </div>
    );
  }

  const summaryRows = confirmation
    ? [
        { label: 'Event', value: confirmation.event.title },
        {
          label: 'Location',
          value: `${confirmation.location.city} — ${confirmation.location.location_name}`,
        },
        { label: 'Date', value: formatDate(confirmation.eventDate.event_date) },
        {
          label: 'Time',
          value: `${confirmation.timeSlot.slot_name} · ${confirmation.timeSlot.start_time} – ${confirmation.timeSlot.end_time}`,
        },
        {
          label: 'Tickets',
          value: `${confirmation.booking.ticket_quantity} × Free`,
        },
        { label: 'Name', value: confirmation.booking.customer_name },
      ]
    : [];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 items-center"
        >
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex flex-col items-center gap-3 pt-4"
          >
            <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center">
              <svg
                className="w-10 h-10 text-on-tertiary-container"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-on-surface">Booking Confirmed!</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Your tickets are reserved. See you there!
              </p>
            </div>
          </motion.div>

          {/* Booking Reference */}
          <Card className="w-full p-5 bg-tertiary-container border-0">
            <div className="text-center">
              <p className="text-xs font-semibold text-on-tertiary-container/70 uppercase tracking-widest mb-1">
                Booking Reference
              </p>
              <p className="text-xl font-bold text-on-tertiary-container tracking-wider font-mono">
                {bookingRef}
              </p>
            </div>
          </Card>

          {/* QR Code */}
          {bookingRef && (
            <Card className="w-full p-6 flex flex-col items-center gap-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Show this at the venue
              </p>
              <div className="p-3 bg-white rounded-2xl border border-outline-variant">
                <QRCode value={bookingRef} size={160} />
              </div>
              <p className="text-xs text-on-surface-variant font-mono">{bookingRef}</p>
            </Card>
          )}

          {/* Booking Summary */}
          {confirmation && (
            <Card className="w-full p-5 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                Booking Details
              </h2>
              <div className="flex flex-col gap-2">
                {summaryRows.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-sm text-on-surface-variant min-w-[72px]">{label}</span>
                    <span className="text-sm font-medium text-on-surface text-right">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Ticket Numbers */}
          {confirmation && confirmation.tickets.length > 0 && (
            <Card className="w-full p-5 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                Your Ticket{confirmation.tickets.length > 1 ? 's' : ''}
              </h2>
              <div className="flex flex-col gap-2">
                {confirmation.tickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-outline-variant"
                  >
                    <span className="text-xs text-on-surface-variant">Ticket {idx + 1}</span>
                    <span className="text-sm font-mono font-semibold text-on-surface">
                      {ticket.ticket_number}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Error state fallback */}
          {error && !confirmation && (
            <Card className="w-full p-5 bg-error-container border-0">
              <p className="text-sm text-on-error-container text-center">{error}</p>
            </Card>
          )}

          {/* Book Another */}
          <div className="w-full pt-2 pb-6">
            <Button
              variant="tonal"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Book Another Event
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

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
