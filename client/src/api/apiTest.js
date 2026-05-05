// API Testing Script
// This script can be used to test backend API connections

import api from './axiosConfig';
import { API_ENDPOINTS, isRouteImplemented } from './apiRoutes';

// Test configuration
const TEST_CONFIG = {
  timeout: 5000, // 5 seconds timeout
  retries: 2, // Number of retries for failed requests
};

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  skipped: [],
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make test API calls with retries
const testApiCall = async (name, endpoint, method = 'GET', data = null) => {
  const maxRetries = TEST_CONFIG.retries;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Testing ${name} (Attempt ${attempt}/${maxRetries})...`);
      
      let response;
      switch (method) {
        case 'GET':
          response = await api.get(endpoint);
          break;
        case 'POST':
          response = await api.post(endpoint, data);
          break;
        case 'PUT':
          response = await api.put(endpoint, data);
          break;
        case 'PATCH':
          response = await api.patch(endpoint, data);
          break;
        case 'DELETE':
          response = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`✅ ${name} - PASSED`);
      testResults.passed.push({ name, endpoint, method, status: response.status });
      return { success: true, data: response.data };

    } catch (error) {
      lastError = error;
      console.log(`❌ ${name} - FAILED (Attempt ${attempt}/${maxRetries}): ${error.message}`);
      
      if (attempt < maxRetries) {
        await delay(1000); // Wait 1 second before retry
      }
    }
  }

  console.log(`💀 ${name} - FAILED AFTER ${maxRetries} ATTEMPTS`);
  testResults.failed.push({ 
    name, 
    endpoint, 
    method, 
    error: lastError.message,
    status: lastError.response?.status 
  });
  return { success: false, error: lastError };
};

// Test suites for different API categories
export const testSuites = {
  // Authentication Tests
  auth: async () => {
    console.log('\n🔐 Testing Authentication API...');
    
    // Test public endpoints first
    await testApiCall('Health Check', '/health', 'GET');
    await testApiCall('Root Endpoint', '/', 'GET');
    
    // Test auth endpoints (these will fail without proper auth, but we test the routes exist)
    await testApiCall('Login Route', API_ENDPOINTS.AUTH.LOGIN, 'POST', { 
      email: 'test@example.com', 
      password: 'testpassword' 
    });
    await testApiCall('Register Route', API_ENDPOINTS.AUTH.REGISTER, 'POST', {
      email: 'test@example.com',
      password: 'testpassword',
      first_name: 'Test',
      last_name: 'User'
    });
    await testApiCall('Forgot Password Route', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 'POST', {
      email: 'test@example.com'
    });
  },

  // Membership Tests
  memberships: async () => {
    console.log('\n💳 Testing Membership API...');
    
    await testApiCall('Get Membership Plans', API_ENDPOINTS.MEMBERSHIPS.PLANS, 'GET');
    await testApiCall('Get Membership Plan Detail', API_ENDPOINTS.MEMBERSHIPS.PLAN_DETAIL('00000000-0000-0000-0000-000000000000'), 'GET');
  },

  // Bookings/Consultations Tests
  bookings: async () => {
    console.log('\n📅 Testing Bookings API...');
    
    await testApiCall('Get Consultation Types', API_ENDPOINTS.BOOKINGS.CONSULTATION_TYPES, 'GET');
    await testApiCall('Get Consultation Type Detail', API_ENDPOINTS.BOOKINGS.CONSULTATION_TYPE_DETAIL('test-type'), 'GET');
    await testApiCall('Get Availability', API_ENDPOINTS.BOOKINGS.AVAILABILITY, 'GET', null, {
      params: {
        consultation_type_id: '00000000-0000-0000-0000-000000000000',
        date: '2024-01-01'
      }
    });
  },

  // Shop Tests
  shop: async () => {
    console.log('\n🛒 Testing Shop API...');
    
    await testApiCall('Get Products', API_ENDPOINTS.SHOP.PRODUCTS, 'GET');
    await testApiCall('Get Product Detail', API_ENDPOINTS.SHOP.PRODUCT_DETAIL('test-product'), 'GET');
    await testApiCall('Get Categories', API_ENDPOINTS.SHOP.CATEGORIES, 'GET');
    await testApiCall('Search Products', API_ENDPOINTS.SHOP.PRODUCT_SEARCH, 'GET', null, {
      params: { q: 'test' }
    });
  },

  // ML Tests
  ml: async () => {
    console.log('\n🤖 Testing ML API...');
    
    const testProfile = {
      age: 25,
      gender: 'male',
      weight_kg: 70,
      height_m: 1.75,
      fat_pct: 15,
      experience_level: 1,
      workout_freq: 3,
      session_duration: 1.0,
      avg_bpm: 130,
      health_conditions: [],
      goal: 'maintain'
    };

    await testApiCall('Workout Recommendation', API_ENDPOINTS.ML.WORKOUT_RECOMMEND, 'POST', testProfile);
    await testApiCall('Progress Prediction', API_ENDPOINTS.ML.PROGRESS_PREDICT, 'POST', testProfile);
    await testApiCall('Food Suggestions', API_ENDPOINTS.ML.FOOD_SUGGEST, 'POST', testProfile);
  },

  // Account Tests (will be skipped - needs implementation)
  account: async () => {
    console.log('\n👤 Testing Account API...');
    
    if (!isRouteImplemented('ACCOUNT')) {
      console.log('⏭️  Account API not implemented - skipping tests');
      testResults.skipped.push({ category: 'Account', reason: 'Not implemented' });
      return;
    }

    await testApiCall('Get Account', API_ENDPOINTS.ACCOUNT.ME, 'GET');
    await testApiCall('Get Measurements', API_ENDPOINTS.ACCOUNT.MEASUREMENTS, 'GET');
  },

  // Excursions Tests (will be skipped - needs implementation)
  excursions: async () => {
    console.log('\n🏔️ Testing Excursions API...');
    
    if (!isRouteImplemented('EXCURSIONS')) {
      console.log('⏭️  Excursions API not implemented - skipping tests');
      testResults.skipped.push({ category: 'Excursions', reason: 'Not implemented' });
      return;
    }

    await testApiCall('Get Excursions', API_ENDPOINTS.EXCURSIONS.LIST, 'GET');
    await testApiCall('Get Excursion Detail', API_ENDPOINTS.EXCURSIONS.DETAIL('test-excursion'), 'GET');
  },

  // Admin Tests (will be skipped - needs implementation)
  admin: async () => {
    console.log('\n👨‍💼 Testing Admin API...');
    
    if (!isRouteImplemented('ADMIN')) {
      console.log('⏭️  Admin API not implemented - skipping tests');
      testResults.skipped.push({ category: 'Admin', reason: 'Not implemented' });
      return;
    }

    await testApiCall('Get All Clients', API_ENDPOINTS.ADMIN.ALL_CLIENTS, 'GET');
    await testApiCall('Get Dashboard Stats', API_ENDPOINTS.ADMIN.DASHBOARD_STATS, 'GET');
  },

  // Trainer Tests (will be skipped - needs implementation)
  trainer: async () => {
    console.log('\n🏋️ Testing Trainer API...');
    
    if (!isRouteImplemented('TRAINER')) {
      console.log('⏭️  Trainer API not implemented - skipping tests');
      testResults.skipped.push({ category: 'Trainer', reason: 'Not implemented' });
      return;
    }

    await testApiCall('Get Trainer Profile', API_ENDPOINTS.TRAINER.PROFILE, 'GET');
    await testApiCall('Get Trainer Clients', API_ENDPOINTS.TRAINER.CLIENTS, 'GET');
  },
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting API Connection Tests...\n');
  
  const startTime = Date.now();
  
  try {
    // Test implemented APIs
    await testSuites.auth();
    await testSuites.memberships();
    await testSuites.bookings();
    await testSuites.shop();
    await testSuites.ml();
    
    // Test unimplemented APIs (will be skipped)
    await testSuites.account();
    await testSuites.excursions();
    await testSuites.admin();
    await testSuites.trainer();
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⏭️  Skipped: ${testResults.skipped.length}`);
  console.log(`📈 Success Rate: ${((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1)}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`  • ${test.name}: ${test.error} (${test.status || 'N/A'})`);
    });
  }
  
  if (testResults.skipped.length > 0) {
    console.log('\n⏭️  SKIPPED TESTS:');
    testResults.skipped.forEach(test => {
      console.log(`  • ${test.category}: ${test.reason}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  return testResults;
};

// Run specific test suite
export const runTestSuite = async (suiteName) => {
  if (!testSuites[suiteName]) {
    console.error(`❌ Test suite '${suiteName}' not found`);
    return null;
  }
  
  console.log(`🚀 Running ${suiteName} test suite...\n`);
  
  const startTime = Date.now();
  await testSuites[suiteName]();
  const endTime = Date.now();
  
  console.log(`\n⏱️  ${suiteName} tests completed in ${(endTime - startTime) / 1000} seconds`);
  
  return {
    suite: suiteName,
    passed: testResults.passed.filter(t => t.suite === suiteName),
    failed: testResults.failed.filter(t => t.suite === suiteName),
    skipped: testResults.skipped.filter(t => t.suite === suiteName),
  };
};

// Export test results for inspection
export { testResults };

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
