import axios from 'axios';

// Connect to our mock backend
const API_URL = 'http://localhost:5001/api';

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// For backward compatibility during transition
const RENTAL_ITEMS_KEY = 'rentalItems';
const RENTAL_BOOKINGS_KEY = 'rentalBookings';

// Types
interface RentalItem {
  id: string;
  name: string;
  category: 'dumbbell' | 'mat' | 'resistance_band' | 'skipping_rope' | 'yoga_block' | 'other';
  description: string;
  imageUrl: string;
  ownerId: string;
  ownerName: string;
  price: number; // per day
  availableFrom: string; // ISO date string
  availableTo: string; // ISO date string
  status: 'available' | 'rented' | 'unavailable';
  rating: number | null;
  reviewCount: number;
}

interface RentalBooking {
  id: string;
  itemId: string;
  renterId: string;
  renterName: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  userRating?: number;
  userReview?: string;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// We've removed the localStorage helper functions since we're now using the API

// Rental Item Services
export const getRentalItems = async (category?: string, status?: string): Promise<ServiceResponse<RentalItem[]>> => {
  try {
    // Use the category endpoint if a category is specified
    const endpoint = category ? `/rental/category/${category}` : '/rental';
    
    const response = await api.get(endpoint);
    
    // Map the backend response to our frontend model
    const items = response.data.data.items.map((item: any) => ({
      id: item._id,
      name: item.name,
      category: item.category,
      description: item.description,
      imageUrl: item.photoUrl || 'https://via.placeholder.com/300',
      ownerId: item.ownerId,
      ownerName: 'Owner', // We don't have owner name in the backend response
      price: item.pricePerDay,
      availableFrom: item.availableFrom,
      availableTo: item.availableTo,
      status: item.available ? 'available' : 'unavailable',
      rating: null,
      reviewCount: 0
    }));
    
    // Filter by status if needed (since our backend doesn't support this filter)
    let filteredItems = items;
    if (status) {
      filteredItems = filteredItems.filter((item: RentalItem) => item.status === status);
    }
    
    return {
      success: true,
      data: filteredItems,
    };
  } catch (error: any) {
    console.error('Error fetching rental items:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch rental items',
    };
  }
};

export const getRentalItemById = async (id: string): Promise<ServiceResponse<RentalItem>> => {
  try {
    const response = await api.get(`/rental/${id}`);
    
    // Map the backend response to our frontend model
    const item = response.data.data.item;
    
    if (!item) {
      return {
        success: false,
        error: 'Rental item not found',
      };
    }
    
    const mappedItem: RentalItem = {
      id: item._id,
      name: item.name,
      category: item.category,
      description: item.description,
      imageUrl: item.photoUrl || 'https://via.placeholder.com/300',
      ownerId: item.ownerId,
      ownerName: 'Owner', // We don't have owner name in the backend response
      price: item.pricePerDay,
      availableFrom: item.availableFrom,
      availableTo: item.availableTo,
      status: item.available ? 'available' : 'unavailable',
      rating: null,
      reviewCount: 0
    };
    
    return {
      success: true,
      data: mappedItem,
    };
  } catch (error: any) {
    console.error('Error fetching rental item:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch rental item',
    };
  }
};

export const getMyListings = async (userId?: string): Promise<ServiceResponse<RentalItem[]>> => {
  try {
    // Use the myitems endpoint to get user's rental items
    const response = await api.get('/rental/user/myitems');
    
    // Map the backend response to our frontend model
    const items = response.data.data.items.map((item: any) => ({
      id: item._id,
      name: item.name,
      category: item.category,
      description: item.description,
      imageUrl: item.photoUrl || 'https://via.placeholder.com/300',
      ownerId: item.ownerId,
      ownerName: 'Owner', // We don't have owner name in the backend response
      price: item.pricePerDay,
      availableFrom: item.availableFrom,
      availableTo: item.availableTo,
      status: item.available ? 'available' : 'unavailable',
      rating: null,
      reviewCount: 0
    }));
    
    return {
      success: true,
      data: items,
    };
  } catch (error: any) {
    console.error('Error fetching my listings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch my listings',
    };
  }
};

export const addRentalItem = async (item: Omit<RentalItem, 'id' | 'rating' | 'reviewCount'>): Promise<ServiceResponse<RentalItem>> => {
  try {
    // Transform frontend model to backend model
    const backendItem = {
      name: item.name,
      category: item.category,
      description: item.description,
      photoUrl: item.imageUrl,
      pricePerDay: item.price,
      availableFrom: item.availableFrom,
      availableTo: item.availableTo,
      available: item.status === 'available'
    };
    
    // Send POST request to create new item
    const response = await api.post('/rental', backendItem);
    
    // Map the backend response to our frontend model
    const newItem: RentalItem = {
      id: response.data.data.item._id,
      name: response.data.data.item.name,
      category: response.data.data.item.category,
      description: response.data.data.item.description,
      imageUrl: response.data.data.item.photoUrl || 'https://via.placeholder.com/300',
      ownerId: response.data.data.item.ownerId,
      ownerName: 'Owner', // We don't have owner name in the backend response
      price: response.data.data.item.pricePerDay,
      availableFrom: response.data.data.item.availableFrom,
      availableTo: response.data.data.item.availableTo,
      status: response.data.data.item.available ? 'available' : 'unavailable',
      rating: null,
      reviewCount: 0
    };
    
    return {
      success: true,
      data: newItem,
    };
  } catch (error: any) {
    console.error('Error adding rental item:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to add rental item',
    };
  }
};

export const updateRentalItem = async (id: string, updates: Partial<RentalItem>): Promise<ServiceResponse<RentalItem>> => {
  try {
    // Transform frontend model to backend model
    const backendUpdates: any = {};
    
    if (updates.name) backendUpdates.name = updates.name;
    if (updates.category) backendUpdates.category = updates.category;
    if (updates.description) backendUpdates.description = updates.description;
    if (updates.imageUrl) backendUpdates.photoUrl = updates.imageUrl;
    if (updates.price) backendUpdates.pricePerDay = updates.price;
    if (updates.availableFrom) backendUpdates.availableFrom = updates.availableFrom;
    if (updates.availableTo) backendUpdates.availableTo = updates.availableTo;
    if (updates.status) backendUpdates.available = updates.status === 'available';
    
    // Send PATCH request to update item
    const response = await api.patch(`/rental/${id}`, backendUpdates);
    
    // Map the backend response to our frontend model
    const updatedItem: RentalItem = {
      id: response.data.data.item._id,
      name: response.data.data.item.name,
      category: response.data.data.item.category,
      description: response.data.data.item.description,
      imageUrl: response.data.data.item.photoUrl || 'https://via.placeholder.com/300',
      ownerId: response.data.data.item.ownerId,
      ownerName: 'Owner', // We don't have owner name in the backend response
      price: response.data.data.item.pricePerDay,
      availableFrom: response.data.data.item.availableFrom,
      availableTo: response.data.data.item.availableTo,
      status: response.data.data.item.available ? 'available' : 'unavailable',
      rating: null,
      reviewCount: 0
    };
    
    return {
      success: true,
      data: updatedItem,
    };
  } catch (error: any) {
    console.error('Error updating rental item:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update rental item',
    };
  }
};

export const deleteRentalItem = async (id: string): Promise<ServiceResponse<void>> => {
  try {
    // Send DELETE request to remove item
    await api.delete(`/rental/${id}`);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting rental item:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete rental item',
    };
  }
};

