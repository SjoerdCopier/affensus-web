import CryptoJS from 'crypto-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    // Use the same environment variable for both encryption and API auth
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AFFENSUS_CREDENTIALS_PASSWORD not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { project_id, network_id, credentials, credential_name } = body;

    if (!project_id || !network_id || !credentials) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'project_id, network_id, and credentials are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert network_id to integer, keep project_id as string (UUID)
    const networkId = parseInt(network_id);

    if (isNaN(networkId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'network_id must be a valid number' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Data to encrypt:', JSON.stringify(credentials, null, 2));
    
    // Encrypt function
    const encryptCredentials = (data: any) => {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password);
      return encrypted.toString(); // Return the full encrypted object, not just ciphertext
    };

    const encryptedCredentials = encryptCredentials(credentials);
    console.log('Encrypted credentials:', encryptedCredentials);
    
    // Test that we can decrypt what we just encrypted
    try {
      const testDecrypt = CryptoJS.AES.decrypt(encryptedCredentials, password);
      const testDecryptString = testDecrypt.toString(CryptoJS.enc.Utf8);
      const testDecryptData = JSON.parse(testDecryptString);
      console.log('Encryption test successful - data can be decrypted');
    } catch (testError) {
      console.error('WARNING: Cannot decrypt the data we just encrypted!', testError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Encryption validation failed - cannot decrypt encrypted data' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = 'https://apiv2.affensus.com/api/credentials';

    const requestPayload = { 
      project_id: project_id, // Keep as string (UUID)
      network_id: networkId, 
      credentials: encryptedCredentials, 
      credential_name 
    };

    console.log('Sending to apiv2:', JSON.stringify(requestPayload, null, 2));

    const apiv2Response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`, // Using same password as bearer token
      },
      body: JSON.stringify(requestPayload)
    });

    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error('apiv2 error response:', errorText);
      console.error('apiv2 status:', apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await apiv2Response.json();

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating credentials:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
