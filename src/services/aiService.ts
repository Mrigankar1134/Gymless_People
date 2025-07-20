import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  // Include authorization header if needed
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`
};

// Function to analyze a hostel menu and provide recommendations
export const analyzeMenu = async (menuItems: any[]): Promise<AIServiceResponse> => {
  try {
    const response = await axios.post(`${API_URL}/ai/analyze-menu`, {
      menuItems
    }, { headers });

    return {
      success: true,
      data: response.data.data.analysis
    };
  } catch (error: any) {
    console.error('Error analyzing menu:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to analyze menu'
    };
  }
};

// Function to generate a personalized workout plan
export const generateWorkoutPlan = async (userGoals: string, equipment: string[], fitnessLevel: string, timeAvailable: number): Promise<AIServiceResponse> => {
  try {
    const response = await axios.post(`${API_URL}/ai/generate-workout-plan`, {
      userGoals,
      equipment,
      fitnessLevel,
      timeAvailable
    }, { headers });

    return {
      success: true,
      data: response.data.data.plan
    };
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate workout plan'
    };
  }
};

// Function to generate weekly meal and workout recommendations
export const generateWeeklyPlan = async (dietData: any, exerciseData: any, userCommitments: any[]): Promise<AIServiceResponse> => {
  try {
    const response = await axios.post(`${API_URL}/ai/generate-recommendations`, {
      dietData,
      exerciseData,
      userCommitments
    }, { headers });

    return {
      success: true,
      data: response.data.data.recommendations
    };
  } catch (error: any) {
    console.error('Error generating weekly plan:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate weekly plan'
    };
  }
};

// Function to analyze user's progress and provide insights
export const analyzeProgress = async (analyticsData: any): Promise<AIServiceResponse> => {
  try {
    const response = await axios.post(API_URL, {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specializing in analyzing fitness and nutrition data to provide personalized insights and recommendations.'
        },
        {
          role: 'user',
          content: `Here is my fitness and nutrition data: ${JSON.stringify(analyticsData)}. Please analyze my progress and provide insights and recommendations for improvement.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, { headers });

    return {
      success: true,
      data: response.data.choices[0].message.content
    };
  } catch (error: any) {
    console.error('Error analyzing progress:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze progress'
    };
  }
};

// Function to get exercise tutorials and form tips
export const getExerciseTutorial = async (exerciseName: string, equipment: string): Promise<AIServiceResponse> => {
  try {
    const response = await axios.post(API_URL, {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fitness expert specializing in teaching proper exercise form and technique.'
        },
        {
          role: 'user',
          content: `Please provide a detailed tutorial for the exercise: ${exerciseName} using ${equipment}. Include proper form, common mistakes to avoid, and variations for different fitness levels.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, { headers });

    return {
      success: true,
      data: response.data.choices[0].message.content
    };
  } catch (error: any) {
    console.error('Error getting exercise tutorial:', error);
    return {
      success: false,
      error: error.message || 'Failed to get exercise tutorial'
    };
  }
};