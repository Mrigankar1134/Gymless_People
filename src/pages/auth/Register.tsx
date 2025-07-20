import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material';

// Services
import { register, isAuthenticated } from '../../services/authService';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  fitnessGoal: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user selects
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate gender
    if (!formData.gender) {
      errors.gender = 'Please select your gender';
      isValid = false;
    }
    
    // Validate age
    const age = parseInt(formData.age);
    if (!formData.age) {
      errors.age = 'Age is required';
      isValid = false;
    } else if (isNaN(age) || age < 13 || age > 100) {
      errors.age = 'Please enter a valid age between 13 and 100';
      isValid = false;
    }
    
    // Validate weight
    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      errors.weight = 'Weight is required';
      isValid = false;
    } else if (isNaN(weight) || weight < 30 || weight > 300) {
      errors.weight = 'Please enter a valid weight between 30 and 300 kg';
      isValid = false;
    }
    
    // Validate height
    const height = parseInt(formData.height);
    if (!formData.height) {
      errors.height = 'Height is required';
      isValid = false;
    } else if (isNaN(height) || height < 100 || height > 250) {
      errors.height = 'Please enter a valid height between 100 and 250 cm';
      isValid = false;
    }
    
    // Validate fitness goal
    if (!formData.fitnessGoal) {
      errors.fitnessGoal = 'Please select your fitness goal';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profile: {
          gender: formData.gender,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          fitnessGoal: formData.fitnessGoal,
        },
      };
      
      const response = await register(userData);
      
      if (response.success) {
        // Redirect to login page after successful registration
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container component="main" maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          marginTop: { xs: 2, sm: 4 },
          marginBottom: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <FitnessCenterIcon sx={{ fontSize: { xs: 32, sm: 40 }, mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, color: 'primary.main' }} />
            <Typography component="h1" variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, textAlign: 'center' }}>
              Gymless People
            </Typography>
          </Box>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Account Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  disabled={loading}
                />
              </Grid>
              
              {/* Profile Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Profile Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.gender}>
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
                  {formErrors.gender && (
                    <Typography variant="caption" color="error">
                      {formErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="age"
                  label="Age"
                  name="age"
                  type="number"
                  inputProps={{ min: 13, max: 100 }}
                  value={formData.age}
                  onChange={handleChange}
                  error={!!formErrors.age}
                  helperText={formErrors.age}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="weight"
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  inputProps={{ min: 30, max: 300, step: 0.1 }}
                  value={formData.weight}
                  onChange={handleChange}
                  error={!!formErrors.weight}
                  helperText={formErrors.weight}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="height"
                  label="Height (cm)"
                  name="height"
                  type="number"
                  inputProps={{ min: 100, max: 250 }}
                  value={formData.height}
                  onChange={handleChange}
                  error={!!formErrors.height}
                  helperText={formErrors.height}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.fitnessGoal}>
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
                  {formErrors.fitnessGoal && (
                    <Typography variant="caption" color="error">
                      {formErrors.fitnessGoal}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;