# Quick MongoDB Atlas Setup

## Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Create a new project (name it "Clothing Store")

## Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" (M0 Sandbox)
3. Select any cloud provider and region
4. Click "Create Cluster"

## Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `clothingstore`
4. Password: `clothingstore123` (or generate secure password)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go back to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It will look like: `mongodb+srv://clothingstore:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Update Your .env File
Replace the MONGODB_URI in your .env file with:
```
MONGODB_URI=mongodb+srv://clothingstore:clothingstore123@cluster0.xxxxx.mongodb.net/clothing_store?retryWrites=true&w=majority
```
(Replace the cluster URL with your actual cluster URL)

This setup takes about 5 minutes and gives you a fully managed MongoDB database!
