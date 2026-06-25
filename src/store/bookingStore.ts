'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, EventDate, Location, TimeSlot } from '@/types';

interface BookingStore {
  event: Event | null;
  selectedLocation: Location | null;
  selectedDate: EventDate | null;
  selectedSlot: TimeSlot | null;
  ticketQuantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;

  setEvent: (event: Event) => void;
  setLocation: (location: Location) => void;
  setDate: (date: EventDate) => void;
  setSlot: (slot: TimeSlot) => void;
  setTicketQuantity: (qty: number) => void;
  setCustomerInfo: (info: { name: string; email: string; phone: string; city: string }) => void;
  reset: () => void;
}

const initialState = {
  event: null,
  selectedLocation: null,
  selectedDate: null,
  selectedSlot: null,
  ticketQuantity: 1,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerCity: '',
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      ...initialState,
      setEvent: (event) => set({ event }),
      setLocation: (location) => set({ selectedLocation: location, selectedDate: null, selectedSlot: null }),
      setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
      setSlot: (slot) => set({ selectedSlot: slot }),
      setTicketQuantity: (qty) => set({ ticketQuantity: qty }),
      setCustomerInfo: (info) =>
        set({
          customerName: info.name,
          customerEmail: info.email,
          customerPhone: info.phone,
          customerCity: info.city,
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        event: state.event,
        selectedLocation: state.selectedLocation,
        selectedDate: state.selectedDate,
        selectedSlot: state.selectedSlot,
        ticketQuantity: state.ticketQuantity,
        customerName: state.customerName,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        customerCity: state.customerCity,
      }),
    }
  )
);
