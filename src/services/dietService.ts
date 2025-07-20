import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Note: We need to install this package

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// For demo purposes, we'll use localStorage to simulate a backend
const HOSTEL_MENU_KEY = 'hostelMenu';
const MEAL_INTAKE_KEY = 'mealIntake';
const AI_RECOMMENDATIONS_KEY = 'aiDietRecommendations';

// Types
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

interface AIRecommendation {
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

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Hostel Menu Services
export const getHostelMenu = async (): Promise<ServiceResponse<MenuItem[]>> => {
  try {
    // Call the backend API to get the menu
    const response = await axios.get(`${API_URL}/menu`, {
      headers: {
        // Include authorization header if needed
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Update localStorage with the latest data
    if (response.data.data.menu) {
      saveToStorage(HOSTEL_MENU_KEY, response.data.data.menu);
      return {
        success: true,
        data: response.data.data.menu,
      };
    }
    
    // Fallback to localStorage if API returns empty data
    const menu = getFromStorage<MenuItem>(HOSTEL_MENU_KEY);
    return {
      success: true,
      data: menu,
    };
  } catch (error: any) {
    console.error('Error fetching hostel menu:', error);
    // Fallback to localStorage if API fails
    try {
      const menu = getFromStorage<MenuItem>(HOSTEL_MENU_KEY);
      return {
        success: true,
        data: menu,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message || 'Failed to fetch hostel menu',
      };
    }
  }
};

export const uploadHostelMenu = async (menuItems: Omit<MenuItem, 'id'>[]): Promise<ServiceResponse<MenuItem[]>> => {
  try {
    // Call the backend API to upload the menu
    const response = await axios.post(`${API_URL}/menu/upload`, { menuItems }, {
      headers: {
        'Content-Type': 'application/json',
        // Include authorization header if needed
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Also save to localStorage as a backup
    const itemsWithIds = response.data.data.menu;
    saveToStorage(HOSTEL_MENU_KEY, itemsWithIds);
    
    return {
      success: true,
      data: itemsWithIds,
    };
  } catch (error: any) {
    console.error('Error uploading hostel menu:', error);
    // Fallback to localStorage if API fails
    try {
      const itemsWithIds = menuItems.map(item => ({
        ...item,
        id: uuidv4(),
      }));
      
      saveToStorage(HOSTEL_MENU_KEY, itemsWithIds);
      
      return {
        success: true,
        data: itemsWithIds,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message || 'Failed to upload hostel menu',
      };
    }
  }
};

export const addMenuItem = async (menuItem: Omit<MenuItem, 'id'>): Promise<ServiceResponse<MenuItem>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/hostel-menu/item`, menuItem);
    
    // For demo, we'll use localStorage
    const menu = getFromStorage<MenuItem>(HOSTEL_MENU_KEY);
    const newItem = { ...menuItem, id: uuidv4() };
    menu.push(newItem);
    saveToStorage(HOSTEL_MENU_KEY, menu);
    
    return {
      success: true,
      data: newItem,
    };
  } catch (error: any) {
    console.error('Error adding menu item:', error);
    return {
      success: false,
      error: error.message || 'Failed to add menu item',
    };
  }
};

// Meal Intake Services
export const getMealIntake = async (date?: string): Promise<ServiceResponse<MealIntake[]>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/meal-intake`, { params: { date } });
    
    // For demo, we'll use localStorage
    const intakes = getFromStorage<MealIntake>(MEAL_INTAKE_KEY);
    const filteredIntakes = date 
      ? intakes.filter(intake => intake.date === date)
      : intakes;
    
    return {
      success: true,
      data: filteredIntakes,
    };
  } catch (error: any) {
    console.error('Error fetching meal intake:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch meal intake',
    };
  }
};

export const addMealIntake = async (mealIntake: Omit<MealIntake, 'id'>): Promise<ServiceResponse<MealIntake>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/meal-intake`, mealIntake);
    
    // For demo, we'll use localStorage
    const intakes = getFromStorage<MealIntake>(MEAL_INTAKE_KEY);
    const newIntake = { ...mealIntake, id: uuidv4() };
    intakes.push(newIntake);
    saveToStorage(MEAL_INTAKE_KEY, intakes);
    
    return {
      success: true,
      data: newIntake,
    };
  } catch (error: any) {
    console.error('Error adding meal intake:', error);
    return {
      success: false,
      error: error.message || 'Failed to add meal intake',
    };
  }
};

export const updateMealIntake = async (id: string, updates: Partial<MealIntake>): Promise<ServiceResponse<MealIntake>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.put(`${API_URL}/meal-intake/${id}`, updates);
    
    // For demo, we'll use localStorage
    const intakes = getFromStorage<MealIntake>(MEAL_INTAKE_KEY);
    const index = intakes.findIndex(intake => intake.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Meal intake not found',
      };
    }
    
    const updatedIntake = { ...intakes[index], ...updates };
    intakes[index] = updatedIntake;
    saveToStorage(MEAL_INTAKE_KEY, intakes);
    
    return {
      success: true,
      data: updatedIntake,
    };
  } catch (error: any) {
    console.error('Error updating meal intake:', error);
    return {
      success: false,
      error: error.message || 'Failed to update meal intake',
    };
  }
};

// AI Recommendations Services
export const getAIRecommendations = async (date?: string): Promise<ServiceResponse<AIRecommendation[]>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/ai-recommendations`, { params: { date } });
    
    // For demo, we'll use localStorage
    const recommendations = getFromStorage<AIRecommendation>(AI_RECOMMENDATIONS_KEY);
    const filteredRecommendations = date 
      ? recommendations.filter(rec => rec.date === date)
      : recommendations;
    
    return {
      success: true,
      data: filteredRecommendations,
    };
  } catch (error: any) {
    console.error('Error fetching AI recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch AI recommendations',
    };
  }
};

export const addAIRecommendation = async (recommendation: Omit<AIRecommendation, 'id'>): Promise<ServiceResponse<AIRecommendation>> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/ai-recommendations`, recommendation);
    
    // For demo, we'll use localStorage
    const recommendations = getFromStorage<AIRecommendation>(AI_RECOMMENDATIONS_KEY);
    const newRecommendation = { ...recommendation, id: uuidv4() };
    recommendations.push(newRecommendation);
    saveToStorage(AI_RECOMMENDATIONS_KEY, recommendations);
    
    return {
      success: true,
      data: newRecommendation,
    };
  } catch (error: any) {
    console.error('Error adding AI recommendation:', error);
    return {
      success: false,
      error: error.message || 'Failed to add AI recommendation',
    };
  }
};

// Nutrition Analysis
export const calculateDailyNutrition = async (date: string): Promise<ServiceResponse<{
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}>> => {
  try {
    // Get meal intakes for the day
    const intakesResponse = await getMealIntake(date);
    if (!intakesResponse.success || !intakesResponse.data) {
      throw new Error(intakesResponse.error || 'Failed to fetch meal intakes');
    }
    
    // Get hostel menu for nutrition info
    const menuResponse = await getHostelMenu();
    if (!menuResponse.success || !menuResponse.data) {
      throw new Error(menuResponse.error || 'Failed to fetch hostel menu');
    }
    
    const intakes = intakesResponse.data;
    const menuItems = menuResponse.data;
    
    // Calculate totals
    let totalCalories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    
    // Process each meal intake
    intakes.forEach(intake => {
      // Process menu items that were consumed
      intake.items.forEach(item => {
        if (item.consumed) {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          if (menuItem && menuItem.nutritionInfo) {
            totalCalories += menuItem.nutritionInfo.calories;
            protein += menuItem.nutritionInfo.protein;
            carbs += menuItem.nutritionInfo.carbs;
            fat += menuItem.nutritionInfo.fat;
          }
        }
      });
      
      // Process added items
      if (intake.addedItems) {
        intake.addedItems.forEach(addedItem => {
          if (addedItem.nutritionInfo) {
            totalCalories += addedItem.nutritionInfo.calories;
            protein += addedItem.nutritionInfo.protein;
            carbs += addedItem.nutritionInfo.carbs;
            fat += addedItem.nutritionInfo.fat;
          }
        });
      }
    });
    
    return {
      success: true,
      data: {
        totalCalories,
        protein,
        carbs,
        fat,
      },
    };
  } catch (error: any) {
    console.error('Error calculating daily nutrition:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate daily nutrition',
    };
  }
};