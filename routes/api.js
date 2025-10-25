const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { validatePhoneNumber, validateAddress } = require('../services/validationService');
const socialAuth = require('../services/socialAuthService');
const { upload, processAndUploadImage, removeBackground } = require('../services/imageService');
const { serverSideTrack } = require('../utils/analytics');

// Phone validation endpoint
router.post('/validate/phone', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('countryCode').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, countryCode = 'NP' } = req.body;
  const validation = validatePhoneNumber(phone, countryCode);
  
  res.json(validation);
});

// Address validation endpoint
router.post('/validate/address', [
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await validateAddress(req.body.address);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Social authentication endpoint
router.post('/auth/social/:provider', async (req, res) => {
  const { provider } = req.params;
  const { token } = req.body;

  if (!['google', 'facebook'].includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  try {
    const token = await socialAuth[provider](token);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Image upload endpoint
router.post('/upload', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const files = req.files || [req.file];
      const uploadPromises = files.map(file => processAndUploadImage(file, 'products'));
      const urls = await Promise.all(uploadPromises);
      
      // Track the upload event
      serverSideTrack('upload_image', {
        user_id: req.user.id,
        file_count: urls.length
      });
      
      res.json({ urls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Background removal endpoint
router.post('/images/remove-bg', auth, async (req, res) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const result = await removeBackground(imageUrl);
    res.set('Content-Type', 'image/png');
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send test email
router.post('/test-email', auth, async (req, res) => {
  const { email } = req.user;
  
  try {
    const template = emailTemplates.welcome(req.user.name);
    await sendEmail(email, template.subject, template.html);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Social share links
router.get('/share-links', (req, res) => {
  const { url, title, description, image } = req.query;
  const links = socialAuth.getShareLinks(url, title, description, image);
  res.json(links);
});

module.exports = router;
