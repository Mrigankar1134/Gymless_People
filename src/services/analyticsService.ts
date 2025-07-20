import { v4 as uuidv4 } from 'uuid';

// For demo purposes, we'll use localStorage to simulate a backend
const DAILY_STATS_KEY = 'dailyStats';
const WEEKLY_STATS_KEY = 'weeklyStats';
const MONTHLY_STATS_KEY = 'monthlyStats';
const AI_INSIGHTS_KEY = 'aiInsights';

// Types
export interface DailyStats {
  id: string;
  date: string; // ISO date string
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatsConsumed: number;
  waterIntake: number; // in liters
  workoutDuration: number; // in minutes
  workoutType?: string;
  mealsTracked: number;
  mealsSkipped: number;
  steps?: number;
}

export interface WeeklyStats {
  id: string;
  weekStartDate: string; // ISO date string for Monday
  averageCaloriesConsumed: number;
  averageCaloriesBurned: number;
  averageProteinConsumed: number;
  averageCarbsConsumed: number;
  averageFatsConsumed: number;
  totalWorkoutDuration: number; // in minutes
  workoutFrequency: number; // number of days with workouts
  mealsTrackedPercentage: number; // percentage of meals tracked
  dailyStatsIds: string[]; // references to daily stats
}

export interface MonthlyStats {
  id: string;
  month: number; // 0-11
  year: number;
  averageCaloriesConsumed: number;
  averageCaloriesBurned: number;
  averageProteinConsumed: number;
  averageCarbsConsumed: number;
  averageFatsConsumed: number;
  totalWorkoutDuration: number; // in minutes
  workoutFrequency: number; // number of days with workouts
  mealsTrackedPercentage: number; // percentage of meals tracked
  weeklyStatsIds: string[]; // references to weekly stats
}

export interface AIInsight {
  id: string;
  date: string; // ISO date string when insight was generated
  type: 'diet' | 'workout' | 'progress' | 'general';
  title: string;
  description: string;
  relatedMetric?: string; // e.g., 'protein', 'workout_frequency'
  recommendation?: string;
  priority: 'low' | 'medium' | 'high';
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

// Daily Stats Services
export const getDailyStats = async (): Promise<ServiceResponse<DailyStats[]>> => {
  try {
    const stats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
    
    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error('Error fetching daily stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch daily stats',
    };
  }
};

export const getDailyStatsByDate = async (date: string): Promise<ServiceResponse<DailyStats>> => {
  try {
    const stats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
    const dayStats = stats.find(s => s.date === date);
    
    if (!dayStats) {
      return {
        success: false,
        error: 'Daily stats not found for the specified date',
      };
    }
    
    return {
      success: true,
      data: dayStats,
    };
  } catch (error: any) {
    console.error('Error fetching daily stats by date:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch daily stats by date',
    };
  }
};

export const addDailyStats = async (stats: Omit<DailyStats, 'id'>): Promise<ServiceResponse<DailyStats>> => {
  try {
    const allStats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
    
    // Check if stats already exist for this date
    const existingStats = allStats.find(s => s.date === stats.date);
    if (existingStats) {
      return {
        success: false,
        error: 'Stats already exist for this date',
      };
    }
    
    const newStats: DailyStats = {
      ...stats,
      id: uuidv4(),
    };
    
    allStats.push(newStats);
    saveToStorage(DAILY_STATS_KEY, allStats);
    
    // Update weekly and monthly stats if needed
    await updateAggregateStats();
    
    return {
      success: true,
      data: newStats,
    };
  } catch (error: any) {
    console.error('Error adding daily stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to add daily stats',
    };
  }
};

export const updateDailyStats = async (id: string, updates: Partial<DailyStats>): Promise<ServiceResponse<DailyStats>> => {
  try {
    const allStats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
    const index = allStats.findIndex(s => s.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Daily stats not found',
      };
    }
    
    const updatedStats = { ...allStats[index], ...updates };
    allStats[index] = updatedStats;
    saveToStorage(DAILY_STATS_KEY, allStats);
    
    // Update weekly and monthly stats if needed
    await updateAggregateStats();
    
    return {
      success: true,
      data: updatedStats,
    };
  } catch (error: any) {
    console.error('Error updating daily stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to update daily stats',
    };
  }
};

