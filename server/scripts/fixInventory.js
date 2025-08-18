const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const fixInventory = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to fix`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Calculate total stock from sizes if they exist
        if (product.sizes && product.sizes.length > 0) {
          const totalStock = product.sizes.reduce((total, size) => total + (size.stock || 0), 0);
          
          // Initialize inventory if it doesn't exist
          if (!product.inventory) {
            product.inventory = {};
          }
          
          // Update inventory fields
          product.inventory.totalStock = totalStock;
          product.inventory.availableStock = totalStock;
          product.inventory.reservedStock = 0;
          
          // Save the product
          await product.save();
          
          console.log(`✅ Fixed inventory for ${product.name}: Total Stock = ${totalStock}`);
          fixedCount++;
        } else {
          console.log(`⚠️ Product ${product.name} has no sizes, skipping inventory fix`);
        }
      } catch (error) {
        console.error(`❌ Error fixing inventory for ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Inventory Fix Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total products processed: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

// Run the script
fixInventory();
