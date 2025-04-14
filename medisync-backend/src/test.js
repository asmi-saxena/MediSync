const axios = require('axios');

// Test the backend connection
async function testBackend() {
  try {
    console.log('Testing backend connection...');
    console.log('Making request to:', 'http://localhost:5000/');
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log('Root endpoint response:', rootResponse.data);

    // Test users endpoint
    console.log('\nTesting users endpoint...');
    console.log('Making request to:', 'http://localhost:5000/api/users');
    
    const usersResponse = await axios.get('http://localhost:5000/api/users');
    console.log('Users endpoint response:', usersResponse.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response data',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
  }
}

// Run the test
testBackend(); 