// Weekly Stats Services
export const getWeeklyStats = async (): Promise<ServiceResponse<WeeklyStats[]>> => {
  try {
    const stats = getFromStorage<WeeklyStats>(WEEKLY_STATS_KEY);
    
    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error('Error fetching weekly stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weekly stats',
    };
  }
};

export const getWeeklyStatsByDate = async (date: string): Promise<ServiceResponse<WeeklyStats>> => {
  try {
    const targetDate = new Date(date);
    const monday = getMondayOfWeek(targetDate);
    const mondayStr = formatDateOnly(monday);
    
    const stats = getFromStorage<WeeklyStats>(WEEKLY_STATS_KEY);
    const weekStats = stats.find(s => s.weekStartDate === mondayStr);
    
    if (!weekStats) {
      return {
        success: false,
        error: 'Weekly stats not found for the specified week',
      };
    }
    
    return {
      success: true,
      data: weekStats,
    };
  } catch (error: any) {
    console.error('Error fetching weekly stats by date:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weekly stats by date',
    };
  }
};

// Monthly Stats Services
export const getMonthlyStats = async (): Promise<ServiceResponse<MonthlyStats[]>> => {
  try {
    const stats = getFromStorage<MonthlyStats>(MONTHLY_STATS_KEY);
    
    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error('Error fetching monthly stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch monthly stats',
    };
  }
};

export const getMonthlyStatsByMonthYear = async (month: number, year: number): Promise<ServiceResponse<MonthlyStats>> => {
  try {
    const stats = getFromStorage<MonthlyStats>(MONTHLY_STATS_KEY);
    const monthStats = stats.find(s => s.month === month && s.year === year);
    
    if (!monthStats) {
      return {
        success: false,
        error: 'Monthly stats not found for the specified month and year',
      };
    }
    
    return {
      success: true,
      data: monthStats,
    };
  } catch (error: any) {
    console.error('Error fetching monthly stats by month and year:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch monthly stats by month and year',
    };
  }
};

// AI Insights Services
export const getAIInsights = async (): Promise<ServiceResponse<AIInsight[]>> => {
  try {
    const insights = getFromStorage<AIInsight>(AI_INSIGHTS_KEY);
    
    return {
      success: true,
      data: insights,
    };
  } catch (error: any) {
    console.error('Error fetching AI insights:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch AI insights',
    };
  }
};

export const addAIInsight = async (insight: Omit<AIInsight, 'id'>): Promise<ServiceResponse<AIInsight>> => {
  try {
    const insights = getFromStorage<AIInsight>(AI_INSIGHTS_KEY);
    
    const newInsight: AIInsight = {
      ...insight,
      id: uuidv4(),
    };
    
    insights.push(newInsight);
    saveToStorage(AI_INSIGHTS_KEY, insights);
    
    return {
      success: true,
      data: newInsight,
    };
  } catch (error: any) {
    console.error('Error adding AI insight:', error);
    return {
      success: false,
      error: error.message || 'Failed to add AI insight',
    };
  }
};

export const removeAIInsight = async (id: string): Promise<ServiceResponse<void>> => {
  try {
    const insights = getFromStorage<AIInsight>(AI_INSIGHTS_KEY);
    const filteredInsights = insights.filter(i => i.id !== id);
    
    if (filteredInsights.length === insights.length) {
      return {
        success: false,
        error: 'AI insight not found',
      };
    }
    
    saveToStorage(AI_INSIGHTS_KEY, filteredInsights);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error removing AI insight:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove AI insight',
    };
  }
};

