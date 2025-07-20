import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DailyStats {
  date: string; // ISO date string
  meals: {
    tracked: number;
    skipped: number;
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  workouts: {
    completed: number;
    skipped: number;
    totalDurationMinutes: number;
    caloriesBurned: number;
  };
  calorieBalance: number; // calories consumed - calories burned
  waterIntake: number; // in ml
  sleepHours: number;
  steps: number;
}

interface WeeklyStats {
  weekStartDate: string; // ISO date string
  dailyStats: DailyStats[];
  averages: {
    caloriesConsumed: number;
    caloriesBurned: number;
    calorieBalance: number;
    protein: number;
    carbs: number;
    fat: number;
    workoutDuration: number;
    waterIntake: number;
    sleepHours: number;
    steps: number;
  };
  trends: {
    calorieBalanceTrend: 'increasing' | 'decreasing' | 'stable';
    workoutConsistency: 'improving' | 'declining' | 'stable';
    nutritionQuality: 'improving' | 'declining' | 'stable';
  };
}

interface MonthlyStats {
  monthStartDate: string; // ISO date string
  weeklyStats: WeeklyStats[];
  monthlyAverages: {
    caloriesConsumed: number;
    caloriesBurned: number;
    calorieBalance: number;
    protein: number;
    carbs: number;
    fat: number;
    workoutDuration: number;
    waterIntake: number;
    sleepHours: number;
    steps: number;
  };
  progressTowardsGoals: {
    weightGoal: number; // percentage
    workoutFrequencyGoal: number; // percentage
    nutritionGoal: number; // percentage
  };
}

interface AIInsight {
  id: string;
  date: string; // ISO date string
  type: 'nutrition' | 'workout' | 'general';
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

interface AnalyticsState {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  aiInsights: AIInsight[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dailyStats: [],
  weeklyStats: [],
  monthlyStats: [],
  aiInsights: [],
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    addDailyStats: (state, action: PayloadAction<DailyStats>) => {
      const existingIndex = state.dailyStats.findIndex(stats => stats.date === action.payload.date);
      if (existingIndex !== -1) {
        state.dailyStats[existingIndex] = action.payload;
      } else {
        state.dailyStats.push(action.payload);
      }
    },
    updateDailyStats: (state, action: PayloadAction<{ date: string; updates: Partial<DailyStats> }>) => {
      const index = state.dailyStats.findIndex(stats => stats.date === action.payload.date);
      if (index !== -1) {
        state.dailyStats[index] = { ...state.dailyStats[index], ...action.payload.updates };
      }
    },
    setWeeklyStats: (state, action: PayloadAction<WeeklyStats[]>) => {
      state.weeklyStats = action.payload;
    },
    addWeeklyStats: (state, action: PayloadAction<WeeklyStats>) => {
      const existingIndex = state.weeklyStats.findIndex(stats => stats.weekStartDate === action.payload.weekStartDate);
      if (existingIndex !== -1) {
        state.weeklyStats[existingIndex] = action.payload;
      } else {
        state.weeklyStats.push(action.payload);
      }
    },
    setMonthlyStats: (state, action: PayloadAction<MonthlyStats[]>) => {
      state.monthlyStats = action.payload;
    },
    addMonthlyStats: (state, action: PayloadAction<MonthlyStats>) => {
      const existingIndex = state.monthlyStats.findIndex(stats => stats.monthStartDate === action.payload.monthStartDate);
      if (existingIndex !== -1) {
        state.monthlyStats[existingIndex] = action.payload;
      } else {
        state.monthlyStats.push(action.payload);
      }
    },
    addAIInsight: (state, action: PayloadAction<AIInsight>) => {
      state.aiInsights.push(action.payload);
    },
    removeAIInsight: (state, action: PayloadAction<string>) => {
      state.aiInsights = state.aiInsights.filter(insight => insight.id !== action.payload);
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
  addDailyStats,
  updateDailyStats,
  setWeeklyStats,
  addWeeklyStats,
  setMonthlyStats,
  addMonthlyStats,
  addAIInsight,
  removeAIInsight,
  setLoading,
  setError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;