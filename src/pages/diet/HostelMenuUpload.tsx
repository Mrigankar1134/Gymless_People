import React, { useState } from 'react';
import { MenuItem as MenuItemType } from '../../types/diet';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// Using the MenuItem interface from diet.ts
// Removed unused MenuEntry interface
/*
interface MenuEntry {
  id: string;
  name: string;
  mealType: string;
  day: string;
  nutritionEstimate?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
*/

const HostelMenuUpload: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    mealType: 'Breakfast',
    day: 'Monday',
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleNext = () => {
    if (activeStep === 0 && menuItems.length === 0) {
      setError('Please add at least one menu item before proceeding');
      return;
    }
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
    
    if (activeStep === 1) {
      // Simulate AI analysis when moving to step 3
      analyzeMenu();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddItem = () => {
    if (newItem.name.trim() === '') return;

    const item: MenuItemType = {
      id: Date.now().toString(),
      ...newItem,
    };

    setMenuItems([...menuItems, item]);
    setNewItem({
      name: '',
      mealType: 'Breakfast',
      day: 'Monday',
    });
    setError(null);
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>, field: string) => {
    setNewItem({
      ...newItem,
      [field]: e.target.value,
    });
  };

  const analyzeMenu = async () => {
    setLoading(true);
    try {
      // Call the backend API to analyze the menu
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/ai/analyze-menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ menuItems })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data.analysis) {
        // Parse the analysis response
        let analysisData;
        try {
          // Try to parse if it's a JSON string
          if (typeof data.data.analysis === 'string') {
            analysisData = JSON.parse(data.data.analysis);
          } else {
            analysisData = data.data.analysis;
          }
        } catch (parseError) {
          // If parsing fails, use the raw response
          analysisData = {
            summary: {
              averageCalories: 0,
              proteinPercentage: 0,
              carbsPercentage: 0,
              fatPercentage: 0,
            },
            recommendations: [data.data.analysis],
            analyzedItems: menuItems
          };
        }
        
        setAnalysis(analysisData);
        
        // Update menu items with nutrition estimates if available
        if (analysisData.analyzedItems) {
          setMenuItems(analysisData.analyzedItems);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error analyzing menu:', err);
      setError(err.message || 'Failed to analyze menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUploadFile = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls,.pdf';
    fileInput.onchange = handleFileChange as any;
    
    // Trigger the file dialog
    fileInput.click();
  };

  const handleSubmitFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('menuFile', selectedFile);
      
      // Call the backend API to upload the file
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${API_URL}/menu/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      
      if (data.status === 'success' && data.data.menu) {
        // Update menu items with the parsed items from the file
        setMenuItems(data.data.menu);
        setActiveStep(1); // Move to the next step
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Your Hostel Menu
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add items from your hostel menu for the week. You can enter them manually or upload a file.
            </Typography>
            
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Food Item"
                    name="name"
                    value={newItem.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    placeholder="Enter food item name"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
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
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Meal Type</InputLabel>
                    <Select
                      value={newItem.mealType}
                      label="Meal Type"
                      onChange={(e) => handleSelectChange(e, 'mealType')}
                    >
                      {mealTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    disabled={!newItem.name}
                    size="medium"
                  >
                    Add Food Item
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadFile}
                  sx={{ mr: 2 }}
                >
                  Select Menu File
                </Button>
                {selectedFile && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {selectedFile.name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitFile}
                      disabled={uploading}
                      size="small"
                    >
                      {uploading ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="inline">
                Supported formats: .xlsx, .csv, .pdf
              </Typography>
            </Box>
            
            {menuItems.length > 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Added Menu Items
                </Typography>
                <Grid container spacing={2}>
                  {days.map(day => {
                    const dayItems = menuItems.filter(item => item.day === day);
                    return dayItems.length > 0 ? (
                      <Grid item xs={12} md={6} key={day}>
                        <Card variant="outlined">
                          <CardHeader title={day} />
                          <Divider />
                          <CardContent>
                            {mealTypes.map(type => {
                              const mealItems = dayItems.filter(item => item.mealType === type);
                              return mealItems.length > 0 ? (
                                <Box key={type} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2">{type}</Typography>
                                  <List dense>
                                    {mealItems.map(item => (
                                      <ListItem key={item.id}>
                                        <ListItemText primary={item.name} />
                                        <IconButton
                                          edge="end"
                                          aria-label="delete"
                                          onClick={() => handleDeleteItem(item.id)}
                                          size="small"
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              ) : null;
                            })}
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : null;
                  })}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">
                No menu items added yet. Start by adding items above or uploading a file.
              </Alert>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Menu
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review your hostel menu before submitting for AI analysis.
            </Typography>
            
            <Grid container spacing={2}>
              {days.map(day => {
                const dayItems = menuItems.filter(item => item.day === day);
                return dayItems.length > 0 ? (
                  <Grid item xs={12} md={6} lg={4} key={day}>
                    <Card variant="outlined">
                      <CardHeader title={day} />
                      <Divider />
                      <CardContent>
                        {mealTypes.map(type => {
                          const mealItems = dayItems.filter(item => item.mealType === type);
                          return mealItems.length > 0 ? (
                            <Box key={type} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">{type}</Typography>
                              <List dense>
                                {mealItems.map(item => (
                                  <ListItem key={item.id}>
                                    <ListItemText primary={item.name} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          ) : null;
                        })}
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null;
              })}
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Analysis Results
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
                <CircularProgress size={60} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Analyzing your hostel menu...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Our AI is evaluating nutritional content and preparing recommendations
                </Typography>
              </Box>
            ) : analysis ? (
              <>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Nutritional Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {analysis.summary.averageCalories}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Avg. Daily Calories
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {analysis.summary.proteinPercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Protein
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {analysis.summary.carbsPercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Carbs
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {analysis.summary.fatPercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Fat
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Recommendations
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' }, 
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}
                      >
                        <ListItemText 
                          primary={rec} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            mb: { xs: 1, sm: 0 }
                          }} 
                        />
                        <Chip 
                          icon={<CheckIcon />} 
                          label="Apply" 
                          color="primary" 
                          size="small" 
                          variant="outlined" 
                          sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
                
                <Typography variant="h6" gutterBottom>
                  Analyzed Menu Items
                </Typography>
                <Grid container spacing={2}>
                  {days.map(day => {
                    const dayItems = menuItems.filter(item => item.day === day);
                    return dayItems.length > 0 ? (
                      <Grid item xs={12} md={6} key={day}>
                        <Card variant="outlined">
                          <CardHeader title={day} />
                          <Divider />
                          <CardContent>
                            {mealTypes.map(type => {
                              const mealItems = dayItems.filter(item => item.mealType === type);
                              return mealItems.length > 0 ? (
                                <Box key={type} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2">{type}</Typography>
                                  <List dense>
                                    {mealItems.map(item => (
                                      <ListItem key={item.id}>
                                        <ListItemText 
                                          primary={item.name} 
                                          secondary={
                                            item.nutritionEstimate ? 
                                            `${item.nutritionEstimate.calories} cal | ${item.nutritionEstimate.protein}g protein` :
                                            undefined
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              ) : null;
                            })}
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : null;
                  })}
                </Grid>
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.href = '/diet/planner'}
                    fullWidth={isMobile}
                    sx={{
                      py: { xs: 1.5, sm: 1 },
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    View Your Personalized Diet Plan
                  </Button>
                </Box>
              </>
            ) : (
              <Alert severity="info">
                Click "Analyze Menu" to start the AI analysis process.
              </Alert>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Hostel Menu Upload
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload your hostel menu to get personalized nutrition recommendations.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stepper 
        activeStep={activeStep} 
        sx={{ 
          mb: 4,
          display: { xs: 'none', sm: 'flex' } 
        }}
      >
        <Step>
          <StepLabel>Enter Menu</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review</StepLabel>
        </Step>
        <Step>
          <StepLabel>AI Analysis</StepLabel>
        </Step>
      </Stepper>
      
      {/* Mobile stepper indicator */}
      <Box sx={{ 
        display: { xs: 'flex', sm: 'none' }, 
        justifyContent: 'center', 
        mb: 3 
      }}>
        <Typography variant="body1">
          Step {activeStep + 1} of 3: {activeStep === 0 ? 'Enter Menu' : activeStep === 1 ? 'Review' : 'AI Analysis'}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, mb: 4 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<NavigateBeforeIcon />}
          fullWidth={window.innerWidth < 600}
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          endIcon={activeStep === 2 ? undefined : <NavigateNextIcon />}
          disabled={loading}
          fullWidth={window.innerWidth < 600}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          {activeStep === 0 ? 'Continue' : activeStep === 1 ? 'Analyze Menu' : 'Finish'}
        </Button>
      </Box>
    </Box>
  );
};

export default HostelMenuUpload;