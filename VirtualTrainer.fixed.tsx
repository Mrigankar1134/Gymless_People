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
  DirectionsRun as DirectionsRunIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  PlayArrow as PlayIcon,
  EmojiEvents as EmojiEventsIcon,
  Favorite as FavoriteIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Videocam as VideocamIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';

// Services
import { generateWorkoutPlan } from '../../services/aiService';
import { addWorkoutPlan, setLoading, setError } from '../../store/slices/exerciseSlice';

// Interfaces
interface ExerciseDemo {
  id: string;
  name: string;
  videoUrl: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface WorkoutFeedback {
  rating: number;
  feedback: string;
  completed: boolean;
  duration: number;
  caloriesBurned: number;
}

const VirtualTrainer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redux state
  const dispatch = useDispatch();
  const { workoutPlans, workoutSessions, loading, error } = useSelector((state: RootState) => state.exercise);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    goal: 'weight_loss',
    fitnessLevel: 'beginner',
    timeAvailable: 30,
    equipment: [] as string[],
    focusAreas: [] as string[],
    frequency: 3,
    healthConditions: [] as string[],
    preferredTime: 'morning',
  });
  
  // Generated plan
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Demo dialog
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDemo | null>(null);
  
  // Feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<WorkoutFeedback>({
    rating: 4,
    feedback: '',
    completed: true,
    duration: 30,
    caloriesBurned: 250,
  });
  
  // Progress tracking
  const [progress, setProgress] = useState({
    workoutsCompleted: 0,
    streakDays: 0,
    totalMinutes: 0,
    totalCalories: 0,
    averageRating: 0,
  });
  
  // Notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
  });
  
  // Refs for scrolling
  const planSectionRef = useRef<HTMLDivElement>(null);
  const progressSectionRef = useRef<HTMLDivElement>(null);
  
  // Options for form selects
  const goals = [
    { value: 'weight_loss', label: 'Weight Loss', icon: <FavoriteIcon color="error" /> },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: <FitnessCenterIcon color="primary" /> },
    { value: 'endurance', label: 'Endurance', icon: <DirectionsRunIcon color="secondary" /> },
    { value: 'flexibility', label: 'Flexibility', icon: <AccessTimeIcon color="info" /> },
    { value: 'general_fitness', label: 'General Fitness', icon: <CheckIcon color="success" /> },
  ];
  
  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];
  
  const equipmentOptions = [
    { value: 'none', label: 'No Equipment' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'yoga_mat', label: 'Yoga Mat' },
    { value: 'bench', label: 'Bench' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' },
    { value: 'kettlebell', label: 'Kettlebell' },
  ];
  
  const focusAreas = [
    { value: 'full_body', label: 'Full Body', icon: <FitnessCenterIcon /> },
    { value: 'upper_body', label: 'Upper Body', icon: <FitnessCenterIcon /> },
    { value: 'lower_body', label: 'Lower Body', icon: <FitnessCenterIcon /> },
    { value: 'core', label: 'Core', icon: <FitnessCenterIcon /> },
    { value: 'cardio', label: 'Cardio', icon: <DirectionsRunIcon /> },
    { value: 'flexibility', label: 'Flexibility', icon: <AccessTimeIcon /> },
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
  
  // Sample exercise demos
  const exerciseDemos: ExerciseDemo[] = [
    {
      id: '1',
      name: 'Push-up',
      videoUrl: 'https://example.com/videos/pushup.mp4',
      description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps. Start in a plank position with hands shoulder-width apart, lower your body until your chest nearly touches the floor, then push back up.',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      difficulty: 'beginner',
    },
    {
      id: '2',
      name: 'Squat',
      videoUrl: 'https://example.com/videos/squat.mp4',
      description: 'A fundamental lower body exercise. Stand with feet shoulder-width apart, lower your body by bending your knees and pushing your hips back as if sitting in a chair, then return to standing position.',
      muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
      difficulty: 'beginner',
    },
    {
      id: '3',
      name: 'Plank',
      videoUrl: 'https://example.com/videos/plank.mp4',
      description: 'An isometric core exercise that improves stability and strength. Hold a push-up position with your body in a straight line from head to heels, engaging your core muscles throughout.',
      muscleGroups: ['Core', 'Shoulders', 'Back'],
      difficulty: 'intermediate',
    },
  ];
  
  // Calculate progress stats from workout sessions
  useEffect(() => {
    if (workoutSessions && workoutSessions.length > 0) {
      const completed = workoutSessions.filter(session => session.completed).length;
      
      // Calculate streak (consecutive days)
      let streak = 0;
      const sortedSessions = [...workoutSessions]
        .filter(session => session.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (sortedSessions.length > 0) {
        // Check if most recent session is today or yesterday
        const mostRecent = new Date(sortedSessions[0].date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (mostRecent >= yesterday) {
          streak = 1;
          let currentDate = mostRecent;
          
          for (let i = 1; i < sortedSessions.length; i++) {
            const prevDate = new Date(sortedSessions[i].date);
            prevDate.setHours(0, 0, 0, 0);
            
            const expectedPrevDate = new Date(currentDate);
            expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
            
            if (prevDate.getTime() === expectedPrevDate.getTime()) {
              streak++;
              currentDate = prevDate;
            } else {
              break;
            }
          }
        }
      }
      
      // Calculate total minutes and calories
      const totalMins = workoutSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalCals = workoutSessions.reduce((sum, session) => sum + (session.caloriesBurned || 0), 0);
      
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
  
  const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
    setFeedbackData({
      ...feedbackData,
      rating: newValue || 0,
    });
  };
  
  const submitFeedback = () => {
    // Would save feedback to backend in a real app
    closeFeedbackDialog();
    showNotification('Feedback submitted successfully!');
  };
  
  // Notification handlers
  const showNotification = (message: string) => {
    setNotification({
      open: true,
      message,
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };
  
  // Generate AI workout plan
  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Call AI service to generate plan
      const plan = await generateWorkoutPlan(formData);
      
      setGeneratedPlan(plan);
      setActiveStep((prevStep) => prevStep + 1);
      
      // Scroll to plan section
      if (planSectionRef.current) {
        planSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      dispatch(setError('Failed to generate workout plan. Please try again.'));
      showNotification('Error generating workout plan');
    } finally {
      setIsGenerating(false);
      dispatch(setLoading(false));
    }
  };
  
  // Save generated plan
  const savePlan = () => {
    if (generatedPlan) {
      const newPlan = {
        id: Date.now().toString(),
        name: `${formData.goal.replace('_', ' ')} Plan`,
        description: `${formData.fitnessLevel} level, ${formData.timeAvailable} minutes`,
        goal: formData.goal,
        level: formData.fitnessLevel,
        duration: formData.timeAvailable,
        createdAt: new Date().toISOString(),
        isAIGenerated: true,
        plan: generatedPlan,
      };
      
      dispatch(addWorkoutPlan(newPlan));
      setActiveStep(2); // Move to final step
      showNotification('Workout plan saved successfully!');
    }
  };
  
  // Regenerate plan
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
                            <MenuItem key={level.value} value={level.value}>{level.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Time Available (minutes)"
                        name="timeAvailable"
                        type="number"
                        value={formData.timeAvailable}
                        onChange={handleInputChange}
                        inputProps={{ min: 10, max: 120 }}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Workout Frequency</InputLabel>
                        <Select
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleInputChange}
                          label="Workout Frequency"
                        >
                          {frequencyOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Available Equipment</InputLabel>
                        <Select
                          multiple
                          name="equipment"
                          value={formData.equipment}
                          onChange={handleMultiSelectChange}
                          label="Available Equipment"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => {
                                const equipment = equipmentOptions.find(option => option.value === value);
                                return (
                                  <Chip key={value} label={equipment?.label || value} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {equipmentOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
                          onChange={handleMultiSelectChange}
                          label="Focus Areas"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => {
                                const area = focusAreas.find(option => option.value === value);
                                return (
                                  <Chip key={value} label={area?.label || value} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {focusAreas.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {option.icon && <Box sx={{ mr: 1 }}>{option.icon}</Box>}
                                {option.label}
                              </Box>
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
                          onChange={handleMultiSelectChange}
                          label="Health Conditions"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => {
                                const condition = healthConditions.find(option => option.value === value);
                                return (
                                  <Chip key={value} label={condition?.label || value} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {healthConditions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {activeStep === 1 && (
                <Box ref={planSectionRef}>
                  {generatedPlan ? (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Your AI-Generated Workout Plan
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={regeneratePlan}
                          size="small"
                        >
                          Regenerate Plan
                        </Button>
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Plan Summary
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">Goal</Typography>
                              <Typography variant="subtitle1">
                                {goals.find(g => g.value === formData.goal)?.label || formData.goal}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">Level</Typography>
                              <Typography variant="subtitle1">
                                {fitnessLevels.find(l => l.value === formData.fitnessLevel)?.label || formData.fitnessLevel}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">Duration</Typography>
                              <Typography variant="subtitle1">{formData.timeAvailable} min</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">Frequency</Typography>
                              <Typography variant="subtitle1">{formData.frequency}x / week</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Exercises
                      </Typography>
                      
                      <Paper sx={{ mb: 3, overflow: 'auto' }}>
                        <Box sx={{ minWidth: 650 }}>
                          <Grid container sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Grid item xs={4} sm={3} sx={{ p: 1.5, fontWeight: 'bold' }}>Exercise</Grid>
                            <Grid item xs={2} sm={2} sx={{ p: 1.5, fontWeight: 'bold' }}>Sets</Grid>
                            <Grid item xs={2} sm={2} sx={{ p: 1.5, fontWeight: 'bold' }}>Reps</Grid>
                            <Grid item xs={2} sm={3} sx={{ p: 1.5, fontWeight: 'bold' }}>Rest</Grid>
                            <Grid item xs={2} sm={2} sx={{ p: 1.5, fontWeight: 'bold' }}>Actions</Grid>
                          </Grid>
                          
                          {exerciseDemos.map((exercise) => (
                            <Grid container key={exercise.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                              <Grid item xs={4} sm={3} sx={{ p: 1.5 }}>{exercise.name}</Grid>
                              <Grid item xs={2} sm={2} sx={{ p: 1.5 }}>3</Grid>
                              <Grid item xs={2} sm={2} sx={{ p: 1.5 }}>12-15</Grid>
                              <Grid item xs={2} sm={3} sx={{ p: 1.5 }}>60 sec</Grid>
                              <Grid item xs={2} sm={2} sx={{ p: 1.5 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="View Demo">
                                    <IconButton size="small" onClick={() => openDemoDialog(exercise)}>
                                      <VideocamIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Exercise Info">
                                    <IconButton size="small" onClick={() => openDemoDialog(exercise)}>
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Grid>
                            </Grid>
                          ))}
                        </Box>
                      </Paper>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Workout Schedule
                      </Typography>
                      
                      <Box sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                        <Typography variant="body1">
                          {generatedPlan}
                        </Typography>
                      </Box>
                    </>
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
              <Box sx={{ height: 250, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Activity chart would appear here in a real application
                </Typography>
              </Box>
            </Paper>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Goal Progress</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Weight Loss Goal</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={35} color="error" sx={{ height: 10, borderRadius: 5 }} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">35%</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Consistency Goal</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={65} color="info" sx={{ height: 10, borderRadius: 5 }} />
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
                          <LinearProgress variant="determinate" value={60} color="warning" sx={{ height: 10, borderRadius: 5 }} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">60%</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Recent Achievements</Typography>
                  
                  <List>
                    <ListItem divider>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <EmojiEventsIcon />
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
                          <LocalFireDepartmentIcon />
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
              </Grid>
            </Grid>
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
                            <Typography variant="body2" sx={{ mr: 2 }}>
                              {item === 1 ? 'June 15, 2023' : item === 2 ? 'June 13, 2023' : item === 3 ? 'June 11, 2023' : item === 4 ? 'June 9, 2023' : 'June 7, 2023'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                {item * 10 + 20} min
                              </Typography>
                              <LocalFireDepartmentIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main', fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary">
                                {item * 50 + 150} cal
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', mt: { xs: 2, sm: 0 } }}>
                        <Chip 
                          label={item % 2 === 0 ? 'Strength' : 'Cardio'} 
                          size="small" 
                          color={item % 2 === 0 ? 'primary' : 'secondary'}
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={item === 5 ? 'Missed' : 'Completed'} 
                          size="small" 
                          color={item === 5 ? 'error' : 'success'}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No workout history available yet. Complete your first workout to see it here!
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
                onChange={handleFeedbackChange}
                label="Did you complete the workout?"
              >
                <MenuItem value={true}>Yes, completed fully</MenuItem>
                <MenuItem value={false}>No, partially completed</MenuItem>
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