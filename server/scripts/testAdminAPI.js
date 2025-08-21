const axios = require('axios');

const testAdminAPI = async () => {
  try {
    console.log('🧪 Testing Admin Events API...\\n');

    // Test 1: Health check
    console.log('📡 Test 1: Health check...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test 2: Test admin events endpoint (without auth - should fail)
    console.log('\\n📡 Test 2: Admin events endpoint (no auth)...');
    try {
      const eventsResponse = await axios.get('http://localhost:5000/api/admin/events');
      console.log('✅ Events endpoint accessible (unexpected):', eventsResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Events endpoint properly protected (401 Unauthorized)');
      } else if (error.response && error.response.status === 500) {
        console.log('⚠️ Events endpoint returned 500 error:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAdminAPI();
