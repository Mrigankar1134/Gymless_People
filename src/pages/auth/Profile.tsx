import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Avatar,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

// Services
import { getCurrentUser, updateUserProfile } from '../../services/authService';

// Redux
import { RootState } from '../../store';
import { updateProfile } from '../../store/slices/userSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Access user properties directly from state.user
  const user = useSelector((state: RootState) => state.user);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
  });
  
  useEffect(() => {
    // If user is not logged in, redirect to login page
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Initialize form data with user data from Redux store
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.profile?.gender || '',
        age: user.profile?.age?.toString() || '',
        weight: user.profile?.weight?.toString() || '',
        height: user.profile?.height?.toString() || '',
        fitnessGoal: user.profile?.fitnessGoal || '',
      });
    }
  }, [user, navigate]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
  };
  
  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.profile?.gender || '',
        age: user.profile?.age?.toString() || '',
        weight: user.profile?.weight?.toString() || '',
        height: user.profile?.height?.toString() || '',
        fitnessGoal: user.profile?.fitnessGoal || '',
      });
    }
    
    setEditMode(false);
    setSuccess('');
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    
    try {
      const updatedProfile = {
        name: formData.name,
        email: formData.email,
        profile: {
          gender: formData.gender,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          fitnessGoal: formData.fitnessGoal,
        },
      };
      
      // Get the user ID from Redux state
      const userId = user?.id || '';
      
      const response = await updateUserProfile(userId, updatedProfile);
      
      if (response.success && response.data && response.data.user) {
        // Update Redux state with name, email, and profile
        dispatch(updateProfile({
          name: response.data.user.name,
          email: response.data.user.email,
          profile: response.data.user.profile
        }));
        setSuccess('Profile updated successfully!');
        setEditMode(false);
      } else {
        setError(response.error || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate BMI
  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return 'N/A';
    
    const weight = parseFloat(formData.weight);
    const heightInMeters = parseInt(formData.height) / 100;
    
    if (isNaN(weight) || isNaN(heightInMeters) || heightInMeters === 0) return 'N/A';
    
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };
  
  // Get BMI category
  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    
    if (isNaN(bmi)) return 'N/A';
    
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };
  
  // Format fitness goal for display
  const formatFitnessGoal = (goal: string) => {
    if (!goal) return 'Not specified';
    
    return goal
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Profile" {...a11yProps(0)} />
            <Tab label="Edit Profile" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        {/* Profile View */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 3, md: 0 }, mr: { md: 4 } }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
              >
                <PersonIcon sx={{ fontSize: 80 }} />
              </Avatar>
              <Typography variant="h5">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
                onClick={() => setTabValue(1)}
              >
                Edit Profile
              </Button>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 3, display: { xs: 'none', md: 'block' } }} />
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">
                        {user.profile?.gender ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) : 'Not specified'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{user.profile?.age || 'Not specified'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                      <Typography variant="body1">{user.profile?.weight ? `${user.profile.weight} kg` : 'Not specified'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                      <Typography variant="body1">{user.profile?.height ? `${user.profile.height} cm` : 'Not specified'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">BMI</Typography>
                      <Typography variant="body1">{calculateBMI()}</Typography>
                      <Typography variant="body2" color="text.secondary">{getBMICategory()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Fitness Goal</Typography>
                      <Typography variant="body1">{formatFitnessGoal(user.profile?.fitnessGoal || '')}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Edit Profile */}
        <TabPanel value={tabValue} index={1}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true} // Email cannot be changed
                />
              </Grid>
              
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Profile Information</Typography>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    label="Gender"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="age"
                  label="Age"
                  name="age"
                  type="number"
                  inputProps={{ min: 13, max: 100 }}
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="weight"
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  inputProps={{ min: 30, max: 300, step: 0.1 }}
                  value={formData.weight}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="height"
                  label="Height (cm)"
                  name="height"
                  type="number"
                  inputProps={{ min: 100, max: 250 }}
                  value={formData.height}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="fitness-goal-label">Fitness Goal</InputLabel>
                  <Select
                    labelId="fitness-goal-label"
                    id="fitnessGoal"
                    name="fitnessGoal"
                    value={formData.fitnessGoal}
                    label="Fitness Goal"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    <MenuItem value="weight-loss">Weight Loss</MenuItem>
                    <MenuItem value="muscle-gain">Muscle Gain</MenuItem>
                    <MenuItem value="endurance">Improve Endurance</MenuItem>
                    <MenuItem value="flexibility">Increase Flexibility</MenuItem>
                    <MenuItem value="general-fitness">General Fitness</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={() => setTabValue(0)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Profile;