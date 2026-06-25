'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { TimeSlot } from '@/types';

function SlotSkeleton() {
  return (
    <div className="flex flex-wrap gap-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 w-32 bg-outline-variant rounded-full" />
      ))}
    </div>
  );
}

function formatSlotTime(timeStr: string): string {
  // timeStr may be "09:00:00" or "09:00" or a full ISO string
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return timeStr;
}

export default function TimePage() {
  const router = useRouter();
  const { event, selectedDate, selectedLocation, selectedSlot, setSlot } = useBookingStore();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) {
      router.replace('/');
      return;
    }
    if (!selectedDate) {
      router.replace('/book/date');
      return;
    }
    async function fetchSlots() {
      try {
        // Filter by location so only the selected city's slots are shown
        const locationParam = selectedLocation?.city
          ? `&location_id=${selectedLocation.id}`
          : '';
        const res = await fetch(`/api/slots?date_id=${selectedDate!.id}${locationParam}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch slots');
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : data.slots ?? [data]);
      } catch {
        setError('Could not load time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [event, selectedDate, router]);

  if (!event || !selectedDate) return null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator
              current={3}
              total={6}
              labels={['Location', 'Date', 'Time', 'Tickets', 'Details', 'Confirm']}
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-on-surface text-xl font-semibold mb-1">Pick a Time Slot</h2>
            <p className="text-on-surface-variant text-sm">
              Choose a session time that fits your schedule.
            </p>
          </div>

          {/* Selected date summary */}
          <div className="bg-primary-container rounded-2xl px-4 py-3 mb-6 inline-flex items-center gap-2">
            <svg
              className="w-4 h-4 text-on-primary-container"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-on-primary-container text-sm font-medium">
              {new Date(selectedDate.event_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <SlotSkeleton />
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-on-surface-variant mb-4">{error}</p>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-3">
                {slots.map((slot, idx) => {
                  const isDisabled =
                    slot.remaining_capacity <= 0 ||
                    slot.status === 'sold_out' ||
                    slot.status === 'cancelled';
                  const isSelected = selectedSlot?.id === slot.id;
                  const displayTime = slot.slot_name || formatSlotTime(slot.start_time);
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx, duration: 0.25 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <Chip
                        selected={isSelected}
                        disabled={isDisabled}
                        onClick={() => setSlot(slot)}
                        className="min-w-[7.5rem] justify-center"
                      >
                        {displayTime}
                      </Chip>
                      <span
                        className={`text-xs font-medium ${
                          isDisabled
                            ? 'text-on-surface-variant/40'
                            : isSelected
                            ? 'text-primary'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {isDisabled
                          ? 'Sold out'
                          : `${slot.remaining_capacity} left`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {slots.length === 0 && (
                <p className="text-on-surface-variant text-sm text-center py-8">
                  No time slots available for this date.
                </p>
              )}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outlined" onClick={() => router.push('/book/date')} className="flex-1">
              Back
            </Button>
            <Button
              variant="filled"
              onClick={() => router.push('/book/tickets')}
              disabled={!selectedSlot}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
