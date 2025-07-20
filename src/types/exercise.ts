// Types for the Exercise feature

export interface Exercise {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'balance' | 'yoga';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
  description: string;
  instructions: string[];
  durationMinutes: number;
  caloriesBurnedPerMinute: number;
  targetMuscle?: string; // Added for compatibility
}

export interface WorkoutSession {
  id: string;
  date: string;
  planId: string;
  userId: string;
  totalDurationMinutes: number; // in minutes
  totalCaloriesBurned: number;
  exercises: {
    exerciseId: string;
    completed: boolean;
    durationMinutes: number;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
  }[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  goal: 'weight_loss' | 'muscle_gain' | 'flexibility' | 'general_fitness';
  daysPerWeek: number;
  exercises: {
    day: number; // 1-7 for days of the week
    exerciseId: string;
    sets?: number;
    reps?: number;
    durationMinutes?: number;
  }[];
  isAIGenerated: boolean;
  createdAt: string;
}