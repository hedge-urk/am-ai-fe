# Dynamic API Endpoint Setup

This document explains how the dynamic API endpoint system works in this application.

## Overview

The application now supports dynamic API endpoints where each form submission gets a unique ID and listens on a specific endpoint for that request.

## How It Works

### 1. Form Submission
When a user submits the form on the home page (`/`):
- A unique request ID is generated (timestamp + random string)
- A dynamic callback URL is created: `/api/listen/{requestId}`
- The form data is sent to your backend along with the `callbackUrl` and `requestId`
- The user is redirected to `/listen/{requestId}` to wait for results

### 2. Backend Processing
Your backend should:
- Receive the form data including the `callbackUrl` and `requestId`
- Process the request as usual
- When ready to send results, make a POST request to the `callbackUrl` with the HTML content

### 3. Dynamic Listening
The frontend listens on the specific endpoint (`/api/listen/{requestId}`):
- Polls the endpoint every 2 seconds
- Displays results when data is received
- Shows loading state while waiting

## API Endpoints

### Dynamic Listen Endpoint: `/api/listen/[id]`

**POST** - Receive data from backend
- URL: `/api/listen/{id}`
- Body: Form data with `html` field containing the results
- Response: `{ success: true, message: 'Data received successfully', id }`

**GET** - Retrieve stored data
- URL: `/api/listen/{id}`
- Response: `{ success: true, data: { html: string, timestamp: string }, id }`

**DELETE** - Clear stored data
- URL: `/api/listen/{id}`
- Response: `{ success: true, message: 'Data cleared', id }`

## Example Backend Integration

When your backend is ready to send results back to the frontend:

```javascript
// Example backend code
const sendResultsToFrontend = async (callbackUrl, htmlContent) => {
  const formData = new FormData();
  formData.append('html', htmlContent);
  
  const response = await fetch(callbackUrl, {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    console.log('Results sent successfully');
  }
};
```

## Benefits

1. **Multiple Concurrent Requests**: Each request has its own endpoint, allowing multiple users to submit forms simultaneously
2. **Isolated Data**: Data for each request is stored separately and cleared when no longer needed
3. **Better User Experience**: Users can see their specific request ID and know their request is being processed
4. **Scalability**: The system can handle multiple concurrent requests without data conflicts

## File Structure

- `pages/api/listen/[id].js` - Dynamic API endpoint handler
- `pages/listen/[id].tsx` - Dynamic results page
- `pages/index.tsx` - Updated form with dynamic callback URL generation
- `pages/listen.tsx` - Legacy redirect (for backward compatibility)

## Migration Notes

The old static `/api/listen` endpoint still exists for backward compatibility, but new requests will use the dynamic system. The old `/listen` page now redirects to the home page. 