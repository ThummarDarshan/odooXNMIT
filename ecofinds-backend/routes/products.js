const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/products';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products with filtering and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('condition').optional().isIn(['New', 'Like New', 'Used']).withMessage('Invalid condition'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['newest', 'oldest', 'price-low', 'price-high', 'sustainability']),
  query('isEcoFriendly').optional().isBoolean()
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
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['p.is_active = TRUE'];
    let queryParams = [];

    // Category filter
    if (req.query.category && req.query.category !== 'All Categories') {
      whereConditions.push('c.name = ?');
      queryParams.push(req.query.category);
    }

    // Condition filter
    if (req.query.condition && req.query.condition !== 'All Conditions') {
      whereConditions.push('p.condition_type = ?');
      queryParams.push(req.query.condition);
    }

    // Price range filter
    if (req.query.minPrice) {
      whereConditions.push('p.price >= ?');
      queryParams.push(parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      whereConditions.push('p.price <= ?');
      queryParams.push(parseFloat(req.query.maxPrice));
    }

    // Search filter
    if (req.query.search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Eco-friendly filter
    if (req.query.isEcoFriendly === 'true') {
      whereConditions.push('p.is_eco_friendly = TRUE');
    }

    // Build ORDER BY clause
    let orderBy = 'p.created_at DESC'; // default: newest first
    switch (req.query.sortBy) {
      case 'oldest':
        orderBy = 'p.created_at ASC';
        break;
      case 'price-low':
        orderBy = 'p.price ASC';
        break;
      case 'price-high':
        orderBy = 'p.price DESC';
        break;
      case 'sustainability':
        orderBy = 'p.sustainability_score DESC';
        break;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get products with pagination
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        u.display_name as seller_name,
        u.is_verified as seller_verified,
        COALESCE(AVG(r.rating), 4.5) as seller_rating,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      LEFT JOIN (
        SELECT seller_id, AVG(rating) as rating 
        FROM reviews GROUP BY seller_id
      ) r ON u.id = r.seller_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [products] = await db.execute(productsQuery, [...queryParams, limit, offset]);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, queryParams);
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    // Format response
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category_name,
      condition: product.condition_type,
      imageUrl: product.primary_image || product.image_url,
      seller: {
        id: product.seller_id,
        name: product.seller_name,
        rating: parseFloat(product.seller_rating),
        isVerified: Boolean(product.seller_verified)
      },
      year: product.year_manufactured,
      brand: product.brand,
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      hasWarranty: Boolean(product.has_warranty),
      hasManual: Boolean(product.has_manual),
      quantity: product.quantity,
      isEcoFriendly: Boolean(product.is_eco_friendly),
      sustainabilityScore: product.sustainability_score,
      createdAt: product.created_at
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await db.execute(`
      SELECT 
        p.*,
        c.name as category_name,
        u.display_name as seller_name,
        u.profile_image as seller_image,
        u.is_verified as seller_verified,
        COALESCE(AVG(r.rating), 4.5) as seller_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN (
        SELECT seller_id, AVG(rating) as rating 
        FROM reviews GROUP BY seller_id
      ) r ON u.id = r.seller_id
      WHERE p.id = ? AND p.is_active = TRUE
      GROUP BY p.id
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Get product images
    const [images] = await db.execute(
      'SELECT image_url, is_primary, display_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
      [productId]
    );

    // Check if user has this in wishlist (if authenticated)
    let inWishlist = false;
    if (req.user) {
      const [wishlistCheck] = await db.execute(
        'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      );
      inWishlist = wishlistCheck.length > 0;
    }

    const formattedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category_name,
      condition: product.condition_type,
      imageUrl: product.image_url,
      images: images.map(img => ({
        url: img.image_url,
        isPrimary: Boolean(img.is_primary),
        order: img.display_order
      })),
      seller: {
        id: product.seller_id,
        name: product.seller_name,
        image: product.seller_image,
        rating: parseFloat(product.seller_rating),
        isVerified: Boolean(product.seller_verified)
      },
      year: product.year_manufactured,
      brand: product.brand,
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      hasWarranty: Boolean(product.has_warranty),
      hasManual: Boolean(product.has_manual),
      quantity: product.quantity,
      isEcoFriendly: Boolean(product.is_eco_friendly),
      sustainabilityScore: product.sustainability_score,
      inWishlist,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    res.json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('condition').isIn(['New', 'Like New', 'Used']).withMessage('Invalid condition'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('dimensions').optional().trim().isLength({ max: 100 }),
  body('weight').optional().trim().isLength({ max: 50 }),
  body('material').optional().trim().isLength({ max: 100 }),
  body('hasWarranty').optional().isBoolean(),
  body('hasManual').optional().isBoolean(),
  body('isEcoFriendly').optional().isBoolean(),
  body('sustainabilityScore').optional().isInt({ min: 1, max: 100 })
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

    const {
      title, description, price, categoryId, condition, quantity = 1,
      year, brand, dimensions, weight, material,
      hasWarranty = false, hasManual = false, isEcoFriendly = false,
      sustainabilityScore
    } = req.body;

    // Verify category exists
    const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Insert product
    const [result] = await db.execute(`
      INSERT INTO products (
        title, description, price, category_id, condition_type, seller_id,
        year_manufactured, brand, dimensions, weight, material,
        has_warranty, has_manual, quantity, is_eco_friendly, sustainability_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, price, categoryId, condition, req.user.id,
      year || null, brand || null, dimensions || null, weight || null, material || null,
      hasWarranty, hasManual, quantity, isEcoFriendly, sustainabilityScore || null
    ]);

    const productId = result.insertId;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageInserts = req.files.map((file, index) => [
        productId,
        `/uploads/products/${file.filename}`,
        index === 0, // First image is primary
        index
      ]);

      await db.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ?',
        [imageInserts]
      );

      // Set primary image on product
      await db.execute(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [`/uploads/products/${req.files[0].filename}`, productId]
      );
    }

    // Get the created product
    const [newProduct] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct[0].id,
        title: newProduct[0].title,
        price: parseFloat(newProduct[0].price),
        category: newProduct[0].category_name,
        imageUrl: newProduct[0].image_url
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Get user's products (my listings)
router.get('/user/listings', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().trim(),
  query('sortBy').optional().isIn(['newest', 'oldest', 'price-low', 'price-high'])
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
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let whereConditions = ['p.seller_id = ?'];
    let queryParams = [userId];

    // Category filter
    if (req.query.category && req.query.category !== 'All Categories') {
      whereConditions.push('c.name = ?');
      queryParams.push(req.query.category);
    }

    // Build ORDER BY clause
    let orderBy = 'p.created_at DESC';
    switch (req.query.sortBy) {
      case 'oldest':
        orderBy = 'p.created_at ASC';
        break;
      case 'price-low':
        orderBy = 'p.price ASC';
        break;
      case 'price-high':
        orderBy = 'p.price DESC';
        break;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get user's products
    const [products] = await db.execute(`
      SELECT 
        p.*,
        c.name as category_name,
        COUNT(oi.id) as total_sales
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `, queryParams);

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category_name,
      condition: product.condition_type,
      imageUrl: product.image_url,
      quantity: product.quantity,
      isActive: Boolean(product.is_active),
      isEcoFriendly: Boolean(product.is_eco_friendly),
      sustainabilityScore: product.sustainability_score,
      totalSales: product.total_sales,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user listings'
    });
  }
});

