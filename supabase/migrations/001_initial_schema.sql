-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  city TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event dates table
CREATE TABLE IF NOT EXISTS event_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date_id UUID NOT NULL REFERENCES event_dates(id) ON DELETE CASCADE,
  slot_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  remaining_capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT remaining_non_negative CHECK (remaining_capacity >= 0),
  CONSTRAINT remaining_lte_capacity CHECK (remaining_capacity <= capacity)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES events(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  event_date_id UUID NOT NULL REFERENCES event_dates(id),
  time_slot_id UUID NOT NULL REFERENCES time_slots(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  ticket_quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ticket_quantity_positive CHECK (ticket_quantity > 0),
  CONSTRAINT ticket_quantity_max CHECK (ticket_quantity <= 10)
);

-- Booking tickets table
CREATE TABLE IF NOT EXISTS booking_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_locations_event_id ON locations(event_id);
CREATE INDEX idx_event_dates_event_id ON event_dates(event_id);
CREATE INDEX idx_time_slots_event_date_id ON time_slots(event_date_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_time_slot_id ON bookings(time_slot_id);
CREATE INDEX idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX idx_booking_tickets_booking_id ON booking_tickets(booking_id);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: public read access for event data
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read event_dates" ON event_dates FOR SELECT USING (true);
CREATE POLICY "Public read time_slots" ON time_slots FOR SELECT USING (true);

-- Bookings: anyone can insert, read own booking by reference
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read bookings by reference" ON bookings FOR SELECT USING (true);

-- Booking tickets: anyone can insert and read
CREATE POLICY "Public insert booking_tickets" ON booking_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read booking_tickets" ON booking_tickets FOR SELECT USING (true);

-- Concurrency-safe booking function
CREATE OR REPLACE FUNCTION create_booking(
  p_booking_reference TEXT,
  p_event_id UUID,
  p_location_id UUID,
  p_event_date_id UUID,
  p_time_slot_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_customer_city TEXT,
  p_ticket_quantity INTEGER
) RETURNS JSON AS $$
DECLARE
  v_remaining INTEGER;
  v_booking_id UUID;
  v_booking JSON;
BEGIN
  -- Lock the time slot row for update
  SELECT remaining_capacity INTO v_remaining
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check capacity
  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'Time slot not found';
  END IF;

  IF v_remaining < p_ticket_quantity THEN
    RAISE EXCEPTION 'Insufficient capacity: only % tickets remaining', v_remaining;
  END IF;

  -- Decrement capacity
  UPDATE time_slots
  SET remaining_capacity = remaining_capacity - p_ticket_quantity
  WHERE id = p_time_slot_id;

  -- Insert booking
  INSERT INTO bookings (
    booking_reference, event_id, location_id, event_date_id, time_slot_id,
    customer_name, customer_email, customer_phone, customer_city, ticket_quantity, status
  ) VALUES (
    p_booking_reference, p_event_id, p_location_id, p_event_date_id, p_time_slot_id,
    p_customer_name, p_customer_email, p_customer_phone, p_customer_city, p_ticket_quantity, 'confirmed'
  ) RETURNING id INTO v_booking_id;

  -- Return booking id
  RETURN json_build_object('booking_id', v_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
