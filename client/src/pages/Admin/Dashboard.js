import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  ShoppingBag,
  People,
  AttachMoney,
  Inventory,
  TrendingUp,
  Chat
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/orders/all?limit=5'),
        axios.get('/api/products?limit=1')
      ]);

      const orders = ordersRes.data.orders;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalOrders: ordersRes.data.total,
        totalRevenue,
        totalProducts: productsRes.data.total,
        totalUsers: 0 // Would need a users endpoint
      });

      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBag sx={{ fontSize: 40, color: 'black', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'black', mr: 2 }} />
                <Box>
                  <Typography variant="h4">Rs. {stats.totalRevenue.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40, color: 'black', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalProducts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'black', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order) => (
                <ListItem key={order._id} divider>
                  <ListItemText
                    primary={`Order #${order._id.slice(-8)}`}
                    secondary={`${order.user?.name} - ${new Date(order.createdAt).toLocaleDateString()}`}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      Rs. {order.totalAmount}
                    </Typography>
                    <Chip
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                component={Link}
                to="/admin/products"
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory sx={{ mr: 2, color: 'black' }} />
                  <Typography>Manage Products</Typography>
                </CardContent>
              </Card>

              <Card
                component={Link}
                to="/admin/orders"
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBag sx={{ mr: 2, color: 'black' }} />
                  <Typography>Manage Orders</Typography>
                </CardContent>
              </Card>

              <Card
                component={Link}
                to="/admin/chats"
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chat sx={{ mr: 2, color: 'black' }} />
                  <Typography>Customer Chats</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
