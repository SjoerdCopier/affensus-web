// Test script for network-monitors API
const API_BASE = 'http://localhost:8788'; // Adjust port if needed

async function testAPI() {
  console.log('Testing network-monitors API...\n');

  // Test GET request
  try {
    console.log('1. Testing GET /api/network-monitors');
    const getResponse = await fetch(`${API_BASE}/api/network-monitors?userId=test_user_123`);
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    console.log('Status:', getResponse.status);
  } catch (error) {
    console.error('GET Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test POST request
  try {
    console.log('2. Testing POST /api/network-monitors');
    const postResponse = await fetch(`${API_BASE}/api/network-monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 'test_user_123',
        domain: 'example.com'
      }),
    });
    const postData = await postResponse.json();
    console.log('POST Response:', postData);
    console.log('Status:', postResponse.status);
  } catch (error) {
    console.error('POST Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test PUT request
  try {
    console.log('3. Testing PUT /api/network-monitors');
    const putResponse = await fetch(`${API_BASE}/api/network-monitors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        user_id: 'test_user_123',
        enabled: false
      }),
    });
    const putData = await putResponse.json();
    console.log('PUT Response:', putData);
    console.log('Status:', putResponse.status);
  } catch (error) {
    console.error('PUT Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test DELETE request
  try {
    console.log('4. Testing DELETE /api/network-monitors');
    const deleteResponse = await fetch(`${API_BASE}/api/network-monitors`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        user_id: 'test_user_123'
      }),
    });
    const deleteData = await deleteResponse.json();
    console.log('DELETE Response:', deleteData);
    console.log('Status:', deleteResponse.status);
  } catch (error) {
    console.error('DELETE Error:', error.message);
  }
}

// Run the test
testAPI().catch(console.error);

