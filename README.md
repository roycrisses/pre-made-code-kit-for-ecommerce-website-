# 🛍️ ClothingHub - Full-Stack Ecommerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-16.x-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-featured ecommerce platform for clothing stores. Built with MERN stack (MongoDB, Express, React, Node.js) and packed with essential e-commerce features.

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- MongoDB 5.0 or higher
- npm 8.x or higher
- Git

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/clothinghub.git
cd clothinghub
```

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/clothinghub
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   
   # Email (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourstore.com
   CLIENT_URL=http://localhost:3000
   
   # AWS S3 Storage (for image uploads)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your-bucket-name
   
   # Google Analytics (optional)
   GA_MEASUREMENT_ID=your_ga_measurement_id
   GA_API_SECRET=your_ga_api_secret
   ```

### 3. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 4. Start the Development Servers

#### Option 1: Run both backend and frontend separately

```bash
# Start backend server (from root directory)
npm run dev

# In a new terminal, start the frontend
cd client
npm start
```

#### Option 2: Run with concurrently (recommended)

```bash
# Install concurrently globally if you haven't
npm install -g concurrently

# Start both servers from root directory
npm run dev:all
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs (if enabled)

## 🛠️ Configuration

### Required Services

1. **MongoDB**
   - Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas

2. **SendGrid** (for email notifications)
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Create an API key with "Full Access"
   - Add the API key to your `.env` file

3. **AWS S3** (for image storage)
   - Create an AWS account at [AWS Console](https://aws.amazon.com/)
   - Create an S3 bucket and get your credentials
   - Set CORS policy for your bucket:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["PUT", "POST", "DELETE", "GET"],
         "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
         "ExposeHeaders": []
       }
     ]
     ```

### Optional Integrations

1. **Google Analytics**
   - Create a GA4 property at [Google Analytics](https://analytics.google.com/)
   - Add your Measurement ID to `.env`

2. **Social Logins**
   - Follow the setup guide in `INTEGRATION_GUIDE.md`

## 📂 Project Structure

```
clothinghub/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── context/       # React context
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── .env.example          # Example environment variables
├── package.json          # Backend dependencies
└── README.md            # This file
```

## 🚀 Deployment

### Backend Deployment (Heroku)

1. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Add MongoDB to Heroku:
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   # Add other environment variables
   ```

4. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Netlify)

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `build` folder to Netlify

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start backend server with nodemon
- `npm run client` - Start React development server
- `npm run dev:all` - Start both servers with concurrently
- `npm run build` - Build React app for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Airbnb JavaScript Style Guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the awesome UI components
- MongoDB for the database
- SendGrid for email services
- All the open-source libraries used in this project

---

<div align="center">
  <sub>Built with ❤️ by Your Name</sub>
</div>

A comprehensive clothing ecommerce platform built with Node.js, Express, MongoDB, and React. Features include user authentication, product management, shopping cart, real-time chat, and eSewa payment integration.

## Features

### For Customers
- **User Registration & Authentication** - Secure login/signup system
- **Product Browsing** - Browse products with advanced filtering and search
- **Shopping Cart** - Add/remove items, update quantities
- **Secure Checkout** - Multiple payment options (eSewa, Cash on Delivery)
- **Order Management** - Track order status and history
- **Real-time Chat** - Chat with sellers for support
- **User Profile** - Manage personal information and addresses

### For Admins/Sellers
- **Admin Dashboard** - Overview of orders, revenue, and products
- **Product Management** - Add, edit, delete products with image uploads
- **Order Management** - Update order status, add tracking numbers
- **Customer Support** - Real-time chat with customers
- **Inventory Management** - Track stock levels and sizes

### Technical Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Communication** - Socket.io for instant messaging
- **Image Upload** - Multer for handling product images
- **Payment Integration** - eSewa digital wallet support
- **Security** - JWT authentication, input validation, rate limiting
- **Modern UI** - Material-UI components with beautiful design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Frontend
- **React** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form handling
- **React Toastify** - Notifications

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-clothing-business
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/clothing-ecommerce
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   NODE_ENV=development

   # eSewa Configuration
   ESEWA_MERCHANT_ID=your_esewa_merchant_id
   ESEWA_SECRET_KEY=your_esewa_secret_key
   ESEWA_SUCCESS_URL=http://localhost:3000/payment/success
   ESEWA_FAILURE_URL=http://localhost:3000/payment/failure

   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads/
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Create uploads directory**
   ```bash
   mkdir uploads
   mkdir uploads/products
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   # From root directory
   npm run dev
   # or
   npm start
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   # From client directory
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Creating Admin Account
1. Register a new account
2. During registration, select "Admin/Seller" as account type
3. Login with admin credentials to access admin dashboard

### Adding Products (Admin)
1. Login as admin
2. Navigate to Admin Dashboard
3. Go to "Manage Products"
4. Click "Add Product" and fill in details
5. Upload product images
6. Set sizes, colors, and inventory

### Customer Shopping Flow
1. Browse products on homepage or products page
2. Use filters to find specific items
3. Click on product to view details
4. Select size, color, and quantity
5. Add to cart
6. Proceed to checkout
7. Fill shipping information
8. Choose payment method (eSewa or COD)
9. Complete order

### Chat Support
- Customers can start chat from the chat page
- Admins can respond from the admin chat panel
- Real-time messaging with Socket.io

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat/start` - Start new chat
- `POST /api/chat/:id/message` - Send message

### Payment
- `POST /api/payment/esewa/initiate` - Initiate eSewa payment
- `POST /api/payment/esewa/verify` - Verify eSewa payment
- `POST /api/payment/cod/confirm` - Confirm COD order

## eSewa Integration

### Setup
1. Register for eSewa merchant account
2. Get merchant ID and secret key
3. Update `.env` file with credentials
4. Configure success/failure URLs

### Testing
- Use eSewa sandbox for testing
- Test credentials available in eSewa documentation

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Update MongoDB URI for production database
3. Configure proper JWT secret
4. Set up file upload directory
5. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve static files from Express in production
3. Update API URLs for production

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - express-validator for request validation
- **Rate Limiting** - Prevent API abuse
- **CORS Configuration** - Cross-origin request handling
- **File Upload Security** - File type and size validation

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@clothinghub.com
- Chat: Use the built-in chat system
- Issues: Create GitHub issue

## Acknowledgments

- Material-UI for beautiful components
- eSewa for payment processing
- MongoDB for database
- Socket.io for real-time features
#   p r e - m a d e - c o d e - k i t - f o r - e c o m m e r c e - w e b s i t e -  
 