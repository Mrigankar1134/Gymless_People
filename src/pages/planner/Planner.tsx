import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { 
  CalendarToday as CalendarTodayIcon, 
  Add as AddIcon 
} from '@mui/icons-material';
import { 
  ViewState 
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
  Toolbar,
  DateNavigator,
  TodayButton,
  AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';

// Services
import {
  getWeeklyPlanByDate,
  addEvent,
  updateEvent,
  removeEvent,
} from '../../services/plannerService';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setCurrentWeekPlan,
  addEvent as addEventToStore,
  updateEvent as updateEventInStore,
  removeEvent as removeEventFromStore,
  setLoading,
  setError,
} from '../../store/slices/plannerSlice';

// Types
import { PlannerEvent } from '../../types/planner';

const PlannerPage: React.FC = () => {
  const dispatch = useDispatch();
  const {
    currentWeekPlan: weeklyPlan,
    loading,
    error,
  } = useSelector((state: RootState) => state.planner);
  const userId = useSelector((state: RootState) => state.user.id);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<PlannerEvent> | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!userId) return;
    dispatch(setLoading(true));
    try {
      const today = new Date().toISOString();
      const response = await getWeeklyPlanByDate(today);
      if (response.success && response.data) {
        dispatch(setCurrentWeekPlan(response.data));
      } else if (response.error) {
        dispatch(setError(response.error));
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to fetch weekly plan.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const schedulerData = weeklyPlan?.events.map((event: PlannerEvent) => {
    // Create date objects from the date and time strings
    const eventDate = new Date(event.date);
    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    const startDate = new Date(eventDate);
    startDate.setHours(startHours, startMinutes);
    
    let endDate = new Date(startDate);
    if (event.endTime) {
      const [endHours, endMinutes] = event.endTime.split(':').map(Number);
      endDate = new Date(eventDate);
      endDate.setHours(endHours, endMinutes);
    } else {
      // Default to 1 hour duration if no end time
      endDate.setHours(endDate.getHours() + 1);
    }
    
    return {
      ...event,
      startDate,
      endDate
    };
  }) || [];

  const handleEditEvent = (event?: PlannerEvent) => {
    setEditingEvent(event || { 
      id: '', 
      title: '', 
      date: new Date().toISOString(), 
      startTime: '09:00', 
      endTime: '10:00', 
      type: 'commitment',
      completed: false
    });
    setEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async () => {
    if (!editingEvent || !weeklyPlan || !userId) return;

    const eventToSave = {
      ...editingEvent,
      date: editingEvent.date || new Date().toISOString(),
      completed: editingEvent.completed || false
    } as PlannerEvent;

    try {
      if (eventToSave.id) {
        const response = await updateEvent(weeklyPlan.id, eventToSave.id, eventToSave);
        if (response.success && response.data) {
          dispatch(updateEventInStore({
            planId: weeklyPlan.id,
            eventId: eventToSave.id,
            updates: response.data
          }));
        }
      } else {
        const response = await addEvent(weeklyPlan.id, eventToSave);
        if (response.success && response.data) {
          dispatch(addEventToStore({
            planId: weeklyPlan.id,
            event: response.data
          }));
        }
      }
      handleCloseEventDialog();
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to save event'));
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Weekly Planner
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleEditEvent()}
        >
          Add Event
        </Button>
      </Box>

      <Paper elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Scheduler data={schedulerData} height={660}>
            <ViewState
              currentDate={currentDate}
              onCurrentDateChange={setCurrentDate}
            />
            <WeekView startDayHour={7} endDayHour={22} />
            <Toolbar />
            <DateNavigator />
            <TodayButton />
            <Appointments />
            <AppointmentTooltip showCloseButton showOpenButton />
          </Scheduler>
        )}
      </Paper>

      <Dialog open={eventDialogOpen} onClose={handleCloseEventDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingEvent?.id ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={editingEvent?.title || ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={editingEvent?.type || 'commitment'}
              onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as PlannerEvent['type'] })}
            >
              <MenuItem value="commitment">Commitment</MenuItem>
              <MenuItem value="meal">Meal</MenuItem>
              <MenuItem value="workout">Workout</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const newDate = e.target.value;
              setEditingEvent({ ...editingEvent, date: new Date(newDate).toISOString() });
            }}
          />
          <TextField
            margin="dense"
            label="Start Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editingEvent?.startTime || '09:00'}
            onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editingEvent?.endTime || '10:00'}
            onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={editingEvent?.description || ''}
            onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editingEvent?.completed || false}
                onChange={(e) => setEditingEvent({ ...editingEvent, completed: e.target.checked })}
              />
            }
            label="Completed"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>Cancel</Button>
          <Button onClick={handleSaveEvent}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlannerPage;