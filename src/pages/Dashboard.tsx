import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from "@mui/material/Unstable_Grid2";

import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarMonth as CalendarMonthIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  DirectionsRun as RunIcon,
  WaterDrop as WaterIcon,
} from '@mui/icons-material';

// Services
import { getCurrentUser } from '../services/authService';
import { getDailyStatsByDate } from '../services/analyticsService';
import { getCurrentWeekPlan } from '../services/plannerService';

// Types
import { DailyStats } from '../services/analyticsService';
import { WeeklyPlan, PlannerEvent } from '../types/planner';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weekPlan, setWeekPlan] = useState<WeeklyPlan | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<PlannerEvent[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's stats
        const statsResponse = await getDailyStatsByDate(today);
        if (statsResponse.success && statsResponse.data) {
          setTodayStats(statsResponse.data);
        }
        
        // Fetch current week plan
        const planResponse = await getCurrentWeekPlan();
        if (planResponse.success && planResponse.data) {
          setWeekPlan(planResponse.data);
          
          // Filter upcoming events (today and future)
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const currentHour = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
          
          const upcoming = planResponse.data.events
            .filter(event => {
              // Include events from today that haven't started yet or are in the future
              if (event.date > todayStr) return true;
              if (event.date === todayStr && event.startTime >= currentTimeStr) return true;
              return false;
            })
            .sort((a, b) => {
              // Sort by date and then by start time
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return a.startTime.localeCompare(b.startTime);
            })
            .slice(0, 5); // Get only the next 5 events
          
          setUpcomingEvents(upcoming);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Helper function to format time
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  // Calculate macro percentages
  const calculateMacroPercentage = (macro: number, target: number): number => {
    return Math.min(Math.round((macro / target) * 100), 100);
  };
  
  // Get icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <RestaurantIcon color="primary" />;
      case 'workout':
        return <FitnessCenterIcon color="secondary" />;
      case 'commitment':
        return <CalendarMonthIcon color="info" />;
      default:
        return <CalendarMonthIcon color="action" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Welcome, {getCurrentUser()?.name || 'User'}!
      </Typography>
      
      <Grid component="div" container spacing={{ xs: 2, sm: 3 }}>
        {/* Quick Stats */}
        <Grid component="div" xs={12} md={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Today's Progress
            </Typography>
            
            {todayStats ? (
              <Grid component="div" container spacing={{ xs: 1, sm: 2 }}>
                {/* Calories */}
                <Grid component="div" xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Calories
                        </Typography>
                        <FireIcon color="error" />
                      </Box>
                      <Typography variant="h5">
                        {todayStats.caloriesConsumed} / {todayStats.caloriesBurned + 2000}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((todayStats.caloriesConsumed / (todayStats.caloriesBurned + 2000)) * 100, 100)} 
                        sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {todayStats.caloriesBurned} calories burned
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Protein */}
                <Grid component="div" xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Protein
                        </Typography>
                        <TrendingUpIcon color="primary" />
                      </Box>
                      <Typography variant="h5">
                        {todayStats.proteinConsumed}g / 120g
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateMacroPercentage(todayStats.proteinConsumed, 120)} 
                        sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {calculateMacroPercentage(todayStats.proteinConsumed, 120)}% of daily goal
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Workout */}
                <Grid component="div" xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Workout
                        </Typography>
                        <RunIcon color="secondary" />
                      </Box>
                      <Typography variant="h5">
                        {todayStats.workoutDuration} mins
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((todayStats.workoutDuration / 60) * 100, 100)} 
                        sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                        color="secondary"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {todayStats.workoutType || 'No workout type recorded'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Water */}
                <Grid component="div" xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Water Intake
                        </Typography>
                        <WaterIcon color="info" />
                      </Box>
                      <Typography variant="h5">
                        {todayStats.waterIntake}L / 3L
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((todayStats.waterIntake / 3) * 100, 100)} 
                        sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                        color="info"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {Math.min((todayStats.waterIntake / 3) * 100, 100).toFixed(0)}% of daily goal
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No stats available for today. Start tracking your meals and workouts!
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* AI Recommendations */}
        <Grid component="div" xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              AI Recommendations
            </Typography>
            
            {weekPlan?.aiRecommendations ? (
              <List>
                {weekPlan.aiRecommendations.tips.map((tip, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <LightbulbIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No recommendations available. Complete your profile to get personalized tips!
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Upcoming Events */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Upcoming Events
            </Typography>
            
            {upcomingEvents.length > 0 ? (
              <List>
                {upcomingEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {getEventIcon(event.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {formatDate(event.date)} at {formatTime(event.startTime)}
                            </Typography>
                            {event.description && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                display="block"
                              >
                                {event.description}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No upcoming events. Plan your week in the Weekly Planner!
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/planner')}
                startIcon={<CalendarMonthIcon />}
              >
                Go to Planner
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Quick Access */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Quick Access
            </Typography>
            
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid xs={6}>
                <Card 
                  sx={{ 
                    bgcolor: theme.palette.primary.light,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <RestaurantIcon sx={{ color: '#fff', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="h6" sx={{ color: '#fff', mt: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Diet Tracker
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth
                      size="small" 
                      sx={{ 
                        color: '#fff',
                        py: { xs: 1, sm: 0.5 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                      onClick={() => navigate('/diet/tracker')}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid xs={6}>
                <Card 
                  sx={{ 
                    bgcolor: theme.palette.secondary.light,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <FitnessCenterIcon sx={{ color: '#fff', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="h6" sx={{ color: '#fff', mt: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Workouts
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth
                      size="small" 
                      sx={{ 
                        color: '#fff',
                        py: { xs: 1, sm: 0.5 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                      onClick={() => navigate('/exercise/tracker')}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid xs={6}>
                <Card 
                  sx={{ 
                    bgcolor: theme.palette.info.light,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <InventoryIcon sx={{ color: '#fff', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="h6" sx={{ color: '#fff', mt: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Rental Hub
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth
                      size="small" 
                      sx={{ 
                        color: '#fff',
                        py: { xs: 1, sm: 0.5 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                      onClick={() => navigate('/rental/hub')}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid xs={6}>
                <Card 
                  sx={{ 
                    bgcolor: theme.palette.warning.light,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <BarChartIcon sx={{ color: '#fff', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="h6" sx={{ color: '#fff', mt: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Analytics
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth
                      size="small" 
                      sx={{ 
                        color: '#fff',
                        py: { xs: 1, sm: 0.5 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                      onClick={() => navigate('/analytics')}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;