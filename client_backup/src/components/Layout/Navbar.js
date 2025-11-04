import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  InputBase,
  alpha,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Chat as ChatIcon,
  AdminPanelSettings
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useChatNotifications } from '../../contexts/ChatContext';
import ClothingHubLogo from '../Logo/ClothingHubLogo';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 0,
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
  },
  '&:focus-within': {
    borderColor: theme.palette.text.primary,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  },
}));

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const { unreadCount, clearUnreadCount } = useChatNotifications();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      className="blue-nav-section"
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '3px solid #2196F3',
        borderColor: '#2196F3',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            mr: 4,
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          <ClothingHubLogo width={140} height={40} color="black" />
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0, mr: { xs: 1, sm: 2, md: 4 } }} className="blue-nav-items">
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              className="blue-nav-item"
              sx={{
                color: 'black',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                minWidth: 'auto',
                borderRight: '2px solid #2196F3',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3'
                }
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/products"
              className="blue-nav-item"
              sx={{
                color: 'black',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                minWidth: 'auto',
                borderRight: '2px solid #2196F3',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3'
                }
              }}
            >
              All
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/products?category=outerwear"
              className="blue-nav-item"
              sx={{
                color: 'black',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                minWidth: 'auto',
                borderRight: '2px solid #2196F3',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3'
                }
              }}
            >
              Outerwear
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/products?category=knitwear"
              className="blue-nav-item"
              sx={{
                color: 'black',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                minWidth: 'auto',
                borderRight: '2px solid #2196F3',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3'
                }
              }}
            >
              Knitwear
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/products?category=pants"
              className="blue-nav-item"
              sx={{
                color: 'black',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                minWidth: 'auto',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3'
                }
              }}
            >
              Pants
            </Button>
          </Box>
        )}

        <Search sx={{ 
          flexGrow: 1, 
          maxWidth: { xs: 200, sm: 250, md: 300 },
          display: { xs: 'none', sm: 'block' }
        }}>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </Search>

        <Box sx={{ flexGrow: 1 }} />


        {isMobile && (
          <IconButton
            sx={{ color: 'text.primary', ml: 1 }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton
              sx={{ color: 'text.primary' }}
              component={Link}
              to="/cart"
            >
              <Badge badgeContent={getCartItemCount()} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            <IconButton
              sx={{ color: 'text.primary' }}
              component={Link}
              to="/chat"
              onClick={clearUnreadCount}
            >
              <Badge badgeContent={unreadCount} color="error">
                <ChatIcon />
              </Badge>
            </IconButton>

            {isAdmin && (
              <IconButton
                sx={{ color: 'text.primary' }}
                component={Link}
                to="/admin"
              >
                <AdminPanelSettings />
              </IconButton>
            )}

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: 'text.primary' }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/orders'); handleClose(); }}>
                My Orders
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button 
              sx={{ 
                color: 'black',
                textTransform: 'uppercase',
                fontWeight: 400,
                letterSpacing: '0.05em',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#666'
                }
              }} 
              component={Link} 
              to="/login"
            >
              Login
            </Button>
            <Button 
              sx={{ 
                color: 'black',
                textTransform: 'uppercase',
                fontWeight: 400,
                letterSpacing: '0.05em',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#666'
                }
              }} 
              component={Link} 
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
