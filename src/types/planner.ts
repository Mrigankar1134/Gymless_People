// Types for the Weekly Planner feature

export interface PlannerEvent {
  id: string;
  title: string;
  type: 'meal' | 'workout' | 'commitment' | 'other';
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format
  description?: string;
  completed: boolean;
  relatedItemId?: string; // ID of related meal or workout
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string; // ISO date string for Monday
  events: PlannerEvent[];
  aiRecommendations?: {
    meals: string[];
    workouts: string[];
    tips: string[];
  };
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}