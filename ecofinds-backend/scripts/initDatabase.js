const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Create connection without selecting a database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ecofinds'}\``);
    console.log(`✅ Database '${process.env.DB_NAME || 'ecofinds'}' created/verified`);

    // Use the database
    await connection.execute(`USE \`${process.env.DB_NAME || 'ecofinds'}\``);

    // Create tables
    console.log('📝 Creating tables...');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        display_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ Users table created');

    // Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ Categories table created');

    // Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT,
        condition_type ENUM('New', 'Like New', 'Used') NOT NULL,
        image_url VARCHAR(255),
        seller_id INT NOT NULL,
        year_manufactured INT,
        brand VARCHAR(100),
        dimensions VARCHAR(100),
        weight VARCHAR(50),
        material VARCHAR(100),
        has_warranty BOOLEAN DEFAULT FALSE,
        has_manual BOOLEAN DEFAULT FALSE,
        quantity INT DEFAULT 1,
        is_eco_friendly BOOLEAN DEFAULT FALSE,
        sustainability_score INT CHECK (sustainability_score >= 1 AND sustainability_score <= 100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_category (category_id),
        INDEX idx_seller (seller_id),
        INDEX idx_active (is_active),
        INDEX idx_price (price),
        INDEX idx_eco (is_eco_friendly)
      )
    `);
    console.log('  ✅ Products table created');

    // Product Images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_primary (is_primary)
      )
    `);
    console.log('  ✅ Product Images table created');

    // Cart Items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user (user_id)
      )
    `);
    console.log('  ✅ Cart Items table created');

    // Orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_status (status)
      )
    `);
    console.log('  ✅ Orders table created');

    // Order Items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_product (product_id)
      )
    `);
    console.log('  ✅ Order Items table created');

    // Wishlists table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user (user_id)
      )
    `);
    console.log('  ✅ Wishlists table created');

    // Reviews table (for future use)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seller_id INT NOT NULL,
        buyer_id INT NOT NULL,
        order_id INT,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        INDEX idx_seller (seller_id),
        INDEX idx_buyer (buyer_id),
        INDEX idx_rating (rating)
      )
    `);
    console.log('  ✅ Reviews table created');

    // Insert default categories
    console.log('📝 Inserting default categories...');
    const categories = [
      ['Electronics', 'Computers, phones, gadgets, and electronic devices'],
      ['Furniture', 'Home and office furniture, decor items'],
      ['Clothing', 'Apparel, shoes, and fashion accessories'],
      ['Books', 'Books, magazines, and educational materials'],
      ['Sports & Recreation', 'Sports equipment, outdoor gear, fitness items'],
      ['Tools & Equipment', 'Hand tools, power tools, machinery'],
      ['Automotive', 'Car parts, accessories, and automotive equipment'],
      ['Home & Garden', 'Household items, gardening tools, appliances'],
      ['Art & Collectibles', 'Artwork, antiques, collectible items'],
      ['Musical Instruments', 'Guitars, keyboards, audio equipment']
    ];

    for (const [name, description] of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
    }
    console.log('  ✅ Default categories inserted');

    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  - Database created/verified');
    console.log('  - All tables created with proper indexes and foreign keys');
    console.log('  - Default categories inserted');
    console.log('');
    console.log('🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('  1. Ensure XAMPP MySQL is running');
    console.error('  2. Check your .env file database credentials');
    console.error('  3. Verify MySQL is accessible on the configured port');
    console.error('  4. Check MySQL user permissions');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the initialization
initDatabase();