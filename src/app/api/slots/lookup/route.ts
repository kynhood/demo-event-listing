import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/slots/lookup?city=Chennai&date=2026-06-17&time=09:00 AM
// Returns the slot UUID for a given city + date + time — use the id to PATCH status.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') ?? searchParams.get('location');
  const date = searchParams.get('date');   // YYYY-MM-DD
  const time = searchParams.get('time');   // e.g. "09:00 AM"

  if (!city || !date || !time) {
    return NextResponse.json(
      { error: 'city, date (YYYY-MM-DD), and time (e.g. "09:00 AM") are all required' },
      { status: 400 }
    );
  }

  // resolve city → location row
  const { data: location, error: locError } = await supabase
    .from('locations')
    .select('id, city, location_name')
    .ilike('city', city.trim())
    .single();

  if (locError || !location) {
    const { data: allLocs } = await supabase.from('locations').select('city');
    return NextResponse.json(
      { error: `City "${city}" not found`, available_cities: allLocs?.map((l) => l.city) ?? [] },
      { status: 404 }
    );
  }

  // resolve date string → event_date row
  const { data: dateRow, error: dateError } = await supabase
    .from('event_dates')
    .select('id, event_date')
    .eq('event_date', date)
    .single();

  if (dateError || !dateRow) {
    return NextResponse.json({ error: `No event scheduled on ${date}` }, { status: 404 });
  }

  // fetch all slots for this location + date
  const { data: slots, error: slotError } = await supabase
    .from('time_slots')
    .select('id, slot_name, start_time, end_time, capacity, remaining_capacity, status')
    .eq('location_id', location.id)
    .eq('event_date_id', dateRow.id);

  if (slotError) {
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  const match = slots?.find(
    (s) =>
      s.slot_name.toLowerCase().replace(/\s/g, '') === normalise(time) ||
      s.start_time.startsWith(to24h(time))
  );

  if (!match) {
    return NextResponse.json(
      {
        error: `No slot found for "${time}" in ${location.city} on ${date}`,
        available_slots: slots?.map((s) => s.slot_name) ?? [],
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: match.id,
    slot_name: match.slot_name,
    start_time: match.start_time,
    end_time: match.end_time,
    capacity: match.capacity,
    remaining_capacity: match.remaining_capacity,
    status: match.status,
    city: location.city,
    location_name: location.location_name,
    location_id: location.id,
    date: dateRow.event_date,
    date_id: dateRow.id,
  });
}

function normalise(t: string): string {
  return t.trim().toLowerCase().replace(/\s/g, '');
}

function to24h(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t.slice(0, 5);
  let h = parseInt(m[1], 10);
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}
