export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
    dietaryPreferences?: string[];
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  createdAt: Date | string;
  passwordChangedAt?: Date | string;
  active: boolean;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface UserProfileUpdateData {
  name?: string;
  email?: string;
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
    dietaryPreferences?: string[];
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface UserPasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}