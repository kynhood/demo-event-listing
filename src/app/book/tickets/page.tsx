'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TicketsPage() {
  const router = useRouter();
  const { selectedSlot, ticketQuantity, setTicketQuantity, event, selectedLocation, selectedDate } =
    useBookingStore();

  useEffect(() => {
    if (!event || !selectedLocation || !selectedDate || !selectedSlot) {
      router.replace('/');
    }
  }, [event, selectedLocation, selectedDate, selectedSlot, router]);

  if (!event || !selectedLocation || !selectedDate || !selectedSlot) {
    return null;
  }

  const remaining = selectedSlot.remaining_capacity;
  const canIncrement = ticketQuantity < 10 && ticketQuantity < remaining;
  const canDecrement = ticketQuantity > 1;

  function decrement() {
    if (canDecrement) setTicketQuantity(ticketQuantity - 1);
  }

  function increment() {
    if (canIncrement) setTicketQuantity(ticketQuantity + 1);
  }

  function handleContinue() {
    router.push('/book/details');
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
          <StepIndicator current={4} total={6} />

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Select Tickets</h1>
            <p className="text-sm text-on-surface-variant mt-1">Choose how many tickets you need</p>
          </div>

          {/* Free Ticket Info Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-on-surface">Free Ticket</span>
                  <span className="text-xs font-medium bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
                    Free Entry
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">General admission — no seat assignment</p>
              </div>
              <span className="text-2xl font-bold text-primary">₹0</span>
            </div>
          </Card>

          {/* Quantity Selector */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface">Quantity</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {remaining} spots remaining
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrement}
                  disabled={!canDecrement}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-primary text-xl font-bold
                    hover:bg-primary/8 active:bg-primary/12 transition-colors
                    disabled:text-on-surface/38 disabled:border-on-surface/12 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-8 text-center text-xl font-bold text-on-surface tabular-nums">
                  {ticketQuantity}
                </span>
                <button
                  onClick={increment}
                  disabled={!canIncrement}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-primary text-xl font-bold
                    hover:bg-primary/8 active:bg-primary/12 transition-colors
                    disabled:text-on-surface/38 disabled:border-on-surface/12 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs text-on-surface-variant mt-4 text-center">
              Maximum 10 tickets per booking
            </p>
          </Card>

          {/* Order Summary */}
          <Card className="p-5 bg-primary-container border-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-primary-container">Total</span>
              <div className="text-right">
                <span className="text-xl font-bold text-on-primary-container">₹0</span>
                <p className="text-xs text-on-primary-container/70">{ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outlined"
              className="flex-1"
              onClick={() => router.push('/book/time')}
            >
              Back
            </Button>
            <Button
              variant="filled"
              className="flex-1"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
