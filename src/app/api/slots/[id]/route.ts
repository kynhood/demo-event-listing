import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('time_slots')
    .select('id, slot_name, start_time, end_time, capacity, remaining_capacity, status')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { status?: string; remaining_capacity?: number; capacity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { status, remaining_capacity, capacity } = body;

  if (!status && remaining_capacity === undefined && capacity === undefined) {
    return NextResponse.json(
      { error: 'At least one of status, remaining_capacity, or capacity is required' },
      { status: 400 }
    );
  }

  if (status && !['active', 'sold_out', 'cancelled'].includes(status)) {
    return NextResponse.json(
      { error: 'status must be one of: active, sold_out, cancelled' },
      { status: 400 }
    );
  }

  if (remaining_capacity !== undefined && (typeof remaining_capacity !== 'number' || remaining_capacity < 0)) {
    return NextResponse.json({ error: 'remaining_capacity must be a non-negative number' }, { status: 400 });
  }

  if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1)) {
    return NextResponse.json({ error: 'capacity must be a positive number' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (remaining_capacity !== undefined) updates.remaining_capacity = remaining_capacity;
  if (capacity !== undefined) updates.capacity = capacity;

  const { data, error } = await supabaseAdmin
    .from('time_slots')
    .update(updates)
    .eq('id', id)
    .select('id, slot_name, start_time, end_time, capacity, remaining_capacity, status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  }

  return NextResponse.json(data);
}