// Rental Booking Services
export const getBookings = async (userId: string, role: 'renter' | 'owner'): Promise<ServiceResponse<RentalBooking[]>> => {
  try {
    // For now, we'll use a simplified approach since our mock backend doesn't have booking endpoints yet
    // In a real implementation, we would call different endpoints based on the role
    
    // This is a placeholder implementation until we implement booking endpoints in the backend
    const mockBookings: RentalBooking[] = [];
    
    return {
      success: true,
      data: mockBookings,
    };
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch bookings',
    };
  }
};

/**
 * Get items borrowed by the current user
 * @returns {Promise<ServiceResponse<RentalItem[]>>}
 */
export const getBorrowedItems = async (): Promise<ServiceResponse<RentalItem[]>> => {
  try {
    // Placeholder implementation - backend doesn't have borrowed items endpoints yet
    // In a real implementation, this would call an API endpoint like /rental/user/borrowed
    return {
      success: true,
      data: []
    };
  } catch (error: any) {
    console.error('Error getting borrowed items:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch borrowed items',
    };
  }
};

export const getBookingById = async (id: string): Promise<ServiceResponse<RentalBooking>> => {
  try {
    // This is a placeholder implementation until we implement booking endpoints in the backend
    return {
      success: false,
      error: 'Booking functionality not yet implemented in the backend',
    };
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch booking',
    };
  }
};

export const createBooking = async (booking: Omit<RentalBooking, 'id'>): Promise<ServiceResponse<RentalBooking>> => {
  try {
    // This is a placeholder implementation until we implement booking endpoints in the backend
    return {
      success: false,
      error: 'Booking functionality not yet implemented in the backend',
    };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create booking',
    };
  }
};

export const updateBooking = async (id: string, updates: Partial<RentalBooking>): Promise<ServiceResponse<RentalBooking>> => {
  try {
    // This is a placeholder implementation until we implement booking endpoints in the backend
    return {
      success: false,
      error: 'Booking functionality not yet implemented in the backend',
    };
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update booking',
    };
  }
};

export const cancelBooking = async (id: string): Promise<ServiceResponse<RentalBooking>> => {
  try {
    // This is a placeholder implementation until we implement booking endpoints in the backend
    return {
      success: false,
      error: 'Booking functionality not yet implemented in the backend',
    };
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to cancel booking',
    };
  }
};

export const rateBooking = async (id: string, ratingData: { rating: number; comment?: string }): Promise<ServiceResponse<RentalBooking>> => {
  try {
    // This is a placeholder implementation until we implement booking endpoints in the backend
    return {
      success: false,
      error: 'Booking functionality not yet implemented in the backend',
    };
  } catch (error: any) {
    console.error('Error rating booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to rate booking',
    };
  }
};

// We've removed the initializeRentalItems function since we're now using the API
// The backend already has sample data

// Alias for getMyListings for better readability in the UI components
export const getUserRentalItems = async (): Promise<ServiceResponse<RentalItem[]>> => {
  return getMyListings();
};