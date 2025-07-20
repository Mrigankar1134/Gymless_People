import { v4 as uuidv4 } from 'uuid'; // Note: We need to install this package

// For demo purposes, we'll use localStorage to simulate a backend
const EXERCISES_KEY = 'exercises';
const WORKOUT_SESSIONS_KEY = 'workoutSessions';
const WORKOUT_PLANS_KEY = 'workoutPlans';

// Types
interface Exercise {
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
}

interface WorkoutSession {
  id: string;
  date: string;
  planId: string;
  userId: string;
  exercises: {
    exerciseId: string;
    completed: boolean;
    durationMinutes: number;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
  }[];
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
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

// Exercise Services
export const getExercises = async (category?: string): Promise<ServiceResponse<Exercise[]>> => {
  try {
    const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
    const filteredExercises = category 
      ? exercises.filter(exercise => exercise.category === category)
      : exercises;
    
    return {
      success: true,
      data: filteredExercises,
    };
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch exercises',
    };
  }
};

export const getExerciseById = async (id: string): Promise<ServiceResponse<Exercise>> => {
  try {
    const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
    const exercise = exercises.find(ex => ex.id === id);
    
    if (!exercise) {
      return {
        success: false,
        error: 'Exercise not found',
      };
    }
    
    return {
      success: true,
      data: exercise,
    };
  } catch (error: any) {
    console.error('Error fetching exercise:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch exercise',
    };
  }
};

export const addExercise = async (exercise: Omit<Exercise, 'id'>): Promise<ServiceResponse<Exercise>> => {
  try {
    const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
    const newExercise = { ...exercise, id: uuidv4() };
    exercises.push(newExercise);
    saveToStorage(EXERCISES_KEY, exercises);
    
    return {
      success: true,
      data: newExercise,
    };
  } catch (error: any) {
    console.error('Error adding exercise:', error);
    return {
      success: false,
      error: error.message || 'Failed to add exercise',
    };
  }
};

export const updateExercise = async (id: string, updates: Partial<Exercise>): Promise<ServiceResponse<Exercise>> => {
  try {
    const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
    const index = exercises.findIndex(ex => ex.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Exercise not found',
      };
    }
    
    const updatedExercise = { ...exercises[index], ...updates };
    exercises[index] = updatedExercise;
    saveToStorage(EXERCISES_KEY, exercises);
    
    return {
      success: true,
      data: updatedExercise,
    };
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    return {
      success: false,
      error: error.message || 'Failed to update exercise',
    };
  }
};

export const deleteExercise = async (id: string): Promise<ServiceResponse<void>> => {
  try {
    const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
    const filteredExercises = exercises.filter(ex => ex.id !== id);
    saveToStorage(EXERCISES_KEY, filteredExercises);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete exercise',
    };
  }
};

// Workout Session Services
export const getWorkoutSessions = async (date?: string): Promise<ServiceResponse<WorkoutSession[]>> => {
  try {
    const sessions = getFromStorage<WorkoutSession>(WORKOUT_SESSIONS_KEY);
    const filteredSessions = date 
      ? sessions.filter(session => session.date === date)
      : sessions;
    
    return {
      success: true,
      data: filteredSessions,
    };
  } catch (error: any) {
    console.error('Error fetching workout sessions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch workout sessions',
    };
  }
};

export const addWorkoutSession = async (session: Omit<WorkoutSession, 'id'>): Promise<ServiceResponse<WorkoutSession>> => {
  try {
    const sessions = getFromStorage<WorkoutSession>(WORKOUT_SESSIONS_KEY);
    const newSession = { ...session, id: uuidv4() };
    sessions.push(newSession);
    saveToStorage(WORKOUT_SESSIONS_KEY, sessions);
    
    return {
      success: true,
      data: newSession,
    };
  } catch (error: any) {
    console.error('Error adding workout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to add workout session',
    };
  }
};

export const updateWorkoutSession = async (id: string, updates: Partial<WorkoutSession>): Promise<ServiceResponse<WorkoutSession>> => {
  try {
    const sessions = getFromStorage<WorkoutSession>(WORKOUT_SESSIONS_KEY);
    const index = sessions.findIndex(session => session.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Workout session not found',
      };
    }
    
    const updatedSession = { ...sessions[index], ...updates };
    sessions[index] = updatedSession;
    saveToStorage(WORKOUT_SESSIONS_KEY, sessions);
    
    return {
      success: true,
      data: updatedSession,
    };
  } catch (error: any) {
    console.error('Error updating workout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to update workout session',
    };
  }
};

// Workout Plan Services
export const getWorkoutPlans = async (): Promise<ServiceResponse<WorkoutPlan[]>> => {
  try {
    const plans = getFromStorage<WorkoutPlan>(WORKOUT_PLANS_KEY);
    
    return {
      success: true,
      data: plans,
    };
  } catch (error: any) {
    console.error('Error fetching workout plans:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch workout plans',
    };
  }
};

export const getWorkoutPlanById = async (id: string): Promise<ServiceResponse<WorkoutPlan>> => {
  try {
    const plans = getFromStorage<WorkoutPlan>(WORKOUT_PLANS_KEY);
    const plan = plans.find(p => p.id === id);
    
    if (!plan) {
      return {
        success: false,
        error: 'Workout plan not found',
      };
    }
    
    return {
      success: true,
      data: plan,
    };
  } catch (error: any) {
    console.error('Error fetching workout plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch workout plan',
    };
  }
};

