import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day?: string; // Optional day of the week
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealIntake {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: {
    menuItemId: string;
    consumed: boolean;
  }[];
  addedItems?: {
    name: string;
    nutritionInfo?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
}

export interface AIRecommendation {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  eatItems: string[];
  skipItems: string[];
  addItems: string[];
  nutritionAnalysis: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  customTips: string[];
}

interface DietState {
  hostelMenu: MenuItem[];
  mealIntake: MealIntake[];
  aiRecommendations: AIRecommendation[];
  loading: boolean;
  error: string | null;
}

const initialState: DietState = {
  hostelMenu: [],
  mealIntake: [],
  aiRecommendations: [],
  loading: false,
  error: null,
};

const dietSlice = createSlice({
  name: 'diet',
  initialState,
  reducers: {
    setHostelMenu: (state, action: PayloadAction<MenuItem[]>) => {
      state.hostelMenu = action.payload;
    },
    addMenuItem: (state, action: PayloadAction<MenuItem>) => {
      state.hostelMenu.push(action.payload);
    },
    updateMenuItem: (state, action: PayloadAction<{ id: string; updates: Partial<MenuItem> }>) => {
      const index = state.hostelMenu.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.hostelMenu[index] = { ...state.hostelMenu[index], ...action.payload.updates };
      }
    },
    removeMenuItem: (state, action: PayloadAction<string>) => {
      state.hostelMenu = state.hostelMenu.filter(item => item.id !== action.payload);
    },
    addMealIntake: (state, action: PayloadAction<MealIntake>) => {
      state.mealIntake.push(action.payload);
    },
    updateMealIntake: (state, action: PayloadAction<{ id: string; updates: Partial<MealIntake> }>) => {
      const index = state.mealIntake.findIndex(meal => meal.id === action.payload.id);
      if (index !== -1) {
        state.mealIntake[index] = { ...state.mealIntake[index], ...action.payload.updates };
      }
    },
    addAIRecommendation: (state, action: PayloadAction<AIRecommendation>) => {
      state.aiRecommendations.push(action.payload);
    },
    clearAIRecommendations: (state) => {
      state.aiRecommendations = [];
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
  setHostelMenu,
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  addMealIntake,
  updateMealIntake,
  addAIRecommendation,
  clearAIRecommendations,
  setLoading,
  setError,
} = dietSlice.actions;

export default dietSlice.reducer;