// Helper function to update weekly and monthly stats based on daily stats
const updateAggregateStats = async (): Promise<void> => {
  try {
    const dailyStats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
    
    // Group daily stats by week
    const weeklyStatsMap = new Map<string, DailyStats[]>();
    
    dailyStats.forEach(stat => {
      const date = new Date(stat.date);
      const monday = getMondayOfWeek(date);
      const mondayStr = formatDateOnly(monday);
      
      if (!weeklyStatsMap.has(mondayStr)) {
        weeklyStatsMap.set(mondayStr, []);
      }
      
      weeklyStatsMap.get(mondayStr)?.push(stat);
    });
    
    // Update weekly stats
    const existingWeeklyStats = getFromStorage<WeeklyStats>(WEEKLY_STATS_KEY);
    const updatedWeeklyStats: WeeklyStats[] = [];
    
    weeklyStatsMap.forEach((stats, weekStartDate) => {
      const existingWeekStat = existingWeeklyStats.find(s => s.weekStartDate === weekStartDate);
      
      const totalCaloriesConsumed = stats.reduce((sum, stat) => sum + stat.caloriesConsumed, 0);
      const totalCaloriesBurned = stats.reduce((sum, stat) => sum + stat.caloriesBurned, 0);
      const totalProteinConsumed = stats.reduce((sum, stat) => sum + stat.proteinConsumed, 0);
      const totalCarbsConsumed = stats.reduce((sum, stat) => sum + stat.carbsConsumed, 0);
      const totalFatsConsumed = stats.reduce((sum, stat) => sum + stat.fatsConsumed, 0);
      const totalWorkoutDuration = stats.reduce((sum, stat) => sum + stat.workoutDuration, 0);
      const daysWithWorkout = stats.filter(stat => stat.workoutDuration > 0).length;
      const totalMealsTracked = stats.reduce((sum, stat) => sum + stat.mealsTracked, 0);
      const totalMealsSkipped = stats.reduce((sum, stat) => sum + stat.mealsSkipped, 0);
      
      const weeklyStats: WeeklyStats = {
        id: existingWeekStat?.id || uuidv4(),
        weekStartDate,
        averageCaloriesConsumed: totalCaloriesConsumed / stats.length,
        averageCaloriesBurned: totalCaloriesBurned / stats.length,
        averageProteinConsumed: totalProteinConsumed / stats.length,
        averageCarbsConsumed: totalCarbsConsumed / stats.length,
        averageFatsConsumed: totalFatsConsumed / stats.length,
        totalWorkoutDuration,
        workoutFrequency: daysWithWorkout,
        mealsTrackedPercentage: totalMealsTracked / (totalMealsTracked + totalMealsSkipped) * 100,
        dailyStatsIds: stats.map(stat => stat.id),
      };
      
      updatedWeeklyStats.push(weeklyStats);
    });
    
    saveToStorage(WEEKLY_STATS_KEY, updatedWeeklyStats);
    
    // Group weekly stats by month
    const monthlyStatsMap = new Map<string, WeeklyStats[]>();
    
    updatedWeeklyStats.forEach(stat => {
      const date = new Date(stat.weekStartDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthKey = `${year}-${month}`;
      
      if (!monthlyStatsMap.has(monthKey)) {
        monthlyStatsMap.set(monthKey, []);
      }
      
      monthlyStatsMap.get(monthKey)?.push(stat);
    });
    
    // Update monthly stats
    const existingMonthlyStats = getFromStorage<MonthlyStats>(MONTHLY_STATS_KEY);
    const updatedMonthlyStats: MonthlyStats[] = [];
    
    monthlyStatsMap.forEach((stats, monthKey) => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const existingMonthStat = existingMonthlyStats.find(s => s.month === month && s.year === year);
      
      const totalAvgCaloriesConsumed = stats.reduce((sum, stat) => sum + stat.averageCaloriesConsumed, 0);
      const totalAvgCaloriesBurned = stats.reduce((sum, stat) => sum + stat.averageCaloriesBurned, 0);
      const totalAvgProteinConsumed = stats.reduce((sum, stat) => sum + stat.averageProteinConsumed, 0);
      const totalAvgCarbsConsumed = stats.reduce((sum, stat) => sum + stat.averageCarbsConsumed, 0);
      const totalAvgFatsConsumed = stats.reduce((sum, stat) => sum + stat.averageFatsConsumed, 0);
      const totalWorkoutDuration = stats.reduce((sum, stat) => sum + stat.totalWorkoutDuration, 0);
      const totalWorkoutFrequency = stats.reduce((sum, stat) => sum + stat.workoutFrequency, 0);
      const totalMealsTrackedPercentage = stats.reduce((sum, stat) => sum + stat.mealsTrackedPercentage, 0);
      
      const monthlyStats: MonthlyStats = {
        id: existingMonthStat?.id || uuidv4(),
        month,
        year,
        averageCaloriesConsumed: totalAvgCaloriesConsumed / stats.length,
        averageCaloriesBurned: totalAvgCaloriesBurned / stats.length,
        averageProteinConsumed: totalAvgProteinConsumed / stats.length,
        averageCarbsConsumed: totalAvgCarbsConsumed / stats.length,
        averageFatsConsumed: totalAvgFatsConsumed / stats.length,
        totalWorkoutDuration,
        workoutFrequency: totalWorkoutFrequency,
        mealsTrackedPercentage: totalMealsTrackedPercentage / stats.length,
        weeklyStatsIds: stats.map(stat => stat.id),
      };
      
      updatedMonthlyStats.push(monthlyStats);
    });
    
    saveToStorage(MONTHLY_STATS_KEY, updatedMonthlyStats);
  } catch (error) {
    console.error('Error updating aggregate stats:', error);
  }
};

