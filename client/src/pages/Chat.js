import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Send, Chat as ChatIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    fetchChats();

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && activeChat) {
      socket.emit('join_chat', { chatId: activeChat._id });

      socket.on('receive_message', (data) => {
        // Only update if message is not from current user (prevent duplication)
        const currentUserId = user._id;
        if (data.message.sender._id !== currentUserId && data.chatId === activeChat._id) {
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
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, activeChat, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat');
      setChats(response.data);
      if (response.data.length > 0) {
        setActiveChat(response.data[0]);
        fetchChatMessages(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
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

  const startNewChat = async () => {
    try {
      const response = await axios.post('/api/chat/start');
      const newChat = response.data;
      
      setChats([newChat, ...chats]);
      setActiveChat(newChat);
      
      // Notify admins about new chat via socket
      if (socket) {
        socket.emit('new_chat_created', {
          chat: newChat
        });
      }
      
      toast.success('New chat started! You can now send messages to the seller.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start chat');
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
        Chat with Seller
      </Typography>

      <Card sx={{ height: 600, display: 'flex' }}>
        {/* Chat List */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={startNewChat}
              startIcon={<ChatIcon />}
            >
              Start New Chat
            </Button>
          </Box>
          
          <List sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
            {chats.map((chat) => (
              <ListItem
                key={chat._id}
                button
                selected={activeChat?._id === chat._id}
                onClick={() => {
                  setActiveChat(chat);
                  fetchChatMessages(chat._id);
                }}
              >
                <Avatar sx={{ mr: 2 }}>
                  {chat.participants.find(p => p._id !== user._id)?.name?.[0] || 'A'}
                </Avatar>
                <ListItemText
                  primary={chat.participants.find(p => p._id !== user._id)?.name || 'Admin'}
                  secondary={chat.lastMessage?.content || 'No messages yet'}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {activeChat.participants.find(p => p._id !== user._id)?.name || 'Admin'}
                </Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                {activeChat.messages?.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '70%',
                        bgcolor: msg.sender._id === user._id ? 'primary.main' : 'grey.100',
                        color: msg.sender._id === user._id ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
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
                  placeholder="Type your message..."
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
              <Typography variant="h6" color="text.secondary">
                Select a chat or start a new conversation
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default Chat;
