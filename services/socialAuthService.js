const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const socialAuth = {
  // Google OAuth
  google: async (token) => {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Find or create user
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        user = new User({
          name: data.name,
          email: data.email,
          avatar: data.picture,
          isVerified: true,
          authMethod: 'google'
        });
        await user.save();
      }

      return generateToken(user);
    } catch (error) {
      console.error('Google auth error:', error.message);
      throw new Error('Google authentication failed');
    }
  },

  // Facebook Login
  facebook: async (token) => {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
      
      // Find or create user
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        user = new User({
          name: data.name,
          email: data.email,
          avatar: data.picture?.data?.url,
          isVerified: true,
          authMethod: 'facebook'
        });
        await user.save();
      }

      return generateToken(user);
    } catch (error) {
      console.error('Facebook auth error:', error.message);
      throw new Error('Facebook authentication failed');
    }
  },

  // Social sharing function
  getShareLinks: (url, title, description, image) => ({
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
  })
};

module.exports = socialAuth;
