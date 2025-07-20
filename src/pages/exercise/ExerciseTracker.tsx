import React, { useState, useEffect } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
  Favorite as HeartIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Mock data for exercise types
const exerciseTypes = [
  { id: 'cardio', name: 'Cardio', icon: <RunIcon /> },
  { id: 'strength', name: 'Strength Training', icon: <FitnessCenterIcon /> },
  { id: 'flexibility', name: 'Flexibility', icon: <FitnessCenterIcon /> },
  { id: 'hiit', name: 'HIIT', icon: <FireIcon /> },
];

// Mock data for exercises
const mockExercises = [
  { id: 1, name: 'Running', type: 'cardio', caloriesPerMinute: 10 },
  { id: 2, name: 'Push-ups', type: 'strength', caloriesPerMinute: 8 },
  { id: 3, name: 'Squats', type: 'strength', caloriesPerMinute: 8 },
  { id: 4, name: 'Jumping Jacks', type: 'cardio', caloriesPerMinute: 10 },
  { id: 5, name: 'Plank', type: 'strength', caloriesPerMinute: 5 },
  { id: 6, name: 'Yoga', type: 'flexibility', caloriesPerMinute: 4 },
  { id: 7, name: 'Cycling', type: 'cardio', caloriesPerMinute: 8 },
  { id: 8, name: 'Burpees', type: 'hiit', caloriesPerMinute: 12 },
  { id: 9, name: 'Mountain Climbers', type: 'hiit', caloriesPerMinute: 10 },
  { id: 10, name: 'Stretching', type: 'flexibility', caloriesPerMinute: 3 },
];

// Interface for tracked exercise
interface TrackedExercise {
  id: string;
  exerciseId: number;
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
  notes?: string;
}