// Update product
router.put('/:id', authenticateToken, upload.array('images', 5), [
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('price').optional().isFloat({ min: 0.01 }),
  body('condition').optional().isIn(['New', 'Like New', 'Used']),
  body('quantity').optional().isInt({ min: 1 }),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('dimensions').optional().trim().isLength({ max: 100 }),
  body('weight').optional().trim().isLength({ max: 50 }),
  body('material').optional().trim().isLength({ max: 100 }),
  body('hasWarranty').optional().isBoolean(),
  body('hasManual').optional().isBoolean(),
  body('isEcoFriendly').optional().isBoolean(),
  body('sustainabilityScore').optional().isInt({ min: 1, max: 100 })
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

    const productId = req.params.id;
    const userId = req.user.id;

    // Verify product exists and belongs to user
    const [products] = await db.execute(
      'SELECT id FROM products WHERE id = ? AND seller_id = ?',
      [productId, userId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not authorized'
      });
    }

    const allowedFields = [
      'title', 'description', 'price', 'condition_type', 'quantity',
      'year_manufactured', 'brand', 'dimensions', 'weight', 'material',
      'has_warranty', 'has_manual', 'is_eco_friendly', 'sustainability_score'
    ];

    const updates = {};
    const fieldMapping = {
      condition: 'condition_type',
      year: 'year_manufactured',
      hasWarranty: 'has_warranty',
      hasManual: 'has_manual',
      isEcoFriendly: 'is_eco_friendly',
      sustainabilityScore: 'sustainability_score'
    };

    // Build update object
    Object.keys(req.body).forEach(key => {
      const dbField = fieldMapping[key] || key;
      if (allowedFields.includes(dbField) && req.body[key] !== undefined) {
        updates[dbField] = req.body[key];
      }
    });

    if (Object.keys(updates).length > 0) {
      const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const updateValues = Object.values(updates);

      await db.execute(
        `UPDATE products SET ${updateFields} WHERE id = ?`,
        [...updateValues, productId]
      );
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Get current image count
      const [currentImages] = await db.execute(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?',
        [productId]
      );

      const startOrder = currentImages[0].count;

      const imageInserts = req.files.map((file, index) => [
        productId,
        `/uploads/products/${file.filename}`,
        startOrder === 0 && index === 0, // First image is primary if no existing images
        startOrder + index
      ]);

      await db.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ?',
        [imageInserts]
      );

      // Update primary image if this is the first image
      if (startOrder === 0) {
        await db.execute(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [`/uploads/products/${req.files[0].filename}`, productId]
        );
      }
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Verify product exists and belongs to user
    const [products] = await db.execute(
      'SELECT id FROM products WHERE id = ? AND seller_id = ?',
      [productId, userId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not authorized'
      });
    }

    // Check if product has pending orders
    const [pendingOrders] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM order_items oi 
      JOIN orders o ON oi.order_id = o.id 
      WHERE oi.product_id = ? AND o.status = 'pending'
    `, [productId]);

    if (pendingOrders[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with pending orders'
      });
    }

    // Soft delete (set as inactive)
    await db.execute(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [productId]
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT id, name, description FROM categories ORDER BY name ASC'
    );

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Add to wishlist
router.post('/:id/wishlist', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Check if product exists
    const [products] = await db.execute(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add to wishlist (ignore if already exists)
    await db.execute(
      'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Product added to wishlist'
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
});

// Remove from wishlist
router.delete('/:id/wishlist', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    await db.execute(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

router.get('/user/wishlist', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const [products] = await db.execute(`
      SELECT 
        p.*,
        c.name as category_name,
        u.display_name as seller_name,
        u.is_verified as seller_verified,
        w.created_at as added_to_wishlist
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE w.user_id = ? AND p.is_active = TRUE
      ORDER BY w.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // Get total count
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id = ? AND p.is_active = TRUE',
      [userId]
    );

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category_name,
      condition: product.condition_type,
      imageUrl: product.image_url,
      seller: {
        id: product.seller_id,
        name: product.seller_name,
        isVerified: Boolean(product.seller_verified)
      },
      addedToWishlist: product.added_to_wishlist
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
});

module.exports = router;