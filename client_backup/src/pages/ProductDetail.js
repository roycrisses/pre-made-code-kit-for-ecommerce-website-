import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Chip,
  Rating,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart } from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchProduct = React.useCallback(async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      if (response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0].color);
      }
      if (response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0].size);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(product._id, quantity, selectedSize, selectedColor);
    
    if (result.success) {
      toast.success('Added to cart successfully!');
    } else {
      toast.error(result.error);
    }
    
    setAddingToCart(false);
  };

  const getAvailableQuantity = () => {
    const sizeInfo = product?.sizes.find(s => s.size === selectedSize);
    return sizeInfo ? sizeInfo.quantity : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  const discountedPrice = product.discount > 0 ? product.discountedPrice : product.price;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="div"
              sx={{
                height: 500,
                background: product.images?.[selectedImage]?.data 
                  ? `url(data:${product.images[selectedImage].contentType};base64,${product.images[selectedImage].data})` 
                  : 'linear-gradient(45deg, #f0f0f0 0%, #e0e0e0 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </Card>
          
          {product.images && product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 80,
                    height: 80,
                    cursor: 'pointer',
                    border: selectedImage === index ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedImage(index)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: '100%',
                      background: `url(${image.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h5" color="primary">
              Rs. {discountedPrice}
            </Typography>
            {product.discount > 0 && (
              <>
                <Typography variant="h6" sx={{ textDecoration: 'line-through' }}>
                  Rs. {product.price}
                </Typography>
                <Chip label={`${product.discount}% OFF`} color="secondary" />
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip label={product.category} />
            {product.brand && <Chip label={product.brand} variant="outlined" />}
          </Box>

          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Size</InputLabel>
              <Select
                value={selectedSize}
                label="Size"
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size) => (
                  <MenuItem 
                    key={size.size} 
                    value={size.size}
                    disabled={size.quantity === 0}
                  >
                    {size.size} {size.quantity === 0 && '(Out of Stock)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Color</InputLabel>
              <Select
                value={selectedColor}
                label="Color"
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {product.colors.map((color) => (
                  <MenuItem key={color.color} value={color.color}>
                    {color.color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Quantity Selection */}
          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(getAvailableQuantity(), parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: getAvailableQuantity() }}
            sx={{ mb: 3, width: 120 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available: {getAvailableQuantity()} items
          </Typography>

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={addingToCart || getAvailableQuantity() === 0}
            fullWidth
            sx={{ mb: 2 }}
          >
            {addingToCart ? <CircularProgress size={24} /> : 'Add to Cart'}
          </Button>

          {/* Product Details */}
          {product.material && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Material:</strong> {product.material}
            </Typography>
          )}
          
          {product.careInstructions && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Care Instructions:</strong> {product.careInstructions}
            </Typography>
          )}

          {product.tags && product.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tags:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
