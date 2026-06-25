import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          banner_url: string | null;
          created_at: string;
        };
        Insert: Omit<{ id: string; title: string; description: string; banner_url: string | null; created_at: string }, 'id' | 'created_at'>;
        Update: Partial<{ title: string; description: string; banner_url: string | null }>;
      };
      locations: {
        Row: {
          id: string;
          event_id: string;
          location_name: string;
          city: string;
          capacity: number;
          created_at: string;
        };
      };
      event_dates: {
        Row: {
          id: string;
          event_id: string;
          event_date: string;
          created_at: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          event_date_id: string;
          slot_name: string;
          start_time: string;
          end_time: string;
          capacity: number;
          remaining_capacity: number;
          created_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          event_id: string;
          location_id: string;
          event_date_id: string;
          time_slot_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_city: string;
          ticket_quantity: number;
          status: string;
          created_at: string;
        };
      };
      booking_tickets: {
        Row: {
          id: string;
          booking_id: string;
          ticket_number: string;
          created_at: string;
        };
      };
    };
  };
};
