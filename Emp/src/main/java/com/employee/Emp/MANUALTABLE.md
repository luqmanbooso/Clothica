-- For carts table
CREATE TABLE carts (
id BIGINT NOT NULL AUTO_INCREMENT,
created_at DATETIME,
total_amount FLOAT NOT NULL,
user_id INT NOT NULL,
PRIMARY KEY (id),
UNIQUE KEY UK64t7ox312pqal3p7fg9o503c2 (user_id)
) ENGINE=InnoDB;

-- For orders table  
CREATE TABLE orders (
id BIGINT NOT NULL AUTO_INCREMENT,
order_date DATETIME,
order_number VARCHAR(255),
payment_status VARCHAR(255),
status VARCHAR(255),
total_amount FLOAT,
user_id INT NOT NULL,
PRIMARY KEY (id),
UNIQUE KEY UKnthkiu7pgmnqnu86i2jyoe2v7 (order_number)
) ENGINE=InnoDB;

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,           -- reduced length to stay under 767 bytes
    password VARCHAR(255) NOT NULL,
    roles VARCHAR(100) NOT NULL DEFAULT 'ROLE_USER',
    phone VARCHAR(10) NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Shorten the index: only index first 150 chars of email (more than enough)
    UNIQUE KEY uk_users_email (email(150)),
    
    CONSTRAINT chk_phone_format 
        CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;