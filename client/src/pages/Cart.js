import React, { useState } from 'react';
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
  TextField,
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    const result = await updateCartItem(itemId, newQuantity);
    
    if (!result.success) {
      toast.error(result.error);
    }
    
    setUpdating({ ...updating, [itemId]: false });
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const result = await clearCart();
      if (result.success) {
        toast.success('Cart cleared');
      } else {
        toast.error(result.error);
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

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Add some products to your cart to get started
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/products"
          size="large"
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Card key={item._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 120,
                        background: item.product?.images?.[0]?.data 
                          ? `url(data:${item.product.images[0].contentType};base64,${item.product.images[0].data})` 
                          : 'linear-gradient(45deg, #f0f0f0 0%, #e0e0e0 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" component={Link} to={`/products/${item.product._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      {item.product?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size: {item.size} | Color: {item.color}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      Rs. {item.price}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={updating[item._id] || item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity !== item.quantity) {
                            handleQuantityChange(item._id, newQuantity);
                          }
                        }}
                        inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                        disabled={updating[item._id]}
                      />
                      
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={updating[item._id]}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item._id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              startIcon={<Delete />}
            >
              Clear Cart
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {cart.items.map((item) => (
                  <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.product?.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">Rs. {cart.totalAmount.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1">Rs. 100.00</Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  Rs. {(cart.totalAmount + 100).toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                component={Link}
                to="/checkout"
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/products"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
