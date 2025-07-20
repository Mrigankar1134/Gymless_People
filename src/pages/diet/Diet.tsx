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
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Collapse,
  styled,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Fastfood as FastfoodIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  ExpandMore as ExpandMoreIcon,
  RestaurantMenu as RestaurantMenuIcon,
  NoteAdd as NoteAddIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

// Services
import {
  getHostelMenu, 
  uploadHostelMenu, 
  addMealIntake, 
  getMealIntake, 
  getAIRecommendations,
  calculateDailyNutrition,
} from '../../services/dietService';
import { analyzeMenu } from '../../services/aiService';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setHostelMenu,
  addMenuItem,
  addMealIntake as addIntake,
  addAIRecommendation,
  clearAIRecommendations,
  setLoading,
  setError,
} from '../../store/slices/dietSlice';

// Types
import { MenuItem, MealIntake } from '../../types/diet';
// Using AIRecommendation from dietSlice to match the expected structure
import { AIRecommendation } from '../../store/slices/dietSlice';

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

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const DietPage: React.FC = () => {
  const dispatch = useDispatch();
  const {
    hostelMenu,
    mealIntake,
    aiRecommendations,
    loading,
    error,
  } = useSelector((state: RootState) => state.diet);
  
  // Use the first recommendation if available
  const aiRecommendation = aiRecommendations && aiRecommendations.length > 0 ? aiRecommendations[0] : null;
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [expanded, setExpanded] = useState<string | false>(false);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const handleExpandClick = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setUploadError('');
    }
  };

  const handleMenuUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');
    dispatch(setLoading(true));

    try {
      // In a real app, we would parse the file content here
      // For now, we'll use the file data to get menu items from the backend
      
      const formData = new FormData();
      formData.append('menuFile', selectedFile);
      
      // Use the API_URL from environment or default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      
      // Upload the file to the backend
      const response = await fetch(`${API_URL}/menu/upload-file`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data.menuItems) {
        // Set the menu items in the store
        dispatch(setHostelMenu(result.data.menuItems));
        
        // Get AI analysis for weekly recommendations
        const menuItems = result.data.menuItems.map((item: any) => ({
          name: item.name,
          category: item.category,
          nutritionInfo: item.nutritionInfo
        }));
        
        const analysis = await analyzeMenu(menuItems);
        
        if (analysis.success && analysis.data) {
          // Create weekly recommendations
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          
          // Clear existing recommendations
          dispatch(clearAIRecommendations());
          
          // Generate a recommendation for each day
          days.forEach((day, index) => {
            const dayRecommendation: AIRecommendation = {
              id: `ai-${day}-${new Date().toISOString()}`,
              date: new Date().toISOString(),
              mealType: 'breakfast', // This will be used differently for weekly view
              eatItems: [],
              skipItems: [],
              addItems: [],
              nutritionAnalysis: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
              },
              customTips: [
                `${day}'s Recommendation:`,
                ...analysis.data.split('\n').map((tip: string) => 
                  // Customize tips for each day
                  tip.replace(/general recommendation/i, `${day.toLowerCase()} recommendation`)
                )
              ],
            };
            dispatch(addAIRecommendation(dayRecommendation));
          });
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      dispatch(setError(err.message || 'Failed to upload and analyze menu.'));
      setUploadError(err.message || 'Failed to upload menu file.');
    } finally {
      setUploading(false);
      dispatch(setLoading(false));
    }
  };

  const fetchInitialData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const menuResponse = await getHostelMenu();
      if (menuResponse.success && menuResponse.data) {
        dispatch(setHostelMenu(menuResponse.data));
      }

      const intakeResponse = await getMealIntake();
      if (intakeResponse.success && intakeResponse.data) {
        intakeResponse.data.forEach(item => dispatch(addIntake(item)));
      }

      const recommendationResponse = await getAIRecommendations();
      if (recommendationResponse.success && recommendationResponse.data) {
        // Handle both single object and array responses
        if (Array.isArray(recommendationResponse.data)) {
          recommendationResponse.data.forEach(rec => dispatch(addAIRecommendation(rec)));
        } else {
          dispatch(addAIRecommendation(recommendationResponse.data));
        }
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to fetch diet data.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Local function to calculate daily nutrition from meal intake array
  const calculateDailyNutrition = (intakes: any[]): { totalCalories: number; totalProtein: number; carbs: number; fat: number } => {
    // Initialize nutrition totals
    let totalCalories = 0;
    let totalProtein = 0;
    let carbs = 0;
    let fat = 0;
    
    // Process each meal intake
    intakes.forEach(intake => {
      // If the intake has direct nutrition values (from types/diet.ts)
      if ('calories' in intake && 'protein' in intake) {
        totalCalories += intake.calories || 0;
        totalProtein += intake.protein || 0;
        carbs += intake.carbs || 0;
        fat += intake.fat || 0;
      }
      
      // If the intake has items array (from dietSlice.ts)
      if (intake.items && Array.isArray(intake.items)) {
        // We would need to look up each item in the hostelMenu
        // This is simplified as we don't have access to that lookup here
      }
      
      // If the intake has addedItems
      if (intake.addedItems && Array.isArray(intake.addedItems)) {
        intake.addedItems.forEach((item: any) => {
          if (item.nutritionInfo) {
            totalCalories += item.nutritionInfo.calories || 0;
            totalProtein += item.nutritionInfo.protein || 0;
            carbs += item.nutritionInfo.carbs || 0;
            fat += item.nutritionInfo.fat || 0;
          }
        });
      }
    });
    
    return {
      totalCalories,
      totalProtein,
      carbs,
      fat
    };
  };
  
  const dailyNutrition = calculateDailyNutrition(mealIntake);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Diet & Nutrition Hub
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<RestaurantMenuIcon />} label="Hostel Menu & AI Tips" />
          <Tab icon={<NoteAddIcon />} label="Track Your Intake" />
          <Tab icon={<AnalyticsIcon />} label="Daily Summary" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upload Hostel Menu</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Select Menu File
                    <input type="file" hidden onChange={handleFileChange} accept=".csv,.txt,.json" />
                  </Button>
                  {selectedFile && <Typography variant="body2">Selected: {selectedFile.name}</Typography>}
                  <Button
                    variant="outlined"
                    onClick={handleMenuUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? <CircularProgress size={24} /> : 'Upload & Analyze'}
                  </Button>
                  {uploadError && <Alert severity="error">{uploadError}</Alert>}
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6">Weekly Diet Recommendations</Typography>
                {loading && <CircularProgress />}
                
                {aiRecommendations.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <Button 
                          key={day}
                          variant={selectedDay === day ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setSelectedDay(day)}
                          sx={{ mb: 1 }}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Display recommendations for the selected day */}
                    {(() => {
                      const dayRecommendation = aiRecommendations.find(rec => 
                        rec.id.includes(selectedDay)
                      );
                      
                      if (dayRecommendation) {
                        return (
                          <List dense>
                            {dayRecommendation.customTips.map((rec: string, index: number) => (
                              <ListItem key={index}>
                                <ListItemText primary={rec} />
                              </ListItem>
                            ))}
                          </List>
                        );
                      } else {
                        return (
                          <Typography>No recommendations available for {selectedDay}.</Typography>
                        );
                      }
                    })()}
                  </Box>
                ) : (
                  <Typography>Upload a menu to get AI-powered weekly recommendations.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Menu Items for {selectedDay}</Typography>
            {hostelMenu.length > 0 ? (
              <Box>
                {/* Group menu items by category */}
                {['breakfast', 'lunch', 'dinner', 'snack'].map(category => {
                  const categoryItems = hostelMenu.filter(item => 
                    item.category === category && 
                    // Filter items for the selected day if they have a day property
                    (!item.day || item.day === selectedDay.toLowerCase())
                  );
                  
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <Box key={category} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', mb: 1 }}>
                        {category}
                      </Typography>
                      <List dense>
                        {categoryItems.map(item => (
                          <ListItem key={item.id} secondaryAction={
                            <Button size="small" onClick={() => { /* Implement add to intake */ }}>Track</Button>
                          }>
                            <ListItemText 
                              primary={item.name}
                              secondary={
                                item.nutritionInfo 
                                  ? `Calories: ${item.nutritionInfo.calories || 0}, Protein: ${item.nutritionInfo.protein || 0}g, Carbs: ${item.nutritionInfo.carbs || 0}g, Fat: ${item.nutritionInfo.fat || 0}g` 
                                  : 'No nutrition info available'
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography>No menu uploaded yet. Please upload a menu file to see available items.</Typography>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Meal Intake Tracking UI Here */}
        <Typography variant="h6">Log your meals for today</Typography>
        {/* Form to add meal intake */}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>Today's Nutrition Summary</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <LocalFireDepartmentIcon color="error" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">{dailyNutrition.totalCalories.toFixed(0)}</Typography>
                <Typography color="text.secondary">Calories</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <FastfoodIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">{dailyNutrition.totalProtein.toFixed(1)}g</Typography>
                <Typography color="text.secondary">Protein</Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Add more cards for Carbs, Fats etc. */}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6">Your Meals Today</Typography>
        <List>
          {mealIntake.map(intake => (
            <ListItem key={intake.id}>
              <ListItemText 
                primary={`Meal: ${intake.mealType}`}
                secondary={`Date: ${new Date(intake.date).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </Container>
  );
};

export default DietPage;