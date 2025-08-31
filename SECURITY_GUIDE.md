# Security Guide for Sleep Tracker App

## API Key Security

### Current Issue
The application currently exposes the Gemini API key in client-side code (`config.js`), which is a security risk as anyone can view the source code and extract the key.

### Recommended Solution: Server-Side Proxy

#### 1. Create a Backend API Server
Set up a Node.js/Express server or use serverless functions (Firebase Functions, Vercel, Netlify) to handle AI API calls.

#### 2. Environment Variables
Store your API keys in environment variables on the server:
```bash
# .env file (server-side only)
GEMINI_API_KEY=your_actual_api_key_here
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account.json
```

#### 3. API Proxy Endpoints
Create secure endpoints that forward requests to AI services:

```javascript
// Example Express.js endpoint
app.post('/api/ai/gemini/analyze-sleep', async (req, res) => {
    try {
        const { sleepData } = req.body;
        
        // Call Gemini API with server-side key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze this sleep data: ${JSON.stringify(sleepData)}`
                    }]
                }]
            })
        });
        
        const result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'AI analysis failed' });
    }
});
```

#### 4. Update Client Configuration
Update `api-proxy-config.js` with your actual proxy server URL:
```javascript
PROXY_BASE_URL: 'https://your-actual-domain.com/api'
```

### Alternative Solutions

#### Option 1: Firebase Functions
Use Firebase Functions to create secure API endpoints:
```bash
firebase init functions
```

#### Option 2: Vercel/Netlify Functions
Deploy serverless functions with these platforms for easy API proxy setup.

#### Option 3: Express.js Server
Deploy a simple Express.js server to handle API calls.

### Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use HTTPS for all API communications**
3. **Implement rate limiting on your proxy endpoints**
4. **Add authentication to your proxy endpoints if needed**
5. **Validate and sanitize all input data**
6. **Use environment variables for sensitive configuration**

### Testing the Secure Setup

1. Deploy your proxy server
2. Update `api-proxy-config.js` with the correct URL
3. Test AI functionality through the proxy
4. Verify API keys are not visible in browser dev tools

### Current Status
- ✅ Fixed deprecated meta tags
- ✅ Updated Firebase configuration to use modern settings
- ✅ Removed exposed API key from client-side code
- ✅ Created secure API proxy configuration
- ✅ Fixed Firebase initialization conflicts with merge option
- ✅ Added Firebase duplicate initialization check
- ⚠️ Need to deploy actual proxy server
- ⚠️ Update proxy configuration with real server URL

### Recent Fixes Applied

#### Firebase Warnings Fixed:
1. **Host Override Warning**: Added `{ merge: true }` option to `db.settings()` to prevent overriding original host settings
2. **Multiple Initialization**: Added check to prevent Firebase from being initialized multiple times
3. **Modern Cache Configuration**: Updated to use `cache.sizeBytes` instead of deprecated `cacheSizeBytes`
4. **Deprecated Methods**: Removed `db.enablePersistence()` calls that were causing warnings

#### Popup Issues Fixed:
1. **Automatic Fallback**: Added automatic fallback from popup to redirect when popup is blocked
2. **Better Error Handling**: Improved error handling for popup-related issues
3. **User Guidance**: Added better user guidance for popup blocking issues

#### Test Files Created:
- `firebase-test.html` - Simple test file to verify Firebase initialization without warnings
- `popup-test.html` - Comprehensive test file for popup functionality and Firebase
