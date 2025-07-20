import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
  FreeBreakfast as FreeBreakfastIcon,
  Cake as CakeIcon,
  Fastfood as FastfoodIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';

interface MealItem {
  name: string;
  status: 'recommended' | 'avoid' | 'replacement';
}

interface MealPlan {
  breakfast: MealItem[];
  lunch: MealItem[];
  snacks: MealItem[];
  dinner: MealItem[];
  dessert: MealItem[];
}

interface WeeklyPlan {
  [key: string]: MealPlan;
}

// Hardcoded weekly diet plan
const weeklyDietPlan: WeeklyPlan = {
  Monday: {
    breakfast: [
      { name: 'Oatmeal with fruits', status: 'recommended' },
      { name: 'Greek yogurt', status: 'recommended' },
      { name: 'Sugary cereals', status: 'avoid' },
      { name: 'Whole grain cereal', status: 'replacement' },
    ],
    lunch: [
      { name: 'Grilled chicken salad', status: 'recommended' },
      { name: 'Quinoa bowl', status: 'recommended' },
      { name: 'Fried foods', status: 'avoid' },
      { name: 'Baked sweet potato', status: 'replacement' },
    ],
    snacks: [
      { name: 'Nuts and seeds', status: 'recommended' },
      { name: 'Apple with peanut butter', status: 'recommended' },
      { name: 'Chips and cookies', status: 'avoid' },
      { name: 'Rice cakes with hummus', status: 'replacement' },
    ],
    dinner: [
      { name: 'Baked salmon', status: 'recommended' },
      { name: 'Steamed vegetables', status: 'recommended' },
      { name: 'Heavy cream sauces', status: 'avoid' },
      { name: 'Herb seasoning', status: 'replacement' },
    ],
    dessert: [
      { name: 'Fresh berries', status: 'recommended' },
      { name: 'Dark chocolate (small piece)', status: 'recommended' },
      { name: 'Ice cream', status: 'avoid' },
      { name: 'Frozen yogurt', status: 'replacement' },
    ],
  },
  Tuesday: {
    breakfast: [
      { name: 'Vegetable omelet', status: 'recommended' },
      { name: 'Whole grain toast', status: 'recommended' },
      { name: 'White bread', status: 'avoid' },
      { name: 'Ezekiel bread', status: 'replacement' },
    ],
    lunch: [
      { name: 'Turkey and avocado wrap', status: 'recommended' },
      { name: 'Vegetable soup', status: 'recommended' },
      { name: 'Creamy soups', status: 'avoid' },
      { name: 'Clear broth-based soup', status: 'replacement' },
    ],
    snacks: [
      { name: 'Greek yogurt with honey', status: 'recommended' },
      { name: 'Carrot sticks with hummus', status: 'recommended' },
      { name: 'Candy bars', status: 'avoid' },
      { name: 'Trail mix', status: 'replacement' },
    ],
    dinner: [
      { name: 'Grilled tofu', status: 'recommended' },
      { name: 'Brown rice', status: 'recommended' },
      { name: 'White rice', status: 'avoid' },
      { name: 'Cauliflower rice', status: 'replacement' },
    ],
    dessert: [
      { name: 'Baked apple with cinnamon', status: 'recommended' },
      { name: 'Chia pudding', status: 'recommended' },
      { name: 'Pastries', status: 'avoid' },
      { name: 'Fruit sorbet', status: 'replacement' },
    ],
  },
  Wednesday: {
    breakfast: [
      { name: 'Smoothie bowl', status: 'recommended' },
      { name: 'Chia seeds', status: 'recommended' },
      { name: 'Flavored instant oatmeal', status: 'avoid' },
      { name: 'Steel-cut oats', status: 'replacement' },
    ],
    lunch: [
      { name: 'Lentil soup', status: 'recommended' },
      { name: 'Mixed green salad', status: 'recommended' },
      { name: 'Creamy dressings', status: 'avoid' },
      { name: 'Olive oil and vinegar', status: 'replacement' },
    ],
    snacks: [
      { name: 'Cottage cheese with fruit', status: 'recommended' },
      { name: 'Edamame', status: 'recommended' },
      { name: 'Pretzels', status: 'avoid' },
      { name: 'Roasted chickpeas', status: 'replacement' },
    ],
    dinner: [
      { name: 'Grilled lean steak', status: 'recommended' },
      { name: 'Roasted vegetables', status: 'recommended' },
      { name: 'Butter-heavy sides', status: 'avoid' },
      { name: 'Herbs and spices', status: 'replacement' },
    ],
    dessert: [
      { name: 'Greek yogurt parfait', status: 'recommended' },
      { name: 'Mixed berries', status: 'recommended' },
      { name: 'Cheesecake', status: 'avoid' },
      { name: 'Ricotta with honey', status: 'replacement' },
    ],
  },
  Thursday: {
    breakfast: [
      { name: 'Protein pancakes', status: 'recommended' },
      { name: 'Fresh fruit', status: 'recommended' },
      { name: 'Syrup', status: 'avoid' },
      { name: 'Pure maple syrup (small amount)', status: 'replacement' },
    ],
    lunch: [
      { name: 'Tuna salad with olive oil', status: 'recommended' },
      { name: 'Whole grain crackers', status: 'recommended' },
      { name: 'Mayo-heavy tuna', status: 'avoid' },
      { name: 'Greek yogurt-based dressing', status: 'replacement' },
    ],
    snacks: [
      { name: 'Hard-boiled eggs', status: 'recommended' },
      { name: 'Bell pepper strips', status: 'recommended' },
      { name: 'Flavored yogurts', status: 'avoid' },
      { name: 'Plain yogurt with fresh fruit', status: 'replacement' },
    ],
    dinner: [
      { name: 'Baked chicken breast', status: 'recommended' },
      { name: 'Quinoa pilaf', status: 'recommended' },
      { name: 'Fried chicken', status: 'avoid' },
      { name: 'Air-fried chicken', status: 'replacement' },
    ],
    dessert: [
      { name: 'Dark chocolate-covered strawberries', status: 'recommended' },
      { name: 'Coconut chia pudding', status: 'recommended' },
      { name: 'Milk chocolate', status: 'avoid' },
      { name: '70%+ dark chocolate', status: 'replacement' },
    ],
  },
  Friday: {
    breakfast: [
      { name: 'Avocado toast on whole grain', status: 'recommended' },
      { name: 'Poached eggs', status: 'recommended' },
      { name: 'Bagels with cream cheese', status: 'avoid' },
      { name: 'Whole grain English muffin', status: 'replacement' },
    ],
    lunch: [
      { name: 'Mediterranean bowl', status: 'recommended' },
      { name: 'Hummus and vegetables', status: 'recommended' },
      { name: 'White pita bread', status: 'avoid' },
      { name: 'Whole wheat pita', status: 'replacement' },
    ],
    snacks: [
      { name: 'Protein smoothie', status: 'recommended' },
      { name: 'Mixed nuts', status: 'recommended' },
      { name: 'Granola bars', status: 'avoid' },
      { name: 'Homemade energy balls', status: 'replacement' },
    ],
    dinner: [
      { name: 'Grilled fish', status: 'recommended' },
      { name: 'Asparagus', status: 'recommended' },
      { name: 'Creamy pasta sides', status: 'avoid' },
      { name: 'Zucchini noodles', status: 'replacement' },
    ],
    dessert: [
      { name: 'Fruit salad', status: 'recommended' },
      { name: 'Coconut whipped cream', status: 'recommended' },
      { name: 'Store-bought whipped cream', status: 'avoid' },
      { name: 'Homemade whipped cream', status: 'replacement' },
    ],
  },
  Saturday: {
    breakfast: [
      { name: 'Breakfast burrito with beans', status: 'recommended' },
      { name: 'Salsa and avocado', status: 'recommended' },
      { name: 'Sour cream', status: 'avoid' },
      { name: 'Greek yogurt', status: 'replacement' },
    ],
    lunch: [
      { name: 'Grilled vegetable sandwich', status: 'recommended' },
      { name: 'Side salad', status: 'recommended' },
      { name: 'French fries', status: 'avoid' },
      { name: 'Baked sweet potato fries', status: 'replacement' },
    ],
    snacks: [
      { name: 'Rice cakes with almond butter', status: 'recommended' },
      { name: 'Sliced apple', status: 'recommended' },
      { name: 'Processed cheese dips', status: 'avoid' },
      { name: 'Homemade bean dip', status: 'replacement' },
    ],
    dinner: [
      { name: 'Lean beef stir fry', status: 'recommended' },
      { name: 'Broccoli and peppers', status: 'recommended' },
      { name: 'Sweet and sour sauce', status: 'avoid' },
      { name: 'Low-sodium soy sauce', status: 'replacement' },
    ],
    dessert: [
      { name: 'Frozen banana "ice cream"', status: 'recommended' },
      { name: 'Cinnamon', status: 'recommended' },
      { name: 'Store-bought ice cream', status: 'avoid' },
      { name: 'Banana nice cream', status: 'replacement' },
    ],
  },
  Sunday: {
    breakfast: [
      { name: 'Whole grain waffles', status: 'recommended' },
      { name: 'Fresh berries', status: 'recommended' },
      { name: 'Artificial syrup', status: 'avoid' },
      { name: 'Pure maple syrup (small amount)', status: 'replacement' },
    ],
    lunch: [
      { name: 'Chicken and vegetable soup', status: 'recommended' },
      { name: 'Whole grain roll', status: 'recommended' },
      { name: 'Canned soup', status: 'avoid' },
      { name: 'Homemade broth', status: 'replacement' },
    ],
    snacks: [
      { name: 'Celery with almond butter', status: 'recommended' },
      { name: 'Handful of berries', status: 'recommended' },
      { name: 'Crackers and cheese', status: 'avoid' },
      { name: 'Cucumber slices with hummus', status: 'replacement' },
    ],
    dinner: [
      { name: 'Baked cod', status: 'recommended' },
      { name: 'Roasted Brussels sprouts', status: 'recommended' },
      { name: 'Tartar sauce', status: 'avoid' },
      { name: 'Lemon and herbs', status: 'replacement' },
    ],
    dessert: [
      { name: 'Poached pears', status: 'recommended' },
      { name: 'Cinnamon and nutmeg', status: 'recommended' },
      { name: 'Caramel sauce', status: 'avoid' },
      { name: 'Honey drizzle', status: 'replacement' },
    ],
  },
};

