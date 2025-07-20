// Types for the Diet feature

export interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
}

export interface MealIntake {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  itemName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
}

export interface AIRecommendation {
  id: string;
  recommendations: string[];
  createdAt: string;
}