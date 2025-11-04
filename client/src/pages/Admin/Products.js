import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  IconButton,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
  Save,
  Cancel,
  ViewList,
  ViewModule,
  Search,
  FilterList,
  TrendingUp,
  Inventory,
  Category,
  AttachMoney
} from '@mui/icons-material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    sizes: [],
    colors: [],
    material: '',
    careInstructions: '',
    tags: [],
    discount: 0,
    isFeatured: false
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState(new Set());

  const categories = [
    'shirts', 'pants', 'dresses', 'jackets', 'shoes', 'accessories', 'underwear', 'sportswear'
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];

  useEffect(() => {
    fetchProducts();
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = () => {
    const saved = localStorage.getItem('featuredProducts');
    if (saved) {
      setFeaturedProducts(new Set(JSON.parse(saved)));
    }
  };

  const toggleFeatured = (productId) => {
    const newFeatured = new Set(featuredProducts);
    if (newFeatured.has(productId)) {
      newFeatured.delete(productId);
    } else {
      newFeatured.add(productId);
    }
    setFeaturedProducts(newFeatured);
    localStorage.setItem('featuredProducts', JSON.stringify([...newFeatured]));
    
    // Update hero image immediately
    updateHeroImage([...newFeatured]);
  };

  const updateHeroImage = (featuredIds) => {
    const featuredProductsData = products.filter(p => featuredIds.includes(p._id));
    localStorage.setItem('heroProducts', JSON.stringify(featuredProductsData));
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products?limit=100&sortBy=createdAt&sortOrder=desc');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        material: product.material || '',
        careInstructions: product.careInstructions || '',
        tags: product.tags || [],
        discount: product.discount || 0,
        isFeatured: product.isFeatured || false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        brand: '',
        sizes: [],
        colors: [],
        material: '',
        careInstructions: '',
        tags: [],
        discount: 0,
        isFeatured: false
      });
    }
    setImages([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      brand: '',
      sizes: [],
      colors: [],
      material: '',
      careInstructions: '',
      tags: [],
      discount: 0,
      isFeatured: false
    });
    setImages([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSizeChange = (size, quantity) => {
    const existingIndex = formData.sizes.findIndex(s => s.size === size);
    const newSizes = [...formData.sizes];
    
    if (existingIndex >= 0) {
      if (quantity > 0) {
        newSizes[existingIndex].quantity = parseInt(quantity);
      } else {
        newSizes.splice(existingIndex, 1);
      }
    } else if (quantity > 0) {
      newSizes.push({ size, quantity: parseInt(quantity) });
    }
    
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleColorChange = (color, colorCode = '') => {
    const existingIndex = formData.colors.findIndex(c => c.color === color);
    const newColors = [...formData.colors];
    
    if (existingIndex >= 0) {
      if (color) {
        newColors[existingIndex] = { color, colorCode };
      } else {
        newColors.splice(existingIndex, 1);
      }
    } else if (color) {
      newColors.push({ color, colorCode });
    }
    
    setFormData({ ...formData, colors: newColors });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    console.log('Save button clicked!', { formData, images });
    
    // Basic validation
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      console.log('Validation failed - missing required fields');
      toast.error('Please fill in all required fields (Name, Description, Price, Category)');
      return;
    }

    if (formData.price <= 0) {
      console.log('Validation failed - invalid price');
      toast.error('Price must be greater than 0');
      return;
    }

    console.log('Validation passed, starting save...');
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append form fields - ensure proper data types
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory || '');
      formDataToSend.append('brand', formData.brand || '');
      formDataToSend.append('material', formData.material || '');
      formDataToSend.append('careInstructions', formData.careInstructions || '');
      formDataToSend.append('discount', parseFloat(formData.discount || 0));
      formDataToSend.append('isFeatured', formData.isFeatured);
      
      // Append arrays as JSON strings
      formDataToSend.append('sizes', JSON.stringify(formData.sizes || []));
      formDataToSend.append('colors', JSON.stringify(formData.colors || []));
      formDataToSend.append('tags', JSON.stringify(formData.tags || []));

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      console.log('FormData prepared, sending request...');

      let response;
      const config = {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      };

      if (editingProduct) {
        response = await axios.put(`/api/products/${editingProduct._id}`, formDataToSend, config);
      } else {
        response = await axios.post('/api/products', formDataToSend, config);
      }

      console.log('Product saved successfully:', response.data);
      
      // Show success notification with enhanced styling
      toast.success(`🎉 Product ${editingProduct ? 'updated' : 'created'} successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#4caf50',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      
      // Refresh the products list to show the new/updated product
      await fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', error.response?.data);
      
      // Enhanced error notification
      toast.error(`❌ ${error.response?.data?.message || error.message || 'Failed to save product'}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#f44336',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('Deleting product with ID:', productId);
        console.log('Product ID type:', typeof productId);
        console.log('Product ID length:', productId?.length);
        console.log('Product ID string:', String(productId));
        
        const config = {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        };
        
        const response = await axios.delete(`/api/products/${productId}`, config);
        console.log('Delete response:', response.data);
        
        toast.success('Product deleted successfully!');
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        console.error('Error details:', error.response?.data);
        console.error('Full error response:', error.response);
        console.error('Request URL:', error.config?.url);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
        toast.error(`Delete failed: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get products for current page
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.sizes?.reduce((s, size) => s + size.quantity, 0) || 0)), 0);
  const lowStockProducts = products.filter(product => 
    (product.sizes?.reduce((s, size) => s + size.quantity, 0) || 0) < 10
  ).length;
  const featuredCount = products.filter(product => featuredProducts.has(product._id)).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Product Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage your inventory, track performance, and optimize your catalog
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '4px solid #000000', bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Inventory sx={{ fontSize: 40, color: '#000000', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalProducts}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Total Products</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '4px solid #333333', bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <AttachMoney sx={{ fontSize: 40, color: '#333333', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Rs. {totalValue.toLocaleString()}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Inventory Value</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '4px solid #666666', bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUp sx={{ fontSize: 40, color: '#666666', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{lowStockProducts}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Low Stock Items</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '4px solid #999999', bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <StarIcon sx={{ fontSize: 40, color: '#999999', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{featuredCount}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Featured Products</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000' }}>Product Catalog</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Grid View">
              <IconButton 
                onClick={() => setViewMode('grid')}
                sx={{ color: viewMode === 'grid' ? '#000000' : '#666666' }}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table View">
              <IconButton 
                onClick={() => setViewMode('table')}
                sx={{ color: viewMode === 'table' ? '#000000' : '#666666' }}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: '#666666' }} />
            }}
            sx={{ 
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#000000' },
                '&.Mui-focused fieldset': { borderColor: '#000000' }
              }
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter by Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              startAdornment={<FilterList sx={{ mr: 1, color: '#666666' }} />}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ ml: 'auto', color: '#666666' }}>
            Showing {filteredProducts.length} of {totalProducts} products
          </Typography>
        </Stack>
      </Paper>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => {
            const totalStock = product.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0;
            const isLowStock = totalStock < 10;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    {/* Status Badges */}
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {featuredProducts.has(product._id) && (
                        <Chip 
                          label="Featured" 
                          size="small" 
                          sx={{ bgcolor: '#000000', color: 'white', fontWeight: 'bold' }}
                        />
                      )}
                      {isLowStock && (
                        <Chip 
                          label="Low Stock" 
                          size="small" 
                          sx={{ bgcolor: '#666666', color: 'white', fontWeight: 'bold' }}
                        />
                      )}
                      {product.discount > 0 && (
                        <Chip 
                          label={`${product.discount}% OFF`} 
                          size="small" 
                          sx={{ bgcolor: '#333333', color: 'white', fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                    
                    {/* Featured Toggle */}
                    <Tooltip title={featuredProducts.has(product._id) ? 'Remove from Featured' : 'Add to Featured'}>
                      <IconButton
                        onClick={() => toggleFeatured(product._id)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(5px)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        {featuredProducts.has(product._id) ? (
                          <StarIcon sx={{ color: '#000000' }} />
                        ) : (
                          <StarBorderIcon sx={{ color: '#999999' }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    <CardMedia
                      component="div"
                      sx={{
                        height: 220,
                        background: product.images?.[0]?.data 
                          ? `url(data:${product.images[0].contentType};base64,${product.images[0].data})` 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                      {product.description.substring(0, 80)}...
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                        Rs. {product.discount > 0 ? product.discountedPrice : product.price}
                      </Typography>
                      {product.discount > 0 && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          Rs. {product.price}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderColor: '#667eea', color: '#667eea' }}
                      />
                      <Chip 
                        label={`Stock: ${totalStock}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: isLowStock ? '#ff5722' : '#4caf50', 
                          color: isLowStock ? '#ff5722' : '#4caf50'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                      <Tooltip title="Edit Product">
                        <IconButton
                          onClick={() => handleOpenDialog(product)}
                          sx={{ 
                            color: '#2196f3',
                            '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          onClick={() => handleDelete(product._id)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => {
                const totalStock = product.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0;
                const isLowStock = totalStock < 10;
                
                return (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                        src={product.images?.[0]?.data 
                          ? `data:${product.images[0].contentType};base64,${product.images[0].data}` 
                          : undefined
                        }
                      >
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                          Rs. {product.discount > 0 ? product.discountedPrice : product.price}
                        </Typography>
                        {product.discount > 0 && (
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            Rs. {product.price}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={totalStock} 
                        size="small" 
                        sx={{ 
                          bgcolor: isLowStock ? '#ffebee' : '#e8f5e8', 
                          color: isLowStock ? '#d32f2f' : '#2e7d32',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {featuredProducts.has(product._id) && (
                          <Chip label="Featured" size="small" sx={{ bgcolor: '#000000', color: 'white' }} />
                        )}
                        {product.discount > 0 && (
                          <Chip label={`${product.discount}% OFF`} size="small" sx={{ bgcolor: '#333333', color: 'white' }} />
                        )}
                        {isLowStock && (
                          <Chip label="Low Stock" size="small" sx={{ bgcolor: '#666666', color: 'white' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={featuredProducts.has(product._id) ? 'Remove from Featured' : 'Add to Featured'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleFeatured(product._id)}
                            sx={{ color: featuredProducts.has(product._id) ? '#000000' : '#999999' }}
                          >
                            {featuredProducts.has(product._id) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(product)}
                            sx={{ color: '#000000' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(product._id)}
                            sx={{ color: '#666666' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {filteredProducts.length > rowsPerPage && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.75rem',
          py: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: '#000000'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 1.5,
              backdropFilter: 'blur(10px)'
            }}>
              {editingProduct ? '✏️' : '🛍️'}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {editingProduct ? 'Update product information and inventory' : 'Create a new product for your store'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate id="product-form">
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="📝 Basic Info" />
              <Tab label="📏 Sizes & Stock" />
              <Tab label="🎨 Colors & Images" />
              <Tab label="⚙️ Advanced" />
            </Tabs>

            {/* Tab 1: Basic Information */}
            {tabValue === 0 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#000000', fontWeight: 'bold' }}>
                  📝 Product Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e5e5e5' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#667eea' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product Description"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            placeholder="Describe your product in detail..."
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#667eea' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                              name="category"
                              value={formData.category}
                              label="Category"
                              onChange={handleInputChange}
                              required
                            >
                              {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Category sx={{ fontSize: 18 }} />
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            placeholder="e.g. Nike, Adidas, Zara"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e5e5e5' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
                        💰 Pricing & Offers
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Price (Rs.)"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            InputProps={{
                              startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rs.</Typography>
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Discount (%)"
                            name="discount"
                            type="number"
                            value={formData.discount}
                            onChange={handleInputChange}
                            inputProps={{ min: 0, max: 100 }}
                            helperText="Optional discount percentage"
                          />
                        </Grid>
                        {formData.discount > 0 && (
                          <Grid item xs={12}>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #000000' }}>
                              <Typography variant="body2" sx={{ color: '#000000', fontWeight: 'bold' }}>
                                💰 Final Price: Rs. {(formData.price * (1 - formData.discount / 100)).toFixed(0)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#333333' }}>
                                You save Rs. {(formData.price * formData.discount / 100).toFixed(0)}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Tab 2: Sizes & Stock */}
            {tabValue === 1 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#000000', fontWeight: 'bold' }}>
                  📏 Sizes & Inventory Management
                </Typography>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Available Sizes & Stock Quantities
                  </Typography>
                  <Grid container spacing={2}>
                    {availableSizes.map((size) => {
                      const existingSize = formData.sizes.find(s => s.size === size);
                      const quantity = existingSize?.quantity || 0;
                      return (
                        <Grid item xs={6} sm={4} md={3} key={size}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              border: quantity > 0 ? '2px solid #000000' : '1px solid #e5e5e5',
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              {size}
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              value={quantity}
                              onChange={(e) => handleSizeChange(size, e.target.value)}
                              inputProps={{ min: 0 }}
                              size="small"
                              placeholder="0"
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover fieldset': { borderColor: '#000000' },
                                  '&.Mui-focused fieldset': { borderColor: '#000000' }
                                }
                              }}
                            />
                            {quantity > 0 && (
                              <Chip 
                                label={quantity < 10 ? 'Low Stock' : 'In Stock'} 
                                size="small" 
                                sx={{ 
                                  mt: 1,
                                  bgcolor: quantity < 10 ? '#f5f5f5' : '#ffffff',
                                  color: quantity < 10 ? '#666666' : '#000000'
                                }}
                              />
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      💡 Tip: Enter quantities for each size. Sizes with 0 quantity won't be available for purchase.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Tab 3: Colors & Images */}
            {tabValue === 2 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#000000', fontWeight: 'bold' }}>
                  🎨 Visual Presentation
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        📸 Product Images
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        fullWidth
                        sx={{ 
                          py: 3,
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          borderColor: '#000000',
                          color: '#000000',
                          '&:hover': {
                            borderColor: '#333333',
                            bgcolor: 'rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Upload Product Images
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click to select multiple images (JPG, PNG, WebP)
                          </Typography>
                        </Box>
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                      {images.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Chip 
                            label={`${images.length} image(s) selected`} 
                            sx={{ bgcolor: '#000000', color: 'white', fontWeight: 'bold' }}
                          />
                          <Typography variant="body2" sx={{ mt: 1, color: '#666666' }}>
                            First image will be used as the main product image
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        🎯 Product Features
                      </Typography>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                            style={{ marginRight: '8px' }}
                          />
                          <label htmlFor="featured">
                            <Typography variant="body1">
                              ⭐ Mark as Featured Product
                            </Typography>
                          </label>
                        </Box>
                      </FormControl>
                      <Typography variant="body2" sx={{ color: '#666666', fontStyle: 'italic' }}>
                        Featured products appear prominently on your homepage and get more visibility.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Tab 4: Advanced Settings */}
            {tabValue === 3 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#000000', fontWeight: 'bold' }}>
                  ⚙️ Advanced Product Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        🧵 Material & Care
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Material"
                            name="material"
                            value={formData.material}
                            onChange={handleInputChange}
                            placeholder="e.g. 100% Cotton, Polyester Blend"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Care Instructions"
                            name="careInstructions"
                            value={formData.careInstructions}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="e.g. Machine wash cold, tumble dry low"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        🏷️ Tags & SEO
                      </Typography>
                      <TextField
                        fullWidth
                        label="Product Tags"
                        name="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                        }))}
                        placeholder="casual, summer, cotton, comfortable"
                        helperText="Separate tags with commas for better searchability"
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Enhanced Footer */}
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Cancel />}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
            sx={{ 
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'
              }
            }}
          >
            {submitting ? 'Saving Product...' : (editingProduct ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
