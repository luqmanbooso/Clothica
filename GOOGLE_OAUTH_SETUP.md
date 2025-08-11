# Google OAuth & Enhanced Authentication Setup Guide

## Overview
This guide will help you set up Google OAuth, OTP verification, and enhanced authentication features for the Clothica e-commerce application.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Cloud Console account
- Gmail account (for email services)

## Backend Setup

### 1. Install Dependencies
Navigate to the server directory and install the required packages:
```bash
cd server
npm install
```

### 2. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/clothica

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Client URL (for email links)
CLIENT_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Google OAuth Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

#### Step 2: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Copy the Client ID and Client Secret

#### Step 3: Update Environment Variables
Replace the placeholder values in your `.env` file with the actual Google OAuth credentials.

### 4. Gmail Setup for Email Services

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to "Security" > "2-Step Verification"
2. Click "App passwords"
3. Generate a new app password for "Mail"
4. Use this password in your `SMTP_PASS` environment variable

### 5. Start the Backend Server
```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
Navigate to the client directory and install the required packages:
```bash
cd client
npm install
```

### 2. Environment Variables
Create a `.env` file in the client directory:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start the Frontend Application
```bash
npm start
```

## Features Implemented

### 1. Google OAuth Authentication
- **Sign In**: Users can sign in with their Google account
- **Sign Up**: New users can create accounts using Google OAuth
- **Account Linking**: Existing email accounts can be linked to Google OAuth

### 2. Enhanced Password Management
- **Secure Registration**: Password hashing with bcrypt
- **Password Reset**: Secure token-based password reset
- **Password Change**: Authenticated users can change their passwords
- **Account Lockout**: Protection against brute force attacks

### 3. Email Verification System
- **Email Verification**: Users must verify their email after registration
- **Verification Tokens**: Secure, time-limited verification tokens
- **Resend Verification**: Users can request new verification emails
- **Welcome Emails**: Automated welcome emails for new users

### 4. OTP Verification System
- **Phone Verification**: Optional phone number verification
- **OTP Generation**: Secure 6-digit OTP codes
- **OTP Expiration**: 10-minute expiration for security
- **Email Delivery**: OTP codes sent via email (can be extended to SMS)

### 5. Security Features
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Secure error messages that don't leak information
- **CORS Protection**: Cross-origin request protection

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

## User Model Schema

The enhanced User model includes:
- Basic information (name, email, password)
- Google OAuth integration (googleId, avatar)
- Verification status (email, phone)
- Security features (login attempts, account lockout)
- Timestamps and audit fields
- Preferences and loyalty system

## Email Templates

The system includes professionally designed email templates for:
- Email verification
- Password reset
- OTP delivery
- Welcome messages

## Testing the System

### 1. Test Registration
1. Go to `/register`
2. Fill out the registration form
3. Check your email for verification link
4. Click the verification link

### 2. Test Google OAuth
1. Go to `/login` or `/register`
2. Click the Google Sign-In button
3. Complete Google OAuth flow
4. Verify successful authentication

### 3. Test Password Reset
1. Go to `/forgot-password`
2. Enter your email address
3. Check your email for reset link
4. Click the link and set a new password

### 4. Test OTP Verification
1. Sign in to your account
2. Go to your profile
3. Add a phone number
4. Request OTP verification
5. Enter the OTP code

## Troubleshooting

### Common Issues

#### 1. Google OAuth Not Working
- Verify Google Client ID is correct
- Check that Google+ API is enabled
- Ensure redirect URIs are properly configured

#### 2. Email Not Sending
- Verify Gmail credentials
- Check that 2FA is enabled
- Ensure app password is correct
- Check SMTP settings

#### 3. Database Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure database exists

#### 4. Frontend Build Issues
- Clear node_modules and reinstall
- Check for environment variable typos
- Verify all dependencies are installed

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secrets**: Use strong, unique JWT secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust rate limiting based on your needs
5. **Email Security**: Use app passwords, not regular passwords
6. **Database Security**: Use strong database passwords and network security

## Production Deployment

### 1. Environment Variables
- Use production-grade secrets
- Set appropriate CORS origins
- Configure production database URLs
- Use production email services

### 2. Security Headers
- Enable Helmet.js security headers
- Configure CORS properly
- Set up rate limiting
- Enable HTTPS

### 3. Monitoring
- Set up logging
- Monitor authentication attempts
- Track email delivery rates
- Monitor API performance

## Support

For additional support or questions:
- Check the code comments for implementation details
- Review the API documentation
- Contact the development team

## License

This authentication system is part of the Clothica e-commerce application and follows the same licensing terms.

