import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  profile?: {
    gender?: string;
    age?: number;
    weight?: number;
    height?: number;
    fitnessGoal?: string;
  };
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  profile: {
    gender: undefined,
    age: undefined,
    weight: undefined,
    height: undefined,
    fitnessGoal: undefined
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ id: string; name: string; email: string; profile?: { gender?: string; age?: number; weight?: number; height?: number; fitnessGoal?: string; } }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.profile = action.payload.profile || state.profile;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<{ name?: string; email?: string; profile?: { gender?: string; age?: number; weight?: number; height?: number; fitnessGoal?: string; } }>) => {
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload.profile
        };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = userSlice.actions;

// Thunk action to handle login
export const loginUser = (userData: any) => (dispatch: any) => {
  try {
    if (userData.user) {
      dispatch(loginSuccess(userData.user));
    } else {
      dispatch(loginFailure('Invalid user data'));
    }
  } catch (error: any) {
    dispatch(loginFailure(error.message || 'Login failed'));
  }
};

export default userSlice.reducer;