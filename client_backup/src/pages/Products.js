import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Badge,
  Tooltip,
  Divider,
  Stack,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Search, 
  FilterList, 
  ViewModule, 
  ViewList,
  LocalOffer,
  Star,
  StarBorder,
  ShoppingCart,
  Visibility,
  TrendingUp,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editDialog, setEditDialog] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1
  });

  const categories = [
    'shirts', 'pants', 'dresses', 'jackets', 'shoes', 'accessories', 'underwear', 'sportswear'
  ];

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, fetchProducts]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (event, newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    };
    setFilters(newFilters);
    setSearchParams({});
  };

  const handleEditProduct = (product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description
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
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: 'white', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              🛍️ Product Catalog
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Discover our complete collection of premium clothing
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                {products.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Products
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Filters */}
      <Paper elevation={2} sx={{ mb: 4, p: 4, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterList sx={{ mr: 2, color: '#000000' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000' }}>
            Filter & Search Products
          </Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Products"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666666' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#000000' },
                  '&.Mui-focused fieldset': { borderColor: '#000000' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                startAdornment={<Search sx={{ mr: 1, color: '#666666' }} />}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: 18 }} />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                label="Sort By"
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                startAdornment={<TrendingUp sx={{ mr: 1, color: '#666666' }} />}
              >
                <MenuItem value="createdAt-desc">🆕 Newest First</MenuItem>
                <MenuItem value="createdAt-asc">🕐 Oldest First</MenuItem>
                <MenuItem value="price-asc">💰 Price: Low to High</MenuItem>
                <MenuItem value="price-desc">💎 Price: High to Low</MenuItem>
                <MenuItem value="name-asc">🔤 Name: A to Z</MenuItem>
                <MenuItem value="name-desc">🔤 Name: Z to A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{
                borderColor: '#e5e5e5',
                color: '#666666',
                '&:hover': {
                  borderColor: '#000000',
                  bgcolor: 'rgba(51, 65, 85, 0.05)'
                }
              }}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000' }}>
              📦 {products.length} Products Found
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
              <ToggleButtonGroup size="small" exclusive>
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
          </Box>

          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    borderRadius: 3,
                    border: '1px solid #e5e5e5',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: '#000000'
                    }
                  }}
                >
                  {/* Status Badges */}
                  <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {product.isFeatured && (
                      <Chip 
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label="Featured" 
                        size="small" 
                        sx={{ bgcolor: '#000000', color: 'white', fontWeight: 'bold' }}
                      />
                    )}
                    {product.discount > 0 && (
                      <Chip 
                        icon={<LocalOffer sx={{ fontSize: 16 }} />}
                        label={`${product.discount}% OFF`} 
                        size="small" 
                        sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                  
                  {/* Admin Controls */}
                  {user && (user.role === 'admin' || user.role === 'seller') && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <Tooltip title="Edit Product">
                        <IconButton
                          onClick={() => handleEditProduct(product)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                          }}
                        >
                          <Edit fontSize="small" sx={{ color: '#3b82f6' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          onClick={() => handleDeleteProduct(product._id)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                          }}
                        >
                          <Delete fontSize="small" sx={{ color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  
                  <CardMedia
                    component="div"
                    sx={{
                      height: 280,
                      background: product.images?.[0]?.data 
                        ? `url(data:${product.images[0].contentType};base64,${product.images[0].data})` 
                        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
                      }
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 'auto', color: '#666666' }}>
                      {product.description.substring(0, 90)}...
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#059669' }}>
                          Rs. {product.discount > 0 ? product.discountedPrice : product.price}
                        </Typography>
                        {product.discount > 0 && (
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#6b7280' }}>
                            Rs. {product.price}
                          </Typography>
                        )}
                      </Box>
                      {product.discount > 0 && (
                        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                          💰 You save Rs. {product.price - product.discountedPrice}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 'bold' }}
                      />
                      {product.brand && (
                        <Chip 
                          label="Featured" 
                          size="small" 
                          sx={{ bgcolor: '#000000', color: 'white', fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        component={Link}
                        to={`/products/${product._id}`}
                        variant="contained"
                        startIcon={<Visibility />}
                        variant="contained"
                        sx={{
                          background: '#000000',
                          color: 'white',
                          '&:hover': {
                            background: '#1a1a1a'
                          }
                        }}
                      >
                        View Details
                      </Button>
                      <Tooltip title="Add to Cart">
                        <IconButton
                          sx={{
                            bgcolor: '#f1f5f9',
                            border: '1px solid #e5e5e5',
                            '&:hover': { bgcolor: '#e5e5e5' }
                          }}
                        >
                          <ShoppingCart sx={{ color: '#334155' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={handlePageChange}
                sx={{ color: '#000000' }}
              />
            </Box>
          )}
        </>
      )}
      
      {/* Enhanced Edit Product Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, product: null })} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
          color: 'white',
          fontWeight: 'bold',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit />
            <Typography variant="h6">Edit Product</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#334155' },
                    '&.Mui-focused fieldset': { borderColor: '#1e293b' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (Rs.)"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rs.</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter detailed product description..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setEditDialog({ open: false, product: null })}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;
