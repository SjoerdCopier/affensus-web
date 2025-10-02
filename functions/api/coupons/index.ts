export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestGet(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    
    const url = new URL(request.url);
    const project_id = url.searchParams.get('project_id') || '600d52f9-a0ca-4fc3-b2c4-9235a95182ad';
    const limit = url.searchParams.get('limit') || '50';
    const offset = url.searchParams.get('offset') || '0';

    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    const apiUrl = `https://apiv2.affensus.com/api/coupons?project_id=${project_id}&limit=${limit}&offset=${offset}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    console.log('apiUrl', apiUrl);
    console.log('response', response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=0, s-maxage=0'
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch coupons'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    
    const body = await request.json();

    if (body.action === 'create') {
      return handleCreateDeal(body, env);
    } else if (body.action === 'unpublish') {
      return handleUnpublishCoupon(body, env);
    } else {
      throw new Error('Invalid action. Only "create" and "unpublish" are supported.');
    }

  } catch (error) {
    console.error('Error in coupons API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'API request failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCreateDeal(body: any, env: any) {
  const {
    project_id,
    url,
    language_code,
    country_code,
    language_name,
    merchant_name,
    title,
    voucher_code,
    discount,
    description,
    end_date,
    deal_conditions,
  } = body;

  console.log('Create deal request body:', body);
  
  if (!project_id || !merchant_name || !discount || !description) {
    throw new Error(`Missing required parameters for deal creation. Got: project_id=${project_id}, merchant_name=${merchant_name}, title=${title}, discount=${discount}, description=${description}, end_date=${end_date}`);
  }

  const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
  if (!bearerToken) {
    throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
  }

  // Create the request payload for the scrape-coupons API
  const scrapePayload = {
    url: url || 'https://example.com',
    language_code: language_code || 'en',
    country_code: country_code || 'US',
    language_name: language_name || 'English',
    merchant_name,
    title,
    voucher_code: voucher_code || '',
    discount: discount || '10%', // Fallback if discount is empty
    description,
    end_date,
    deal_conditions: deal_conditions || '',
  };

  console.log('Creating deal with payload:', scrapePayload);

  // Make streaming request to scrape-coupons API
  const response = await fetch('https://apiv2.affensus.com/api/scrape-coupons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
      'Accept-Encoding': 'identity', // Request uncompressed response
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
    body: JSON.stringify(scrapePayload),
  });

  console.log('Scrape API response status:', response.status);
  console.log('Scrape API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scrape API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  console.log('Scrape API response is OK, setting up streaming...');

  // Check if response is gzipped
  const contentEncoding = response.headers.get('content-encoding');
  console.log('Content encoding:', contentEncoding);

  if (!response.body) {
    throw new Error('Response body is null');
  }

  // Create a TransformStream to ensure proper streaming
  const { readable, writable } = new TransformStream();
  
  // Stream the response body through the transform stream
  // This ensures chunks are passed through immediately
  if (contentEncoding === 'gzip') {
    console.log('Response is gzipped, decompressing...');
    const decompressedStream = new DecompressionStream('gzip');
    response.body
      .pipeThrough(decompressedStream)
      .pipeTo(writable);
  } else {
    // Pipe the response directly without waiting
    response.body.pipeTo(writable);
  }

  // Return the readable stream immediately
  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8', // Match the original content type
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function handleUnpublishCoupon(body: any, env: any) {
  const { promotion_id, network_id, project_id } = body;

  if (!promotion_id || !network_id || !project_id) {
    throw new Error('Missing required parameters: promotion_id, network_id, project_id');
  }

  const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
  if (!bearerToken) {
    throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
  }

  // Call the external API to unpublish the coupon
  const apiUrl = `https://apiv2.affensus.com/api/coupons/${promotion_id}/${network_id}/publish?project_id=${project_id}`;
  console.log('unpublish apiUrl', apiUrl);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    },
  });

  console.log('unpublish response', response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  return new Response(JSON.stringify({
    success: true,
    message: `Coupon ${promotion_id} unpublished successfully`,
    data: data
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=0, s-maxage=0'
    }
  });
}
