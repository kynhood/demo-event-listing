import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/slots/all
// Returns all slots grouped by city → date → time
export async function GET() {
  const { data: slots, error } = await supabase
    .from('time_slots')
    .select(`
      id, slot_name, start_time, end_time, capacity, remaining_capacity, status,
      locations ( id, city, location_name ),
      event_dates ( id, event_date )
    `)
    .order('start_time');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by city → date → slots
  const grouped: Record<string, Record<string, unknown[]>> = {};

  for (const slot of slots ?? []) {
    const loc = slot.locations as unknown as { city: string; location_name: string } | null;
    const dateRow = slot.event_dates as unknown as { event_date: string } | null;
    const city = loc?.city ?? 'Unknown';
    const date = dateRow?.event_date ?? 'Unknown';

    if (!grouped[city]) grouped[city] = {};
    if (!grouped[city][date]) grouped[city][date] = [];

    grouped[city][date].push({
      id: slot.id,
      slot_name: slot.slot_name,
      start_time: slot.start_time,
      end_time: slot.end_time,
      capacity: slot.capacity,
      remaining_capacity: slot.remaining_capacity,
      status: slot.status,
    });
  }

  return NextResponse.json({
    total: slots?.length ?? 0,
    cities: grouped,
  });
}
