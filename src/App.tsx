import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Store
import { store } from './store';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';

// Feature Pages
import Dashboard from './pages/Dashboard';
import DietPlanner from './pages/diet/DietPlanner';
import MealTracker from './pages/diet/MealTracker';
import HostelMenuUpload from './pages/diet/HostelMenuUpload';
import WeeklyDietPlan from './pages/diet/WeeklyDietPlan';
import ExerciseLibrary from './pages/exercise/ExerciseLibrary';
import ExerciseTracker from './pages/exercise/ExerciseTracker';
import VirtualTrainer from './pages/exercise/VirtualTrainer';
import WeeklyPlanner from './pages/planner/WeeklyPlanner';
import RentalHub from './pages/rental/RentalHub';
import MyRentals from './pages/rental/MyRentals';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';

// Services for initialization
import { initializeWeeklyPlan } from './services/plannerService';
import { initializeAnalyticsData } from './services/analyticsService';

// Create a theme with mobile-first approach
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green shade
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f00', // Orange shade
      light: '#ffa040',
      dark: '#c43e00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize sample data for demo purposes
    const initializeData = async () => {
      await initializeWeeklyPlan();
      await initializeAnalyticsData();
      // Note: Rental data now comes from the backend API
    };
    
    initializeData();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Diet Routes */}
              <Route path="diet">
                <Route index element={<Navigate to="/diet/planner" replace />} />
                <Route path="planner" element={<DietPlanner />} />
                <Route path="tracker" element={<MealTracker />} />
                <Route path="hostel-menu" element={<HostelMenuUpload />} />
                <Route path="weekly-plan" element={<WeeklyDietPlan />} />
              </Route>
              
              {/* Exercise Routes */}
              <Route path="exercise">
                <Route index element={<Navigate to="/exercise/library" replace />} />
                <Route path="library" element={<ExerciseLibrary />} />
                <Route path="tracker" element={<ExerciseTracker />} />
                <Route path="trainer" element={<VirtualTrainer />} />
              </Route>
              
              {/* Planner Route */}
              <Route path="planner" element={<WeeklyPlanner />} />
              
              {/* Rental Routes */}
              <Route path="rental">
                <Route index element={<Navigate to="/rental/hub" replace />} />
                <Route path="hub" element={<RentalHub />} />
                <Route path="my-rentals" element={<MyRentals />} />
              </Route>
              
              {/* Analytics Route */}
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
