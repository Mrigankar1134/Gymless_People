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
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Restaurant as RestaurantIcon, Info as InfoIcon } from '@mui/icons-material';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealRecommendation {
  mealType: string;
  recommendations: string[];
  nutritionInfo: NutritionInfo;
}

const DietPlanner: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data
        const sampleRecommendations: MealRecommendation[] = [
          {
            mealType: 'Breakfast',
            recommendations: [
              'Eat: Oatmeal with fruits',
              'Skip: Sugary cereals',
              'Add: 1 boiled egg for extra protein'
            ],
            nutritionInfo: {
              calories: 350,
              protein: 15,
              carbs: 45,
              fat: 10
            }
          },
          {
            mealType: 'Lunch',
            recommendations: [
              'Eat: Rice with dal and vegetables',
              'Skip: Fried items',
              'Add: A small bowl of yogurt'
            ],
            nutritionInfo: {
              calories: 550,
              protein: 20,
              carbs: 70,
              fat: 15
            }
          },
          {
            mealType: 'Dinner',
            recommendations: [
              'Eat: Chapati with vegetable curry',
              'Skip: Heavy desserts',
              'Add: A small portion of paneer'
            ],
            nutritionInfo: {
              calories: 450,
              protein: 18,
              carbs: 60,
              fat: 12
            }
          },
          {
            mealType: 'Snacks',
            recommendations: [
              'Eat: Fruits or nuts',
              'Skip: Chips and cookies',
              'Add: A protein shake if working out'
            ],
            nutritionInfo: {
              calories: 200,
              protein: 10,
              carbs: 25,
              fat: 8
            }
          }
        ];
        
        setRecommendations(sampleRecommendations);
        setError(null);
      } catch (err) {
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const getTotalNutrition = (): NutritionInfo => {
    return recommendations.reduce(
      (total, meal) => {
        return {
          calories: total.calories + meal.nutritionInfo.calories,
          protein: total.protein + meal.nutritionInfo.protein,
          carbs: total.carbs + meal.nutritionInfo.carbs,
          fat: total.fat + meal.nutritionInfo.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Diet Planner
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Personalized diet recommendations based on your hostel menu and fitness goals.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Daily Nutrition Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{getTotalNutrition().calories}</Typography>
                    <Typography variant="body2" color="text.secondary">Calories</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{getTotalNutrition().protein}g</Typography>
                    <Typography variant="body2" color="text.secondary">Protein</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{getTotalNutrition().carbs}g</Typography>
                    <Typography variant="body2" color="text.secondary">Carbs</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">{getTotalNutrition().fat}g</Typography>
                    <Typography variant="body2" color="text.secondary">Fat</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            {recommendations.map((meal, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardHeader 
                    title={meal.mealType} 
                    avatar={<RestaurantIcon color="primary" />}
                  />
                  <Divider />
                  <CardContent>
                    <List>
                      {meal.recommendations.map((rec, idx) => {
                        const [action, food] = rec.split(': ');
                        return (
                          <ListItem key={idx}>
                            <ListItemText 
                              primary={food}
                              secondary={action}
                              primaryTypographyProps={{
                                fontWeight: action === 'Add' ? 'bold' : 'normal'
                              }}
                            />
                            <Chip 
                              label={action} 
                              color={
                                action === 'Eat' ? 'success' : 
                                action === 'Skip' ? 'error' : 'primary'
                              } 
                              size="small" 
                              variant="outlined"
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" display="flex" alignItems="center">
                        <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                        Nutrition Info
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={3}>
                          <Typography variant="body2">{meal.nutritionInfo.calories} cal</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{meal.nutritionInfo.protein}g protein</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{meal.nutritionInfo.carbs}g carbs</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{meal.nutritionInfo.fat}g fat</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.href = '/diet/hostel-menu'}
            >
              Update Hostel Menu
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DietPlanner;