import axios from 'axios';
import { Booking } from '../types/booking';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create a new booking
export const createBooking = async (bookingData: Partial<Booking>) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(
      `${API_URL}/bookings`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get a single booking by ID
export const getBookingById = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(
      `${API_URL}/bookings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.booking;
  } catch (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    throw error;
  }
};

// Get all bookings for the current user (as a renter)
export const getMyBookings = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(
      `${API_URL}/bookings/my-bookings`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.bookings;
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    throw error;
  }
};

// Get all bookings for the current user's rental items (as an owner)
export const getBookingsForMyItems = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(
      `${API_URL}/bookings/my-items-bookings`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.bookings;
  } catch (error) {
    console.error('Error fetching bookings for my items:', error);
    throw error;
  }
};

// Update a booking
export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.patch(
      `${API_URL}/bookings/${id}`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.booking;
  } catch (error) {
    console.error(`Error updating booking with ID ${id}:`, error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.patch(
      `${API_URL}/bookings/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data.booking;
  } catch (error) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    throw error;
  }
};