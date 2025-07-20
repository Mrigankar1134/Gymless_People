import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Rating,
  Snackbar,
  MobileStepper,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
  SelfImprovement as YogaIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as GoalIcon,
  EmojiEvents,
  Settings as SettingsIcon,
  PlayCircleOutline as PlayIcon,
  Check as CheckIcon,
  Favorite as FavoriteIcon,
  Favorite,
  FavoriteBorder as FavoriteBorderIcon,
  BarChart as BarChartIcon,
  BarChart,
  History as HistoryIcon,
  History,
  Videocam as VideocamIcon,
  Videocam,
  Info as InfoIcon,
  Info,
  Star as StarIcon,
  Star,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Refresh,
  Save as SaveIcon,
  Save,
  Edit as EditIcon,
  Edit,
  Close as CloseIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { generateWorkoutPlan } from '../../services/aiService';
import { addWorkoutPlan, setLoading, setError } from '../../store/slices/exerciseSlice';
import { WorkoutPlan } from '../../types/exercise';

interface ExerciseDemo {
  id: string;
  name: string;
  videoUrl: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface WorkoutFeedback {
  id: string;
  planId: string;
  date: string;
  rating: number;
  feedback: string;
  completed: boolean;
  duration: number;
  caloriesBurned: number;
}

const VirtualTrainer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { workoutPlans, workoutSessions, loading, error } = useSelector((state: RootState) => state.exercise);
  const user = useSelector((state: RootState) => state.user);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    goal: 'general_fitness',
    fitnessLevel: 'beginner',
    timeAvailable: 30,
    equipment: ['bodyweight'],
    focusAreas: ['full_body'],
    frequency: 3, // days per week
    healthConditions: [],
    preferredTime: 'morning',
  });
  
  // Plan generation state
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tabs state
  const [tabValue, setTabValue] = useState(0);
  
  // Demo video dialog state
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDemo | null>(null);
  
  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: '',
    completed: false,
    duration: 0,
    caloriesBurned: 0,
  });
  
  // Progress tracking
  const [progress, setProgress] = useState({
    workoutsCompleted: 0,
    streakDays: 0,
    totalMinutes: 0,
    totalCalories: 0,
    averageRating: 0,
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Refs for scrolling
  const planSectionRef = useRef<HTMLDivElement>(null);
  const progressSectionRef = useRef<HTMLDivElement>(null);
  
  const goals = [
    { value: 'weight_loss', label: 'Weight Loss', icon: <FireIcon color="error" /> },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: <FitnessCenterIcon color="primary" /> },
    { value: 'flexibility', label: 'Flexibility & Mobility', icon: <YogaIcon color="secondary" /> },
    { value: 'general_fitness', label: 'General Fitness', icon: <RunIcon color="info" /> },
    { value: 'endurance', label: 'Endurance', icon: <HistoryIcon color="warning" /> },
  ];
  
  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to exercise or returning after a long break' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise 1-3 times per week' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent exercise 4+ times per week' },
  ];
  
  const equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight Only' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'kettlebells', label: 'Kettlebells' },
    { value: 'yoga_mat', label: 'Yoga Mat' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' },
    { value: 'bench', label: 'Workout Bench' },
    { value: 'stability_ball', label: 'Stability Ball' },
    { value: 'foam_roller', label: 'Foam Roller' },
  ];
  
  const focusAreas = [
    { value: 'full_body', label: 'Full Body' },
    { value: 'upper_body', label: 'Upper Body' },
    { value: 'lower_body', label: 'Lower Body' },
    { value: 'core', label: 'Core' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'back', label: 'Back' },
    { value: 'chest', label: 'Chest' },
    { value: 'arms', label: 'Arms' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'legs', label: 'Legs' },
  ];
  
  const frequencyOptions = [
    { value: 2, label: '2 days/week' },
    { value: 3, label: '3 days/week' },
    { value: 4, label: '4 days/week' },
    { value: 5, label: '5 days/week' },
    { value: 6, label: '6 days/week' },
    { value: 7, label: '7 days/week' },
  ];
  
  const timeOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'flexible', label: 'Flexible' },
  ];
  
  const healthConditions = [
    { value: 'none', label: 'None' },
    { value: 'back_pain', label: 'Back Pain' },
    { value: 'knee_pain', label: 'Knee Pain' },
    { value: 'shoulder_pain', label: 'Shoulder Pain' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'asthma', label: 'Asthma' },
  ];
  
  // Sample exercise demos for the demo dialog
  const exerciseDemos: ExerciseDemo[] = [
    {
      id: 'ex1',
      name: 'Push-up',
      videoUrl: 'https://example.com/videos/pushup.mp4',
      description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
      muscleGroups: ['chest', 'shoulders', 'triceps'],
      difficulty: 'beginner',
    },
    {
      id: 'ex2',
      name: 'Squat',
      videoUrl: 'https://example.com/videos/squat.mp4',
      description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
      muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
      difficulty: 'beginner',
    },
    {
      id: 'ex3',
      name: 'Plank',
      videoUrl: 'https://example.com/videos/plank.mp4',
      description: 'An isometric core exercise that strengthens the abdominals, back, and shoulders.',
      muscleGroups: ['core', 'shoulders', 'back'],
      difficulty: 'beginner',
    },
  ];
  
  // Effect to calculate progress stats from workout sessions
  useEffect(() => {
    if (workoutSessions && workoutSessions.length > 0) {
      // Calculate total workouts completed
      const completed = workoutSessions.length;
      
      // Calculate total minutes and calories
      const totalMins = workoutSessions.reduce((sum, session) => sum + session.totalDurationMinutes, 0);
      const totalCals = workoutSessions.reduce((sum, session) => sum + session.totalCaloriesBurned, 0);
      
      // Calculate streak (consecutive days with workouts)
      const sortedDates = workoutSessions
        .map(session => new Date(session.date).toISOString().split('T')[0])
        .sort()
        .reverse(); // Most recent first
      
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      let currentDate = new Date(today);
      
      // Check if there's a workout today
      if (sortedDates[0] === today) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          currentDate.setDate(currentDate.getDate() - 1);
          const prevDate = currentDate.toISOString().split('T')[0];
          if (sortedDates.includes(prevDate)) {
            streak++;
          } else {
            break;
          }
        }
      }
      
      setProgress({
        workoutsCompleted: completed,
        streakDays: streak,
        totalMinutes: totalMins,
        totalCalories: totalCals,
        averageRating: 4.2, // Placeholder - would calculate from actual ratings
      });
    }
  }, [workoutSessions]);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Stepper navigation
  const handleNext = () => {
    if (activeStep === 0) {
      generatePlan();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Form input handlers
  const handleInputChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleMultiSelectChange = (e: SelectChangeEvent<string[]> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Demo video dialog handlers
  const openDemoDialog = (exercise: ExerciseDemo) => {
    setSelectedExercise(exercise);
    setDemoDialogOpen(true);
  };
  
  const closeDemoDialog = () => {
    setDemoDialogOpen(false);
    setSelectedExercise(null);
  };
  
  // Feedback dialog handlers
  const openFeedbackDialog = () => {
    setFeedbackDialogOpen(true);
  };
  
  const closeFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
  };
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFeedbackData({
        ...feedbackData,
        [name]: value,
      });
    }
  };
  
  const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
    setFeedbackData({
      ...feedbackData,
      rating: value || 0,
    });
  };
  
  const submitFeedback = () => {
    // In a real app, you would save this feedback to the database
    setNotification({
      open: true,
      message: 'Feedback submitted successfully!',
      severity: 'success',
    });
    closeFeedbackDialog();
  };
  
  // Notification handler
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };
  
  // Scroll handlers
  const scrollToPlans = () => {
    planSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToProgress = () => {
    progressSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Plan generation
  const generatePlan = async () => {
    setIsGenerating(true);
    dispatch(setLoading(true));
    try {
      // Convert formData.goal to string format expected by the API
      const goalString = formData.goal === 'general_fitness' ? 'general-fitness' : 
                        formData.goal === 'weight_loss' ? 'weight-loss' : 
                        formData.goal === 'muscle_gain' ? 'muscle-gain' : 
                        formData.goal === 'endurance' ? 'endurance' : 'flexibility';
      
      // Convert equipment array to string array
      const equipmentArray = Array.isArray(formData.equipment) ? 
        formData.equipment.map(eq => eq.toString().replace('_', ' ')) : 
        ['bodyweight'];
      
      // Include additional parameters in the request
      const response = await generateWorkoutPlan(
        goalString,
        equipmentArray,
        formData.fitnessLevel.toString(),
        formData.timeAvailable as number
      );
      
      if (response.success && response.data) {
        setGeneratedPlan(response.data);
        
        // Create a structured workout plan from the AI response
        const newPlan: WorkoutPlan = {
          id: `ai-plan-${Date.now()}`,
          name: `AI Workout: ${goals.find(g => g.value === formData.goal)?.label || 'Custom'} Plan`,
          description: `${fitnessLevels.find(f => f.value === formData.fitnessLevel)?.label} level workout focusing on ${focusAreas.find(f => formData.focusAreas.includes(f.value))?.label || 'Full Body'}`,
          goal: formData.goal as 'weight_loss' | 'muscle_gain' | 'flexibility' | 'general_fitness',
          daysPerWeek: formData.frequency as number,
          exercises: response.data.exercises?.map((ex: any, index: number) => ({
            day: (index % formData.frequency) + 1,
            exerciseId: ex,
            durationMinutes: formData.timeAvailable as number
          })) || [],
          isAIGenerated: true,
          createdAt: new Date().toISOString(),
        };
        
        dispatch(addWorkoutPlan(newPlan));
        setActiveStep(1); // Move to the next step
        
        // Show success notification
        setNotification({
          open: true,
          message: 'Workout plan generated successfully!',
          severity: 'success',
        });
      } else {
        dispatch(setError('Failed to generate workout plan'));
        setNotification({
          open: true,
          message: 'Failed to generate workout plan. Please try again.',
          severity: 'error',
        });
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to generate workout plan'));
      setNotification({
        open: true,
        message: err.message || 'Failed to generate workout plan',
        severity: 'error',
      });
    } finally {
      setIsGenerating(false);
      dispatch(setLoading(false));
    }
  };
  
  const savePlan = () => {
    // In a real app, you would save the plan to the user's account
    setActiveStep(2); // Move to the final step
    setNotification({
      open: true,
      message: 'Workout plan saved successfully!',
      severity: 'success',
    });
  };
  
  const regeneratePlan = () => {
    setActiveStep(0);
    setGeneratedPlan(null);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 2, sm: 4 } }}>
        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="trainer tabs"
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab icon={<FitnessCenterIcon />} iconPosition="start" label="Create Plan" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="My Progress" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
          </Tabs>
        </Box>
        
        {/* Create Plan Tab */}
        {tabValue === 0 && (
          <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              AI Virtual Trainer
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Get personalized workout plans tailored to your goals, equipment, and fitness level
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
                <Step>
                  <StepLabel>Set Your Preferences</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Review AI Workout Plan</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Save & Start Training</StepLabel>
                </Step>
              </Stepper>
              
              {/* Mobile stepper alternative */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mb: 3 }}>
                <Typography variant="body1">
                  Step {activeStep + 1} of 3: {activeStep === 0 ? 'Set Preferences' : activeStep === 1 ? 'Review Plan' : 'Save & Start'}
                </Typography>
              </Box>
          
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customize Your Workout Plan
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Fitness Goal</InputLabel>
                        <Select
                          name="goal"
                          value={formData.goal}
                          onChange={handleInputChange}
                          label="Fitness Goal"
                        >
                          {goals.map((goal) => (
                            <MenuItem key={goal.value} value={goal.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {goal.icon && <Box sx={{ mr: 1 }}>{goal.icon}</Box>}
                                {goal.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Fitness Level</InputLabel>
                        <Select
                          name="fitnessLevel"
                          value={formData.fitnessLevel}
                          onChange={handleInputChange}
                          label="Fitness Level"
                        >
                          {fitnessLevels.map((level) => (
                            <MenuItem key={level.value} value={level.value}>
                              {level.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Workout Frequency</InputLabel>
                        <Select
                          name="frequency"
                          value={formData.frequency}
                          onChange={(event: SelectChangeEvent<number>) => handleInputChange(event as any)}
                          label="Workout Frequency"
                        >
                          {frequencyOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        name="timeAvailable"
                        label="Time Available (minutes)"
                        type="number"
                        value={formData.timeAvailable}
                        onChange={handleInputChange}
                        InputProps={{ inputProps: { min: 10, max: 120 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Available Equipment</InputLabel>
                        <Select
                          multiple
                          name="equipment"
                          value={formData.equipment}
                          onChange={handleMultiSelectChange as any}
                          label="Available Equipment"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip 
                                  key={value} 
                                  label={equipmentOptions.find(opt => opt.value === value)?.label} 
                                  size="small" 
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {equipmentOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                
                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Focus Areas</InputLabel>
                        <Select
                          multiple
                          name="focusAreas"
                          value={formData.focusAreas}
                          onChange={handleMultiSelectChange as any}
                          label="Focus Areas"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip 
                                  key={value} 
                                  label={focusAreas.find(opt => opt.value === value)?.label} 
                                  size="small" 
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {focusAreas.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Health Conditions</InputLabel>
                        <Select
                          multiple
                          name="healthConditions"
                          value={formData.healthConditions}
                          onChange={handleMultiSelectChange as any}
                          label="Health Conditions"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip 
                                  key={value} 
                                  label={healthConditions.find(condition => condition.value === value)?.label} 
                                  size="small" 
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {healthConditions.map((condition) => (
                            <MenuItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Select any health conditions we should consider</FormHelperText>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Preferred Time</InputLabel>
                        <Select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          label="Preferred Time"
                        >
                          {timeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
              </Grid>
            </Box>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your AI-Generated Workout Plan
              </Typography>
              
              {isGenerating ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Generating your personalized workout plan...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Our AI is analyzing your preferences and creating the perfect workout routine
                  </Typography>
                </Box>
              ) : generatedPlan ? (
                <Box>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {goals.find(g => g.value === formData.goal)?.label} Plan
                        </Typography>
                        <Tooltip title="Regenerate Plan">
                          <IconButton onClick={regeneratePlan} color="primary" size="small">
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <GoalIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">
                              Goal: {goals.find(g => g.value === formData.goal)?.label}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FitnessCenterIcon color="secondary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">
                              Level: {fitnessLevels.find(f => f.value === formData.fitnessLevel)?.label}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TimeIcon color="info" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">
                              Duration: {formData.timeAvailable} minutes
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FireIcon color="error" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">
                              Estimated Calories: {Math.round(formData.timeAvailable as number * 8)} - {Math.round(formData.timeAvailable as number * 12)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Workout Schedule
                  </Typography>
                  
                  <Box sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                    <Typography variant="body1">
                      {generatedPlan}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">No workout plan generated yet. Please go back and set your preferences.</Alert>
              )}
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your Workout Plan is Ready!
              </Typography>
              <Typography variant="body1" paragraph>
                Your personalized AI workout plan has been saved to your account. You can access it anytime from the "My Workout Plans" section.
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  startIcon={<PlayIcon />}
                  fullWidth={isMobile}
                  sx={{ py: { xs: 1.5, sm: 1 } }}
                  onClick={() => window.location.href = '/exercise/tracker'}
                >
                  Start Your Workout Now
                </Button>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              fullWidth={isMobile}
              sx={{ order: isMobile ? 2 : 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto', order: isMobile ? 1 : 2 }} />
            {activeStep === 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={savePlan}
                disabled={!generatedPlan || isGenerating}
                fullWidth={isMobile}
                sx={{ order: isMobile ? 0 : 3 }}
              >
                Save Plan
              </Button>
            ) : activeStep === 0 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={isGenerating}
                fullWidth={isMobile}
                sx={{ order: isMobile ? 0 : 3 }}
              >
                {isGenerating ? <CircularProgress size={24} /> : 'Generate Plan'}
              </Button>
            ) : null}
          </Box>
        </Paper>
        
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Recent AI-Generated Workout Plans
          </Typography>
          
          {workoutPlans.filter(plan => plan.isAIGenerated).length > 0 ? (
            <List>
              {workoutPlans
                .filter(plan => plan.isAIGenerated)
                .slice(0, 5)
                .map(plan => (
                  <ListItem key={plan.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <FitnessCenterIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={plan.name}
                      secondary={`Created: ${new Date(plan.createdAt).toLocaleDateString()} - Goal: ${plan.goal.replace('_', ' ')}`}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => window.location.href = '/exercise/tracker'}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No AI workout plans generated yet. Create your first plan above!
            </Typography>
          )}
        </Paper>
      </>
      )}
      
      {/* Progress Tab */}
      {tabValue === 1 && (
        <Box ref={progressSectionRef}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            My Fitness Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Track your workout achievements and fitness journey
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">{progress.workoutsCompleted}</Typography>
                  <Typography variant="body2">Workouts Completed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="secondary">{progress.streakDays}</Typography>
                  <Typography variant="body2">Day Streak</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main">{progress.totalMinutes}</Typography>
                  <Typography variant="body2">Total Minutes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="error.main">{progress.totalCalories}</Typography>
                  <Typography variant="body2">Calories Burned</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Weekly Activity</Typography>
            <Box sx={{ height: 300, p: 1 }}>
              {/* Placeholder for chart - would use a library like recharts in a real app */}
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <Box key={day} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          bgcolor: 'primary.main', 
                          borderRadius: 1,
                          height: `${Math.max(15, Math.min(90, Math.random() * 100))}%`
                        }} 
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>{day}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Goal Progress</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Weight Loss Goal</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={65} color="success" sx={{ height: 10, borderRadius: 5 }} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">65%</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Workout Frequency Goal</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={80} color="primary" sx={{ height: 10, borderRadius: 5 }} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">80%</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Strength Goal</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={45} color="secondary" sx={{ height: 10, borderRadius: 5 }} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">45%</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Cardio Goal</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={70} color="info" sx={{ height: 10, borderRadius: 5 }} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">70%</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Achievements</Typography>
              <Chip label="View All" color="primary" variant="outlined" onClick={() => {}} size="small" />
            </Box>
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <EmojiEvents />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="5-Day Streak Achieved!" 
                  secondary="You've worked out for 5 consecutive days"
                />
                <Typography variant="caption" color="text.secondary">2 days ago</Typography>
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <FitnessCenterIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="10 Workouts Completed" 
                  secondary="You've completed 10 workouts total"
                />
                <Typography variant="caption" color="text.secondary">1 week ago</Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <LocalFireDepartment />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="1000 Calories Burned" 
                  secondary="You've burned over 1000 calories with your workouts"
                />
                <Typography variant="caption" color="text.secondary">2 weeks ago</Typography>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
      
      {/* History Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Workout History
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Review your past workouts and track your progress over time
          </Typography>
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Recent Workouts</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter By</InputLabel>
                <Select
                  value="all"
                  label="Filter By"
                >
                  <MenuItem value="all">All Workouts</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                  <MenuItem value="weight_loss">Weight Loss</MenuItem>
                  <MenuItem value="strength">Strength</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {workoutSessions && workoutSessions.length > 0 ? (
              <List>
                {[1, 2, 3, 4, 5].map((item) => (
                  <ListItem key={item} divider sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {item === 1 ? 'Full Body Workout' : item === 2 ? 'Upper Body Focus' : item === 3 ? 'Cardio Session' : item === 4 ? 'Leg Day' : 'Core Workout'}
                          </Typography>
                          {item === 1 && <Chip label="Today" size="small" color="primary" />}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mt: { xs: 1, sm: 0 } }}>
                          <Typography variant="body2" sx={{ mr: { xs: 0, sm: 2 } }}>
                            <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {item * 10 + 15} minutes
                          </Typography>
                          <Typography variant="body2" sx={{ mr: { xs: 0, sm: 2 } }}>
                            <FireIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: theme.palette.error.main }} />
                            {item * 100 + 50} calories
                          </Typography>
                          <Typography variant="body2">
                            <FitnessCenterIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: theme.palette.secondary.main }} />
                            {item === 1 ? 'Weight Loss' : item === 2 ? 'Strength' : item === 3 ? 'Cardio' : item === 4 ? 'Strength' : 'Flexibility'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', mt: { xs: 1, sm: 0 } }}>
                      <Rating 
                        value={item === 3 ? 3 : item === 5 ? 4 : 5} 
                        readOnly 
                        size="small" 
                        sx={{ mr: 2 }}
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={openFeedbackDialog}
                      >
                        Details
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No workout history yet. Complete your first workout to see it here!
              </Typography>
            )}
          </Paper>
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>Monthly Summary</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5">12</Typography>
                    <Typography variant="body2">Workouts This Month</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5">320</Typography>
                    <Typography variant="body2">Minutes Exercised</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5">2,450</Typography>
                    <Typography variant="body2">Calories Burned</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
      
      {/* Exercise Demo Dialog */}
      <Dialog
        open={demoDialogOpen}
        onClose={closeDemoDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedExercise?.name || 'Exercise Demo'}
          <IconButton
            aria-label="close"
            onClick={closeDemoDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedExercise && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: 'black', width: '100%', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideocamIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Video demonstration would appear here in a real application
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Description</Typography>
                <Typography variant="body2" paragraph>
                  {selectedExercise.description}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>Muscle Groups</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedExercise.muscleGroups.map(muscle => (
                    <Chip key={muscle} label={muscle} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>Difficulty</Typography>
                <Chip 
                  label={selectedExercise.difficulty} 
                  color={selectedExercise.difficulty === 'beginner' ? 'success' : 
                         selectedExercise.difficulty === 'intermediate' ? 'primary' : 'error'} 
                  size="small" 
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDemoDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={closeFeedbackDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Workout Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>How was your workout?</Typography>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Rating:</Typography>
            <Rating
              name="rating"
              value={feedbackData.rating}
              onChange={handleRatingChange}
              precision={0.5}
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Feedback (optional)"
            name="feedback"
            value={feedbackData.feedback}
            onChange={handleFeedbackChange}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Did you complete the workout?</InputLabel>
            <Select
              name="completed"
              value={feedbackData.completed}
              onChange={(event: SelectChangeEvent<boolean>) => handleFeedbackChange(event as any)}
              label="Did you complete the workout?"
            >
              <MenuItem value="completed">Yes, completed fully</MenuItem>
              <MenuItem value="false">No, partially completed</MenuItem>
            </Select>
          </FormControl>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (minutes)"
                name="duration"
                value={feedbackData.duration}
                onChange={handleFeedbackChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Calories Burned (estimate)"
                name="caloriesBurned"
                value={feedbackData.caloriesBurned}
                onChange={handleFeedbackChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeedbackDialog}>Cancel</Button>
          <Button onClick={submitFeedback} variant="contained" color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      </Box>
    </Container>
  );
};

export default VirtualTrainer;