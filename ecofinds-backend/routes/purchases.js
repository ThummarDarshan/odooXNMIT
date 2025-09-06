const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create order from cart
router.post('/checkout', authenticateToken, [
  body('shippingAddress').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress } = req.body;
    const userId = req.user.id;

    // Get cart items with product details
    const [cartItems] = await connection.execute(`
      SELECT 
        ci.*,
        p.price,
        p.quantity as available_quantity,
        p.seller_id,
        p.title
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = TRUE
    `, [userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify all items are still available
    for (const item of cartItems) {
      if (item.quantity > item.available_quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${item.title}. Only ${item.available_quantity} available`
        });
      }

      // Check if user is trying to buy their own product
      if (item.seller_id === userId) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cannot purchase your own products'
        });
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, shippingAddress || null, 'pending']
    );

    const orderId = orderResult.insertId;

    // Create order items and update product quantities
    for (const item of cartItems) {
      // Add order item
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Update product quantity
      await connection.execute(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Set product as inactive if quantity becomes 0
      await connection.execute(
        'UPDATE products SET is_active = FALSE WHERE id = ? AND quantity <= 0',
        [item.product_id]
      );
    }

    // Clear cart
    await connection.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    // For demo purposes, immediately complete the order
    // In a real app, this would happen after payment processing
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['completed', orderId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: 'completed',
        itemCount: cartItems.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Checkout failed'
    });
  } finally {
    connection.release();
  }
});

// Get user's purchase history
router.get('/history', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'completed', 'cancelled'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let whereConditions = ['o.user_id = ?'];
    let queryParams = [userId];

    // Status filter
    if (req.query.status) {
      whereConditions.push('o.status = ?');
      queryParams.push(req.query.status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get orders with items
    const [orders] = await db.execute(`
      SELECT DISTINCT
        o.id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        o.updated_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get order items for each order
    const orderIds = orders.map(order => order.id);
    let orderItems = [];

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      const [items] = await db.execute(`
        SELECT 
          oi.*,
          p.title,
          p.image_url,
          p.condition_type,
          c.name as category_name,
          u.display_name as seller_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE oi.order_id IN (${placeholders})
        ORDER BY oi.order_id, oi.id
      `, orderIds);

      orderItems = items;
    }

    // Group items by order
    const formattedOrders = orders.map(order => ({
      id: order.id,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: orderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          id: item.id,
          product: {
            id: item.product_id,
            title: item.title,
            imageUrl: item.image_url,
            category: item.category_name,
            condition: item.condition_type,
            seller: {
              name: item.seller_name
            }
          },
          quantity: item.quantity,
          priceAtPurchase: parseFloat(item.price_at_purchase)
        }))
    }));

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `, queryParams);

    const totalOrders = countResult[0].total;
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase history'
    });
  }
});

// Get single order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Get order
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.execute(`
      SELECT 
        oi.*,
        p.title,
        p.description,
        p.image_url,
        p.condition_type,
        c.name as category_name,
        u.display_name as seller_name,
        u.profile_image as seller_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE oi.order_id = ?
    `, [orderId]);

    const formattedOrder = {
      id: order.id,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: items.map(item => ({
        id: item.id,
        product: {
          id: item.product_id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          category: item.category_name,
          condition: item.condition_type,
          seller: {
            name: item.seller_name,
            image: item.seller_image
          }
        },
        quantity: item.quantity,
        priceAtPurchase: parseFloat(item.price_at_purchase)
      }))
    };

    res.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Cancel order
router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = req.params.orderId;
    const userId = req.user.id;

    // Get order and verify ownership
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (order.status === 'completed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed order'
      });
    }

    if (order.status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Get order items to restore product quantities
    const [orderItems] = await connection.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Restore product quantities
    for (const item of orderItems) {
      await connection.execute(
        'UPDATE products SET quantity = quantity + ?, is_active = TRUE WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Update order status to cancelled
    await connection.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', orderId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Order has been cancelled successfully',
      data: {
        orderId: parseInt(orderId),
        status: 'cancelled'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  } finally {
    connection.release();
  }
});

// Seller analytics
router.get('/seller/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a seller (has products)
    const [sellerCheck] = await db.execute(
      'SELECT COUNT(*) as product_count FROM products WHERE seller_id = ?',
      [userId]
    );

    if (sellerCheck[0].product_count === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a seller to view analytics'
      });
    }

    // Get analytics data
    const [analytics] = await db.execute(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `, [userId]);

    const data = analytics[0];

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(data.total_orders),
        totalRevenue: parseFloat(data.total_revenue),
        pendingOrders: parseInt(data.pending_orders),
        completedOrders: parseInt(data.completed_orders),
        cancelledOrders: parseInt(data.cancelled_orders)
      }
    });

  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller analytics'
    });
  }
});

module.exports = router;