-- =====================================================
-- Banner and Event Tables for Clothica
-- Run this script in your MySQL database
-- =====================================================

-- 1. Events table (for promotional events)
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    discount_percentage DOUBLE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_events_active (is_active),
    INDEX idx_events_dates (start_date, end_date)
);

-- 2. Banners table
CREATE TABLE IF NOT EXISTS banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(500),
    image VARCHAR(1000),
    position VARCHAR(50) NOT NULL DEFAULT 'hero',
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME,
    end_date DATETIME,
    cta_text VARCHAR(100),
    cta_link VARCHAR(500),
    cta_target VARCHAR(20) DEFAULT '_self',
    display_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    event_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    INDEX idx_banners_active (is_active),
    INDEX idx_banners_position (position),
    INDEX idx_banners_dates (start_date, end_date),
    INDEX idx_banners_priority (priority DESC)
);

-- =====================================================
-- Sample Data
-- =====================================================

-- Insert sample events
INSERT INTO events (name, description, type, start_date, end_date, is_active, discount_percentage) VALUES
('Winter Sale 2024', 'End of year clearance sale', 'sale', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 25.0),
('New Year Collection', 'Fresh arrivals for the new year', 'promotion', NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE, 15.0);

-- Insert sample banners
INSERT INTO banners (name, title, subtitle, image, position, priority, is_active, start_date, cta_text, cta_link) VALUES
('Hero Winter Sale', 'Winter Sale Up to 50% Off', 'Shop the biggest sale of the season', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', 'hero', 10, TRUE, NOW(), 'Shop Now', '/products?sale=true'),
('New Arrivals Banner', 'New Collection Just Dropped', 'Discover the latest trends', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 'hero', 8, TRUE, NOW(), 'Explore', '/products?new=true'),
('Free Shipping Banner', 'Free Shipping on Orders $50+', 'Limited time offer', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'top', 5, TRUE, NOW(), 'Learn More', '/shipping');

-- Associate first banner with Winter Sale event
UPDATE banners SET event_id = 1 WHERE name = 'Hero Winter Sale';

-- =====================================================
-- Verify tables created
-- =====================================================
-- SELECT * FROM events;
-- SELECT * FROM banners;
