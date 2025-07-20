import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress,
  Tooltip,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface MealItem {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fromMenu: boolean;
  skipped: boolean;
  added: boolean;
}

const MealTracker: React.FC = () => {
  const [mealItems, setMealItems] = useState<MealItem[]>([
    {
      id: '1',
      name: 'Oatmeal with fruits',
      mealType: 'Breakfast',
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 10,
      fromMenu: true,
      skipped: false,
      added: false,
    },
    {
      id: '2',
      name: 'Rice with dal and vegetables',
      mealType: 'Lunch',
      calories: 550,
      protein: 20,
      carbs: 70,
      fat: 15,
      fromMenu: true,
      skipped: false,
      added: false,
    },
    {
      id: '3',
      name: 'Boiled egg',
      mealType: 'Breakfast',
      calories: 80,
      protein: 6,
      carbs: 1,
      fat: 5,
      fromMenu: false,
      skipped: false,
      added: true,
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    mealType: 'Breakfast',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleAddItem = () => {
    if (newItem.name.trim() === '') return;

    const item: MealItem = {
      id: Date.now().toString(),
      ...newItem,
      fromMenu: false,
      skipped: false,
      added: true,
    };

    setMealItems([...mealItems, item]);
    setNewItem({
      name: '',
      mealType: 'Breakfast',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };

  const handleDeleteItem = (id: string) => {
    setMealItems(mealItems.filter(item => item.id !== id));
  };

  const handleToggleSkip = (id: string) => {
    setMealItems(
      mealItems.map(item =>
        item.id === id ? { ...item, skipped: !item.skipped } : item
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'name' ? value : Number(value),
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setNewItem({
      ...newItem,
      mealType: e.target.value,
    });
  };

  // Calculate nutrition totals
  const calculateTotals = () => {
    return mealItems.reduce(
      (acc, item) => {
        if (!item.skipped) {
          acc.calories += item.calories;
          acc.protein += item.protein;
          acc.carbs += item.carbs;
          acc.fat += item.fat;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();
  
  // Daily targets (these would come from user profile in a real app)
  const targets = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fat: 70,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meal Tracker
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track what you eat and monitor your nutrition intake.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Today's Meals
            </Typography>

            {mealTypes.map(type => {
              const meals = mealItems.filter(item => item.mealType === type);
              return meals.length > 0 ? (
                <Box key={type} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {type}
                  </Typography>
                  <List>
                    {meals.map(item => (
                      <ListItem
                        key={item.id}
                        sx={{
                          bgcolor: 'background.paper',
                          mb: 1,
                          borderRadius: 1,
                          ...(item.skipped && {
                            textDecoration: 'line-through',
                            opacity: 0.6,
                          }),
                        }}
                      >
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <Typography variant="body2" component="span">
                              {item.calories} cal | {item.protein}g protein | {item.carbs}g carbs | {item.fat}g fat
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          {item.added && (
                            <Chip
                              size="small"
                              label="Added"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                          )}
                          {item.fromMenu && (
                            <Chip
                              size="small"
                              label="Menu"
                              color="secondary"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Tooltip title={item.skipped ? "Mark as eaten" : "Mark as skipped"}>
                            <IconButton
                              edge="end"
                              aria-label="toggle-skip"
                              onClick={() => handleToggleSkip(item.id)}
                              sx={{ mr: 1 }}
                            >
                              {item.skipped ? <CheckIcon /> : <CloseIcon />}
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : null;
            })}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Add Food Item
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Food Name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meal Type</InputLabel>
                  <Select
                    value={newItem.mealType}
                    label="Meal Type"
                    onChange={handleSelectChange}
                  >
                    {mealTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Calories"
                  name="calories"
                  type="number"
                  value={newItem.calories}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Protein (g)"
                  name="protein"
                  type="number"
                  value={newItem.protein}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Carbs (g)"
                  name="carbs"
                  type="number"
                  value={newItem.carbs}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Fat (g)"
                  name="fat"
                  type="number"
                  value={newItem.fat}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  disabled={!newItem.name}
                >
                  Add Food Item
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Summary
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                  <span>Calories</span>
                  <span>
                    {totals.calories} / {targets.calories}
                  </span>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totals.calories / targets.calories) * 100, 100)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                  <span>Protein</span>
                  <span>
                    {totals.protein}g / {targets.protein}g
                  </span>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totals.protein / targets.protein) * 100, 100)}
                  color="success"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                  <span>Carbs</span>
                  <span>
                    {totals.carbs}g / {targets.carbs}g
                  </span>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totals.carbs / targets.carbs) * 100, 100)}
                  color="warning"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                  <span>Fat</span>
                  <span>
                    {totals.fat}g / {targets.fat}g
                  </span>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totals.fat / targets.fat) * 100, 100)}
                  color="error"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Recommendations
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                You're under your protein target. Consider adding a protein source to your next meal.
              </Alert>
              <Alert severity="success" sx={{ mb: 2 }}>
                Great job staying within your calorie target today!
              </Alert>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<RestaurantIcon />}
                onClick={() => window.location.href = '/diet/planner'}
              >
                View Diet Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MealTracker;