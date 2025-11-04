import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [notes, setNotes] = useState('');

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping address
      const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode'];
      const missing = required.filter(field => !shippingAddress[field]);
      
      if (missing.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
        notes
      };

      const response = await axios.post('/api/orders', orderData);
      const order = response.data;

      if (paymentMethod === 'esewa') {
        // Initiate eSewa payment
        const paymentResponse = await axios.post('/api/payment/esewa/initiate', {
          orderId: order._id
        });

        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentResponse.data.paymentUrl;

        Object.entries(paymentResponse.data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // Cash on Delivery
        await axios.post('/api/payment/cod/confirm', { orderId: order._id });
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="name"
                label="Full Name"
                value={shippingAddress.name}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="phone"
                label="Phone Number"
                value={shippingAddress.phone}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="street"
                label="Street Address"
                value={shippingAddress.street}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="city"
                label="City"
                value={shippingAddress.city}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="state"
                label="State/Province"
                value={shippingAddress.state}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="zipCode"
                label="ZIP/Postal Code"
                value={shippingAddress.zipCode}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="esewa"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">eSewa</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pay securely with eSewa digital wallet
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Cash on Delivery</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pay when your order is delivered
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Order Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 3 }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body2" paragraph>
              {shippingAddress.name}<br />
              {shippingAddress.phone}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <Typography variant="body2" paragraph>
              {paymentMethod === 'esewa' ? 'eSewa Digital Wallet' : 'Cash on Delivery'}
            </Typography>

            {notes && (
              <>
                <Typography variant="h6" gutterBottom>
                  Order Notes
                </Typography>
                <Typography variant="body2" paragraph>
                  {notes}
                </Typography>
              </>
            )}

            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {cart.items.map((item) => (
              <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {item.product?.name} ({item.size}, {item.color}) x {item.quantity}
                </Typography>
                <Typography variant="body2">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="warning">
          Your cart is empty. Please add items before checkout.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                )}
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Place Order'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  Rs. {(cart.totalAmount + 100).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
