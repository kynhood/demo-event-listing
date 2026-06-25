-- Add status column to time_slots
ALTER TABLE time_slots
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CONSTRAINT time_slot_status_check CHECK (status IN ('active', 'sold_out', 'cancelled'));

-- RLS: allow public update of status (for admin use via service key)
-- If you want only service-role to update, remove this policy and use SUPABASE_SECRET_KEY server-side
CREATE POLICY "Public update time_slot status" ON time_slots
  FOR UPDATE USING (true) WITH CHECK (true);
