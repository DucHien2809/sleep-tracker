// API Proxy Configuration for secure AI API calls
// This file contains configuration for server-side proxy endpoints
// that keep API keys secure and hidden from client-side code

var API_PROXY_CONFIG = {
    // Base URL for your API proxy server
    PROXY_BASE_URL: 'https://your-api-proxy-server.com/api',
    
    // Endpoints for different AI services
    ENDPOINTS: {
        GEMINI_ANALYSIS: '/ai/gemini/analyze-sleep',
        GEMINI_ADVICE: '/ai/gemini/sleep-advice',
        GEMINI_SUMMARY: '/ai/gemini/weekly-summary'
    },
    
    // Request configuration
    REQUEST_CONFIG: {
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    }
};

// Make API_PROXY_CONFIG globally available
window.API_PROXY_CONFIG = API_PROXY_CONFIG;

// Helper function to make secure API calls through proxy
async function makeSecureAPICall(endpoint, data) {
    try {
        const response = await fetch(API_PROXY_CONFIG.PROXY_BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers here if needed
            },
            body: JSON.stringify(data),
            timeout: API_PROXY_CONFIG.REQUEST_CONFIG.timeout
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Secure API call failed:', error);
        throw error;
    }
}

// Make the helper function globally available
window.makeSecureAPICall = makeSecureAPICall;