const ExerciseTracker: React.FC = () => {
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Load tracked exercises from localStorage on component mount
  useEffect(() => {
    const savedExercises = localStorage.getItem('trackedExercises');
    if (savedExercises) {
      setTrackedExercises(JSON.parse(savedExercises));
    }
  }, []);

  // Save tracked exercises to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trackedExercises', JSON.stringify(trackedExercises));
  }, [trackedExercises]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openAddDialog = () => {
    setEditMode(false);
    setSelectedExercise(null);
    setDuration(30);
    setNotes('');
    setDialogOpen(true);
  };

  const openEditDialog = (exercise: TrackedExercise) => {
    setEditMode(true);
    setEditId(exercise.id);
    setSelectedExercise(exercise.exerciseId);
    setDuration(exercise.duration);
    setNotes(exercise.notes || '');
    setDialogOpen(true);
  };

  const handleAddExercise = () => {
    if (!selectedExercise) {
      setSnackbarMessage('Please select an exercise');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const exercise = mockExercises.find(ex => ex.id === selectedExercise);
      
      if (!exercise) {
        setSnackbarMessage('Exercise not found');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      if (editMode && editId) {
        // Update existing exercise
        const updatedExercises = trackedExercises.map(ex => 
          ex.id === editId ? {
            ...ex,
            exerciseId: selectedExercise,
            name: exercise.name,
            type: exercise.type,
            duration: duration,
            caloriesBurned: Math.round(exercise.caloriesPerMinute * duration),
            notes: notes,
          } : ex
        );
        
        setTrackedExercises(updatedExercises);
        setSnackbarMessage('Exercise updated successfully');
      } else {
        // Add new exercise
        const newExercise: TrackedExercise = {
          id: Date.now().toString(),
          exerciseId: selectedExercise,
          name: exercise.name,
          type: exercise.type,
          duration: duration,
          caloriesBurned: Math.round(exercise.caloriesPerMinute * duration),
          date: new Date().toISOString(),
          notes: notes,
        };
        
        setTrackedExercises([newExercise, ...trackedExercises]);
        setSnackbarMessage('Exercise added successfully');
      }
      
      setDialogOpen(false);
      setSnackbarOpen(true);
      setLoading(false);
      setEditMode(false);
      setEditId(null);
    }, 1000);
  };

  const handleDeleteExercise = (id: string) => {
    setTrackedExercises(trackedExercises.filter(ex => ex.id !== id));
    setSnackbarMessage('Exercise deleted successfully');
    setSnackbarOpen(true);
  };

  const filteredExercises = filterType === 'all' 
    ? trackedExercises 
    : trackedExercises.filter(ex => ex.type === filterType);

  // Group exercises by date for the log view
  const exercisesByDate = filteredExercises.reduce((acc, exercise) => {
    const date = new Date(exercise.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(exercise);
    return acc;
  }, {} as Record<string, TrackedExercise[]>);

  // Calculate statistics
  const totalCaloriesBurned = trackedExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDuration = trackedExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const exerciseCount = trackedExercises.length;
  const averageCaloriesPerWorkout = exerciseCount > 0 ? Math.round(totalCaloriesBurned / exerciseCount) : 0;

  // Calculate exercise type distribution
  const typeDistribution = trackedExercises.reduce((acc, ex) => {
    if (!acc[ex.type]) {
      acc[ex.type] = 0;
    }
    acc[ex.type]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exercise Tracker
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab icon={<TimelineIcon />} label="Activity Log" />
            <Tab icon={<CalendarIcon />} label="Statistics" />
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label="All Types" 
              color={filterType === 'all' ? 'primary' : 'default'} 
              onClick={() => setFilterType('all')} 
              clickable 
            />
            {exerciseTypes.map(type => (
              <Chip 
                key={type.id} 
                label={type.name} 
                icon={type.icon} 
                color={filterType === type.id ? 'primary' : 'default'} 
                onClick={() => setFilterType(type.id)} 
                clickable 
              />
            ))}
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={openAddDialog}
          >
            Track Exercise
          </Button>
        </Box>

        {/* Activity Log Tab */}
        {tabValue === 0 && (
          <>
            {Object.keys(exercisesByDate).length > 0 ? (
              Object.entries(exercisesByDate)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, exercises]) => (
                  <Paper key={date} sx={{ mb: 3, p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      {date}
                    </Typography>
                    <List>
                      {exercises.map((exercise) => (
                        <React.Fragment key={exercise.id}>
                          <ListItem>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              {exercise.type === 'cardio' && <RunIcon color="primary" />}
                              {exercise.type === 'strength' && <FitnessCenterIcon color="secondary" />}
                              {exercise.type === 'flexibility' && <FitnessCenterIcon color="info" />}
                              {exercise.type === 'hiit' && <FireIcon color="error" />}
                            </Box>
                            <ListItemText
                              primary={exercise.name}
                              secondary={
                                <>
                                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      {exercise.duration} min
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <FireIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      {exercise.caloriesBurned} cal
                                    </Box>
                                  </Box>
                                  {exercise.notes && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      Note: {exercise.notes}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => openEditDialog(exercise)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton edge="end" onClick={() => handleDeleteExercise(exercise.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                ))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>No exercises tracked yet</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Start tracking your workouts to see them here
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />} 
                  onClick={openAddDialog}
                >
                  Track Your First Exercise
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Total Workouts</Typography>
                  <Typography variant="h4">{exerciseCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Total Calories Burned</Typography>
                  <Typography variant="h4">{totalCaloriesBurned}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Total Duration (min)</Typography>
                  <Typography variant="h4">{totalDuration}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Avg. Calories per Workout</Typography>
                  <Typography variant="h4">{averageCaloriesPerWorkout}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Exercise Type Distribution</Typography>
                  {Object.entries(typeDistribution).length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {Object.entries(typeDistribution).map(([type, count]) => {
                        const percentage = Math.round((count / exerciseCount) * 100);
                        const exerciseType = exerciseTypes.find(t => t.id === type);
                        return (
                          <Box key={type} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">
                                {exerciseType?.name || type.charAt(0).toUpperCase() + type.slice(1)}
                              </Typography>
                              <Typography variant="body2">{percentage}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              color={
                                type === 'cardio' ? 'primary' : 
                                type === 'strength' ? 'secondary' : 
                                type === 'hiit' ? 'error' : 'info'
                              }
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data available yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                  {trackedExercises.length > 0 ? (
                    <List dense>
                      {trackedExercises
                        .slice(0, 5)
                        .map(exercise => (
                          <ListItem key={exercise.id}>
                            <ListItemText
                              primary={exercise.name}
                              secondary={`${new Date(exercise.date).toLocaleDateString()} - ${exercise.duration} min - ${exercise.caloriesBurned} cal`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Add/Edit Exercise Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Exercise' : 'Track New Exercise'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Exercise</InputLabel>
              <Select
                value={selectedExercise || ''}
                onChange={(e) => setSelectedExercise(e.target.value as number)}
                label="Exercise"
              >
                {mockExercises.map(exercise => (
                  <MenuItem key={exercise.id} value={exercise.id}>
                    {exercise.name} ({exerciseTypes.find(t => t.id === exercise.type)?.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 1 } }}
            />
            
            {selectedExercise && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Estimated calories: {Math.round((mockExercises.find(ex => ex.id === selectedExercise)?.caloriesPerMinute || 0) * duration)}
                </Typography>
              </Box>
            )}
            
            <TextField
              margin="normal"
              label="Notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddExercise} 
              variant="contained" 
              color="primary"
              disabled={loading || !selectedExercise || duration <= 0}
              startIcon={loading ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <AddIcon />}
            >
              {editMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          action={
            <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </Container>
  );
};

export default ExerciseTracker;