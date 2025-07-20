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
  Tabs,
  Tab,
  Divider,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  FitnessCenter as FitnessCenterIcon,
  SportsHandball as SportsHandballIcon,
  DirectionsRun as DirectionsRunIcon,
  SelfImprovement as SelfImprovementIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// This is our component's RentalItem interface, different from the service's RentalItem
interface RentalItemUI {
  id: string;
  name: string;
  description: string;
  category: 'dumbbell' | 'mat' | 'resistance_band' | 'skipping_rope' | 'yoga_block' | 'other';
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  status: 'active' | 'completed' | 'cancelled' | 'pending-return' | 'pending-approval';
  isOwner: boolean;
}

const MyRentals: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [rentals, setRentals] = useState<RentalItemUI[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<RentalItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalItemUI | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const categories = {
    dumbbell: { label: 'Weights & Dumbbells', icon: <FitnessCenterIcon /> },
    mat: { label: 'Yoga & Mats', icon: <SelfImprovementIcon /> },
    resistance_band: { label: 'Resistance Bands', icon: <DirectionsRunIcon /> },
    skipping_rope: { label: 'Skipping Ropes', icon: <SportsHandballIcon /> },
    yoga_block: { label: 'Yoga Blocks', icon: <SelfImprovementIcon /> },
    other: { label: 'Other Equipment', icon: <FitnessCenterIcon /> },
  };

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Import the rental service
        const { getUserRentalItems, getBorrowedItems } = await import('../../services/rentalService');
        
        // Fetch user's rental items from the API
        const [ownedResponse, borrowedResponse] = await Promise.all([
          getUserRentalItems(),
          getBorrowedItems()
        ]);
        
        const ownedItems = [];
        const borrowedItems = [];
        
        if (ownedResponse.success && ownedResponse.data) {
          // Map the API response to our component's RentalItem interface for owned items
          ownedItems.push(...ownedResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            location: 'Campus', // Default location since it's not in the service interface
            startDate: item.availableFrom || new Date().toISOString(),
            endDate: item.availableTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: item.imageUrl,
            owner: {
              id: item.ownerId,
              name: item.ownerName || 'Owner',
              avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', // Default avatar
              rating: item.rating || 4.5,
            },
            status: (item.status === 'available' ? 'active' : 'completed') as 'active' | 'completed' | 'cancelled' | 'pending-return' | 'pending-approval',
            isOwner: true, // These are the user's own items
          })));
        }
        
        if (borrowedResponse.success && borrowedResponse.data) {
          // Map the API response for borrowed items
          borrowedItems.push(...borrowedResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            location: 'Campus', // Default location since it's not in the service interface
            startDate: item.availableFrom || new Date().toISOString(),
            endDate: item.availableTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: item.imageUrl,
            owner: {
              id: item.ownerId,
              name: item.ownerName || 'Owner',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              rating: item.rating || 4.5,
            },
            status: 'active' as 'active' | 'completed' | 'cancelled' | 'pending-return' | 'pending-approval',
            isOwner: false, // These are items borrowed from others
          })));
        }
        
        // Add a placeholder borrowed item for demo purposes
        if (borrowedItems.length === 0) {
          borrowedItems.push({
            id: 'borrowed-placeholder',
            name: 'Adjustable Dumbbells (5-25kg)',
            description: 'Set of adjustable dumbbells, perfect for various strength exercises. Good condition.',
            category: 'dumbbell',
            price: 50,
            location: 'Campus',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
            owner: {
              id: '101',
              name: 'Alex Johnson',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              rating: 4.8,
            },
            status: 'active' as 'active' | 'completed' | 'cancelled' | 'pending-return' | 'pending-approval',
            isOwner: false,
          });
        }
        
        // Combine owned and borrowed items
        const combinedItems: RentalItemUI[] = [...ownedItems, ...borrowedItems].map(item => ({
          ...item,
          category: item.category as "dumbbell" | "mat" | "resistance_band" | "skipping_rope" | "yoga_block" | "other"
        }));
        
        if (combinedItems.length > 0) {
          setRentals(combinedItems);
          setFilteredRentals(combinedItems);
        } else {
          // Handle error or empty state
          setSnackbar({
            open: true,
            message: 'No rental items found',
            severity: 'info',
          });
          setRentals([]);
          setFilteredRentals([]);
        }
      } catch (error) {
        console.error('Error fetching rental items:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load rental items',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Filter rentals based on tab selection
    let filtered;
    switch (tabValue) {
      case 0: // Active Rentals
        filtered = rentals.filter(rental => 
          (rental.status === 'active' || rental.status === 'pending-return') && !rental.isOwner
        );
        break;
      case 1: // Rental History
        filtered = rentals.filter(rental => 
          (rental.status === 'completed' || rental.status === 'cancelled') && !rental.isOwner
        );
        break;
      case 2: // My Equipment
        filtered = rentals.filter(rental => rental.isOwner);
        break;
      default:
        filtered = rentals;
    }
    setFilteredRentals(filtered);
  }, [rentals, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenReturnDialog = (rental: RentalItemUI) => {
    setSelectedRental(rental);
    setReturnNotes('');
    setOpenReturnDialog(true);
  };

  const handleCloseReturnDialog = () => {
    setOpenReturnDialog(false);
    setSelectedRental(null);
  };

  const handleOpenRatingDialog = (rental: RentalItemUI) => {
    setSelectedRental(rental);
    setRating(5);
    setRatingComment('');
    setOpenRatingDialog(true);
  };

  const handleCloseRatingDialog = () => {
    setOpenRatingDialog(false);
    setSelectedRental(null);
  };

  const handleReturnSubmit = async () => {
    if (!selectedRental) return;

    try {
      // Import the rental service
      const { updateBooking } = await import('../../services/rentalService');
      
      // Update booking status via API
      const response = await updateBooking(selectedRental.id, { status: 'completed' });
      
      if (response.success) {
        // Update local state
        const updatedRentals = rentals.map(rental => 
          rental.id === selectedRental.id ? { ...rental, status: 'completed' as const } : rental
        );
        
        setRentals(updatedRentals);
        handleCloseReturnDialog();
        
        // Open rating dialog after return
        handleOpenRatingDialog(selectedRental);
      } else {
        // Handle error from the placeholder implementation
        setSnackbar({
          open: true,
          message: response.error || 'Return functionality is not yet implemented in the backend',
          severity: 'info',
        });
        
        // For demo purposes, still update the UI
        const updatedRentals = rentals.map(rental => 
          rental.id === selectedRental.id ? { ...rental, status: 'completed' as const } : rental
        );
        
        setRentals(updatedRentals);
        handleCloseReturnDialog();
        
        // Open rating dialog after return
        handleOpenRatingDialog(selectedRental);
      }
    } catch (error) {
      console.error('Error updating rental status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating rental status. Return functionality is not yet implemented in the backend.',
        severity: 'info',
      });
      
      // For demo purposes, still update the UI
      const updatedRentals = rentals.map(rental => 
        rental.id === selectedRental.id ? { ...rental, status: 'completed' as const } : rental
      );
      
      setRentals(updatedRentals);
      handleCloseReturnDialog();
      
      // Open rating dialog after return
      handleOpenRatingDialog(selectedRental);
    }
  };

  const handleRatingSubmit = async () => {
    if (!selectedRental || rating === null) return;

    try {
      // Import the rental service
      const { rateBooking } = await import('../../services/rentalService');
      
      // Submit rating via API
      const response = await rateBooking(selectedRental.id, { 
        rating, 
        comment: ratingComment 
      });
      
      handleCloseRatingDialog();
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Thank you for your feedback! You've rated ${selectedRental.owner?.name || 'the owner'} with ${rating} stars.`,
          severity: 'success',
        });
      } else {
        // Handle error from the placeholder implementation
        setSnackbar({
          open: true,
          message: response.error || 'Rating functionality is not yet implemented in the backend',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      handleCloseRatingDialog();
      
      setSnackbar({
        open: true,
        message: 'Error submitting rating. Rating functionality is not yet implemented in the backend.',
        severity: 'info',
      });
    }
  };

  const handleApproveReturn = async (rental: RentalItemUI) => {
    try {
      // Import the rental service
      const { updateBooking } = await import('../../services/rentalService');
      
      // Update booking status via API
      const response = await updateBooking(rental.id, { status: 'completed' });
      
      if (response.success) {
        // Update local state
        const updatedRentals = rentals.map(item => 
          item.id === rental.id ? { ...item, status: 'completed' as const } : item
        );
        
        setRentals(updatedRentals);
        
        setSnackbar({
          open: true,
          message: `You've approved the return of ${rental.name}.`,
          severity: 'success',
        });
      } else {
        // Handle error from the placeholder implementation
        setSnackbar({
          open: true,
          message: response.error || 'Return approval functionality is not yet implemented in the backend',
          severity: 'info',
        });
        
        // For demo purposes, still update the UI
        const updatedRentals = rentals.map(item => 
          item.id === rental.id ? { ...item, status: 'completed' as const } : item
        );
        
        setRentals(updatedRentals);
      }
    } catch (error) {
      console.error('Error approving return:', error);
      setSnackbar({
        open: true,
        message: 'Error approving return. This functionality is not yet implemented in the backend.',
        severity: 'info',
      });
      
      // For demo purposes, still update the UI
      const updatedRentals = rentals.map(item => 
        item.id === rental.id ? { ...item, status: 'completed' as const } : item
      );
      
      setRentals(updatedRentals);
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
    return categories[category as keyof typeof categories]?.icon || <FitnessCenterIcon />;
  };

  const getCategoryLabel = (category: string) => {
    return categories[category as keyof typeof categories]?.label || 'Other Equipment';
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip size="small" label="Active" color="primary" />;
      case 'completed':
        return <Chip size="small" label="Completed" color="success" />;
      case 'cancelled':
        return <Chip size="small" label="Cancelled" color="error" />;
      case 'pending-return':
        return <Chip size="small" label="Return Due" color="warning" />;
      case 'pending-approval':
        return <Chip size="small" label="Pending Approval" color="info" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const isReturnOverdue = (rental: RentalItemUI) => {
    if (rental.status !== 'active' && rental.status !== 'pending-return') return false;
    
    const endDate = new Date(rental.endDate);
    const now = new Date();
    return now > endDate;
  };

  const getRemainingTime = (rental: RentalItemUI) => {
    const endDate = new Date(rental.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Overdue';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      return `${diffHours}h remaining`;
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
      <Typography variant="h4" gutterBottom>My Rentals</Typography>

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
              <Badge 
                badgeContent={rentals.filter(r => 
                  (r.status === 'active' || r.status === 'pending-return') && !r.isOwner
                ).length} 
                color="primary"
              >
                <Box sx={{ px: 2 }}>Active Rentals</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={rentals.filter(r => 
                  (r.status === 'completed' || r.status === 'cancelled') && !r.isOwner
                ).length} 
                color="default"
              >
                <Box sx={{ px: 2 }}>Rental History</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={rentals.filter(r => r.isOwner).length} 
                color="secondary"
              >
                <Box sx={{ px: 2 }}>My Equipment</Box>
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {filteredRentals.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRentals.map(rental => (
            <Grid item xs={12} sm={6} md={4} key={rental.id}>
              <Card elevation={3}>
                <CardMedia
                  component="img"
                  height="180"
                  image={rental.imageUrl}
                  alt={rental.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1 }}>{getCategoryIcon(rental.category)}</Box>
                    <Typography variant="h6" noWrap>{rental.name}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {getCategoryLabel(rental.category)}
                    </Typography>
                    {getStatusChip(rental.status)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {rental.price} credits/day
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {rental.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </Typography>
                  </Box>
                  
                  {(rental.status === 'active' || rental.status === 'pending-return') && !rental.isOwner && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 1, 
                      bgcolor: isReturnOverdue(rental) ? 'error.50' : 'info.50', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="body2" color={isReturnOverdue(rental) ? 'error' : 'info'}>
                        {isReturnOverdue(rental) ? 'Return overdue!' : getRemainingTime(rental)}
                      </Typography>
                      <Tooltip title="Return Equipment">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenReturnDialog(rental)}
                        >
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={rental.owner.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="body2">
                        {rental.isOwner ? 'Rented to someone' : `From ${rental.owner.name}`}
                      </Typography>
                      {!rental.isOwner && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={rental.owner.rating} precision={0.1} size="small" readOnly />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {rental.owner.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Action buttons based on rental status and ownership */}
                  {rental.status === 'pending-approval' && rental.isOwner && (
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="primary"
                      onClick={() => handleApproveReturn(rental)}
                      startIcon={<CheckIcon />}
                    >
                      Approve
                    </Button>
                  )}
                  
                  {rental.status === 'completed' && !rental.isOwner && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<StarIcon />}
                      onClick={() => handleOpenRatingDialog(rental)}
                    >
                      Rate
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No rentals found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabValue === 0 && 'You don\'t have any active rentals. Visit the Rental Hub to find equipment.'}
            {tabValue === 1 && 'You don\'t have any rental history yet.'}
            {tabValue === 2 && 'You haven\'t listed any equipment for rent yet.'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/rental/hub"
            startIcon={tabValue === 2 ? <UploadIcon /> : <ArrowForwardIcon />}
          >
            {tabValue === 2 ? 'Add Equipment' : 'Browse Rental Hub'}
          </Button>
        </Paper>
      )}

      {/* Return Equipment Dialog */}
      <Dialog open={openReturnDialog} onClose={handleCloseReturnDialog} maxWidth="sm" fullWidth>
        {selectedRental && (
          <>
            <DialogTitle>
              <Typography variant="h6">Return Equipment</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ width: 100, height: 100, mr: 2, overflow: 'hidden', borderRadius: 1 }}>
                  <img 
                    src={selectedRental.imageUrl} 
                    alt={selectedRental.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <Box>
                  <Typography variant="h6">{selectedRental.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rented from {selectedRental.owner.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Return due: {formatDate(selectedRental.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Alert severity={isReturnOverdue(selectedRental) ? "warning" : "info"} sx={{ mb: 3 }}>
                {isReturnOverdue(selectedRental) 
                  ? 'This return is overdue. Please return the equipment as soon as possible to avoid penalties.'
                  : 'Please ensure the equipment is in good condition before returning.'}
              </Alert>
              
              <TextField
                fullWidth
                label="Return Notes (Optional)"
                multiline
                rows={4}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Describe the condition of the equipment or any issues you encountered..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                By confirming the return, you acknowledge that the equipment owner will need to approve the return condition.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReturnDialog}>Cancel</Button>
              <Button onClick={handleReturnSubmit} variant="contained" color="primary">
                Confirm Return
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={openRatingDialog} onClose={handleCloseRatingDialog} maxWidth="sm" fullWidth>
        {selectedRental && (
          <>
            <DialogTitle>
              <Typography variant="h6">Rate Your Experience</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar 
                  src={selectedRental.owner.avatar} 
                  sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }} 
                />
                <Typography variant="h6">{selectedRental.owner.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedRental.name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" gutterBottom>How was your rental experience?</Typography>
                <Rating
                  name="rating"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  size="large"
                  precision={0.5}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Comments (Optional)"
                multiline
                rows={4}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience with this rental..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRatingDialog}>Skip</Button>
              <Button onClick={handleRatingSubmit} variant="contained" color="primary">
                Submit Rating
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

export default MyRentals;