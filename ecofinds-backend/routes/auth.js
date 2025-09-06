const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, generateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');
const passport = require('../config/passport');

const router = express.Router();

// Register new user
router.post('/register', [
  body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { displayName, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (display_name, email, password_hash) VALUES (?, ?, ?)',
      [displayName, email, passwordHash]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = generateToken(userId);

    // Get user data (without password)
    const [newUser] = await db.execute(
      'SELECT id, display_name, email, profile_image, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Send welcome email asynchronously
    setImmediate(() => {
      sendWelcomeEmail(email, displayName);
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT id, display_name, email, password_hash, profile_image, is_verified, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user has a password (OAuth users might not have one)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in using your social account (Google/GitHub)'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// GitHub OAuth routes
router.get('/github', 
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the OAuth user
      const token = generateToken(req.user.id);

      // Send welcome email for new users (only if they just registered)
      const isNewUser = req.user.created_at && 
        (new Date() - new Date(req.user.created_at)) < 60000; // Less than 1 minute ago
      
      if (isNewUser && req.user.email) {
        setImmediate(() => {
          sendWelcomeEmail(req.user.email, req.user.display_name);
        });
      }

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
      
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  }
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the OAuth user
      const token = generateToken(req.user.id);

      // Send welcome email for new users
      const isNewUser = req.user.created_at && 
        (new Date() - new Date(req.user.created_at)) < 60000; // Less than 1 minute ago
      
      if (isNewUser && req.user.email) {
        setImmediate(() => {
          sendWelcomeEmail(req.user.email, req.user.display_name);
        });
      }

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  }
);

// Verify JWT token and get user data
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, display_name, email, profile_image, is_verified, github_id, google_id, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    
    // Add OAuth connection status
    user.hasGitHub = Boolean(user.github_id);
    user.hasGoogle = Boolean(user.google_id);
    
    // Remove OAuth IDs from response for security
    delete user.github_id;
    delete user.google_id;

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user.id);

    res.json({
      success: true,
      token: newToken,
      user: req.user
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// Link OAuth accounts (for existing users)
router.post('/link/:provider', authenticateToken, async (req, res) => {
  try {
    const provider = req.params.provider;
    const userId = req.user.id;

    if (!['github', 'google'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    // Store user ID in session for linking
    req.session.linkUserId = userId;
    
    // Redirect to OAuth provider
    const redirectUrl = `/api/auth/${provider}`;
    res.json({
      success: true,
      redirectUrl
    });

  } catch (error) {
    console.error('Link account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link account'
    });
  }
});

// Unlink OAuth accounts
router.delete('/unlink/:provider', authenticateToken, async (req, res) => {
  try {
    const provider = req.params.provider;
    const userId = req.user.id;

    if (!['github', 'google'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    // Check if user has a password or another OAuth method
    const [user] = await db.execute(
      'SELECT password_hash, github_id, google_id FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasPassword = Boolean(user[0].password_hash);
    const hasGitHub = Boolean(user[0].github_id);
    const hasGoogle = Boolean(user[0].google_id);

    // Prevent unlinking if it's the only authentication method
    if (!hasPassword && ((provider === 'github' && !hasGoogle) || (provider === 'google' && !hasGitHub))) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink the only authentication method. Please set a password first.'
      });
    }

    // Unlink the provider
    const column = provider === 'github' ? 'github_id' : 'google_id';
    await db.execute(
      `UPDATE users SET ${column} = NULL WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully`
    });

  } catch (error) {
    console.error('Unlink account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink account'
    });
  }
});

// Test email endpoint (only for development)
router.post('/test-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Test endpoint not available in production'
    });
  }

  try {
    const { email, name } = req.body;
    const testEmail = email || 'test@example.com';
    const testName = name || 'Test User';

    console.log('🧪 Testing email functionality...');
    const result = await sendWelcomeEmail(testEmail, testName);

    res.json({
      success: result && result.success,
      message: result && result.success ? 'Test email sent successfully' : 'Email test failed',
      details: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

module.exports = router;