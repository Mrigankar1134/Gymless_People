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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface PlannerItem {
  id: string;
  title: string;
  description?: string;
  day: string;
  time: string;
  type: 'meal' | 'workout' | 'commitment';
  completed?: boolean;
  skipped?: boolean;
}

const WeeklyPlanner: React.FC = () => {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [newItem, setNewItem] = useState<Partial<PlannerItem>>({
    title: '',
    description: '',
    day: 'Monday',
    time: '08:00',
    type: 'commitment',
  });
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockItems: PlannerItem[] = [
          // Meals
          {
            id: '1',
            title: 'Oatmeal with Fruits',
            description: 'Add 1 boiled egg for extra protein',
            day: 'Monday',
            time: '08:00',
            type: 'meal',
          },
          {
            id: '2',
            title: 'Chicken Salad',
            description: 'Skip the mayo dressing, use lemon instead',
            day: 'Monday',
            time: '13:00',
            type: 'meal',
          },
          {
            id: '3',
            title: 'Vegetable Curry with Rice',
            description: 'Reduce rice portion, add more vegetables',
            day: 'Monday',
            time: '19:00',
            type: 'meal',
          },
          {
            id: '4',
            title: 'Protein Smoothie',
            description: 'Banana, milk, and protein powder',
            day: 'Tuesday',
            time: '08:00',
            type: 'meal',
          },
          {
            id: '5',
            title: 'Lentil Soup with Bread',
            description: 'Choose whole grain bread',
            day: 'Tuesday',
            time: '13:00',
            type: 'meal',
          },
          
          // Workouts
          {
            id: '6',
            title: 'Morning Cardio',
            description: '30 min jogging or skipping',
            day: 'Monday',
            time: '06:30',
            type: 'workout',
          },
          {
            id: '7',
            title: 'Upper Body Strength',
            description: 'Push-ups, resistance bands, dumbbells',
            day: 'Tuesday',
            time: '17:00',
            type: 'workout',
          },
          {
            id: '8',
            title: 'Yoga Session',
            description: 'Flexibility and balance focus',
            day: 'Wednesday',
            time: '07:00',
            type: 'workout',
          },
          
          // Commitments
          {
            id: '9',
            title: 'Database Systems Lecture',
            description: 'Room 302',
            day: 'Monday',
            time: '10:00',
            type: 'commitment',
          },
          {
            id: '10',
            title: 'Group Project Meeting',
            description: 'Library study room',
            day: 'Tuesday',
            time: '15:00',
            type: 'commitment',
          },
        ];
        
        setItems(mockItems);
      } catch (error) {
        console.error('Error fetching planner data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (edit = false, item?: PlannerItem) => {
    if (edit && item) {
      setEditMode(true);
      setEditItemId(item.id);
      setNewItem({
        title: item.title,
        description: item.description || '',
        day: item.day,
        time: item.time,
        type: item.type,
      });
    } else {
      setEditMode(false);
      setEditItemId(null);
      setNewItem({
        title: '',
        description: '',
        day: days[currentTab],
        time: '08:00',
        type: 'commitment',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent, field: string) => {
    setNewItem({
      ...newItem,
      [field]: e.target.value,
    });
  };

  const handleSaveItem = () => {
    if (!newItem.title || !newItem.day || !newItem.time || !newItem.type) return;

    if (editMode && editItemId) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editItemId ? 
        { ...item, ...newItem, id: item.id } as PlannerItem : 
        item
      ));
    } else {
      // Add new item
      const item: PlannerItem = {
        id: Date.now().toString(),
        title: newItem.title!,
        description: newItem.description,
        day: newItem.day!,
        time: newItem.time!,
        type: newItem.type! as 'meal' | 'workout' | 'commitment',
      };
      setItems([...items, item]);
    }

    handleCloseDialog();
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleToggleStatus = (id: string, status: 'completed' | 'skipped') => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (status === 'completed') {
          return { ...item, completed: !item.completed, skipped: false };
        } else {
          return { ...item, skipped: !item.skipped, completed: false };
        }
      }
      return item;
    }));
  };

  const getItemsByDay = (day: string) => {
    return items
      .filter(item => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <RestaurantIcon color="primary" />;
      case 'workout':
        return <FitnessCenterIcon color="secondary" />;
      case 'commitment':
        return <EventIcon color="action" />;
      default:
        return <EventIcon />;
    }
  };

  const getStatusChip = (item: PlannerItem) => {
    if (item.completed) {
      return <Chip size="small" icon={<CheckCircleIcon />} label="Completed" color="success" variant="outlined" />;
    }
    if (item.skipped) {
      return <Chip size="small" icon={<CancelIcon />} label="Skipped" color="error" variant="outlined" />;
    }
    return null;
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekly Planner</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 1 }}
          >
            Add Item
          </Button>
          <IconButton color="primary" aria-label="refresh" onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="days of week tabs"
        >
          {days.map((day, index) => (
            <Tab 
              key={day} 
              label={day} 
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      <Box role="tabpanel" id={`tabpanel-${currentTab}`} aria-labelledby={`tab-${currentTab}`}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader 
                title="Meals" 
                avatar={<RestaurantIcon color="primary" />}
              />
              <Divider />
              <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                {getItemsByDay(days[currentTab])
                  .filter(item => item.type === 'meal')
                  .length > 0 ? (
                  <List>
                    {getItemsByDay(days[currentTab])
                      .filter(item => item.type === 'meal')
                      .map(item => (
                        <ListItem
                          key={item.id}
                          secondaryAction={
                            <Box>
                              {getStatusChip(item)}
                              <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(true, item)} size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          sx={{
                            opacity: item.skipped ? 0.6 : 1,
                            textDecoration: item.skipped ? 'line-through' : 'none',
                          }}
                        >
                          <ListItemIcon>
                            <Tooltip title={formatTime(item.time)}>
                              <Box component="span">{getItemIcon(item.type)}</Box>
                            </Tooltip>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={item.description}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No meals planned for {days[currentTab]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader 
                title="Workouts" 
                avatar={<FitnessCenterIcon color="secondary" />}
              />
              <Divider />
              <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                {getItemsByDay(days[currentTab])
                  .filter(item => item.type === 'workout')
                  .length > 0 ? (
                  <List>
                    {getItemsByDay(days[currentTab])
                      .filter(item => item.type === 'workout')
                      .map(item => (
                        <ListItem
                          key={item.id}
                          secondaryAction={
                            <Box>
                              <Tooltip title="Mark as completed">
                                <IconButton 
                                  edge="end" 
                                  aria-label="complete" 
                                  onClick={() => handleToggleStatus(item.id, 'completed')} 
                                  color={item.completed ? "success" : "default"}
                                  size="small"
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark as skipped">
                                <IconButton 
                                  edge="end" 
                                  aria-label="skip" 
                                  onClick={() => handleToggleStatus(item.id, 'skipped')} 
                                  color={item.skipped ? "error" : "default"}
                                  size="small"
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(true, item)} size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          sx={{
                            opacity: item.skipped ? 0.6 : 1,
                            textDecoration: item.skipped ? 'line-through' : 'none',
                            bgcolor: item.completed ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            <Tooltip title={formatTime(item.time)}>
                              <Box component="span">{getItemIcon(item.type)}</Box>
                            </Tooltip>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={item.description}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No workouts planned for {days[currentTab]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader 
                title="Commitments" 
                avatar={<EventIcon color="action" />}
              />
              <Divider />
              <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                {getItemsByDay(days[currentTab])
                  .filter(item => item.type === 'commitment')
                  .length > 0 ? (
                  <List>
                    {getItemsByDay(days[currentTab])
                      .filter(item => item.type === 'commitment')
                      .map(item => (
                        <ListItem
                          key={item.id}
                          secondaryAction={
                            <Box>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(true, item)} size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemIcon>
                            <Tooltip title={formatTime(item.time)}>
                              <Box component="span">{getItemIcon(item.type)}</Box>
                            </Tooltip>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={item.description}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No commitments for {days[currentTab]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={newItem.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newItem.type}
                    label="Type"
                    onChange={(e) => handleSelectChange(e, 'type')}
                  >
                    <MenuItem value="meal">Meal</MenuItem>
                    <MenuItem value="workout">Workout</MenuItem>
                    <MenuItem value="commitment">Commitment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={newItem.day}
                    label="Day"
                    onChange={(e) => handleSelectChange(e, 'day')}
                  >
                    {days.map(day => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Time"
                  name="time"
                  type="time"
                  value={newItem.time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyPlanner;