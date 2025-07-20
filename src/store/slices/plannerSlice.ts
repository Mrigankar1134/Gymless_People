import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlannerEvent {
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

interface WeeklyPlan {
  id: string;
  weekStartDate: string; // ISO date string for Monday
  events: PlannerEvent[];
  aiRecommendations?: {
    meals: string[];
    workouts: string[];
    tips: string[];
  };
}

interface PlannerState {
  weeklyPlans: WeeklyPlan[];
  currentWeekPlan: WeeklyPlan | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlannerState = {
  weeklyPlans: [],
  currentWeekPlan: null,
  loading: false,
  error: null,
};

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setWeeklyPlans: (state, action: PayloadAction<WeeklyPlan[]>) => {
      state.weeklyPlans = action.payload;
    },
    addWeeklyPlan: (state, action: PayloadAction<WeeklyPlan>) => {
      state.weeklyPlans.push(action.payload);
    },
    updateWeeklyPlan: (state, action: PayloadAction<{ id: string; updates: Partial<WeeklyPlan> }>) => {
      const index = state.weeklyPlans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.weeklyPlans[index] = { ...state.weeklyPlans[index], ...action.payload.updates };
        
        // If this is the current week plan, update that as well
        if (state.currentWeekPlan && state.currentWeekPlan.id === action.payload.id) {
          state.currentWeekPlan = { ...state.currentWeekPlan, ...action.payload.updates };
        }
      }
    },
    setCurrentWeekPlan: (state, action: PayloadAction<WeeklyPlan>) => {
      state.currentWeekPlan = action.payload;
    },
    addEvent: (state, action: PayloadAction<{ planId: string; event: PlannerEvent }>) => {
      const planIndex = state.weeklyPlans.findIndex(plan => plan.id === action.payload.planId);
      if (planIndex !== -1) {
        state.weeklyPlans[planIndex].events.push(action.payload.event);
        
        // If this is the current week plan, update that as well
        if (state.currentWeekPlan && state.currentWeekPlan.id === action.payload.planId) {
          state.currentWeekPlan.events.push(action.payload.event);
        }
      }
    },
    updateEvent: (state, action: PayloadAction<{ planId: string; eventId: string; updates: Partial<PlannerEvent> }>) => {
      const planIndex = state.weeklyPlans.findIndex(plan => plan.id === action.payload.planId);
      if (planIndex !== -1) {
        const eventIndex = state.weeklyPlans[planIndex].events.findIndex(event => event.id === action.payload.eventId);
        if (eventIndex !== -1) {
          state.weeklyPlans[planIndex].events[eventIndex] = {
            ...state.weeklyPlans[planIndex].events[eventIndex],
            ...action.payload.updates
          };
          
          // If this is the current week plan, update that as well
          if (state.currentWeekPlan && state.currentWeekPlan.id === action.payload.planId) {
            const currentEventIndex = state.currentWeekPlan.events.findIndex(event => event.id === action.payload.eventId);
            if (currentEventIndex !== -1) {
              state.currentWeekPlan.events[currentEventIndex] = {
                ...state.currentWeekPlan.events[currentEventIndex],
                ...action.payload.updates
              };
            }
          }
        }
      }
    },
    removeEvent: (state, action: PayloadAction<{ planId: string; eventId: string }>) => {
      const planIndex = state.weeklyPlans.findIndex(plan => plan.id === action.payload.planId);
      if (planIndex !== -1) {
        state.weeklyPlans[planIndex].events = state.weeklyPlans[planIndex].events.filter(
          event => event.id !== action.payload.eventId
        );
        
        // If this is the current week plan, update that as well
        if (state.currentWeekPlan && state.currentWeekPlan.id === action.payload.planId) {
          state.currentWeekPlan.events = state.currentWeekPlan.events.filter(
            event => event.id !== action.payload.eventId
          );
        }
      }
    },
    updateAIRecommendations: (state, action: PayloadAction<{
      planId: string;
      recommendations: {
        meals: string[];
        workouts: string[];
        tips: string[];
      };
    }>) => {
      const planIndex = state.weeklyPlans.findIndex(plan => plan.id === action.payload.planId);
      if (planIndex !== -1) {
        state.weeklyPlans[planIndex].aiRecommendations = action.payload.recommendations;
        
        // If this is the current week plan, update that as well
        if (state.currentWeekPlan && state.currentWeekPlan.id === action.payload.planId) {
          state.currentWeekPlan.aiRecommendations = action.payload.recommendations;
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
  setWeeklyPlans,
  addWeeklyPlan,
  updateWeeklyPlan,
  setCurrentWeekPlan,
  addEvent,
  updateEvent,
  removeEvent,
  updateAIRecommendations,
  setLoading,
  setError,
} = plannerSlice.actions;

export default plannerSlice.reducer;