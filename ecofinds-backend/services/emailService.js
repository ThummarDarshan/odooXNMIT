const nodemailer = require('nodemailer');

// Create transporter (FIXED: createTransport not createTransporter)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, displayName) => {
  try {
    console.log('🔄 Attempting to send welcome email to:', userEmail);
    
    // Validate email configuration
    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing in environment variables');
      return { success: false, error: 'Email configuration missing' };
    }

    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError.message);
      return { success: false, error: 'Email configuration invalid: ' + verifyError.message };
    }

    const mailOptions = {
      from: {
        name: 'EcoFinds Team',
        address: process.env.EMAIL
      },
      to: userEmail,
      subject: 'Welcome to EcoFinds! 🌱 Your Sustainable Marketplace Journey Begins',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EcoFinds</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px; 
              background: white;
            }
            .welcome-text {
              font-size: 18px;
              color: #374151;
              margin-bottom: 20px;
            }
            .highlight { 
              color: #059669; 
              font-weight: bold; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #10b981, #059669);
              color: white !important; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .features {
              background: #f8fafc;
              padding: 25px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .feature-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .feature-list li {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .feature-list li:last-child {
              border-bottom: none;
            }
            .emoji {
              font-size: 20px;
              margin-right: 10px;
            }
            .footer { 
              text-align: center; 
              padding: 30px 20px;
              background: #f9fafb;
              color: #6b7280; 
              font-size: 14px; 
            }
            .footer a {
              color: #059669;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Welcome to EcoFinds!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Sustainable Marketplace Adventure Begins</p>
            </div>
            <div class="content">
              <div class="welcome-text">
                <strong>Hi ${displayName}! 👋</strong>
              </div>
              
              <p>Welcome to <span class="highlight">EcoFinds</span> - where sustainability meets great deals! We're thrilled to have you join our community of eco-conscious shoppers and sellers.</p>
              
              <div class="features">
                <h3 style="color: #374151; margin-top: 0;">🎉 Here's what awaits you:</h3>
                <ul class="feature-list">
                  <li><span class="emoji">🛒</span><strong>Browse Thousands</strong> of quality pre-owned items</li>
                  <li><span class="emoji">💚</span><strong>Shop Sustainably</strong> and reduce environmental impact</li>
                  <li><span class="emoji">💰</span><strong>Save Money</strong> while helping the planet</li>
                  <li><span class="emoji">📦</span><strong>Sell Easily</strong> - turn your unused items into cash</li>
                  <li><span class="emoji">⭐</span><strong>Build Trust</strong> through our verified rating system</li>
                  <li><span class="emoji">🌍</span><strong>Join the Movement</strong> toward sustainable living</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                  🚀 Start Exploring EcoFinds
                </a>
              </div>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0;">🎯 Pro Tips to Get Started:</h4>
                <ul style="color: #047857; margin: 0;">
                  <li>Complete your profile to build seller trust</li>
                  <li>Use our smart filters to find exactly what you need</li>
                  <li>Add items to your wishlist to track favorites</li>
                  <li>Check out sustainability scores on products</li>
                  <li>Join our community discussions and tips</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Questions? Our friendly support team is here to help! Simply reply to this email or visit our help center.</p>
              
              <p style="margin-bottom: 0;">Happy shopping, happy selling, and happy planet-saving! 🌟</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;"><strong>Best regards,</strong><br>The EcoFinds Team 💚</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EcoFinds. Making the world more sustainable, one purchase at a time.</p>
              <p>This email was sent to <strong>${userEmail}</strong></p>
              <p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe">Unsubscribe</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact">Contact Us</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Also include plain text version for better compatibility
      text: `
Welcome to EcoFinds, ${displayName}!

We're excited to have you join our community of eco-conscious shoppers and sellers.

Here's what you can do on EcoFinds:
• Browse thousands of quality pre-owned items
• Shop sustainably and reduce environmental impact  
• Save money on great products
• Sell items you no longer need
• Build trust through our rating system

Get started: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Questions? Reply to this email for support.

Best regards,
The EcoFinds Team

This email was sent to ${userEmail}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Email sent to:', userEmail);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // Return error details for debugging
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, displayName, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: 'EcoFinds Team',
        address: process.env.EMAIL
      },
      to: userEmail,
      subject: 'Reset Your EcoFinds Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${displayName},</h2>
              <p>You requested to reset your password for your EcoFinds account.</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset My Password</a>
              </div>
              
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>For security reasons, please don't share this link with anyone.</p>
              
              <p>Best regards,<br>The EcoFinds Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EcoFinds</p>
              <p>This email was sent to ${userEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', userEmail);
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};