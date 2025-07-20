import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Badge,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  FitnessCenter as FitnessCenterIcon,
  SportsHandball as SportsHandballIcon,
  DirectionsRun as DirectionsRunIcon,
  SelfImprovement as SelfImprovementIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: 'dumbbell' | 'mat' | 'resistance_band' | 'skipping_rope' | 'yoga_block' | 'other';
  price: number;
  location: string;
  availableFrom: string;
  availableTo: string;
  imageUrl: string;
  ownerId?: string;
  ownerName?: string;
  status?: 'available' | 'rented' | 'unavailable';
  rating?: number | null;
  reviewCount?: number;
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  isAvailable: boolean;
}

const RentalHub: React.FC = () => {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: 'dumbbell' as 'dumbbell' | 'mat' | 'resistance_band' | 'skipping_rope' | 'yoga_block' | 'other',
    price: 0,
    location: '',
    availableFrom: '',
    availableTo: '',
    imageFile: null as File | null,
    imagePreview: '',
  });
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const categories = [
    { value: 'dumbbell', label: 'Weights & Dumbbells', icon: <FitnessCenterIcon /> },
    { value: 'mat', label: 'Yoga & Mats', icon: <SelfImprovementIcon /> },
    { value: 'resistance_band', label: 'Resistance Bands', icon: <SportsHandballIcon /> },
    { value: 'skipping_rope', label: 'Skipping Ropes', icon: <DirectionsRunIcon /> },
    { value: 'yoga_block', label: 'Yoga Blocks', icon: <SelfImprovementIcon /> },
    { value: 'other', label: 'Other Equipment', icon: <FitnessCenterIcon /> },
  ];

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Import the rental service
        const { getRentalItems } = await import('../../services/rentalService');
        
        // Fetch items from the API
        const response = await getRentalItems(categoryFilter !== 'all' ? categoryFilter : undefined);
        
        if (response.success && response.data) {
          // Map the API response to our component's RentalItem interface
          const apiItems = response.data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            location: 'Campus', // Default location since it's not in the API response // Default location if API doesn't provide this
            availableFrom: item.availableFrom || new Date().toISOString(),
            availableTo: item.availableTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: item.imageUrl,
            owner: {
              id: item.ownerId,
              name: item.ownerName || 'Owner',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Default avatar
              rating: item.rating || 4.5,
            },
            isAvailable: item.status === 'available',
          }));
          
          setItems(apiItems);
          setFilteredItems(apiItems);
        } else {
          // Handle error
          setSnackbar({
            open: true,
            message: 'Failed to fetch rental items',
            severity: 'error',
          });
          setItems([]);
          setFilteredItems([]);
        }
      } catch (error) {
        console.error('Error fetching rental items:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load rental items',
          severity: 'error',
        });
        setItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryFilter]); // Re-fetch when category filter changes

  useEffect(() => {
    // Filter items based on search query and availability tab
    let result = [...items];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    // Filter based on tab (available/unavailable)
    if (tabValue === 0) { // Available
      result = result.filter(item => item.isAvailable);
    } else { // Unavailable
      result = result.filter(item => !item.isAvailable);
    }
    
    setFilteredItems(result);
  }, [items, searchQuery, tabValue]); // Category filter is handled by API call

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    // Set loading state before changing category to indicate data is being fetched
    setLoading(true);
    setCategoryFilter(event.target.value);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form
    setNewItem({
      name: '',
      description: '',
      category: 'dumbbell' as 'dumbbell' | 'mat' | 'resistance_band' | 'skipping_rope' | 'yoga_block' | 'other',
      price: 0,
      location: '',
      availableFrom: '',
      availableTo: '',
      imageFile: null,
      imagePreview: '',
    });
  };

  const handleOpenBookDialog = (item: RentalItem) => {
    setSelectedItem(item);
    setOpenBookDialog(true);
  };

  const handleCloseBookDialog = () => {
    setOpenBookDialog(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent, field: string) => {
    setNewItem({
      ...newItem,
      [field]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewItem({
        ...newItem,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleAddItem = async () => {
    // Validate form
    if (!newItem.name || !newItem.description || !newItem.location || 
        !newItem.availableFrom || !newItem.availableTo || newItem.price <= 0) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      // Import the rental service
      const { addRentalItem } = await import('../../services/rentalService');
      
      // Create new item for API
      const newRentalItem = {
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: newItem.price,
        // location is not used in the API
        availableFrom: newItem.availableFrom,
        availableTo: newItem.availableTo,
        imageUrl: newItem.imagePreview || 'https://via.placeholder.com/300x200?text=No+Image',
        status: 'available' as 'available' | 'rented' | 'unavailable',
        ownerId: 'current-user-id', // In a real app, this would come from auth
        ownerName: 'Current User' // In a real app, this would come from auth
      };

      // Add item via API
      const response = await addRentalItem(newRentalItem);
      
      if (response.success && response.data) {
        // Refresh the items list
        const { getRentalItems } = await import('../../services/rentalService');
        const itemsResponse = await getRentalItems(categoryFilter !== 'all' ? categoryFilter : undefined);
        
        if (itemsResponse.success && itemsResponse.data) {
          // Map the API response to our component's RentalItem interface
          const apiItems = itemsResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            location: 'Campus', // Default location since it's not in the API response
            availableFrom: item.availableFrom || new Date().toISOString(),
            availableTo: item.availableTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: item.imageUrl,
            owner: {
              id: item.ownerId,
              name: item.ownerName || 'Owner',
              avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
              rating: item.rating || 5.0,
            },
            isAvailable: item.status === 'available',
          }));
          
          setItems(apiItems);
          setFilteredItems(apiItems);
        }
        
        // Close dialog and show success message
        handleCloseAddDialog();
        setSnackbar({
          open: true,
          message: 'Equipment added successfully!',
          severity: 'success',
        });
      } else {
        // Handle error
        setSnackbar({
          open: true,
          message: 'Failed to add equipment',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding rental item:', error);
      setSnackbar({
        open: true,
        message: 'Error adding equipment',
        severity: 'error',
      });
    }
  };

  const handleBookItem = async () => {
    if (!selectedItem) return;

    try {
      // Import the rental service
      const { createBooking } = await import('../../services/rentalService');
      
      // Create booking via API
      const bookingData = {
        itemId: selectedItem.id,
        renterId: 'current-user-id', // In a real app, this would come from auth
        renterName: 'Current User', // In a real app, this would come from auth
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        totalPrice: selectedItem.price * 7, // 7 days rental
        status: 'pending' as const
      };
      
      const response = await createBooking(bookingData);
      
      if (response.success) {
        // Refresh the items list
        const { getRentalItems } = await import('../../services/rentalService');
        const itemsResponse = await getRentalItems(categoryFilter !== 'all' ? categoryFilter : undefined);
        
        if (itemsResponse.success && itemsResponse.data) {
          // Map the API response to our component's RentalItem interface
          const apiItems = itemsResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            location: 'Campus', // Default location since it's not in the API response
            availableFrom: item.availableFrom || new Date().toISOString(),
            availableTo: item.availableTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: item.imageUrl,
            owner: {
              id: item.ownerId,
              name: item.ownerName || 'Owner',
              avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
              rating: item.rating || 5.0,
            },
            isAvailable: item.status === 'available',
          }));
          
          setItems(apiItems);
          setFilteredItems(apiItems);
        }
        
        handleCloseBookDialog();
        
        setSnackbar({
          open: true,
          message: `You've successfully booked ${selectedItem.name}!`,
          severity: 'success',
        });
      } else {
        // Handle error from the placeholder implementation
        setSnackbar({
          open: true,
          message: response.error || 'Booking functionality is not yet implemented in the backend',
          severity: 'info',
        });
        handleCloseBookDialog();
      }
    } catch (error) {
      console.error('Error booking rental item:', error);
      setSnackbar({
        open: true,
        message: 'Error booking equipment. Booking functionality is not yet implemented in the backend.',
        severity: 'info',
      });
      handleCloseBookDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return dateString;
    }
  };

  const getCategoryIcon = (category: string) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.icon : <FitnessCenterIcon />;
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
        <Typography variant="h4">Rental Hub</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Equipment
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search equipment, location..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>{category.icon}</Box>
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Badge badgeContent={items.filter(item => item.isAvailable).length} color="primary">
                <Box sx={{ px: 2 }}>Available</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={items.filter(item => !item.isAvailable).length} color="secondary">
                <Box sx={{ px: 2 }}>Booked</Box>
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card elevation={3}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1 }}>{getCategoryIcon(item.category)}</Box>
                    <Typography variant="h6" noWrap>{item.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {item.price} credits/day
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Available: {formatDate(item.availableFrom)} - {formatDate(item.availableTo)}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={item.owner.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="body2">{item.owner.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={item.owner.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {item.owner.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {item.isAvailable ? (
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleOpenBookDialog(item)}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Chip label="Booked" color="secondary" size="small" />
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No equipment found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters, or add your own equipment to share.
          </Typography>
        </Paper>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Add Equipment for Rent</Typography>
            <IconButton edge="end" color="inherit" onClick={handleCloseAddDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Equipment Name"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category}
                  label="Category"
                  onChange={(e) => handleSelectChange(e, 'category')}
                >
                  {categories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1 }}>{category.icon}</Box>
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location (Hostel, Room)"
                name="location"
                value={newItem.location}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2, mt: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                  >
                    Upload Equipment Photo
                  </Button>
                </label>
              </Box>
              <Box 
                sx={{ 
                  height: 200, 
                  border: '1px dashed #ccc', 
                  borderRadius: 1, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mb: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper'
                }}
              >
                {newItem.imagePreview ? (
                  <img 
                    src={newItem.imagePreview} 
                    alt="Equipment preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Equipment image preview
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                label="Rental Price (credits/day)"
                name="price"
                type="number"
                value={newItem.price}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Available From"
                    name="availableFrom"
                    type="datetime-local"
                    value={newItem.availableFrom}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Available To"
                    name="availableTo"
                    type="datetime-local"
                    value={newItem.availableTo}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" color="primary">
            Add Equipment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Equipment Dialog */}
      <Dialog open={openBookDialog} onClose={handleCloseBookDialog} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Book Equipment</Typography>
                <IconButton edge="end" color="inherit" onClick={handleCloseBookDialog} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ width: 120, height: 120, mr: 2, overflow: 'hidden', borderRadius: 1 }}>
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <Box>
                  <Typography variant="h6">{selectedItem.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {selectedItem.price} credits/day
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {selectedItem.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {formatDate(selectedItem.availableFrom)} - {formatDate(selectedItem.availableTo)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={selectedItem.owner.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body1">{selectedItem.owner.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={selectedItem.owner.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {selectedItem.owner.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                By booking this equipment, you agree to return it in the same condition by the end of the rental period.
              </Alert>
              
              <Typography variant="body2" color="text.secondary">
                Your current credit balance: <b>200 credits</b>
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseBookDialog}>Cancel</Button>
              <Button onClick={handleBookItem} variant="contained" color="primary">
                Confirm Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RentalHub;