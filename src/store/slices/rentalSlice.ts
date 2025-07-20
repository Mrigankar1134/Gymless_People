import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface RentalState {
  rentalItems: RentalItem[];
  myListings: string[]; // IDs of items listed by the current user
  myRentals: RentalBooking[]; // Bookings made by the current user
  loading: boolean;
  error: string | null;
}

const initialState: RentalState = {
  rentalItems: [],
  myListings: [],
  myRentals: [],
  loading: false,
  error: null,
};

const rentalSlice = createSlice({
  name: 'rental',
  initialState,
  reducers: {
    setRentalItems: (state, action: PayloadAction<RentalItem[]>) => {
      state.rentalItems = action.payload;
    },
    addRentalItem: (state, action: PayloadAction<RentalItem>) => {
      state.rentalItems.push(action.payload);
      if (action.payload.ownerId === 'current_user_id') { // Replace with actual user ID check
        state.myListings.push(action.payload.id);
      }
    },
    updateRentalItem: (state, action: PayloadAction<{ id: string; updates: Partial<RentalItem> }>) => {
      const index = state.rentalItems.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.rentalItems[index] = { ...state.rentalItems[index], ...action.payload.updates };
      }
    },
    removeRentalItem: (state, action: PayloadAction<string>) => {
      state.rentalItems = state.rentalItems.filter(item => item.id !== action.payload);
      state.myListings = state.myListings.filter(id => id !== action.payload);
    },
    setMyListings: (state, action: PayloadAction<string[]>) => {
      state.myListings = action.payload;
    },
    addBooking: (state, action: PayloadAction<RentalBooking>) => {
      state.myRentals.push(action.payload);
      // Update the status of the rental item
      const itemIndex = state.rentalItems.findIndex(item => item.id === action.payload.itemId);
      if (itemIndex !== -1) {
        state.rentalItems[itemIndex].status = 'rented';
      }
    },
    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<RentalBooking> }>) => {
      const index = state.myRentals.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.myRentals[index] = { ...state.myRentals[index], ...action.payload.updates };
        
        // If booking status changed to completed or cancelled, update item status
        if (action.payload.updates.status === 'completed' || action.payload.updates.status === 'cancelled') {
          const itemId = state.myRentals[index].itemId;
          const itemIndex = state.rentalItems.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            state.rentalItems[itemIndex].status = 'available';
          }
        }
      }
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const index = state.myRentals.findIndex(booking => booking.id === action.payload);
      if (index !== -1) {
        state.myRentals[index].status = 'cancelled';
        
        // Update the status of the rental item
        const itemId = state.myRentals[index].itemId;
        const itemIndex = state.rentalItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.rentalItems[itemIndex].status = 'available';
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRentalItems,
  addRentalItem,
  updateRentalItem,
  removeRentalItem,
  setMyListings,
  addBooking,
  updateBooking,
  cancelBooking,
  setLoading,
  setError,
} = rentalSlice.actions;

export default rentalSlice.reducer;