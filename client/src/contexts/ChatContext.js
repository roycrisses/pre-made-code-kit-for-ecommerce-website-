import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const ChatContext = createContext();

export const useChatNotifications = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatNotifications must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Join user room for notifications
      newSocket.emit('join_user_room', { userId: user._id });

      // Listen for new messages
      newSocket.on('receive_message', (data) => {
        // Only count messages not from current user
        if (data.message.sender._id !== user._id) {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Listen for new chats (for customers)
      newSocket.on('new_chat_notification', () => {
        fetchUnreadCount();
      });

      // Fetch initial unread count
      fetchUnreadCount();

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/chat/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = (chatId) => {
    // Mark specific chat as read
    axios.post(`/api/chat/${chatId}/mark-read`).catch(console.error);
    fetchUnreadCount(); // Refresh count
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  const value = {
    unreadCount,
    markAsRead,
    clearUnreadCount,
    fetchUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
