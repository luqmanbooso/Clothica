This will be a follow up of all the apis created so far in order to test 

Cart Operations:

1. GET    /api/cart/user/{userId}          - Get user's cart
2. POST   /api/cart/user/{userId}/add/{productId}?quantity=2  - Add product to cart
3. PUT    /api/cart/user/{userId}/update/{productId}?quantity=3  - Update quantity
4. DELETE /api/cart/user/{userId}/remove/{productId} - Remove item
5. DELETE /api/cart/user/{userId}/clear   - Clear cart

Order Operations:

1. POST   /api/orders/create/{userId}      - Create order from cart
2. GET    /api/orders/{orderId}           - Get order by ID
3. GET    /api/orders/user/{userId}       - Get user's orders
4. PUT    /api/orders/{orderId}/status?status=SHIPPED  - Update status


many structure classes (ex: Order, order item/ Cart,  cart item) but only one main class each for implementation
(ex: Order service, Cart service)

🛒 E-Commerce API - Complete Testing Guide
📋 API Endpoints Testing Sequence

Follow this exact order to test the complete shopping flow:
🔐 1. Authentication & User Setup
1.1 Register a New User
bash

POST http://localhost:8087/api/auth/register
Content-Type: application/json

{
"name": "John Doe",
"username": "johndoe@example.com",
"password": "password123",
"roles": "ROLE_USER"
}

Save the response - you'll get userId (e.g., 1)
1.2 Get JWT Token (Login)
bash

POST http://localhost:8087/api/auth/generatetoken
Content-Type: application/json

{
"username": "johndoe@example.com",
"password": "password123"
}

Save the JWT token - you need it for protected endpoints
🛍️ 2. Product Management (Admin Required)

Add Authorization Header for all admin endpoints:
bash

Authorization: Bearer YOUR_JWT_TOKEN_HERE

2.1 Add Products to Store
bash

# Product 1 - iPhone
POST http://localhost:8087/api/products/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
"name": "iPhone 15 Pro",
"description": "Latest Apple smartphone",
"price": 99999.00,
"stock": 10
}

bash

# Product 2 - AirPods
POST http://localhost:8087/api/products/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
"name": "AirPods Pro",
"description": "Wireless Bluetooth earbuds",
"price": 24999.00,
"stock": 25
}

bash

# Product 3 - MacBook
POST http://localhost:8087/api/products/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
"name": "MacBook Pro",
"description": "Apple laptop",
"price": 199999.00,
"stock": 5
}

2.2 View All Products (Public - No Token Needed)
bash

GET http://localhost:8087/api/products/

Save product IDs from response (e.g., iPhone=1, AirPods=2, MacBook=3)
2.3 View Single Product
bash

GET http://localhost:8087/api/products/1

🛒 3. Cart Operations

Replace {userId} with your actual user ID (from step 1.1)
Replace {productId} with actual product IDs
3.1 Get User's Cart (Automatically creates if doesn't exist)
bash

GET http://localhost:8087/api/cart/user/{userId}

3.2 Add Items to Cart
bash

# Add 2 iPhones to cart
POST http://localhost:8087/api/cart/user/{userId}/add/1?quantity=2

# Add 1 AirPods to cart
POST http://localhost:8087/api/cart/user/{userId}/add/2?quantity=1

# Add 1 MacBook to cart
POST http://localhost:8087/api/cart/user/{userId}/add/3?quantity=1

3.3 View Updated Cart
bash

GET http://localhost:8087/api/cart/user/{userId}

Expected: Cart should show 3 items with total amount
3.4 Update Cart Item Quantity
bash

# Change iPhone quantity from 2 to 1
PUT http://localhost:8087/api/cart/user/{userId}/update/1?quantity=1

3.5 Remove Item from Cart
bash

# Remove MacBook from cart
DELETE http://localhost:8087/api/cart/user/{userId}/remove/3

3.6 View Final Cart Before Checkout
bash

GET http://localhost:8087/api/cart/user/{userId}

Cart should have: 1 iPhone + 1 AirPods
💳 4. Order Processing
4.1 Create Order from Cart
bash

POST http://localhost:8087/api/orders/create/{userId}

Save the order number from response
4.2 Verify Cart is Cleared
bash

