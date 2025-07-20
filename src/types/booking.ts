import { User } from './user';
import { RentalItem } from './rental';

export interface Booking {
  _id: string;
  rentalItemId: string | RentalItem;
  userId: string | User;
  startDate: Date | string;
  endDate: Date | string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: Date | string;
  notes?: string;
}

export interface BookingFormData {
  rentalItemId: string;
  startDate: Date | string;
  endDate: Date | string;
  notes?: string;
}