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
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get encrypted credentials from request body
    const body = await request.json();
    const { encryptedCredentials } = body;

    if (!encryptedCredentials) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Encrypted credentials required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get decryption password
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Decryption key not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Import CryptoJS and decrypt
    const CryptoJS = await import('crypto-js');
    
    let decryptedCredentials = {};
    try {
      console.log('Attempting to decrypt credentials...');
      console.log('Encrypted data length:', encryptedCredentials.length);
      console.log('First 50 chars:', encryptedCredentials.substring(0, 50));
      
      const bytes = CryptoJS.AES.decrypt(encryptedCredentials, password);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      console.log('Decrypted string length:', decryptedString.length);
      
      if (!decryptedString) {
        throw new Error('Decryption resulted in empty string');
      }
      
      decryptedCredentials = JSON.parse(decryptedString);
      console.log('Successfully decrypted and parsed credentials');
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to decrypt credentials' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: decryptedCredentials
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error decrypting credentials:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
