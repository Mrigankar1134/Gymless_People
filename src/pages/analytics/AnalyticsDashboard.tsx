import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalFireDepartment as FireIcon,
  Restaurant as RestaurantIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
  MonitorWeight as WeightIcon,
  WaterDrop as WaterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
  EmojiEvents as AchievementIcon,
} from '@mui/icons-material';

// Mock data for charts
const generateMockData = () => {
  // Generate random data for the past 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const caloriesConsumed = days.map(() => Math.floor(Math.random() * 800) + 1200);
  const caloriesBurned = days.map(() => Math.floor(Math.random() * 500) + 300);
  const workoutsCompleted = days.map(() => Math.random() > 0.3 ? 1 : 0);
  const workoutsSkipped = days.map(() => Math.random() > 0.7 ? 1 : 0);
  const mealsTracked = days.map(() => Math.floor(Math.random() * 2) + 1);
  const mealsSkipped = days.map(() => Math.random() > 0.7 ? 1 : 0);
  const waterIntake = days.map(() => Math.floor(Math.random() * 4) + 4);
  const weight = [68.5, 68.3, 68.4, 68.2, 68.0, 67.8, 67.9];
  
  return {
    days,
    caloriesConsumed,
    caloriesBurned,
    workoutsCompleted,
    workoutsSkipped,
    mealsTracked,
    mealsSkipped,
    waterIntake,
    weight,
    macros: {
      protein: Math.floor(Math.random() * 20) + 60,
      carbs: Math.floor(Math.random() * 30) + 150,
      fat: Math.floor(Math.random() * 15) + 40,
    },
    achievements: [
      { id: 1, title: 'Workout Streak', description: '5 days in a row', completed: true, date: '2023-06-05' },
      { id: 2, title: 'Protein Goal', description: 'Hit protein target for 7 days', completed: true, date: '2023-06-02' },
      { id: 3, title: 'Calorie Balance', description: 'Maintained calorie deficit for 10 days', completed: false, progress: 7 },
      { id: 4, title: 'Water Champion', description: 'Drink 8 glasses of water for 14 days', completed: false, progress: 10 },
    ],
    suggestions: [
      'Try to add a 5-minute walk after dinner to boost your metabolism',
      'Your protein intake is below target. Consider adding a protein shake after workouts',
      'You\'ve been consistent with upper body workouts. Great job!',
      'Try to reduce carb intake in your evening meals for better results',
    ],
  };
};

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock data
        const mockData = generateMockData();
        setData(mockData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const refreshData = () => {
    // Regenerate data
    const mockData = generateMockData();
    setData(mockData);
  };

  // Calculate daily averages
  const calculateAverages = () => {
    if (!data) return { 
      calories: { consumed: 0, burned: 0 }, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      workouts: 0,
      meals: 0,
      water: 0,
      weight: { current: 0, change: 0 }
    };
    
    return {
      calories: {
        consumed: Math.round(data.caloriesConsumed.reduce((a: number, b: number) => a + b, 0) / 7),
        burned: Math.round(data.caloriesBurned.reduce((a: number, b: number) => a + b, 0) / 7),
      },
      workouts: Math.round(data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0) / 7 * 100) / 100,
      meals: Math.round(data.mealsTracked.reduce((a: number, b: number) => a + b, 0) / 7 * 100) / 100,
      water: Math.round(data.waterIntake.reduce((a: number, b: number) => a + b, 0) / 7 * 10) / 10,
      weight: {
        current: data.weight[data.weight.length - 1],
        change: Math.round((data.weight[data.weight.length - 1] - data.weight[0]) * 10) / 10,
      },
    };
  };

  // Calculate macro percentages
  const calculateMacroPercentages = () => {
    if (!data) return { protein: 0, carbs: 0, fat: 0 };
    
    const total = data.macros.protein * 4 + data.macros.carbs * 4 + data.macros.fat * 9;
    
    return {
      protein: Math.round(data.macros.protein * 4 / total * 100),
      carbs: Math.round(data.macros.carbs * 4 / total * 100),
      fat: Math.round(data.macros.fat * 9 / total * 100),
    };
  };

  const averages = calculateAverages();
  const macroPercentages = calculateMacroPercentages();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <IconButton color="primary" onClick={refreshData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Nutrition" />
          <Tab label="Fitness" />
          <Tab label="Progress" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Calorie Balance */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Daily Calorie Balance</Typography>
                      <Typography variant="h4">
                        {averages.calories.consumed - averages.calories.burned}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: (averages.calories.consumed - averages.calories.burned) < 0 ? 'success.light' : 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(averages.calories.consumed - averages.calories.burned) < 0 ? 
                        <TrendingDownIcon color="success" /> : 
                        <TrendingUpIcon color="error" />}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Consumed</Typography>
                      <Typography variant="body1">{averages.calories.consumed}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Burned</Typography>
                      <Typography variant="body1">{averages.calories.burned}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {(averages.calories.consumed - averages.calories.burned) < 0 ? 'Deficit' : 'Surplus'}
                      </Typography>
                      <Typography variant="body1">
                        {Math.abs(averages.calories.consumed - averages.calories.burned)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Workouts */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Workouts Completed</Typography>
                      <Typography variant="h4">
                        {data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FitnessCenterIcon color="primary" />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Daily Average</Typography>
                    <Typography variant="body1">{averages.workouts} workouts</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Completion Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0) / 
                               (data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0) + 
                                data.workoutsSkipped.reduce((a: number, b: number) => a + b, 0)) * 100} 
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {Math.round(data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0) / 
                                  (data.workoutsCompleted.reduce((a: number, b: number) => a + b, 0) + 
                                   data.workoutsSkipped.reduce((a: number, b: number) => a + b, 0)) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Meals */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Meals Tracked</Typography>
                      <Typography variant="h4">
                        {data.mealsTracked.reduce((a: number, b: number) => a + b, 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: 'secondary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <RestaurantIcon color="secondary" />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Daily Average</Typography>
                    <Typography variant="body1">{averages.meals} meals</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Tracking Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.mealsTracked.reduce((a: number, b: number) => a + b, 0) / 
                               (data.mealsTracked.reduce((a: number, b: number) => a + b, 0) + 
                                data.mealsSkipped.reduce((a: number, b: number) => a + b, 0)) * 100} 
                        color="secondary"
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {Math.round(data.mealsTracked.reduce((a: number, b: number) => a + b, 0) / 
                                  (data.mealsTracked.reduce((a: number, b: number) => a + b, 0) + 
                                   data.mealsSkipped.reduce((a: number, b: number) => a + b, 0)) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Weight */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Current Weight</Typography>
                      <Typography variant="h4">
                        {averages.weight.current} kg
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: 'info.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <WeightIcon color="info" />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Change (7 days)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {averages.weight.change < 0 ? (
                        <ArrowDownwardIcon fontSize="small" color="success" />
                      ) : averages.weight.change > 0 ? (
                        <ArrowUpwardIcon fontSize="small" color="error" />
                      ) : (
                        <Typography variant="body1">No change</Typography>
                      )}
                      {averages.weight.change !== 0 && (
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          {Math.abs(averages.weight.change)} kg
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Macro Distribution */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader 
                  title="Macro Distribution" 
                  action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{data.macros.protein}g</Typography>
                          <Typography variant="body2" color="text.secondary">Protein</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={macroPercentages.protein} 
                            color="primary"
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">{macroPercentages.protein}%</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{data.macros.carbs}g</Typography>
                          <Typography variant="body2" color="text.secondary">Carbs</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={macroPercentages.carbs} 
                            color="secondary"
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">{macroPercentages.carbs}%</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{data.macros.fat}g</Typography>
                          <Typography variant="body2" color="text.secondary">Fat</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={macroPercentages.fat} 
                            color="warning"
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">{macroPercentages.fat}%</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Protein intake is slightly below target" 
                        secondary="Try to increase by 10-15g daily"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Carb intake is within optimal range" 
                        secondary="Continue with current consumption"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Suggestions */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader 
                  title="AI Suggestions" 
                  action={
                    <IconButton aria-label="refresh" onClick={refreshData}>
                      <RefreshIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <List>
                    {data.suggestions.map((suggestion: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Achievements */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardHeader title="Achievements & Goals" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {data.achievements.map((achievement: any) => (
                      <Grid item xs={12} sm={6} md={3} key={achievement.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: '50%', 
                                bgcolor: achievement.completed ? 'success.light' : 'info.light',
                                mr: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <AchievementIcon color={achievement.completed ? "success" : "info"} />
                              </Box>
                              <Typography variant="h6">{achievement.title}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {achievement.description}
                            </Typography>
                            {achievement.completed ? (
                              <Chip 
                                icon={<CheckIcon />} 
                                label={`Completed on ${new Date(achievement.date).toLocaleDateString()}`} 
                                color="success" 
                                size="small" 
                                variant="outlined" 
                              />
                            ) : (
                              <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Progress: {achievement.progress} / {achievement.description.match(/\d+/)?.[0] || 0}
                                  </Typography>
                                  <Typography variant="caption" color="primary">
                                    {Math.round(achievement.progress / (achievement.description.match(/\d+/)?.[0] || 1) * 100)}%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={achievement.progress / (achievement.description.match(/\d+/)?.[0] || 1) * 100} 
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Nutrition Tab */}
      {tabValue === 1 && (
        <Typography variant="h6" sx={{ textAlign: 'center', py: 5 }}>
          Detailed nutrition analytics would be displayed here
        </Typography>
      )}

      {/* Fitness Tab */}
      {tabValue === 2 && (
        <Typography variant="h6" sx={{ textAlign: 'center', py: 5 }}>
          Detailed fitness analytics would be displayed here
        </Typography>
      )}

      {/* Progress Tab */}
      {tabValue === 3 && (
        <Typography variant="h6" sx={{ textAlign: 'center', py: 5 }}>
          Detailed progress tracking would be displayed here
        </Typography>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;