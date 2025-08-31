// Configuration file for API keys and sensitive data
var CONFIG = {
    // Google Gemini API Configuration
    // Note: For production, use server-side proxy to keep API keys secure
    // GEMINI_API_KEY: 'YOUR_API_KEY_HERE', // Remove this from client-side code
    
    // Firebase Configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyDXV-oDioINk4bxPXLxJlsRNTMfE1u5tx4",
        authDomain: "sleep-tracker-app-fed79.firebaseapp.com",
        projectId: "sleep-tracker-app-fed79",
        storageBucket: "sleep-tracker-app-fed79.firebasestorage.app",
        messagingSenderId: "217406254531",
        appId: "1:217406254531:web:14a3ca2e5fdcc16dfa6176",
        measurementId: "G-LKT2YXTE9H"
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
