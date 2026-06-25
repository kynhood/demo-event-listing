import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST() {
  const steps: string[] = [];

  // Step 1: Clear dependent tables
  const { error: e1 } = await supabaseAdmin.from('booking_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) return NextResponse.json({ error: 'Clear booking_tickets failed', detail: e1.message }, { status: 500 });
  steps.push('cleared booking_tickets');

  const { error: e2 } = await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) return NextResponse.json({ error: 'Clear bookings failed', detail: e2.message }, { status: 500 });
  steps.push('cleared bookings');

  const { error: e3 } = await supabaseAdmin.from('time_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) return NextResponse.json({ error: 'Clear time_slots failed', detail: e3.message }, { status: 500 });
  steps.push('cleared time_slots');

  // Step 2: Insert 125 slots with location_id
  // UUID: 44{loc2}{date2}{slot2}-0000-0000-0000-000000000001
  // loc: 01=Chennai 02=Bangalore 03=Hyderabad 04=Mumbai 05=Delhi
  // date: 01=Jun15 02=Jun16 03=Jun17 04=Jun18 05=Jun19
  // slot: 01=9AM 02=11AM 03=1PM 04=3PM 05=5PM
  const locations = [
    { code: '01', id: '11111111-0001-0000-0000-000000000001' },
    { code: '02', id: '11111111-0002-0000-0000-000000000002' },
    { code: '03', id: '11111111-0003-0000-0000-000000000003' },
    { code: '04', id: '11111111-0004-0000-0000-000000000004' },
    { code: '05', id: '11111111-0005-0000-0000-000000000005' },
  ];
  const dates = [
    { code: '01', id: '22222222-0001-0000-0000-000000000001' },
    { code: '02', id: '22222222-0002-0000-0000-000000000002' },
    { code: '03', id: '22222222-0003-0000-0000-000000000003' },
    { code: '04', id: '22222222-0004-0000-0000-000000000004' },
    { code: '05', id: '22222222-0005-0000-0000-000000000005' },
  ];
  const slots = [
    { code: '01', slot_name: '09:00 AM', start_time: '09:00', end_time: '10:30' },
    { code: '02', slot_name: '11:00 AM', start_time: '11:00', end_time: '12:30' },
    { code: '03', slot_name: '01:00 PM', start_time: '13:00', end_time: '14:30' },
    { code: '04', slot_name: '03:00 PM', start_time: '15:00', end_time: '16:30' },
    { code: '05', slot_name: '05:00 PM', start_time: '17:00', end_time: '18:30' },
  ];

  const rows = [];
  for (const loc of locations) {
    for (const date of dates) {
      for (const slot of slots) {
        rows.push({
          id: `44${loc.code}${date.code}${slot.code}-0000-0000-0000-000000000001`,
          event_date_id: date.id,
          location_id: loc.id,
          slot_name: slot.slot_name,
          start_time: slot.start_time,
          end_time: slot.end_time,
          capacity: 400,
          remaining_capacity: 400,
          status: 'active',
        });
      }
    }
  }

  const { error: e4 } = await supabaseAdmin.from('time_slots').insert(rows);
  if (e4) return NextResponse.json({ error: 'Insert time_slots failed', detail: e4.message }, { status: 500 });
  steps.push(`inserted ${rows.length} time slots`);

  return NextResponse.json({ success: true, steps });
}
