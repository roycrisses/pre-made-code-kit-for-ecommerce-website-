import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  Button,
  Divider,
  Badge,
  CircularProgress
} from '@mui/material';
import { Send, Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    fetchChats();

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      // Join admin room to receive all customer messages
      socket.emit('join_admin_room');

      socket.on('receive_message', (data) => {
        // Only update if message is not from current user (prevent duplication)
        const currentUserId = localStorage.getItem('userId');
        if (data.message.sender._id !== currentUserId) {
          // Update active chat if it matches
          if (activeChat && data.chatId === activeChat._id) {
            setActiveChat(prev => ({
              ...prev,
              messages: [...prev.messages, data.message],
              lastMessage: {
                content: data.message.content,
                sender: data.message.sender,
                timestamp: data.message.createdAt
              }
            }));
          }

          // Update chats list
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat._id === data.chatId) {
                return {
                  ...chat,
                  messages: [...(chat.messages || []), data.message],
                  lastMessage: {
                    content: data.message.content,
                    sender: data.message.sender,
                    timestamp: data.message.createdAt
                  }
                };
              }
              return chat;
            })
          );
        }
      });

      // Listen for new chats from customers
      socket.on('new_chat', (data) => {
        setChats(prevChats => [data.chat, ...prevChats]);
      });

      return () => {
        socket.off('receive_message');
        socket.off('new_chat');
      };
    }
  }, [socket, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/admin/all');
      setChats(response.data);
      if (response.data.length > 0) {
        setActiveChat(response.data[0]);
        fetchChatMessages(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}`);
      setActiveChat(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    try {
      const response = await axios.post(`/api/chat/${activeChat._id}/message`, {
        content: message.trim()
      });

      // Update active chat with new message
      setActiveChat(response.data.chat);
      
      // Emit message via socket to other participants (not back to sender)
      if (socket) {
        socket.emit('send_message', {
          chatId: activeChat._id,
          message: response.data.newMessage,
          senderId: response.data.newMessage.sender._id
        });
      }

      // Update chats list with updated chat
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === activeChat._id ? response.data.chat : chat
        )
      );

      setMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0;
    const currentUserId = localStorage.getItem('userId');
    return chat.messages.filter(msg => 
      !msg.isRead && 
      msg.sender._id !== currentUserId &&
      msg.sender.role === 'user' // Only count customer messages
    ).length;
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
        Customer Chats
      </Typography>

      <Card sx={{ height: 600, display: 'flex' }}>
        {/* Chat List */}
        <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Active Conversations</Typography>
          </Box>
          
          <List sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
            {chats.map((chat) => {
              // Find the customer (non-admin participant)
              const customer = chat.participants?.find(p => p.role === 'user' || p.role === 'customer');
              const unreadCount = getUnreadCount(chat);
              
              // Skip chats without customer participants
              if (!customer) return null;
              
              return (
                <ListItem
                  key={chat._id}
                  button
                  selected={activeChat?._id === chat._id}
                  onClick={() => {
                    setActiveChat(chat);
                    fetchChatMessages(chat._id);
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    },
                  }}
                >
                  <Avatar 
                    sx={{ 
                      mr: 2, 
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {customer.name || 'Customer'}
                        </Typography>
                        {unreadCount > 0 && (
                          <Badge 
                            badgeContent={unreadCount} 
                            sx={{ 
                              '& .MuiBadge-badge': { 
                                bgcolor: 'error.main', 
                                color: 'white',
                                fontSize: '0.75rem'
                              } 
                            }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                          {chat.lastMessage?.content || 'No messages yet'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.email}
                        </Typography>
                        {chat.lastMessage?.timestamp && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            • {new Date(chat.lastMessage.timestamp).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            }).filter(Boolean)}
            {chats.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No customer conversations yet
                </Typography>
              </Box>
            )}
          </List>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                {(() => {
                  const customer = activeChat.participants?.find(p => p.role === 'user' || p.role === 'customer');
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {customer?.name || 'Customer'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer?.email || 'No email available'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Customer ID: {customer?._id?.slice(-6) || 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                {activeChat.messages?.map((msg, index) => {
                  const isAdmin = msg.sender.role === 'admin';
                  const isCurrentUser = msg.sender._id === localStorage.getItem('userId');
                  return (
                    <Box
                      key={msg._id || index}
                      sx={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          bgcolor: isCurrentUser ? 'black' : (isAdmin ? 'primary.main' : 'grey.100'),
                          color: isCurrentUser ? 'white' : (isAdmin ? 'white' : 'text.primary'),
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                          {msg.sender.name} {isAdmin ? '(Admin)' : '(Customer)'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {msg.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(msg.createdAt || msg.timestamp).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                component="form"
                onSubmit={sendMessage}
                sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}
              >
                <TextField
                  fullWidth
                  placeholder="Type your response..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!message.trim()}
                  endIcon={<Send />}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start chatting
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default AdminChats;
