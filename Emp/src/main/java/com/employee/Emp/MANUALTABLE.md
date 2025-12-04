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