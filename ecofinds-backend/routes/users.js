const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profiles';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('displayName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

    const { displayName, email } = req.body;
    const userId = req.user.id;
    const updates = {};

    // Build update object
    if (displayName !== undefined) updates.display_name = displayName;
    if (email !== undefined) updates.email = email;

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // If email is being updated, check if it's already taken
    if (email) {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updates);

    await db.execute(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      [...updateValues, userId]
    );

    // Get updated user data
    const [updatedUser] = await db.execute(
      'SELECT id, display_name, email, profile_image, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload profile image
router.post('/profile/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const imagePath = `/uploads/profiles/${req.file.filename}`;

    // Update user profile image
    await db.execute(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [imagePath, userId]
    );

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      imageUrl: imagePath
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const [users] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user statistics
    const stats = {};

    // Total products listed
    const [productStats] = await db.execute(
      'SELECT COUNT(*) as total_products, COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_products FROM products WHERE seller_id = ?',
      [userId]
    );

    stats.products = {
      total: productStats[0].total_products,
      active: productStats[0].active_products
    };

    // Total sales
    const [salesStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT oi.order_id) as total_orders,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.price_at_purchase * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.seller_id = ? AND o.status = 'completed'
    `, [userId]);

    stats.sales = {
      totalOrders: salesStats[0].total_orders || 0,
      totalItemsSold: salesStats[0].total_items_sold || 0,
      totalRevenue: parseFloat(salesStats[0].total_revenue || 0)
    };

    // Total purchases
    const [purchaseStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_purchases,
        SUM(total_amount) as total_spent
      FROM orders
      WHERE user_id = ? AND status = 'completed'
    `, [userId]);

    stats.purchases = {
      totalOrders: purchaseStats[0].total_purchases || 0,
      totalSpent: parseFloat(purchaseStats[0].total_spent || 0)
    };

    // Wishlist count
    const [wishlistStats] = await db.execute(
      'SELECT COUNT(*) as wishlist_count FROM wishlists WHERE user_id = ?',
      [userId]
    );

    stats.wishlist = {
      totalItems: wishlistStats[0].wishlist_count || 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
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

    const { password } = req.body;
    const userId = req.user.id;

    // Verify password
    const [users] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidPassword = await bcrypt.compare(password, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Check for pending orders
    const [pendingOrders] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM orders o 
      JOIN order_items oi ON o.id = oi.order_id 
      JOIN products p ON oi.product_id = p.id 
      WHERE (o.user_id = ? OR p.seller_id = ?) AND o.status = 'pending'
    `, [userId, userId]);

    if (pendingOrders[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with pending orders'
      });
    }

    // For this demo, we'll deactivate the account instead of hard deletion
    // In production, you might want to anonymize data instead
    await db.execute(
      'UPDATE users SET email = CONCAT("deleted_", id, "@deleted.com"), display_name = "Deleted User", is_active = FALSE WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;