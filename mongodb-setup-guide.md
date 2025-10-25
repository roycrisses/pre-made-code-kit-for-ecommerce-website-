# MongoDB Setup Guide for Clothing Ecommerce

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (select Free Tier M0)
4. Choose your preferred cloud provider and region

### Step 2: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with username and password
4. Give "Read and write to any database" permissions

### Step 3: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add your current IP or use "0.0.0.0/0" for development (allow access from anywhere)

### Step 4: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `clothing_store`

### Step 5: Update .env file
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/clothing_store?retryWrites=true&w=majority
```

## Option 2: Local MongoDB Installation

### For Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Install as a Windows Service
4. MongoDB will run on `mongodb://localhost:27017`

### Using Chocolatey:
```powershell
choco install mongodb
```

### Using winget:
```powershell
winget install MongoDB.Server
```

### Start MongoDB Service:
```powershell
net start MongoDB
```

## Option 3: Docker MongoDB

### Prerequisites:
- Docker Desktop installed

### Run MongoDB Container:
```bash
docker run --name mongodb-clothing -p 27017:27017 -d mongo:latest
```

### With persistent data:
```bash
docker run --name mongodb-clothing -p 27017:27017 -v mongodb_data:/data/db -d mongo:latest
```

## Database Configuration

### Current .env Configuration:
```
MONGODB_URI=mongodb://localhost:27017/clothing_store
```

### For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/clothing_store?retryWrites=true&w=majority
```

## Database Schema

The application will automatically create the following collections:
- `users` - User accounts and profiles
- `products` - Product catalog
- `carts` - Shopping carts
- `orders` - Order history
- `chats` - Chat messages

## Initial Data Setup

### Create Admin User
After starting the application, you can create an admin user by registering with:
```json
{
  "name": "Admin User",
  "email": "admin@clothing.com",
  "password": "admin123",
  "role": "admin"
}
```

### Sample Products
The application supports products with:
- Multiple sizes and quantities
- Multiple colors
- Image uploads
- Categories: shirts, pants, dresses, jackets, shoes, accessories, underwear, sportswear

## Testing MongoDB Connection

### Test Connection Script:
```javascript
// test-mongodb.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
```

Run: `node test-mongodb.js`

## Troubleshooting

### Common Issues:
1. **Connection Timeout**: Check network access and IP whitelist
2. **Authentication Failed**: Verify username/password
3. **Database Not Found**: MongoDB creates databases automatically
4. **Port 27017 in use**: Check if MongoDB is already running

### MongoDB Compass (GUI Tool)
Download MongoDB Compass for a visual interface to manage your database:
[MongoDB Compass Download](https://www.mongodb.com/products/compass)

## Production Considerations

### Security:
- Use strong passwords
- Limit IP access
- Enable authentication
- Use SSL/TLS connections

### Performance:
- Create indexes for frequently queried fields
- Monitor database performance
- Set up proper backup strategies

### Backup:
- MongoDB Atlas provides automatic backups
- For local installations, use `mongodump` and `mongorestore`

## Next Steps

1. Choose your preferred MongoDB setup option
2. Update the MONGODB_URI in your .env file
3. Start your application with `npm start`
4. Test the connection and create your first admin user
