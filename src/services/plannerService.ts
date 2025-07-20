import { v4 as uuidv4 } from 'uuid'; // Note: We need to install this package

// For demo purposes, we'll use localStorage to simulate a backend
const WEEKLY_PLANS_KEY = 'weeklyPlans';

// Types
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

// Helper function to get the Monday of a given week
const getMondayOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
};

// Helper function to format date as ISO string without time
const formatDateOnly = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Weekly Plan Services
export const getWeeklyPlans = async (): Promise<ServiceResponse<WeeklyPlan[]>> => {
  try {
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    
    return {
      success: true,
      data: plans,
    };
  } catch (error: any) {
    console.error('Error fetching weekly plans:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weekly plans',
    };
  }
};

export const getWeeklyPlanById = async (id: string): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    const plan = plans.find(p => p.id === id);
    
    if (!plan) {
      return {
        success: false,
        error: 'Weekly plan not found',
      };
    }
    
    return {
      success: true,
      data: plan,
    };
  } catch (error: any) {
    console.error('Error fetching weekly plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weekly plan',
    };
  }
};

export const getCurrentWeekPlan = async (): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const mondayStr = formatDateOnly(monday);
    
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    let currentPlan = plans.find(p => p.weekStartDate === mondayStr);
    
    // If no plan exists for the current week, create one
    if (!currentPlan) {
      const newPlan: WeeklyPlan = {
        id: uuidv4(),
        weekStartDate: mondayStr,
        events: [],
      };
      
      plans.push(newPlan);
      saveToStorage(WEEKLY_PLANS_KEY, plans);
      currentPlan = newPlan;
    }
    
    return {
      success: true,
      data: currentPlan,
    };
  } catch (error: any) {
    console.error('Error fetching current week plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch current week plan',
    };
  }
};

export const getWeeklyPlanByDate = async (date: string): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const targetDate = new Date(date);
    const monday = getMondayOfWeek(targetDate);
    const mondayStr = formatDateOnly(monday);
    
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    let plan = plans.find(p => p.weekStartDate === mondayStr);
    
    // If no plan exists for the specified week, create one
    if (!plan) {
      const newPlan: WeeklyPlan = {
        id: uuidv4(),
        weekStartDate: mondayStr,
        events: [],
      };
      
      plans.push(newPlan);
      saveToStorage(WEEKLY_PLANS_KEY, plans);
      plan = newPlan;
    }
    
    return {
      success: true,
      data: plan,
    };
  } catch (error: any) {
    console.error('Error fetching weekly plan by date:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weekly plan by date',
    };
  }
};

export const addWeeklyPlan = async (plan: Omit<WeeklyPlan, 'id'>): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    
    // Check if a plan already exists for this week
    const existingPlan = plans.find(p => p.weekStartDate === plan.weekStartDate);
    if (existingPlan) {
      return {
        success: false,
        error: 'A plan already exists for this week',
      };
    }
    
    const newPlan: WeeklyPlan = {
      ...plan,
      id: uuidv4(),
    };
    
    plans.push(newPlan);
    saveToStorage(WEEKLY_PLANS_KEY, plans);
    
    return {
      success: true,
      data: newPlan,
    };
  } catch (error: any) {
    console.error('Error adding weekly plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to add weekly plan',
    };
  }
};

export const updateWeeklyPlan = async (id: string, updates: Partial<WeeklyPlan>): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
    const index = plans.findIndex(plan => plan.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Weekly plan not found',
      };
    }
    
    const updatedPlan = { ...plans[index], ...updates };
    plans[index] = updatedPlan;
    saveToStorage(WEEKLY_PLANS_KEY, plans);
    
    return {
      success: true,
      data: updatedPlan,
    };
  } catch (error: any) {
    console.error('Error updating weekly plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to update weekly plan',
    };
  }
};

// Event Services
export const addEvent = async (planId: string, event: Omit<PlannerEvent, 'id'>): Promise<ServiceResponse<PlannerEvent>> => {
  try {
    const planResponse = await getWeeklyPlanById(planId);
    if (!planResponse.success || !planResponse.data) {
      return {
        success: false,
        error: planResponse.error || 'Weekly plan not found',
      };
    }
    
    const plan = planResponse.data;
    const newEvent: PlannerEvent = {
      ...event,
      id: uuidv4(),
    };
    
    plan.events.push(newEvent);
    
    const updateResponse = await updateWeeklyPlan(planId, { events: plan.events });
    if (!updateResponse.success) {
      return {
        success: false,
        error: updateResponse.error || 'Failed to add event',
      };
    }
    
    return {
      success: true,
      data: newEvent,
    };
  } catch (error: any) {
    console.error('Error adding event:', error);
    return {
      success: false,
      error: error.message || 'Failed to add event',
    };
  }
};

