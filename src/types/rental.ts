import { User } from './user';

export interface RentalItem {
  _id: string;
  ownerId: string | User;
  name: string;
  description: string;
  category: 'weights' | 'yoga' | 'cardio' | 'accessories' | 'other';
  photoUrl: string;
  pricePerDay: number;
  available: boolean;
  location: string;
  availableFrom: Date | string;
  availableTo: Date | string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  createdAt: Date | string;
  rating?: number;
  reviewCount?: number;
}

export interface RentalItemFormData {
  name: string;
  description: string;
  category: string;
  photoUrl: string;
  pricePerDay: number;
  location: string;
  availableFrom: Date | string;
  availableTo: Date | string;
  condition: string;
}

export interface RentalFilter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  availableFrom?: Date | string;
  availableTo?: Date | string;
  condition?: string;
}