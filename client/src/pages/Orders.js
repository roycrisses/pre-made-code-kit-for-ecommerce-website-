import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Visibility, Cancel } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'error',
      refunded: 'info'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          No Orders Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You haven't placed any orders yet.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      Order #{order._id.slice(-8)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                    />
                    <Chip
                      label={order.paymentStatus}
                      color={getPaymentStatusColor(order.paymentStatus)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items ({order.items.length})
                    </Typography>
                    {order.items.slice(0, 3).map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            background: item.image 
                              ? `url(${item.image})` 
                              : 'linear-gradient(45deg, #f0f0f0 0%, #e0e0e0 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            mr: 2
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Size: {item.size}, Color: {item.color}, Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          Rs. {item.price}
                        </Typography>
                      </Box>
                    ))}
                    {order.items.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{order.items.length - 3} more items
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        Rs. {order.totalAmount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Payment: {order.paymentMethod === 'esewa' ? 'eSewa' : 'Cash on Delivery'}
                      </Typography>
                      {order.trackingNumber && (
                        <Typography variant="body2" color="text.secondary">
                          Tracking: {order.trackingNumber}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedOrder(order);
                        setDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    {['pending', 'confirmed'].includes(order.orderStatus) && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Order Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - #{selectedOrder?._id.slice(-8)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip
                  label={selectedOrder.orderStatus}
                  color={getStatusColor(selectedOrder.orderStatus)}
                />
                <Chip
                  label={selectedOrder.paymentStatus}
                  color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              {selectedOrder.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.name} ({item.size}, {item.color}) x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedOrder.shippingAddress.name}<br />
                {selectedOrder.shippingAddress.phone}<br />
                {selectedOrder.shippingAddress.street}<br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">Rs. {selectedOrder.subtotal}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">Rs. {selectedOrder.shippingCost}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="body1">Total:</Typography>
                <Typography variant="body1">Rs. {selectedOrder.totalAmount}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
