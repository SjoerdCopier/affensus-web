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

export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const { projectId, deal } = await request.json();

    console.log('=== PUBLISH COUPON ===');
    console.log('ProjectId:', projectId);

    if (!projectId || !deal) {
      console.log('❌ ERROR: Missing projectId or deal');
      return new Response(JSON.stringify({ 
        error: 'projectId and deal are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dealData = JSON.parse(deal)[0]; // Parse the stringified deal data

    // Transform deal data to match the external API format
    const transformedDeal = {
      created_by: 1, // Default user ID
      title: dealData.title,
      label: dealData.deal_label || dealData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      code: dealData.coupon || null,
      status: 1, // Active
      description: dealData.description,
      webshop: dealData.external_id || 0,
      validity_from: dealData.valid_from ? new Date(dealData.valid_from).toLocaleDateString('nl-NL') : null,
      validity_to: dealData.valid_until ? new Date(dealData.valid_until).toLocaleDateString('nl-NL') : null,
      exclusive: 0,
      affiliate_deep_link: dealData.affiliate_link || '',
      deal_conditions: dealData.deal_conditions ? 
        dealData.deal_conditions.reduce((acc: any, cond: any) => {
          acc[cond.title] = cond.description;
          return acc;
        }, {}) : {},
      categories: dealData.categories ? 
        dealData.categories.map((cat: any) => cat.id).filter((id: number) => id > 0) : null,
      proof_of_marketing: null
    };

    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      console.log('❌ ERROR: AFFENSUS_CREDENTIALS_PASSWORD not configured');
      return new Response(JSON.stringify({ 
        error: 'AFFENSUS_CREDENTIALS_PASSWORD not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the project details to retrieve the encrypted publish data
    const projectResponse = await fetch(`https://apiv2.affensus.com/api/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      console.log('❌ Failed to fetch project:', projectResponse.status);
      return new Response(JSON.stringify({ 
        error: `Failed to fetch project: ${projectResponse.status} ${projectResponse.statusText}`,
        details: errorText
      }), {
        status: projectResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const projectData = await projectResponse.json();
    const encryptedDeals = projectData.project?.deals;

    console.log('Has deals field:', !!encryptedDeals);
    
    if (!encryptedDeals) {
      console.log('❌ No encrypted deals found');
      return new Response(JSON.stringify({ 
        error: 'No API configured'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decrypt the deals API data
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    const bytes = CryptoJS.AES.decrypt(encryptedDeals, password);
    const dealsApiData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('✓ Decrypted API config');

    // Prepare the API request
    const apiDetails = {
      endpoint: dealsApiData.endpoint,
      authType: dealsApiData.authType,
      username: dealsApiData.username,
      password: dealsApiData.password,
      token: dealsApiData.token,
      apiKey: dealsApiData.apiKey,
      apiValue: dealsApiData.apiValue
    };

    console.log('Endpoint:', apiDetails.endpoint);
    console.log('Auth type:', apiDetails.authType);

    // Make the API call to publish the deal
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (apiDetails.authType === 'Basic Auth') {
      headers.append('Authorization', 'Basic ' + btoa(`${apiDetails.username}:${apiDetails.password}`));
    } else if (apiDetails.authType === 'Bearer Token') {
      headers.append('Authorization', `Bearer ${apiDetails.token}`);
    } else if (apiDetails.authType === 'API Key') {
      headers.append(apiDetails.apiKey, apiDetails.apiValue);
    }

    console.log('Sending to external API:');
    console.log(JSON.stringify(transformedDeal, null, 2));

    const response = await fetch(apiDetails.endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(transformedDeal)
    });

    console.log('External API status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ External API failed:', errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const apiResponse = await response.json();
    console.log('✓ Published successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      data: apiResponse 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error publishing coupon:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
