import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateBookingReference, generateTicketNumber } from '@/lib/utils';
import { z } from 'zod';

const bookingSchema = z.object({
  event_id: z.string().uuid(),
  location_id: z.string().uuid(),
  event_date_id: z.string().uuid(),
  time_slot_id: z.string().uuid(),
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/),
  customer_city: z.string().min(2).max(100),
  ticket_quantity: z.number().int().min(1).max(10),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const bookingRef = generateBookingReference();

  // Use the concurrency-safe stored function
  const { data: result, error: fnError } = await supabase.rpc('create_booking', {
    p_booking_reference: bookingRef,
    p_event_id: data.event_id,
    p_location_id: data.location_id,
    p_event_date_id: data.event_date_id,
    p_time_slot_id: data.time_slot_id,
    p_customer_name: data.customer_name,
    p_customer_email: data.customer_email,
    p_customer_phone: data.customer_phone,
    p_customer_city: data.customer_city,
    p_ticket_quantity: data.ticket_quantity,
  });

  if (fnError) {
    if (fnError.message.includes('Insufficient capacity')) {
      return NextResponse.json({ error: 'Not enough tickets available for this slot.' }, { status: 409 });
    }
    return NextResponse.json({ error: fnError.message }, { status: 500 });
  }

  const bookingId = (result as { booking_id: string }).booking_id;

  // Generate and insert individual ticket numbers
  const tickets = Array.from({ length: data.ticket_quantity }, (_, i) => ({
    booking_id: bookingId,
    ticket_number: generateTicketNumber(bookingRef, i),
  }));

  const { error: ticketError } = await supabase.from('booking_tickets').insert(tickets);

  if (ticketError) {
    return NextResponse.json({ error: ticketError.message }, { status: 500 });
  }

  return NextResponse.json({ booking_reference: bookingRef, booking_id: bookingId }, { status: 201 });
}
