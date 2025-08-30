// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<Response>>()

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function onRequestGet(context: { request: Request; env: { AFFENSUS_CREDENTIALS_PASSWORD: string }; params: { project_id: string } }) {
  const { params, request, env } = context
  const projectId = params.project_id
  const url = new URL(request.url)
  const searchQuery = url.searchParams.get('q')

  if (!searchQuery || searchQuery.length < 2) {
    return new Response(JSON.stringify({ error: 'Query parameter "q" is required and must be at least 2 characters long' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const cacheKey = `search_${projectId}_${searchQuery}`

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  // Check if there's an ongoing request for this same search
  if (ongoingRequests.has(cacheKey)) {
    const response = await ongoingRequests.get(cacheKey)!
    return response.clone()
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const apiUrl = `https://apiv2.affensus.com/api/projects/${projectId}/search?q=${encodeURIComponent(searchQuery)}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.AFFENSUS_CREDENTIALS_PASSWORD}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the result
      cache.set(cacheKey, { data, timestamp: Date.now() })

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
        },
      })
    } catch (error) {
      console.error('Error fetching search results:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch search results' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } finally {
      // Clean up the ongoing request
      ongoingRequests.delete(cacheKey)
    }
  })()

  // Store the ongoing request
  ongoingRequests.set(cacheKey, requestPromise)

  return requestPromise
}
