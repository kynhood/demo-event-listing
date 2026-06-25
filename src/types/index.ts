export interface Event {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  event_id: string;
  location_name: string;
  city: string;
  capacity: number;
  created_at: string;
}

export interface EventDate {
  id: string;
  event_id: string;
  event_date: string;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  event_date_id: string;
  location_id?: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  capacity: number;
  remaining_capacity: number;
  status: 'active' | 'sold_out' | 'cancelled';
  created_at: string;
}

export interface Booking {
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
  status: 'confirmed' | 'cancelled' | 'pending';
  created_at: string;
}

export interface BookingTicket {
  id: string;
  booking_id: string;
  ticket_number: string;
  created_at: string;
}

export interface BookingState {
  event: Event | null;
  selectedLocation: Location | null;
  selectedDate: EventDate | null;
  selectedSlot: TimeSlot | null;
  ticketQuantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  agreeTerms: boolean;
}

export interface BookingConfirmation {
  booking: Booking;
  tickets: BookingTicket[];
  event: Event;
  location: Location;
  eventDate: EventDate;
  timeSlot: TimeSlot;
}
