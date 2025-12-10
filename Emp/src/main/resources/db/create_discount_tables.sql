-- =====================================================
-- Discount System Tables for Clothica
-- Run this script in your MySQL database
-- =====================================================

-- 1. Main discount table (parent table for inheritance)
CREATE TABLE IF NOT EXISTS discount (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_type VARCHAR(31) NOT NULL,  -- Discriminator column (COUPON, BULK_DISCOUNT, PROMOTION)
    name VARCHAR(255),
    code VARCHAR(255),
    description TEXT,
    target VARCHAR(50),                   -- PRODUCT, CATEGORY, CART, SHIPPING
    value_type VARCHAR(50),               -- PERCENTAGE, FIXED_AMOUNT
    discount_value DECIMAL(19,2),
    start_date DATETIME,
    end_date DATETIME,
    max_uses INT,
    uses_count INT DEFAULT 0,
    max_uses_per_customer INT,
    minimum_cart_value DECIMAL(19,2),
    maximum_discount_amount DECIMAL(19,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_stackable BOOLEAN DEFAULT FALSE,
    is_exclusive BOOLEAN DEFAULT FALSE,
    INDEX idx_discount_code (code),
    INDEX idx_discount_active (is_active),
    INDEX idx_discount_dates (start_date, end_date)
);

-- 2. Coupon table (extends discount)
CREATE TABLE IF NOT EXISTS coupon (
    id BIGINT PRIMARY KEY,
    coupon_code VARCHAR(255),
    is_single_use BOOLEAN DEFAULT FALSE,
    is_first_order_only BOOLEAN DEFAULT FALSE,
    customer_email VARCHAR(255),
    FOREIGN KEY (id) REFERENCES discount(id) ON DELETE CASCADE
);

-- 3. Bulk discount table (extends discount)
CREATE TABLE IF NOT EXISTS bulk_discount (
    id BIGINT PRIMARY KEY,
    minimum_quantity INT,
    product_id BIGINT,
    FOREIGN KEY (id) REFERENCES discount(id) ON DELETE CASCADE
);

-- 4. Promotion table (extends discount)
CREATE TABLE IF NOT EXISTS promotion (
    id BIGINT PRIMARY KEY,
    auto_apply BOOLEAN DEFAULT FALSE,
    promotion_banner_text VARCHAR(500),
    promotion_image_url VARCHAR(500),
    FOREIGN KEY (id) REFERENCES discount(id) ON DELETE CASCADE
);

-- 5. Join table for excluded products
CREATE TABLE IF NOT EXISTS discount_excluded_products (
    discount_id BIGINT NOT NULL,
    excluded_products_id BIGINT NOT NULL,
    PRIMARY KEY (discount_id, excluded_products_id),
    FOREIGN KEY (discount_id) REFERENCES discount(id) ON DELETE CASCADE,
    FOREIGN KEY (excluded_products_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Join table for excluded categories
CREATE TABLE IF NOT EXISTS discount_excluded_categories (
    discount_id BIGINT NOT NULL,
    excluded_categories_id BIGINT NOT NULL,
    PRIMARY KEY (discount_id, excluded_categories_id),
    FOREIGN KEY (discount_id) REFERENCES discount(id) ON DELETE CASCADE,
    FOREIGN KEY (excluded_categories_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =====================================================
-- Sample data for testing
-- =====================================================

-- Insert a sample coupon discount
INSERT INTO discount (discount_type, name, code, description, target, value_type, discount_value, start_date, end_date, is_active, is_stackable)
VALUES ('COUPON', 'Summer Sale 20%', 'SUMMER20', '20% off on all orders', 'CART', 'PERCENTAGE', 20.00, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE, FALSE);

INSERT INTO coupon (id, coupon_code, is_single_use, is_first_order_only)
SELECT id, 'SUMMER20', FALSE, FALSE FROM discount WHERE code = 'SUMMER20';

-- Insert a fixed amount discount
INSERT INTO discount (discount_type, name, code, description, target, value_type, discount_value, start_date, end_date, minimum_cart_value, is_active)
VALUES ('COUPON', '$10 Off Order', 'SAVE10', 'Save $10 on orders over $50', 'CART', 'FIXED_AMOUNT', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 50.00, TRUE);

INSERT INTO coupon (id, coupon_code, is_single_use)
SELECT id, 'SAVE10', FALSE FROM discount WHERE code = 'SAVE10';

-- Insert a bulk discount
INSERT INTO discount (discount_type, name, code, description, target, value_type, discount_value, start_date, end_date, is_active)
VALUES ('BULK_DISCOUNT', 'Buy 3 Get 15% Off', 'BULK15', '15% off when you buy 3 or more items', 'CART', 'PERCENTAGE', 15.00, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), TRUE);

INSERT INTO bulk_discount (id, minimum_quantity)
SELECT id, 3 FROM discount WHERE code = 'BULK15';

-- =====================================================
-- Verify tables created
-- =====================================================
-- SELECT * FROM discount;
-- SELECT * FROM coupon;
-- SELECT * FROM bulk_discount;
