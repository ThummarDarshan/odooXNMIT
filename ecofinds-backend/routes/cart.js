const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await db.execute(`
      SELECT 
        ci.*,
        p.title,
        p.description,
        p.price,
        p.image_url,
        p.condition_type,
        p.quantity as available_quantity,
        c.name as category_name,
        u.display_name as seller_name,
        u.is_verified as seller_verified
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = ? AND p.is_active = TRUE
      ORDER BY ci.created_at DESC
    `, [userId]);

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        title: item.title,
        description: item.description,
        price: parseFloat(item.price),
        imageUrl: item.image_url,
        category: item.category_name,
        condition: item.condition_type,
        availableQuantity: item.available_quantity,
        seller: {
          name: item.seller_name,
          isVerified: Boolean(item.seller_verified)
        }
      },
      quantity: item.quantity,
      addedAt: item.created_at
    }));

    // Calculate totals
    const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = formattedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    res.json({
      success: true,
      items: formattedItems,
      summary: {
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Check if product exists and is available
    const [products] = await db.execute(
      'SELECT id, quantity, seller_id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    const product = products[0];

    // Check if user is trying to add their own product
    if (product.seller_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add your own product to cart'
      });
    }

    // Check if enough quantity is available
    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available`
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.quantity - existingItems[0].quantity} more available`
        });
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item
      await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Verify cart item belongs to user and get product info
    const [cartItems] = await db.execute(`
      SELECT ci.id, ci.product_id, p.quantity as available_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ? AND p.is_active = TRUE
    `, [cartItemId, userId]);

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartItem = cartItems[0];

    // Check if enough quantity is available
    if (quantity > cartItem.available_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.available_quantity} items available`
      });
    }

    // Update quantity
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );

    res.json({
      success: true,
      message: 'Cart updated'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const userId = req.user.id;

    // Verify cart item belongs to user
    const [result] = await db.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;