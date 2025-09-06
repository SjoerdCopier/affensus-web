import CryptoJS from 'crypto-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPut(context: any) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const credentialId = url.searchParams.get('credential_id');
    console.log('Credential ID:', credentialId);

    if (!credentialId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Credential ID is required as query parameter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
    const { credentials, credential_name } = body;

    if (!credentials) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Credentials data is required' 
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

    const apiUrl = `https://apiv2.affensus.com/api/credentials/${credentialId}`;

    const apiv2Response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`, // Using same password as bearer token
      },
      body: JSON.stringify({ credentials: encryptedCredentials, credential_name })
    });

    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
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
    console.error('Error updating credentials:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}