import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Container,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarMonth as CalendarMonthIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

// Services
import { logout } from '../../services/authService';

const drawerWidth = 240;

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  theme?: Theme;
  isMobile?: boolean;
}

// Define Main component with proper typing
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })<MainProps>(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(!isMobile ? {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
      } : {}),
    }),
  }),
);

interface AppBarProps {
  theme: Theme;
  open: boolean;
  isMobile?: boolean;
}

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })(
  ({ theme, open, isMobile }: AppBarProps) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && !isMobile && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

interface DrawerHeaderProps {
  theme: Theme;
}

const DrawerHeader = styled('div')(({ theme }: DrawerHeaderProps) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `${theme.spacing(0)} ${theme.spacing(1)}`,
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Diet', icon: <RestaurantIcon />, path: '/diet/weekly-plan' },
  { text: 'Exercise', icon: <FitnessCenterIcon />, path: '/exercise' },
  { text: 'Weekly Planner', icon: <CalendarMonthIcon />, path: '/planner' },
  { text: 'Rental Hub', icon: <InventoryIcon />, path: '/rental' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
];

const MainLayout: React.FC = () => {
  const theme = useTheme<Theme>();
  const navigate = useNavigate();
  const location = useLocation();
  // Use string-based media query instead of theme.breakpoints.down
  const isMobile = useMediaQuery('(max-width:900px)');
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };
  
  const handleProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled theme={theme} position="fixed" open={open} color="primary" isMobile={isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Gymless People
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Menu
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.contrastText,
                      },
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <ListItemIcon sx={isActive ? { color: theme.palette.primary.contrastText } : {}}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Main open={open} isMobile={isMobile}>
        <DrawerHeader />
        <Container maxWidth="lg" disableGutters={isMobile} sx={{ px: isMobile ? 1 : 2 }}>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
};

export default MainLayout;