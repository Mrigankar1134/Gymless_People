import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface ExerciseState {
  exercises: Exercise[];
  workoutSessions: WorkoutSession[];
  workoutPlans: WorkoutPlan[];
  currentPlan: string | null; // ID of the current active plan
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: [],
  workoutSessions: [],
  workoutPlans: [],
  currentPlan: null,
  loading: false,
  error: null,
};

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
    },
    addExercise: (state, action: PayloadAction<Exercise>) => {
      state.exercises.push(action.payload);
    },
    updateExercise: (state, action: PayloadAction<{ id: string; updates: Partial<Exercise> }>) => {
      const index = state.exercises.findIndex(exercise => exercise.id === action.payload.id);
      if (index !== -1) {
        state.exercises[index] = { ...state.exercises[index], ...action.payload.updates };
      }
    },
    removeExercise: (state, action: PayloadAction<string>) => {
      state.exercises = state.exercises.filter(exercise => exercise.id !== action.payload);
    },
    addWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.workoutSessions.push(action.payload);
    },
    updateWorkoutSession: (state, action: PayloadAction<{ id: string; updates: Partial<WorkoutSession> }>) => {
      const index = state.workoutSessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state.workoutSessions[index] = { ...state.workoutSessions[index], ...action.payload.updates };
      }
    },
    addWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      state.workoutPlans.push(action.payload);
    },
    updateWorkoutPlan: (state, action: PayloadAction<{ id: string; updates: Partial<WorkoutPlan> }>) => {
      const index = state.workoutPlans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.workoutPlans[index] = { ...state.workoutPlans[index], ...action.payload.updates };
      }
    },
    removeWorkoutPlan: (state, action: PayloadAction<string>) => {
      state.workoutPlans = state.workoutPlans.filter(plan => plan.id !== action.payload);
    },
    setCurrentPlan: (state, action: PayloadAction<string | null>) => {
      state.currentPlan = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWorkoutPlans: (state, action: PayloadAction<WorkoutPlan[]>) => {
      state.workoutPlans = action.payload;
    },
  },
});

export const {
  setExercises,
  addExercise,
  updateExercise,
  removeExercise,
  addWorkoutSession,
  updateWorkoutSession,
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan,
  setCurrentPlan,
  setLoading,
  setError,
  setWorkoutPlans,
} = exerciseSlice.actions;

export default exerciseSlice.reducer;