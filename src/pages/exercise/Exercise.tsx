import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  VideoLibrary as VideoLibraryIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material';

// Services
import {
  getExercises,
  addWorkoutSession,
  getWorkoutPlans,
  getWorkoutSessions,
} from '../../services/exerciseService';
import { generateWorkoutPlan } from '../../services/aiService';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setExercises,
  addWorkoutSession as addSession,
  addWorkoutPlan,
  setWorkoutPlans as setPlans,
  setLoading,
  setError,
} from '../../store/slices/exerciseSlice';

// Types
import { WorkoutPlan, WorkoutSession } from '../../types/exercise';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ExercisePage: React.FC = () => {
  const dispatch = useDispatch();
  const {
    exercises,
    workoutPlans,
    workoutSessions,
    loading,
    error,
  } = useSelector((state: RootState) => state.exercise);
  const user = useSelector((state: RootState) => state.user);

  const [tabValue, setTabValue] = useState(0);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState(250);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchInitialData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const exercisesResponse = await getExercises();
      if (exercisesResponse.success && exercisesResponse.data) {
        dispatch(setExercises(exercisesResponse.data));
      }

      const plansResponse = await getWorkoutPlans();
      if (plansResponse.success && plansResponse.data) {
        dispatch(setPlans(plansResponse.data));
      }

      const sessionsResponse = await getWorkoutSessions();
      if (sessionsResponse.success && sessionsResponse.data) {
        sessionsResponse.data.forEach(session => dispatch(addSession(session)));
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to fetch exercise data.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleGeneratePlan = async () => {
    // Since UserState doesn't have a profile property, we'll use default values
    dispatch(setLoading(true));
    try {
      const goal = 'general-fitness';
      const equipment = ['bodyweight', 'resistance bands']; // Default equipment
      const fitnessLevel = 'beginner';
      const timeAvailable = 30; // Default time in minutes
      
      const response = await generateWorkoutPlan(goal, equipment, fitnessLevel, timeAvailable);
      if (response.success && response.data) {
        // In a real app, you'd save this plan via a service
        const newPlan: WorkoutPlan = {
          id: `ai-plan-${Date.now()}`,
          name: `AI-Generated Plan for ${goal}`,
          goal: goal === 'general-fitness' ? 'general_fitness' : 'weight_loss',
          daysPerWeek: 3,
          exercises: response.data.exercises?.map((ex: any, index: number) => ({
            day: (index % 3) + 1,
            exerciseId: ex,
            durationMinutes: 30
          })) || [],
          isAIGenerated: true,
          createdAt: new Date().toISOString(),
        };
        dispatch(addWorkoutPlan(newPlan));
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to generate workout plan.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const openSessionDialog = (planId: string) => {
    setSelectedPlan(planId);
    setSessionDialogOpen(true);
  };

  const handleAddSession = async (duration: number, calories: number) => {
    const newSession: Omit<WorkoutSession, 'id'> = {
      exercises: [], // Always provide an empty array, not undefined
      totalDurationMinutes: duration,
      totalCaloriesBurned: calories,
      date: new Date().toISOString(),
      planId: selectedPlan,
      userId: user?.id || 'default-user',
    };
    try {
      const response = await addWorkoutSession(newSession);
      if (response.success && response.data) {
        dispatch(addSession(response.data));
        setSessionDialogOpen(false);
        setSelectedPlan('');
      } else {
        dispatch(setError('Failed to log workout session'));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Workout & Exercise Hub
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<FitnessCenterIcon />} label="My Workout Plans" />
          <Tab icon={<PlaylistAddCheckIcon />} label="Tracked Sessions" />
          <Tab icon={<VideoLibraryIcon />} label="Exercise Library" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={handleGeneratePlan} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Generate AI Workout Plan'}
          </Button>
        </Box>
        <Grid container spacing={3}>
          {workoutPlans.map(plan => (
            <Grid key={plan.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{plan.goal || 'Custom workout plan'}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => openSessionDialog(plan.id)}>Log Workout</Button>
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>Your Past Workout Sessions</Typography>
        <List>
          {workoutSessions.map(session => (
            <ListItem key={session.id}>
              <ListItemText
                primary={`Workout Session - ${workoutPlans.find(plan => plan.id === session.planId)?.name || 'Custom'}`}
                secondary={`Date: ${new Date(session.date).toLocaleDateString()} - Duration: ${session.totalDurationMinutes} mins - Calories: ${session.totalCaloriesBurned}`}
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>Exercise Library & Tutorials</Typography>
        <Grid container spacing={2}>
          {exercises.map(exercise => (
            <Grid key={exercise.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{exercise.name}</Typography>
                  <Typography variant="body2">Target: {exercise.muscleGroups.join(', ')}</Typography>
                  <Typography variant="body2">Equipment: {exercise.equipment.join(', ')}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton color="primary">
                    <PlayCircleOutlineIcon />
                  </IconButton>
                  <Button size="small">View Tutorial</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)}>
        <DialogTitle>Log Workout Session</DialogTitle>
        <DialogContent>
          <Typography>
            Plan: {workoutPlans.find(plan => plan.id === selectedPlan)?.name || 'Selected Plan'}
          </Typography>
          <TextField 
            margin="dense" 
            label="Duration (minutes)" 
            type="number" 
            fullWidth 
            defaultValue={30}
            inputProps={{ min: 1 }}
            onChange={(e) => setSessionDuration(Number(e.target.value))}
          />
          <TextField 
            margin="dense" 
            label="Calories Burned" 
            type="number" 
            fullWidth 
            defaultValue={250}
            inputProps={{ min: 0 }}
            onChange={(e) => setCaloriesBurned(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleAddSession(sessionDuration, caloriesBurned)}
            disabled={sessionDuration <= 0}
          >
            Log Session
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExercisePage;