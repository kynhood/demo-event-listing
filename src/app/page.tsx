'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';

function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative w-full h-72 md:h-96 rounded-3xl bg-outline-variant overflow-hidden mb-6" />
      <div className="h-8 bg-outline-variant rounded-full w-3/4 mb-3" />
      <div className="h-4 bg-outline-variant rounded-full w-full mb-2" />
      <div className="h-4 bg-outline-variant rounded-full w-5/6 mb-6" />
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-16 bg-outline-variant rounded-2xl" />
        ))}
      </div>
      <div className="h-12 bg-outline-variant rounded-full w-48 mx-auto" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { setEvent } = useBookingStore();
  const [event, setLocalEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        const ev: Event = Array.isArray(data) ? data[0] : data;
        setLocalEvent(ev);
        setEvent(ev);
      } catch {
        setError('Could not load event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [setEvent]);

  const bannerUrl = event?.banner_url || FALLBACK_BANNER;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <HeroSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-on-surface-variant mb-4">{error}</p>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Hero Banner */}
            <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-6 shadow-lg">
              <img
                src={bannerUrl}
                alt={event?.title ?? 'Event Banner'}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-on-primary text-xs font-semibold px-3 py-1 rounded-full">
                  Free Entry
                </span>
              </div>
              {/* Title on banner */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight drop-shadow-md">
                  {event?.title ?? 'AI Design Summit 2026'}
                </h1>
              </div>
            </div>

            {/* Description */}
            <p className="text-on-surface-variant text-base leading-relaxed mb-6">
              {event?.description ??
                'Join the most anticipated design and AI summit of 2026. Network with industry leaders, attend workshops, and be part of the future of design.'}
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {[
                { value: '5', label: 'Cities' },
                { value: '5', label: 'Dates' },
                { value: '10,000', label: 'Tickets' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-primary-container rounded-2xl p-4 text-center"
                >
                  <p className="text-on-primary-container text-xl font-bold">{stat.value}</p>
                  <p className="text-on-primary-container/70 text-xs font-medium mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                variant="filled"
                onClick={() => router.push('/book/location')}
                className="w-full max-w-xs"
              >
                Book Free Ticket
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
