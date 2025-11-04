import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  Stack,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Simple Carousel Component for Hero Image
const HeroCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [products.length]);

  if (!products.length || !products[currentIndex]?.images?.[0]?.data) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(data:${products[currentIndex].images[0].contentType};base64,${products[currentIndex].images[0].data})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out'
      }}
    />
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({ name: '', price: '', image: '' });

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Load featured products from localStorage (set by admin)
      const heroProducts = localStorage.getItem('heroProducts');
      if (heroProducts) {
        setFeaturedProducts(JSON.parse(heroProducts));
      } else {
        // Fallback to API or static data
        const response = await axios.get('/api/products?limit=4&featured=true');
        setFeaturedProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // No fallback - show empty if API fails
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      image: product.image || ''
    });
    setEditDialog({ open: true, product });
  };

  const handleSaveProduct = async () => {
    try {
      await axios.put(`/api/products/${editDialog.product._id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Product updated successfully!');
      setEditDialog({ open: false, product: null });
      fetchFeaturedProducts();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    }
  };

  const categories = [
    { 
      name: 'OUTERWEAR', 
      image: '/images/outerwear-category.jpg', 
      link: '/products?category=outerwear',
      color: '#F5F5F5'
    },
    { 
      name: 'HEADWEAR', 
      image: '/images/headwear-category.jpg', 
      link: '/products?category=headwear',
      color: '#EEEEEE'
    },
    { 
      name: 'OUTWEAR', 
      image: '/images/outwear-category.jpg', 
      link: '/products?category=outwear',
      color: '#E0E0E0'
    },
    { 
      name: 'KNITWEAR', 
      image: '/images/knitwear-category.jpg', 
      link: '/products?category=knitwear',
      color: '#BDBDBD'
    },
    { 
      name: 'HOODIE', 
      image: '/images/hoodie-category.jpg', 
      link: '/products?category=hoodie',
      color: '#9E9E9E'
    },
    { 
      name: 'JEANS', 
      image: '/images/jeans-category.jpg', 
      link: '/products?category=jeans',
      color: '#757575'
    },
    { 
      name: 'PANTS', 
      image: '/images/pants-category.jpg', 
      link: '/products?category=pants',
      color: '#616161'
    },
    { 
      name: 'TROUSERS', 
      image: '/images/trousers-category.jpg', 
      link: '/products?category=trousers',
      color: '#424242'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        className="blue-hero-section"
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          border: '3px solid #2196F3',
          margin: '1rem 0'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ pr: { md: 4 } }}>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 300,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  OUR LATEST
                  <br />
                  OFFERINGS
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 4, 
                    color: 'text.secondary',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    maxWidth: '400px'
                  }}
                >
                  Discover our latest offerings, featuring cutting-edge designs and premium quality.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/products"
                  sx={{
                    bgcolor: 'black',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#333',
                    }
                  }}
                >
                  SHOP NOW
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                className="blue-outline"
                sx={{
                  height: '500px',
                  backgroundColor: '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #2196F3'
                }}
              >
                {featuredProducts.length > 0 && featuredProducts[0].images?.[0]?.data ? (
                  featuredProducts.length === 1 ? (
                    // Single featured product
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(data:${featuredProducts[0].images[0].contentType};base64,${featuredProducts[0].images[0].data})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  ) : (
                    // Multiple featured products - simple carousel
                    <HeroCarousel products={featuredProducts} />
                  )
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    HERO IMAGE
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <div className="blue-section-divider">
        <Container maxWidth="lg" sx={{ py: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }} className="blue-product-grid">
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 300,
                letterSpacing: '-0.01em'
              }}
            >
              OUR PRODUCT
            </Typography>
          </Box>
          
          {/* Category Filter Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6, flexWrap: 'wrap', gap: 1 }}>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'black', 
                color: 'white',
                minWidth: 'auto',
                px: 3,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              ALL
            </Button>
            {categories.slice(0, 7).map((category) => (
              <Button 
                key={category.name}
                variant="outlined" 
                component={Link}
                to={category.link}
                sx={{ 
                  borderColor: '#E0E0E0',
                  color: 'black',
                  minWidth: 'auto',
                  px: 3,
                  '&:hover': { 
                    borderColor: 'black',
                    bgcolor: 'transparent'
                  }
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>
          
          {/* Product Grid */}
          <Grid container spacing={3} className="blue-product-grid">
            {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={3} key={product._id || index}>
                <Box sx={{ position: 'relative' }} className="blue-accent-card">
                  {user && (user.role === 'admin' || user.role === 'seller') && (
                    <IconButton
                      onClick={() => handleEditProduct(product)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box
                    component={Link}
                    to="/products"
                    sx={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover .product-image': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <Box
                      className="product-image"
                      sx={{
                        height: 400,
                        backgroundColor: '#F5F5F5',
                        mb: 2,
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: product.images?.[0]?.data 
                          ? `url(data:${product.images[0].contentType};base64,${product.images[0].data})` 
                          : product.image 
                          ? `url(${product.image})` 
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!product.images?.[0]?.data && !product.image && (
                        <Typography variant="body2" color="text.secondary">
                          {product.name || `Product Image ${index + 1}`}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
                      {product.name || `Product Name ${index + 1}`}
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      Rs. {product.price ? product.price.toLocaleString() : ((index + 1) * 1500).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No featured products selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Admin can feature products by clicking the star icon in the product management page
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, product: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Product Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price (Rs.)"
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Image URL"
            value={editForm.image}
            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
            margin="normal"
            helperText="Enter image URL or leave empty for placeholder"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, product: null })}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Newsletter Section */}
      <Box sx={{ bgcolor: '#F5F5F5', py: 12 }} className="blue-section-divider">
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 300,
                letterSpacing: '-0.01em'
              }}
            >
              STAY UPDATED
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary',
                fontSize: '1.1rem',
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and fashion insights.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ 
                maxWidth: '400px', 
                mx: 'auto',
                '& .MuiTextField-root': {
                  flex: 1
                }
              }}
            >
              <Box
                component="input"
                placeholder="Enter your email"
                sx={{
                  flex: 1,
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 0,
                  outline: 'none',
                  fontSize: '1rem',
                  '&:focus': {
                    borderColor: 'black'
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'black',
                  color: 'white',
                  px: 4,
                  py: 2,
                  minWidth: '120px',
                  '&:hover': {
                    bgcolor: '#333',
                  }
                }}
              >
                SUBSCRIBE
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <div className="blue-section-divider">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <LocalShippingIcon sx={{ fontSize: 48, color: 'black' }} />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
                Free Shipping
              </Typography>
              <Typography color="text.secondary">
                Free shipping on orders over Rs. 2000
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <PaymentIcon sx={{ fontSize: 48, color: 'black' }} />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
                Secure Payment
              </Typography>
              <Typography color="text.secondary">
                Pay securely with eSewa or Cash on Delivery
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <RefreshIcon sx={{ fontSize: 48, color: 'black' }} />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
                Easy Returns
              </Typography>
              <Typography color="text.secondary">
                30-day return policy for all items
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </div>
    </Box>
  );
};

export default Home;