export const updateEvent = async (planId: string, eventId: string, updates: Partial<PlannerEvent>): Promise<ServiceResponse<PlannerEvent>> => {
  try {
    const planResponse = await getWeeklyPlanById(planId);
    if (!planResponse.success || !planResponse.data) {
      return {
        success: false,
        error: planResponse.error || 'Weekly plan not found',
      };
    }
    
    const plan = planResponse.data;
    const eventIndex = plan.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return {
        success: false,
        error: 'Event not found',
      };
    }
    
    const updatedEvent = { ...plan.events[eventIndex], ...updates };
    plan.events[eventIndex] = updatedEvent;
    
    const updateResponse = await updateWeeklyPlan(planId, { events: plan.events });
    if (!updateResponse.success) {
      return {
        success: false,
        error: updateResponse.error || 'Failed to update event',
      };
    }
    
    return {
      success: true,
      data: updatedEvent,
    };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return {
      success: false,
      error: error.message || 'Failed to update event',
    };
  }
};

export const removeEvent = async (planId: string, eventId: string): Promise<ServiceResponse<void>> => {
  try {
    const planResponse = await getWeeklyPlanById(planId);
    if (!planResponse.success || !planResponse.data) {
      return {
        success: false,
        error: planResponse.error || 'Weekly plan not found',
      };
    }
    
    const plan = planResponse.data;
    const filteredEvents = plan.events.filter(e => e.id !== eventId);
    
    if (filteredEvents.length === plan.events.length) {
      return {
        success: false,
        error: 'Event not found',
      };
    }
    
    const updateResponse = await updateWeeklyPlan(planId, { events: filteredEvents });
    if (!updateResponse.success) {
      return {
        success: false,
        error: updateResponse.error || 'Failed to remove event',
      };
    }
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error removing event:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove event',
    };
  }
};

// AI Recommendations
export const updateAIRecommendations = async (planId: string, recommendations: {
  meals: string[];
  workouts: string[];
  tips: string[];
}): Promise<ServiceResponse<WeeklyPlan>> => {
  try {
    const planResponse = await getWeeklyPlanById(planId);
    if (!planResponse.success || !planResponse.data) {
      return {
        success: false,
        error: planResponse.error || 'Weekly plan not found',
      };
    }
    
    const updateResponse = await updateWeeklyPlan(planId, { aiRecommendations: recommendations });
    if (!updateResponse.success || !updateResponse.data) {
      return {
        success: false,
        error: updateResponse.error || 'Failed to update AI recommendations',
      };
    }
    
    return updateResponse;
  } catch (error: any) {
    console.error('Error updating AI recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to update AI recommendations',
    };
  }
};

// Initialize with a sample weekly plan for the current week
export const initializeWeeklyPlan = async (): Promise<void> => {
  const plans = getFromStorage<WeeklyPlan>(WEEKLY_PLANS_KEY);
  
  // Only initialize if there are no plans yet
  if (plans.length === 0) {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const mondayStr = formatDateOnly(monday);
    
    const sampleEvents: Omit<PlannerEvent, 'id'>[] = [
      {
        title: 'Morning Workout',
        type: 'workout',
        date: formatDateOnly(new Date(monday.getTime() + 0 * 24 * 60 * 60 * 1000)), // Monday
        startTime: '07:00',
        endTime: '08:00',
        description: 'Full body workout with resistance bands',
        completed: false,
      },
      {
        title: 'Breakfast',
        type: 'meal',
        date: formatDateOnly(new Date(monday.getTime() + 0 * 24 * 60 * 60 * 1000)), // Monday
        startTime: '08:15',
        description: 'Oatmeal with fruits and protein shake',
        completed: false,
      },
      {
        title: 'Evening Yoga',
        type: 'workout',
        date: formatDateOnly(new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000)), // Wednesday
        startTime: '18:00',
        endTime: '19:00',
        description: 'Flexibility and relaxation yoga session',
        completed: false,
      },
      {
        title: 'Study Group',
        type: 'commitment',
        date: formatDateOnly(new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000)), // Thursday
        startTime: '16:00',
        endTime: '18:00',
        description: 'Physics study group in library',
        completed: false,
      },
      {
        title: 'Weekend Run',
        type: 'workout',
        date: formatDateOnly(new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000)), // Saturday
        startTime: '09:00',
        endTime: '10:00',
        description: '5km run around campus',
        completed: false,
      },
    ];
    
    const samplePlan: Omit<WeeklyPlan, 'id'> = {
      weekStartDate: mondayStr,
      events: [],
      aiRecommendations: {
        meals: [
          'Focus on protein-rich breakfast options like eggs or Greek yogurt',
          'Add a serving of vegetables to lunch and dinner',
          'Stay hydrated with at least 2L of water daily',
        ],
        workouts: [
          'Include at least 3 strength training sessions this week',
          'Add one flexibility/mobility session',
          'Aim for 10,000 steps on rest days',
        ],
        tips: [
          'Prepare meals in advance for busy days',
          'Get 7-8 hours of sleep each night',
          'Take short active breaks during long study sessions',
        ],
      },
    };
    
    // Create the plan first
    const newPlan: WeeklyPlan = {
      ...samplePlan,
      id: uuidv4(),
      events: [],
    };
    
    plans.push(newPlan);
    saveToStorage(WEEKLY_PLANS_KEY, plans);
    
    // Add events to the plan
    for (const event of sampleEvents) {
      await addEvent(newPlan.id, event);
    }
  }
};