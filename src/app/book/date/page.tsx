'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { EventDate } from '@/types';

function DateSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-28 bg-outline-variant rounded-3xl" />
      ))}
    </div>
  );
}

function formatDateParts(dateStr: string) {
  const d = new Date(dateStr);
  const dayOfWeek = d.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayNum = d.toLocaleDateString('en-IN', { day: 'numeric' });
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.toLocaleDateString('en-IN', { year: 'numeric' });
  return { dayOfWeek, dayNum, month, year };
}

export default function DatePage() {
  const router = useRouter();
  const { event, selectedDate, setDate } = useBookingStore();
  const [dates, setDates] = useState<EventDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) {
      router.replace('/');
      return;
    }
    async function fetchDates() {
      try {
        const res = await fetch(`/api/dates?event_id=${event!.id}`);
        if (!res.ok) throw new Error('Failed to fetch dates');
        const data = await res.json();
        setDates(Array.isArray(data) ? data : [data]);
      } catch {
        setError('Could not load dates. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchDates();
  }, [event, router]);

  if (!event) return null;

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
              current={2}
              total={6}
              labels={['Location', 'Date', 'Time', 'Tickets', 'Details', 'Confirm']}
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-on-surface text-xl font-semibold mb-1">Select a Date</h2>
            <p className="text-on-surface-variant text-sm">
              Pick the date that works best for you.
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <DateSkeleton />
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
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
            >
              {dates.map((date, idx) => {
                const { dayOfWeek, dayNum, month, year } = formatDateParts(date.event_date);
                const isSelected = selectedDate?.id === date.id;
                return (
                  <motion.div
                    key={date.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  >
                    <Card
                      selected={isSelected}
                      onClick={() => setDate(date)}
                      className="p-4 flex flex-col items-center text-center"
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isSelected ? 'text-on-secondary-container' : 'text-on-surface-variant'
                        }`}
                      >
                        {dayOfWeek}
                      </p>
                      <p
                        className={`text-4xl font-bold leading-none mb-1 ${
                          isSelected ? 'text-on-secondary-container' : 'text-on-surface'
                        }`}
                      >
                        {dayNum}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-on-secondary-container' : 'text-on-surface-variant'
                        }`}
                      >
                        {month}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected
                            ? 'text-on-secondary-container/70'
                            : 'text-on-surface-variant/60'
                        }`}
                      >
                        {year}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outlined" onClick={() => router.push('/book/location')} className="flex-1">
              Back
            </Button>
            <Button
              variant="filled"
              onClick={() => router.push('/book/time')}
              disabled={!selectedDate}
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
