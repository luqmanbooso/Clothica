# Email Service Setup Guide

## Overview
The Clothica email service supports sending order confirmations with PDF invoices attached. It can be configured to use various SMTP providers or fall back to mock mode for development.

## Features
- ✅ Order confirmation emails
- ✅ PDF invoice generation and attachment
- ✅ SMTP support (Gmail, Outlook, custom servers)
- ✅ Gmail OAuth2 support
- ✅ Fallback to mock mode for development
- ✅ Automatic fallback if PDF generation fails

## Configuration Options

### 1. Basic SMTP Configuration
Add these environment variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Enable PDF Invoices
ENABLE_PDF_INVOICES=true
```

### 2. Gmail OAuth2 Configuration (Recommended)
For Gmail, use OAuth2 instead of app passwords:

```env
# Gmail OAuth2 Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-oauth-client-id
GMAIL_CLIENT_SECRET=your-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token

# Enable PDF Invoices
ENABLE_PDF_INVOICES=true
```

### 3. Development Mode (Mock Emails)
For development without real email sending:

```env
# Development Configuration
ENABLE_MOCK_EMAILS=true
ENABLE_PDF_INVOICES=false
NODE_ENV=development
```

## SMTP Provider Examples

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## Testing the Email Service

### 1. Check Service Status
```bash
GET /api/email/status
```

Response:
```json
{
  "isConfigured": true,
  "hasTransporter": true,
  "environment": "production",
  "pdfInvoicesEnabled": true,
  "smtpConfigured": true
}
```

### 2. Send Test Email
```bash
POST /api/email/test
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 3. Test Order Creation
Create a new order to test the automatic email sending with PDF invoice.

## Troubleshooting

### Common Issues

1. **"Email service: Missing required environment variables"**
   - Solution: Add SMTP_USER and SMTP_PASS to your .env file

2. **"SMTP connection failed"**
   - Solution: Check your SMTP credentials and network connectivity
   - For Gmail: Use app passwords instead of regular passwords
   - For Gmail: Enable "Less secure app access" or use OAuth2

3. **"PDF generation failed"**
   - Solution: Ensure pdfkit package is installed (`npm install pdfkit`)
   - Check if ENABLE_PDF_INVOICES=true

4. **"Mock transporter for development"**
   - This is normal in development mode
   - Check console logs for mock email content

### Gmail Setup Steps

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** in SMTP_PASS (not your regular password)

### Gmail OAuth2 Setup (Advanced)

1. **Create OAuth2 Credentials**:
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Gmail API
   - Create OAuth2 credentials
2. **Get Refresh Token**:
   - Use Google's OAuth2 playground or implement OAuth2 flow
3. **Configure environment variables** with the OAuth2 credentials

## Production Considerations

1. **Use OAuth2** instead of app passwords for Gmail
2. **Set up proper SPF/DKIM records** for your domain
3. **Monitor email delivery rates** and bounce handling
4. **Implement email queuing** for high-volume scenarios
5. **Set up email templates** for different order statuses

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific configuration files
- Regularly rotate SMTP passwords and OAuth2 tokens
- Monitor for unauthorized email usage
- Implement rate limiting for email endpoints

## Support

If you encounter issues:
1. Check the server console for detailed error messages
2. Verify your SMTP configuration
3. Test with the `/api/email/status` endpoint
4. Check if the service is in mock mode
5. Ensure all required packages are installed
