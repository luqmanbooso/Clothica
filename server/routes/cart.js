const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure cart is an array and transform items to match frontend format
    const cart = Array.isArray(user.cart) ? user.cart : [];
    const cartItems = cart.map((item, index) => {
      // Transform product images to simple array
      let images = [];
      let image = null;
      
      if (item.product.images && Array.isArray(item.product.images)) {
        images = item.product.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1)) // Primary images first
          .map(img => img.url);
        image = images[0] || null;
      }
      
      // Create unique cart item ID combining product ID, size, and color
      const cartItemId = `${item.product._id}_${item.selectedSize || 'nosize'}_${item.selectedColor || 'nocolor'}`;
      
      return {
        _id: cartItemId,
        cartIndex: index, // Add cart index for easy removal
        productId: item.product._id,
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: images,
        image: image,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        addedAt: item.addedAt
      };
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('selectedSize').optional().isString(),
  body('selectedColor').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, selectedSize, selectedColor } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is active
    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => 
        item.product.toString() === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.cart.push({
        product: productId,
        quantity,
        selectedSize,
        selectedColor
      });
    }

    await user.save();

    // Return updated cart in the same format as GET /api/cart
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    const cart = Array.isArray(updatedUser.cart) ? updatedUser.cart : [];
    const cartItems = cart.map((item, index) => {
      // Transform product images to simple array
      let images = [];
      let image = null;
      
      if (item.product.images && Array.isArray(item.product.images)) {
        images = item.product.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1)) // Primary images first
          .map(img => img.url);
        image = images[0] || null;
      }
      
      // Create unique cart item ID combining product ID, size, and color
      const cartItemId = `${item.product._id}_${item.selectedSize || 'nosize'}_${item.selectedColor || 'nocolor'}`;
      
      return {
        _id: cartItemId,
        cartIndex: index,
        productId: item.product._id,
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: images,
        image: image,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        addedAt: item.addedAt
      };
    });

    console.log('✅ Item added to cart, returning updated cart with', cartItems.length, 'items');
    res.json(cartItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update', auth, [
  body('itemId').isString().withMessage('Valid item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, quantity } = req.body;
    console.log('🔄 Updating cart item:', itemId, 'quantity:', quantity);

    // Parse cart item ID to get product ID, size, and color
    const [productId, selectedSize, selectedColor] = itemId.split('_');
    const actualSize = selectedSize === 'nosize' ? undefined : selectedSize;
    const actualColor = selectedColor === 'nocolor' ? undefined : selectedColor;

    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find item in cart
    const itemIndex = user.cart.findIndex(
      item => 
        item.product._id.toString() === productId && 
        item.selectedSize === actualSize && 
        item.selectedColor === actualColor
    );

    if (itemIndex === -1) {
      console.log('❌ Item not found in cart');
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update quantity
    user.cart[itemIndex].quantity = quantity;
    await user.save();

    // Return updated cart in the same format as GET /api/cart
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    const cart = Array.isArray(updatedUser.cart) ? updatedUser.cart : [];
    const cartItems = cart.map((item, index) => {
      let images = [];
      let image = null;
      
      if (item.product.images && Array.isArray(item.product.images)) {
        images = item.product.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1))
          .map(img => img.url);
        image = images[0] || null;
      }
      
      const cartItemId = `${item.product._id}_${item.selectedSize || 'nosize'}_${item.selectedColor || 'nocolor'}`;
      
      return {
        _id: cartItemId,
        cartIndex: index,
        productId: item.product._id,
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: images,
        image: image,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        addedAt: item.addedAt
      };
    });

    console.log('✅ Cart quantity updated, returning updated cart with', cartItems.length, 'items');
    res.json(cartItems);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:cartItemId', auth, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    console.log('🗑️ Removing cart item:', cartItemId);

    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse cart item ID to get product ID, size, and color
    const [productId, selectedSize, selectedColor] = cartItemId.split('_');
    const actualSize = selectedSize === 'nosize' ? undefined : selectedSize;
    const actualColor = selectedColor === 'nocolor' ? undefined : selectedColor;

    console.log('🔍 Looking for item:', { productId, actualSize, actualColor });

    // Remove item from cart
    const originalLength = user.cart.length;
    user.cart = user.cart.filter(
      item => 
        !(item.product._id.toString() === productId && 
          item.selectedSize === actualSize && 
          item.selectedColor === actualColor)
    );

    if (user.cart.length === originalLength) {
      console.log('❌ Item not found in cart');
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await user.save();

    // Return updated cart in the same format as GET /api/cart
    const cart = Array.isArray(user.cart) ? user.cart : [];
    const cartItems = cart.map((item, index) => {
      let images = [];
      let image = null;
      
      if (item.product.images && Array.isArray(item.product.images)) {
        images = item.product.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1))
          .map(img => img.url);
        image = images[0] || null;
      }
      
      const cartItemId = `${item.product._id}_${item.selectedSize || 'nosize'}_${item.selectedColor || 'nocolor'}`;
      
      return {
        _id: cartItemId,
        cartIndex: index,
        productId: item.product._id,
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: images,
        image: image,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        addedAt: item.addedAt
      };
    });

    console.log('✅ Item removed, returning updated cart with', cartItems.length, 'items');
    res.json(cartItems);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
