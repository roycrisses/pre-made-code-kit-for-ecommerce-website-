# E-commerce Platform Integration Guide

## 1. Email Notifications with SendGrid

### Setup
1. Sign up for a SendGrid account at [https://sendgrid.com](https://sendgrid.com)
2. Create an API key with "Full Access"
3. Add the API key to your `.env` file:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourstore.com
   CLIENT_URL=https://yourstore.com
   ```

### Usage
```javascript
// Send a welcome email
const { sendEmail, emailTemplates } = require('./services/emailService');

// Using a template
const template = emailTemplates.welcome('John Doe');
await sendEmail('user@example.com', template.subject, template.html);

// Custom email
await sendEmail(
  'user@example.com', 
  'Your Order Confirmation', 
  '<h1>Thank you for your order!</h1>'
);
```

## 2. Phone & Address Validation

### Setup
1. For address validation, sign up at [Loqate](https://www.loqate.com/)
2. Add your API key to `.env`:
   ```
   ADDRESS_VALIDATION_KEY=your_loqate_api_key
   ```

### Usage
```javascript
const { validatePhoneNumber, validateAddress } = require('./services/validationService');

// Validate phone number
const phoneValidation = validatePhoneNumber('+1234567890', 'US');
console.log(phoneValidation);

// Validate address
const addressValidation = await validateAddress('123 Main St, New York, NY 10001');
console.log(addressValidation);
```

## 3. Social Media Login & Sharing

### Setup
1. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project and configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Add to `.env`:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

2. **Facebook Login**
   - Go to [Facebook for Developers](https://developers.facebook.com/)
   - Create a new app and add Facebook Login
   - Add to `.env`:
     ```
     FACEBOOK_APP_ID=your_app_id
     FACEBOOK_APP_SECRET=your_app_secret
     ```

### Usage
```javascript
// Social login
router.post('/auth/social/:provider', async (req, res) => {
  const { provider } = req.params;
  const { token } = req.body;
  
  try {
    const jwtToken = await socialAuth[provider](token);
    res.json({ token: jwtToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get share links
const shareLinks = socialAuth.getShareLinks(
  'https://yourstore.com/product/123',
  'Amazing Product',
  'Check out this amazing product!',
  'https://yourstore.com/images/product-123.jpg'
);
```

## 4. Google Analytics Integration

### Setup
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property and get your Measurement ID
3. Add to `.env`:
   ```
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   GA_API_SECRET=your_api_secret
   ```

### Usage
```javascript
// In your React components
import { initGA, trackPageView, ecommerceEvents } from '../utils/analytics';

// Initialize on app load
useEffect(() => {
  initGA();
  trackPageView(window.location.pathname);
}, []);

// Track product view
ecommerceEvents.viewItem([{
  id: 'P123',
  name: 'T-Shirt',
  price: 29.99,
  brand: 'Your Brand',
  category: 'Clothing'
}]);
```

## 5. Image Handling

### Setup
1. Create an AWS S3 bucket
2. Configure IAM user with S3 access
3. Add to `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   AWS_BUCKET_NAME=your_bucket_name
   ```

### Usage
```javascript
const { upload, processAndUploadImage, removeBackground } = require('./services/imageService');

// Upload single image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await processAndUploadImage(req.file, 'products');
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove background (requires remove.bg API key)
const imageBuffer = await removeBackground('https://example.com/image.jpg');
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

## API Endpoints

- `POST /api/validate/phone` - Validate phone number
- `POST /api/validate/address` - Validate address
- `POST /api/auth/social/:provider` - Social login (google, facebook)
- `POST /api/upload` - Upload images
- `POST /api/images/remove-bg` - Remove image background
- `POST /api/test-email` - Send test email
- `GET /api/share-links` - Get social share links

## Troubleshooting

- **Email not sending**: Check SendGrid API key and verify sender email
- **Image upload fails**: Verify AWS credentials and bucket permissions
- **Social login issues**: Ensure redirect URIs are correctly configured
- **Analytics not working**: Check GA Measurement ID and API secret

## Security Notes

- Never commit `.env` to version control
- Use HTTPS in production
- Implement rate limiting on authentication endpoints
- Validate all user inputs
- Keep dependencies updated
