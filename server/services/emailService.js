const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if required environment variables are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service: Missing required environment variables SMTP_USER or SMTP_PASS');
      console.warn('Email service will use fallback configuration or mock mode');
      
      // Try to use alternative email service configurations
      this.setupFallbackTransporter();
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Test the connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service: SMTP connection failed:', error);
          this.isConfigured = false;
          this.setupFallbackTransporter();
        } else {
          console.log('Email service: SMTP connection established');
          this.isConfigured = true;
        }
      });
    } catch (error) {
      console.error('Email service: Failed to create transporter:', error);
      this.setupFallbackTransporter();
    }
  }

  setupFallbackTransporter() {
    // Try to use Gmail with OAuth2 if available
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
      try {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: process.env.GMAIL_ACCESS_TOKEN
          }
        });
        
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('Email service: Gmail OAuth2 connection failed:', error);
            this.setupMockTransporter();
          } else {
            console.log('Email service: Gmail OAuth2 connection established');
            this.isConfigured = true;
          }
        });
      } catch (error) {
        console.error('Email service: Failed to create Gmail OAuth2 transporter:', error);
        this.setupMockTransporter();
      }
    } else {
      this.setupMockTransporter();
    }
  }

  setupMockTransporter() {
    console.log('Email service: Using mock transporter for development');
    this.transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 Mock Email Sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          from: mailOptions.from
        });
        
        // In development, log the email content
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Email Content:', mailOptions.html || mailOptions.text);
        }
        
        return { messageId: 'mock-' + Date.now() };
      },
      verify: (callback) => callback(null, true)
    };
    this.isConfigured = false;
  }

  async sendEmailVerification(email, token, name) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: 'Verify Your Email - Clothica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up with Clothica! To complete your registration and start shopping, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #6C7A59; word-break: break-all; font-size: 14px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account with Clothica, 
              you can safely ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email verification sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send email verification:', error);
      return false;
    }
  }

  async sendOTPEmail(email, otp, name) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: 'Your Verification Code - Clothica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your verification code is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #6C7A59; color: white; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, token, name) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: 'Password Reset Request - Clothica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Clothica account. Click the button below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This reset link will expire in 1 hour.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(email, order) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your order! Here are the details:
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
              <p style="color: #666; margin: 10px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
              <p style="color: #666; margin: 10px 0;"><strong>Total:</strong> Rs. ${order.total?.toLocaleString() || '0'}</p>
              <p style="color: #666; margin: 10px 0;"><strong>Status:</strong> ${order.status || 'pending'}</p>
              <p style="color: #666; margin: 10px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
              ${(order.items || []).map(item => `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                  <p style="color: #333; margin: 5px 0; font-weight: bold;">${item.name || 'Product'}</p>
                  <p style="color: #666; margin: 5px 0;">Quantity: ${item.quantity || 1}</p>
                  <p style="color: #666; margin: 5px 0;">Price: Rs. ${(item.price || 0).toLocaleString()}</p>
                  ${item.selectedColor ? `<p style="color: #666; margin: 5px 0;">Color: ${item.selectedColor}</p>` : ''}
                  ${item.selectedSize ? `<p style="color: #666; margin: 5px 0;">Size: ${item.selectedSize}</p>` : ''}
                </div>
              `).join('')}
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We'll send you updates on your order status. If you have any questions, please contact our support team.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  async sendOrderConfirmationWithInvoice(email, order) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    console.log('📧 Sending order confirmation email with invoice notice...');

    try {
      const mailOptions = {
        from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
        to: email,
        subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your order! We're excited to deliver your Sri Lankan fashion items.
              </p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
                <p style="color: #666; margin: 10px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
                <p style="color: #666; margin: 10px 0;"><strong>Total:</strong> Rs. ${order.total?.toLocaleString() || '0'}</p>
                <p style="color: #666; margin: 10px 0;"><strong>Status:</strong> ${order.status || 'pending'}</p>
                <p style="color: #666; margin: 10px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee5eb;">
                <h3 style="color: #0c5460; margin-top: 0;">📄 Invoice Information</h3>
                <p style="color: #0c5460; margin: 10px 0; font-weight: bold;">
                  Your invoice is available in your account:
                </p>
                <ul style="color: #0c5460; margin: 10px 0; padding-left: 20px;">
                  <li>Go to <strong>My Orders</strong> in your account</li>
                  <li>Click on this order</li>
                  <li>Click <strong>"Download Invoice"</strong> button</li>
                  <li>Or visit: <a href="http://localhost:3000/orders" style="color: #0c5460;">My Orders Page</a></li>
                </ul>
                <p style="color: #0c5460; margin: 10px 0; font-size: 14px;">
                  💡 <em>Invoices are generated on-demand and are always up-to-date with your order details.</em>
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We'll send you updates on your order status. If you have any questions, please contact our support team.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  The Clothica Team
                </p>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email with invoice notice sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  // PDF generation removed - invoices are now available in the user's account

  // Get service status
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasTransporter: !!this.transporter,
      environment: process.env.NODE_ENV || 'development',
      pdfInvoicesEnabled: false, // PDF invoices are now available in user account
      smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
    };
  }

  // Test email functionality
  async testEmail(email) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: 'Test Email - Clothica Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Email Service Test</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Service Test</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is a test email to verify that the Clothica email service is working correctly.
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #333; margin-top: 0;">Service Status</h3>
              <p style="color: #666; margin: 10px 0;"><strong>SMTP Configured:</strong> ${process.env.SMTP_USER ? 'Yes' : 'No'}</p>
              <p style="color: #666; margin: 10px 0;"><strong>PDF Invoices:</strong> Available in user account</p>
              <p style="color: #666; margin: 10px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you received this email, the email service is working correctly!
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(email, name) {
    if (!this.transporter) {
      console.error('Email service: Transporter not initialized');
      return false;
    }

    const mailOptions = {
      from: `"Clothica" <${process.env.SMTP_USER || 'noreply@clothica.com'}>`,
      to: email,
      subject: 'Welcome to Clothica! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Clothica</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Premium Fashion & Lifestyle</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Clothica, ${name}! 🎉</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining our fashion community! We're excited to have you on board and can't wait to help you discover amazing styles.
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>🎯 <strong>Explore our collections</strong> - Discover trending styles</li>
                <li>🛒 <strong>Start shopping</strong> - Add items to your cart</li>
                <li>💎 <strong>Earn loyalty points</strong> - Get rewards with every purchase</li>
                <li>📱 <strong>Track your orders</strong> - Real-time updates on deliveries</li>
              </ul>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #333; margin-top: 0;">Special Welcome Offer</h3>
              <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                As a welcome gift, enjoy <strong>10% off your first order</strong> when you spend Rs. 1000 or more!
              </p>
              <p style="color: #6C7A59; font-weight: bold; margin: 0;">
                Use code: <span style="background: #6C7A59; color: white; padding: 5px 10px; border-radius: 4px;">WELCOME10</span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shop" 
                 style="background: linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Start Shopping Now
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need assistance, our customer support team is here to help!
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Clothica Team<br>
                <a href="mailto:support@clothica.com" style="color: #6C7A59;">support@clothica.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

