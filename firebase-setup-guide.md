# Firebase Storage Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "clothing-ecommerce")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Storage

1. In your Firebase project dashboard
2. Go to "Storage" in the left sidebar
3. Click "Get started"
4. Choose "Start in test mode" for now
5. Select a location (choose closest to your users)
6. Click "Done"

## Step 3: Create Service Account

1. Go to Project Settings (gear icon)
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Keep this file secure - it contains your credentials

## Step 4: Configure Environment Variables

Update your `.env` file with the following values from the downloaded JSON:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Important Notes:**
- Replace `your-project-id` with your actual Firebase project ID
- Copy the entire private key including the BEGIN/END lines
- The private key should be wrapped in quotes and use `\n` for line breaks
- The client email will be something like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- Storage bucket is usually `your-project-id.appspot.com`

## Step 5: Update Storage Rules (Optional)

For production, update your Storage rules in Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 6: Install Dependencies

The Firebase Admin SDK has already been added to package.json:

```bash
npm install firebase-admin
```

## Benefits of Firebase Storage

✅ **5GB Free Storage** - Much more than local storage  
✅ **Global CDN** - Fast image loading worldwide  
✅ **Automatic Scaling** - No server storage limits  
✅ **Secure** - Built-in authentication and rules  
✅ **Reliable** - Google's infrastructure  
✅ **Easy Management** - Firebase Console interface  

## How It Works

1. **Upload**: Images are uploaded to Firebase Storage instead of local `uploads/` folder
2. **Storage**: Files are stored in Firebase with public URLs
3. **Database**: MongoDB stores the Firebase URLs (not local paths)
4. **Display**: Frontend displays images using Firebase URLs
5. **Delete**: When products are deleted, images are removed from Firebase

Your images will now be stored in Firebase Storage with URLs like:
`https://storage.googleapis.com/your-project.appspot.com/products/1234567890-image.jpg`
