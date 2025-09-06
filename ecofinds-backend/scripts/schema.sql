-- =====================================================
-- EcoFinds Database Schema
-- Based on the existing initDatabase.js structure
-- Updated with OAuth support and email functionality
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `ecofinds` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `ecofinds`;

-- Drop existing tables if they exist (in correct order to handle foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- USERS TABLE (Updated with OAuth support)
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `display_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `password_hash` VARCHAR(255),
  `profile_image` VARCHAR(255),
  `github_id` VARCHAR(100) UNIQUE,
  `google_id` VARCHAR(100) UNIQUE,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX `idx_email` (`email`),
  INDEX `idx_github` (`github_id`),
  INDEX `idx_google` (`google_id`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `category_id` INT,
  `condition_type` ENUM('New', 'Like New', 'Used') NOT NULL,
  `image_url` VARCHAR(255),
  `seller_id` INT NOT NULL,
  `year_manufactured` INT,
  `brand` VARCHAR(100),
  `dimensions` VARCHAR(100),
  `weight` VARCHAR(50),
  `material` VARCHAR(100),
  `has_warranty` BOOLEAN DEFAULT FALSE,
  `has_manual` BOOLEAN DEFAULT FALSE,
  `quantity` INT DEFAULT 1,
  `is_eco_friendly` BOOLEAN DEFAULT FALSE,
  `sustainability_score` INT CHECK (`sustainability_score` >= 1 AND `sustainability_score` <= 100),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_category` (`category_id`),
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_price` (`price`),
  INDEX `idx_eco` (`is_eco_friendly`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_product` (`product_id`),
  INDEX `idx_primary` (`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `shipping_address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_purchase` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_order` (`order_id`),
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `seller_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `order_id` INT,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_buyer` (`buyer_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DEFAULT CATEGORIES
-- =====================================================
INSERT IGNORE INTO `categories` (`name`, `description`) VALUES
('Electronics', 'Computers, phones, gadgets, and electronic devices'),
('Furniture', 'Home and office furniture, decor items'),
('Clothing', 'Apparel, shoes, and fashion accessories'),
('Books', 'Books, magazines, and educational materials'),
('Sports & Recreation', 'Sports equipment, outdoor gear, fitness items'),
('Tools & Equipment', 'Hand tools, power tools, machinery'),
('Automotive', 'Car parts, accessories, and automotive equipment'),
('Home & Garden', 'Household items, gardening tools, appliances'),
('Art & Collectibles', 'Artwork, antiques, collectible items'),
('Musical Instruments', 'Guitars, keyboards, audio equipment');

-- =====================================================
-- CREATE A SAMPLE ADMIN USER FOR TESTING
-- Password: admin123 (bcrypt hashed)
-- =====================================================
INSERT IGNORE INTO `users` (
  `display_name`, 
  `email`, 
  `password_hash`, 
  `is_verified`, 
  `created_at`
) VALUES (
  'Admin User', 
  'admin@ecofinds.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/TgEpRd.6xVAJK9d3O', 
  TRUE, 
  NOW()
);

-- =====================================================
-- CREATE SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Sample verified users for testing
INSERT IGNORE INTO `users` (
  `display_name`, 
  `email`, 
  `password_hash`, 
  `is_verified`, 
  `created_at`
) VALUES 
('John Seller', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/TgEpRd.6xVAJK9d3O', TRUE, NOW()),
('Sarah Green', 'sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/TgEpRd.6xVAJK9d3O', TRUE, NOW()),
('Mike Tech', 'mike@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/TgEpRd.6xVAJK9d3O', TRUE, NOW());

-- Sample OAuth user (GitHub)
INSERT IGNORE INTO `users` (
  `display_name`, 
  `email`, 
  `github_id`, 
  `is_verified`, 
  `created_at`
) VALUES (
  'GitHub User', 
  'github@example.com', 
  '12345678', 
  TRUE, 
  NOW()
);

-- Sample OAuth user (Google)
INSERT IGNORE INTO `users` (
  `display_name`, 
  `email`, 
  `google_id`, 
  `is_verified`, 
  `created_at`
) VALUES (
  'Google User', 
  'google@example.com', 
  '87654321', 
  TRUE, 
  NOW()
);

-- Sample products for testing
INSERT IGNORE INTO `products` (
  `title`, 
  `description`, 
  `price`, 
  `category_id`, 
  `condition_type`, 
  `seller_id`, 
  `brand`, 
  `is_eco_friendly`, 
  `sustainability_score`, 
  `quantity`
) VALUES 
(
  'MacBook Pro 2019 13-inch', 
  'Excellent condition MacBook Pro with 16GB RAM and 512GB SSD. Barely used, comes with original charger and box. Perfect for students and professionals.',
  1299.99, 
  1, 
  'Like New', 
  2, 
  'Apple', 
  TRUE, 
  85, 
  1
),
(
  'Vintage Leather Sofa', 
  'Beautiful vintage leather sofa in great condition. Perfect for eco-conscious buyers looking for quality furniture that will last for decades.',
  899.00, 
  2, 
  'Used', 
  2, 
  'Unknown', 
  TRUE, 
  90, 
  1
),
(
  'iPhone 13 128GB', 
  'iPhone 13 in good condition, minor scratches on back but screen is perfect. Battery health 89%. Includes charger.',
  599.99, 
  1, 
  'Used', 
  3, 
  'Apple', 
  FALSE, 
  65, 
  1
),
(
  'Organic Cotton T-Shirts Pack', 
  'Pack of 3 organic cotton t-shirts, size M. Never worn, eco-friendly material. Perfect for sustainable fashion lovers.',
  45.00, 
  3, 
  'New', 
  3, 
  'EcoWear', 
  TRUE, 
  95, 
  5
),
(
  'Mountain Bike Trek 2020', 
  'Well-maintained Trek mountain bike, great for outdoor adventures. Recently serviced, new tires.',
  750.00, 
  5, 
  'Used', 
  4, 
  'Trek', 
  TRUE, 
  80, 
  1
),
(
  'Programming Books Collection', 
  'Collection of 10 programming books including JavaScript, Python, and React. Great condition, some highlighting.',
  120.00, 
  4, 
  'Used', 
  5, 
  'Various', 
  TRUE, 
  70, 
  1
);

-- Sample product images
INSERT IGNORE INTO `product_images` (
  `product_id`, 
  `image_url`, 
  `is_primary`, 
  `display_order`
) VALUES 
(1, '/uploads/products/sample-macbook-1.jpg', TRUE, 0),
(1, '/uploads/products/sample-macbook-2.jpg', FALSE, 1),
(2, '/uploads/products/sample-sofa-1.jpg', TRUE, 0),
(3, '/uploads/products/sample-iphone-1.jpg', TRUE, 0),
(4, '/uploads/products/sample-tshirts-1.jpg', TRUE, 0),
(5, '/uploads/products/sample-bike-1.jpg', TRUE, 0),
(6, '/uploads/products/sample-books-1.jpg', TRUE, 0);

-- Update products with primary images
UPDATE `products` SET `image_url` = '/uploads/products/sample-macbook-1.jpg' WHERE `id` = 1;
UPDATE `products` SET `image_url` = '/uploads/products/sample-sofa-1.jpg' WHERE `id` = 2;
UPDATE `products` SET `image_url` = '/uploads/products/sample-iphone-1.jpg' WHERE `id` = 3;
UPDATE `products` SET `image_url` = '/uploads/products/sample-tshirts-1.jpg' WHERE `id` = 4;
UPDATE `products` SET `image_url` = '/uploads/products/sample-bike-1.jpg' WHERE `id` = 5;
UPDATE `products` SET `image_url` = '/uploads/products/sample-books-1.jpg' WHERE `id` = 6;

-- Sample wishlist items
INSERT IGNORE INTO `wishlists` (`user_id`, `product_id`) VALUES 
(1, 2),
(1, 4),
(2, 1),
(3, 5);

-- Sample cart items
INSERT IGNORE INTO `cart_items` (`user_id`, `product_id`, `quantity`) VALUES 
(1, 3, 1),
(2, 4, 2);

-- Sample reviews
INSERT IGNORE INTO `reviews` (
  `seller_id`, 
  `buyer_id`, 
  `rating`, 
  `comment`
) VALUES 
(2, 1, 5, 'Excellent seller, fast shipping and product exactly as described!'),
(3, 1, 4, 'Good communication, product in great condition.'),
(2, 3, 5, 'Amazing quality, would buy again!');

-- =====================================================
-- USEFUL VIEWS FOR THE APPLICATION
-- =====================================================

-- View for active products with seller information
CREATE OR REPLACE VIEW `active_products_view` AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.condition_type,
    p.image_url,
    p.is_eco_friendly,
    p.sustainability_score,
    p.quantity,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    u.display_name as seller_name,
    u.is_verified as seller_verified,
    u.profile_image as seller_image,
    AVG(r.rating) as seller_rating,
    COUNT(r.id) as review_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN reviews r ON u.id = r.seller_id
WHERE p.is_active = TRUE AND p.quantity > 0
GROUP BY p.id;

-- View for user statistics
CREATE OR REPLACE VIEW `user_stats_view` AS
SELECT 
    u.id as user_id,
    u.display_name,
    u.email,
    u.is_verified,
    u.created_at as joined_date,
    COUNT(DISTINCT p.id) as total_products_listed,
    COUNT(DISTINCT CASE WHEN p.is_active = TRUE THEN p.id END) as active_products,
    COUNT(DISTINCT o.id) as total_purchases,
    COALESCE(SUM(DISTINCT o.total_amount), 0) as total_spent,
    COUNT(DISTINCT w.id) as wishlist_items,
    AVG(r.rating) as seller_rating,
    COUNT(DISTINCT r.id) as review_count
FROM users u
LEFT JOIN products p ON u.id = p.seller_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
LEFT JOIN wishlists w ON u.id = w.user_id
LEFT JOIN reviews r ON u.id = r.seller_id
GROUP BY u.id;

-- =====================================================
-- SHOW COMPLETION MESSAGE
-- =====================================================
SELECT 'EcoFinds Database Setup Completed Successfully!' as message;
SELECT 
    TABLE_NAME as 'Table', 
    TABLE_ROWS as 'Rows'
FROM information_schema.tables 
WHERE table_schema = 'ecofinds' 
    AND table_type = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- =====================================================
-- SUMMARY OF WHAT WAS CREATED
-- =====================================================
/*
TABLES CREATED:
✅ users - User accounts with OAuth support (GitHub, Google)
✅ categories - Product categories
✅ products - Product listings with sustainability features
✅ product_images - Multiple images per product
✅ cart_items - Shopping cart functionality
✅ orders - Order management
✅ order_items - Order line items
✅ wishlists - User wishlist functionality
✅ reviews - Product/seller review system

FEATURES INCLUDED:
✅ OAuth support for GitHub and Google
✅ Email nullable for OAuth users
✅ Password nullable for OAuth users
✅ Sample admin user (admin@ecofinds.com / admin123)
✅ Sample test data for development
✅ Proper foreign keys and constraints
✅ Performance indexes
✅ Useful views for common queries
✅ Default categories
✅ Sample products with sustainability scores

OAUTH USERS FOR TESTING:
- admin@ecofinds.com (Password: admin123)
- john@example.com (Password: admin123)
- sarah@example.com (Password: admin123)
- mike@example.com (Password: admin123)
- github@example.com (OAuth - GitHub ID: 12345678)
- google@example.com (OAuth - Google ID: 87654321)

NEXT STEPS:
1. Run this schema.sql in your MySQL database
2. Install the new npm packages for OAuth and email
3. Create the services/emailService.js file
4. Create the config/passport.js file
5. Update your existing route files
6. Update your server.js file
7. Test the OAuth flows with your frontend

The database is now ready for your EcoFinds application with full OAuth and email support!
*/