import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event_id');

  if (!eventId) {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('event_id', eventId)
    .order('city');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
