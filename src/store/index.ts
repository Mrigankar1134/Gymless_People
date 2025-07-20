import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import userReducer from './slices/userSlice';
import dietReducer from './slices/dietSlice';
import exerciseReducer from './slices/exerciseSlice';
import rentalReducer from './slices/rentalSlice';
import plannerReducer from './slices/plannerSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    diet: dietReducer,
    exercise: exerciseReducer,
    rental: rentalReducer,
    planner: plannerReducer,
    analytics: analyticsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;