// Initialize with sample data
export const initializeAnalyticsData = async (): Promise<void> => {
  const dailyStats = getFromStorage<DailyStats>(DAILY_STATS_KEY);
  
  // Only initialize if there are no stats yet
  if (dailyStats.length === 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const sampleDailyStats: Omit<DailyStats, 'id'>[] = [
      {
        date: formatDateOnly(twoDaysAgo),
        caloriesConsumed: 2100,
        caloriesBurned: 350,
        proteinConsumed: 95,
        carbsConsumed: 220,
        fatsConsumed: 65,
        waterIntake: 2.5,
        workoutDuration: 45,
        workoutType: 'Strength Training',
        mealsTracked: 3,
        mealsSkipped: 0,
        steps: 8500,
      },
      {
        date: formatDateOnly(yesterday),
        caloriesConsumed: 1950,
        caloriesBurned: 280,
        proteinConsumed: 85,
        carbsConsumed: 200,
        fatsConsumed: 60,
        waterIntake: 2.2,
        workoutDuration: 30,
        workoutType: 'Cardio',
        mealsTracked: 2,
        mealsSkipped: 1,
        steps: 7200,
      },
      {
        date: formatDateOnly(today),
        caloriesConsumed: 2200,
        caloriesBurned: 400,
        proteinConsumed: 100,
        carbsConsumed: 230,
        fatsConsumed: 70,
        waterIntake: 3.0,
        workoutDuration: 60,
        workoutType: 'HIIT',
        mealsTracked: 3,
        mealsSkipped: 0,
        steps: 9500,
      },
    ];
    
    // Add sample daily stats
    for (const stats of sampleDailyStats) {
      await addDailyStats(stats);
    }
    
    // Sample AI insights
    const sampleInsights: Omit<AIInsight, 'id'>[] = [
      {
        date: formatDateOnly(today),
        type: 'diet',
        title: 'Protein Intake Improvement',
        description: 'Your protein intake has been consistently improving over the past week. Keep it up!',
        relatedMetric: 'protein',
        recommendation: 'Try to maintain this level by including protein in every meal.',
        priority: 'medium',
      },
      {
        date: formatDateOnly(today),
        type: 'workout',
        title: 'Workout Consistency',
        description: 'You\'ve been consistent with your workouts this week. This is great for building a habit!',
        relatedMetric: 'workout_frequency',
        recommendation: 'Consider increasing intensity slightly next week.',
        priority: 'high',
      },
      {
        date: formatDateOnly(today),
        type: 'progress',
        title: 'Calorie Balance',
        description: 'Your calorie deficit is on track with your goals.',
        relatedMetric: 'calorie_balance',
        recommendation: 'Continue with current diet and exercise plan.',
        priority: 'medium',
      },
      {
        date: formatDateOnly(today),
        type: 'general',
        title: 'Hydration Reminder',
        description: 'Your water intake could be improved.',
        relatedMetric: 'water_intake',
        recommendation: 'Try to drink at least 3L of water daily.',
        priority: 'low',
      },
    ];
    
    // Add sample AI insights
    for (const insight of sampleInsights) {
      await addAIInsight(insight);
    }
  }
};