export const addWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id'>): Promise<ServiceResponse<WorkoutPlan>> => {
  try {
    const plans = getFromStorage<WorkoutPlan>(WORKOUT_PLANS_KEY);
    const newPlan = { ...plan, id: uuidv4() };
    plans.push(newPlan);
    saveToStorage(WORKOUT_PLANS_KEY, plans);
    
    return {
      success: true,
      data: newPlan,
    };
  } catch (error: any) {
    console.error('Error adding workout plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to add workout plan',
    };
  }
};

export const updateWorkoutPlan = async (id: string, updates: Partial<WorkoutPlan>): Promise<ServiceResponse<WorkoutPlan>> => {
  try {
    const plans = getFromStorage<WorkoutPlan>(WORKOUT_PLANS_KEY);
    const index = plans.findIndex(plan => plan.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Workout plan not found',
      };
    }
    
    const updatedPlan = { ...plans[index], ...updates };
    plans[index] = updatedPlan;
    saveToStorage(WORKOUT_PLANS_KEY, plans);
    
    return {
      success: true,
      data: updatedPlan,
    };
  } catch (error: any) {
    console.error('Error updating workout plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to update workout plan',
    };
  }
};

export const deleteWorkoutPlan = async (id: string): Promise<ServiceResponse<void>> => {
  try {
    const plans = getFromStorage<WorkoutPlan>(WORKOUT_PLANS_KEY);
    const filteredPlans = plans.filter(plan => plan.id !== id);
    saveToStorage(WORKOUT_PLANS_KEY, filteredPlans);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting workout plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete workout plan',
    };
  }
};

// Calorie Calculation
export const calculateCaloriesBurned = async (date: string): Promise<ServiceResponse<number>> => {
  try {
    const sessionsResponse = await getWorkoutSessions(date);
    if (!sessionsResponse.success || !sessionsResponse.data) {
      throw new Error(sessionsResponse.error || 'Failed to fetch workout sessions');
    }
    
    const sessions = sessionsResponse.data;
    const totalCaloriesBurned = sessions.reduce((total, session) => total + session.totalCaloriesBurned, 0);
    
    return {
      success: true,
      data: totalCaloriesBurned,
    };
  } catch (error: any) {
    console.error('Error calculating calories burned:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate calories burned',
    };
  }
};

// Initialize with some sample exercises
export const initializeExercises = async (): Promise<void> => {
  const exercises = getFromStorage<Exercise>(EXERCISES_KEY);
  
  // Only initialize if there are no exercises yet
  if (exercises.length === 0) {
    const sampleExercises: Omit<Exercise, 'id'>[] = [
      {
        name: 'Push-ups',
        category: 'strength',
        equipment: ['none'],
        difficulty: 'beginner',
        muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
        description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulder-width apart.',
          'Lower your body until your chest nearly touches the floor.',
          'Push yourself back up to the starting position.',
          'Repeat for the desired number of repetitions.'
        ],
        durationMinutes: 5,
        caloriesBurnedPerMinute: 8,
      },
      {
        name: 'Bodyweight Squats',
        category: 'strength',
        equipment: ['none'],
        difficulty: 'beginner',
        muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'core'],
        description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
        instructions: [
          'Stand with feet shoulder-width apart.',
          'Lower your body by bending your knees and pushing your hips back.',
          'Keep your chest up and back straight.',
          'Lower until thighs are parallel to the ground or as low as comfortable.',
          'Push through your heels to return to the starting position.',
          'Repeat for the desired number of repetitions.'
        ],
        durationMinutes: 5,
        caloriesBurnedPerMinute: 7,
      },
      {
        name: 'Jumping Jacks',
        category: 'cardio',
        equipment: ['none'],
        difficulty: 'beginner',
        muscleGroups: ['full body'],
        description: 'A simple cardio exercise that elevates heart rate and works the entire body.',
        instructions: [
          'Start standing with feet together and arms at your sides.',
          'Jump and spread your feet wider than hip-width apart while raising your arms overhead.',
          'Jump again and return to the starting position.',
          'Repeat at a quick pace for the desired duration.'
        ],
        durationMinutes: 5,
        caloriesBurnedPerMinute: 10,
      },
      {
        name: 'Plank',
        category: 'strength',
        equipment: ['none'],
        difficulty: 'beginner',
        muscleGroups: ['core', 'shoulders', 'back'],
        description: 'An isometric core exercise that strengthens the abdominals, back, and shoulders.',
        instructions: [
          'Start in a push-up position, but with forearms on the ground.',
          'Keep your body in a straight line from head to heels.',
          'Engage your core and hold the position.',
          'Hold for the desired duration.'
        ],
        durationMinutes: 1,
        caloriesBurnedPerMinute: 5,
      },
      {
        name: 'Lunges',
        category: 'strength',
        equipment: ['none'],
        difficulty: 'beginner',
        muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'core'],
        description: 'A unilateral lower body exercise that targets the quadriceps, hamstrings, and glutes.',
        instructions: [
          'Stand with feet hip-width apart.',
          'Step forward with one leg and lower your body until both knees are bent at 90-degree angles.',
          'Push through the front heel to return to the starting position.',
          'Repeat with the other leg.',
          'Continue alternating legs for the desired number of repetitions.'
        ],
        durationMinutes: 5,
        caloriesBurnedPerMinute: 7,
      },
    ];
    
    // Add sample exercises to storage
    for (const exercise of sampleExercises) {
      await addExercise(exercise);
    }
  }
};