import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// POST /api/admin/reset-capacity
// Resets all slots to capacity=400, remaining_capacity=400, status=active
export async function POST() {
  const { data, error } = await supabaseAdmin
    .from('time_slots')
    .update({ capacity: 400, remaining_capacity: 400, status: 'active' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, slots_reset: data?.length ?? 0 });
}
