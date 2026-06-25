'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Location } from '@/types';

function LocationSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-outline-variant rounded-3xl" />
      ))}
    </div>
  );
}

const CITY_ICONS: Record<string, string> = {
  Mumbai: '🌊',
  Delhi: '🏛️',
  Bangalore: '🌿',
  Chennai: '🎭',
  Hyderabad: '💎',
};

function getCityIcon(city: string): string {
  for (const key of Object.keys(CITY_ICONS)) {
    if (city.toLowerCase().includes(key.toLowerCase())) return CITY_ICONS[key];
  }
  return '📍';
}

export default function LocationPage() {
  const router = useRouter();
  const { event, selectedLocation, setLocation } = useBookingStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) {
      router.replace('/');
      return;
    }
    async function fetchLocations() {
      try {
        const res = await fetch(`/api/locations?event_id=${event!.id}`);
        if (!res.ok) throw new Error('Failed to fetch locations');
        const data = await res.json();
        setLocations(Array.isArray(data) ? data : [data]);
      } catch {
        setError('Could not load locations. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
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
              current={1}
              total={6}
              labels={['Location', 'Date', 'Time', 'Tickets', 'Details', 'Confirm']}
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-on-surface text-xl font-semibold mb-1">Choose a City</h2>
            <p className="text-on-surface-variant text-sm">
              Select the city where you want to attend the event.
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <LocationSkeleton />
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
              className="space-y-3 mb-8"
            >
              {locations.map((loc, idx) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                >
                  <Card
                    selected={selectedLocation?.id === loc.id}
                    onClick={() => setLocation(loc)}
                    className="p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-2xl flex-shrink-0">
                        {getCityIcon(loc.city)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-on-surface text-lg font-semibold leading-tight">
                          {loc.city}
                        </p>
                        <p className="text-on-surface-variant text-sm truncate">
                          {loc.location_name}
                        </p>
                      </div>
                      {selectedLocation?.id === loc.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3.5 h-3.5 text-on-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outlined" onClick={() => router.push('/')} className="flex-1">
              Back
            </Button>
            <Button
              variant="filled"
              onClick={() => router.push('/book/date')}
              disabled={!selectedLocation}
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
