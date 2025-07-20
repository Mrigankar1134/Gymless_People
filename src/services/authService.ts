// In a real application, this would connect to a backend API

interface AuthResponse {
  success: boolean;
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
      profile?: {
        gender?: string;
        age?: number;
        weight?: number;
        height?: number;
        fitnessGoal?: string;
      };
    };
    token?: string;
  };
  error?: string;
}

// For demo purposes, we'll simulate authentication with local storage
// In a real application, you would connect to a backend API

interface UserData {
  name: string;
  email: string;
  password: string;
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
  };
}

export const register = async (userData: UserData): Promise<AuthResponse> => {
  try {
    // Simulate API call
    // const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    // For demo purposes, we'll create a mock user
    const mockUser = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      profile: userData.profile || {}
    };
    
    const mockToken = `token_${Math.random().toString(36).substr(2, 16)}`;
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
    
    return {
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Simulate API call
    // const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    // For demo purposes, we'll create a mock user
    const mockUser = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0], // Use part of email as name for demo
      email,
      profile: {
        gender: 'prefer-not-to-say',
        age: 30,
        weight: 70,
        height: 170,
        fitnessGoal: 'general-fitness'
      }
    };
    
    const mockToken = `token_${Math.random().toString(36).substr(2, 16)}`;
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
    
    return {
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getCurrentUser = (): { 
  id: string; 
  name: string; 
  email: string; 
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
  };
} | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const updateUserProfile = async (userId: string, updates: { 
  name?: string; 
  email?: string; 
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
  };
}): Promise<AuthResponse> => {
  try {
    // Simulate API call
    // const response = await axios.put(`${API_URL}/users/${userId}`, updates);
    
    // For demo purposes, we'll update the mock user in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // Handle profile updates separately to merge with existing profile
      let updatedUser;
      if (updates.profile) {
        updatedUser = {
          ...user,
          ...updates,
          profile: {
            ...user.profile,
            ...updates.profile
          }
        };
      } else {
        updatedUser = { ...user, ...updates };
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        data: {
          user: updatedUser,
        },
      };
    }
    
    return {
      success: false,
      error: 'User not found',
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};