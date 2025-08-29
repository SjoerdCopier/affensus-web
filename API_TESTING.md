# Network Monitors API Testing

This document explains how to test the network-monitors API that now uses your external API instead of D1.

## Setup

1. **Environment Variable**: Set the `AFFENSUS_CREDENTIALS_PASSWORD` environment variable with your bearer token:
   ```bash
   export AFFENSUS_CREDENTIALS_PASSWORD="your_bearer_token_here"
   ```

2. **Local Development**: For local testing, add the environment variable to your `.env.local` file or set it in your shell.

3. **Production**: Set the environment variable in your Cloudflare Pages dashboard.

## API Endpoints

The API now proxies requests to `https://apiV2.affensus.com/api/network-monitors` with the bearer token from your environment variable.

### GET /api/network-monitors
- **Query Parameters**: `userId` (required)
- **Response**: List of network monitors for the specified user

### POST /api/network-monitors
- **Body**: 
  ```json
  {
    "user_id": "test_user_123",
    "domain": "example.com"
  }
  ```
- **Response**: Created network monitor

### PUT /api/network-monitors
- **Body**:
  ```json
  {
    "id": 1,
    "user_id": "test_user_123",
    "enabled": false,
    "display_name": "Updated Name",
    "notification_enabled": true,
    "check_interval_minutes": 10
  }
  ```
- **Response**: Updated network monitor

### DELETE /api/network-monitors
- **Body**:
  ```json
  {
    "id": 1,
    "user_id": "test_user_123"
  }
  ```
- **Response**: Deletion confirmation

## Testing

### Using the Test Script

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   node test-api.js
   ```

### Using curl

```bash
# Test POST request
curl -X POST http://localhost:8788/api/network-monitors \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "domain": "example.com"
  }'

# Test GET request
curl "http://localhost:8788/api/network-monitors?userId=test_user_123"

# Test PUT request
curl -X PUT http://localhost:8788/api/network-monitors \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "user_id": "test_user_123",
    "enabled": false
  }'

# Test DELETE request
curl -X DELETE http://localhost:8788/api/network-monitors \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "user_id": "test_user_123"
  }'
```

## Error Handling

The API will return appropriate HTTP status codes and error messages if:
- The `AFFENSUS_CREDENTIALS_PASSWORD` environment variable is not set
- The external API returns an error
- Required fields are missing from the request body

## Notes

- The API now acts as a proxy to your external API
- All authentication is handled via the bearer token from the environment variable
- The D1 database is no longer used for network monitors
- The API maintains the same interface for backward compatibility