const WeeklyDietPlan: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDay, setSelectedDay] = React.useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = [
    { type: 'breakfast', icon: <FreeBreakfastIcon />, label: 'Breakfast' },
    { type: 'lunch', icon: <LocalDiningIcon />, label: 'Lunch' },
    { type: 'snacks', icon: <FastfoodIcon />, label: 'Snacks' },
    { type: 'dinner', icon: <RestaurantIcon />, label: 'Dinner' },
    { type: 'dessert', icon: <CakeIcon />, label: 'Dessert' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recommended':
        return <CheckIcon fontSize="small" />;
      case 'avoid':
        return <CloseIcon fontSize="small" />;
      case 'replacement':
        return <SwapHorizIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended':
        return 'success';
      case 'avoid':
        return 'error';
      case 'replacement':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recommended':
        return '✅';
      case 'avoid':
        return '❌';
      case 'replacement':
        return '🔁';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, mb: 0 }}>
            Weekly Diet Plan
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your personalized weekly diet recommendations based on your fitness goals.
          </Typography>
        </Box>
        <ButtonGroup variant="contained" color="primary" aria-label="diet navigation" orientation={isMobile ? 'vertical' : 'horizontal'}>
          <Button onClick={() => navigate('/diet/planner')}>Diet Planner</Button>
          <Button onClick={() => navigate('/diet/tracker')}>Meal Tracker</Button>
          <Button onClick={() => navigate('/diet/hostel-menu')}>Upload Menu</Button>
        </ButtonGroup>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {days.map((day) => (
          <Chip
            key={day}
            label={day}
            color={selectedDay === day ? 'primary' : 'default'}
            variant={selectedDay === day ? 'filled' : 'outlined'}
            onClick={() => setSelectedDay(day)}
            sx={{ m: 0.5 }}
          />
        ))}
      </Paper>

      <Grid container spacing={3}>
        {mealTypes.map(({ type, icon, label }) => (
          <Grid item xs={12} md={6} key={type}>
            <Card elevation={2}>
              <CardHeader
                avatar={icon}
                title={label}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <List>
                  {weeklyDietPlan[selectedDay][type as keyof MealPlan].map((item, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: item.status === 'recommended' ? 'bold' : 'normal',
                                color: item.status === 'avoid' ? 'text.secondary' : 'text.primary',
                                textDecoration: item.status === 'avoid' ? 'line-through' : 'none',
                              }}
                            >
                              {getStatusLabel(item.status)} {item.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Chip
                            size="small"
                            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            color={getStatusColor(item.status) as any}
                            variant="outlined"
                            icon={getStatusIcon(item.status)}
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WeeklyDietPlan;