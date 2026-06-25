import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_reference', reference)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const [
    { data: event },
    { data: location },
    { data: eventDate },
    { data: timeSlot },
    { data: tickets },
  ] = await Promise.all([
    supabase.from('events').select('*').eq('id', booking.event_id).single(),
    supabase.from('locations').select('*').eq('id', booking.location_id).single(),
    supabase.from('event_dates').select('*').eq('id', booking.event_date_id).single(),
    supabase.from('time_slots').select('*').eq('id', booking.time_slot_id).single(),
    supabase.from('booking_tickets').select('*').eq('booking_id', booking.id).order('ticket_number'),
  ]);

  return NextResponse.json({ booking, event, location, eventDate, timeSlot, tickets });
}