GET http://localhost:8087/api/cart/user/{userId}

Expected: Empty cart with total = 0
4.3 Verify Product Stock Reduced
bash

GET http://localhost:8087/api/products/1
GET http://localhost:8087/api/products/2

iPhone stock: Was 10, now should be 9 (10 - 1)
AirPods stock: Was 25, now should be 24 (25 - 1)
4.4 Get Order Details
bash

# By Order ID (from create response)
GET http://localhost:8087/api/orders/{orderId}

# Or by order number
GET http://localhost:8087/api/orders/number/{orderNumber}

4.5 Get All User's Orders
bash

GET http://localhost:8087/api/orders/user/{userId}

4.6 Update Order Status (Admin)
bash

PUT http://localhost:8087/api/orders/{orderId}/status?status=SHIPPED
Authorization: Bearer YOUR_TOKEN

🔄 5. Complete Shopping Flow Test
Test Scenario: Multiple Orders
bash

# Step 1: Add more items to cart
POST /api/cart/user/{userId}/add/1?quantity=3  # Add 3 more iPhones

# Step 2: Check stock available
GET /api/products/1  # Should show 9 in stock

# Step 3: Create second order
POST /api/orders/create/{userId}  # Will reduce iPhone stock to 6

# Step 4: Verify
GET /api/products/1  # Now should show 6 in stock
GET /api/orders/user/{userId}  # Should show 2 orders

🧪 6. Error Scenario Testing
6.1 Try to Over-order (Out of Stock)
bash

# iPhone has only 6 left, try to order 10
POST /api/cart/user/{userId}/add/1?quantity=10
POST /api/orders/create/{userId}

Expected: Error "Not enough stock for product: iPhone 15 Pro"
6.2 Create Order with Empty Cart
bash

# Clear cart first
DELETE /api/cart/user/{userId}/clear

# Try to create order
POST /api/orders/create/{userId}

Expected: Error "Cannot create order with empty cart"
6.3 Negative Quantity
bash

POST /api/cart/user/{userId}/add/1?quantity=-1

Expected: Error "Quantity must be greater than 0"
📊 7. Data Verification Queries

After completing the flow, verify data in your database:
sql

-- Check all tables
SELECT * FROM user_info;
SELECT * FROM product;
SELECT * FROM cart;
SELECT * FROM cart_item;
SELECT * FROM orders;
SELECT * FROM order_item;

-- Verify stock consistency
SELECT
p.name,
p.stock as current_stock,
(SELECT SUM(quantity) FROM order_item oi WHERE oi.product_id = p.id) as total_ordered,
(SELECT COALESCE(SUM(quantity), 0) FROM cart_item ci
JOIN cart c ON ci.cart_id = c.id
WHERE ci.product_id = p.id) as in_carts
FROM product p;

🚀 Quick Test Commands (Copy-Paste Ready)

Replace placeholders and run in sequence:
bash

# 1. Register & Login
POST http://localhost:8087/api/auth/register
{"name":"Test User","username":"test@email.com","password":"test123","roles":"ROLE_USER"}

POST http://localhost:8087/api/auth/generatetoken
{"username":"test@email.com","password":"test123"}

# 2. Add Products (Need Admin Token)
POST http://localhost:8087/api/products/
Authorization: Bearer TOKEN
{"name":"Test Product","description":"Test","price":1000,"stock":50}

# 3. Cart Operations
POST http://localhost:8087/api/cart/user/1/add/1?quantity=2
GET http://localhost:8087/api/cart/user/1

# 4. Create Order
POST http://localhost:8087/api/orders/create/1
GET http://localhost:8087/api/orders/user/1

📝 Testing Checklist

    User registration successful

    JWT token obtained

    Products added to store

    Products visible in GET /products

    Cart created for user

    Items added to cart

    Cart updates correctly

    Order created successfully

    Cart cleared after order

    Product stock reduced

    Order visible in user's orders

    Error handling works (out of stock, empty cart)

⏱️ Expected Response Times

    Authentication: < 500ms

    Product Operations: < 300ms

    Cart Operations: < 400ms

    Order Creation: < 800ms (includes stock updates)

Happy Testing! 🎯 All endpoints should work in this sequence for a complete e-commerce experience from registration to order fulfillment.
