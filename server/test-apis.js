const axios = require('axios');

// Test script for Reviews and Issues APIs
async function testAPIs() {
  const baseURL = 'http://localhost:5000/api';
  
  // Get admin token - you'll need to replace this with actual admin token
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODkyYjlhYWIwMDdkNTJjYTUxYWY3MTciLCJlbWFpbCI6ImFkbWluQGNsb3RoaWNhLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NTc1NDY0OSwiZXhwIjoxNzU2MzU5NDQ5fQ.QRKccRytuFTwDnfNg3PTD01ou_tIzliM_0KwPCrR0cs';
  
  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  console.log('🧪 Testing Reviews APIs...');
  
  try {
    // Test Reviews API
    console.log('📊 Testing Reviews Stats API...');
    const reviewStats = await axios.get(`${baseURL}/reviews/admin/stats`, { headers });
    console.log('✅ Reviews Stats:', reviewStats.data);

    console.log('📋 Testing Reviews List API...');
    const reviewsList = await axios.get(`${baseURL}/reviews/admin/all`, { headers });
    console.log('✅ Reviews List:', reviewsList.data.data?.length || 0, 'reviews found');

  } catch (error) {
    console.error('❌ Reviews API Error:', error.response?.data || error.message);
  }

  console.log('\n🧪 Testing Issues APIs...');
  
  try {
    // Test Issues API
    console.log('📊 Testing Issues Stats API...');
    const issueStats = await axios.get(`${baseURL}/issues/admin/stats`, { headers });
    console.log('✅ Issues Stats:', issueStats.data);

    console.log('📋 Testing Issues List API...');
    const issuesList = await axios.get(`${baseURL}/issues/admin/all`, { headers });
    console.log('✅ Issues List:', issuesList.data.data?.length || 0, 'issues found');

  } catch (error) {
    console.error('❌ Issues API Error:', error.response?.data || error.message);
  }

  console.log('\n🧪 Testing Product Sales API...');
  
  try {
    // Test Product Sales API
    const salesData = await axios.get(`${baseURL}/orders/analytics/product-sales`, { headers });
    console.log('✅ Product Sales Data:', Object.keys(salesData.data).length, 'products found');

  } catch (error) {
    console.error('❌ Product Sales API Error:', error.response?.data || error.message);
  }
}

testAPIs().catch(console.error);
