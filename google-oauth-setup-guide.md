# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your clothing ecommerce website.

## Prerequisites

- Google account
- Access to Google Cloud Console
- Your application running on `http://localhost:3000` (frontend) and `http://localhost:3001` (backend)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Clothing Store OAuth"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Clothing Store"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Skip "Scopes" for now (click "Save and Continue")
6. Add test users (your email) if needed
7. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name: "Clothing Store Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
6. Add Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
7. Click "Create"
8. Copy the Client ID and Client Secret

## Step 5: Update Environment Variables

1. Open your `.env` file in the root directory
2. Replace the placeholder values:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```

## Step 6: Test the Integration

1. Start your backend server: `npm start`
2. Start your frontend: `cd client && npm start`
3. Go to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the OAuth flow

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Console exactly matches: `http://localhost:3001/api/auth/google/callback`

2. **"Access blocked" error**
   - Make sure you've added your email as a test user in the OAuth consent screen

3. **"Invalid client" error**
   - Double-check your Client ID and Client Secret in the `.env` file

4. **CORS errors**
   - Ensure both `http://localhost:3000` and `http://localhost:3001` are added as authorized origins

### Production Setup:

When deploying to production:
1. Add your production URLs to authorized origins and redirect URIs
2. Update `CLIENT_URL` in your `.env` file
3. Set `cookie: { secure: true }` in session configuration for HTTPS

## Features Included:

- ✅ Google OAuth login/registration
- ✅ Automatic user creation for new Google users
- ✅ Account linking for existing users with same email
- ✅ Secure JWT token generation
- ✅ Session management
- ✅ User profile integration

## Security Notes:

- Google users don't need passwords (handled by Google)
- All Google accounts are automatically verified
- JWT tokens are generated for consistent authentication
- Session secrets should be different in production
