import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateId = searchParams.get('date_id');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!dateId && !date) {
    return NextResponse.json({ error: 'date_id or date required' }, { status: 400 });
  }

  if (dateId) {
    const locationId = searchParams.get('location_id');
    let query = supabase
      .from('time_slots')
      .select('id, slot_name, start_time, end_time, capacity, remaining_capacity, status, event_date_id, location_id')
      .eq('event_date_id', dateId)
      .order('start_time');

    if (locationId) query = query.eq('location_id', locationId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // lookup by date string — join through event_dates
  const { data: dateRows, error: dateError } = await supabase
    .from('event_dates')
    .select('id, event_date')
    .eq('event_date', date)
    .limit(1)
    .single();

  if (dateError || !dateRows) {
    return NextResponse.json({ error: 'No event found for that date' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('time_slots')
    .select('id, slot_name, start_time, end_time, capacity, remaining_capacity, status, event_date_id')
    .eq('event_date_id', dateRows.id)
    .order('start_time');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    date: dateRows.event_date,
    date_id: dateRows.id,
    // note: location is a separate selection — slots are shared across all cities on a given date
    slots: data,
  });
}
