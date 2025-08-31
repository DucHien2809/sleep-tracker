// Configuration file for API keys and sensitive data
// ⚠️ KHÔNG ĐƯỢC PUSH LÊN GITHUB!

const CONFIG = {
    // Google Gemini API Configuration
    GEMINI_API_KEY: 'AIzaSyAAp7dDiPtUsiycdVp4DDblyAIuu1KlrQM', // API key thật của bạn
    
    // Firebase Configuration - ĐÃ CẬP NHẬT VỚI THÔNG TIN THỰC TẾ
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

// HƯỚNG DẪN KHẮC PHỤC LỖI POPUP-BLOCKED:
// 1. Cho phép popup cho trang web này trong trình duyệt
// 2. Tắt ad blocker nếu có
// 3. Kiểm tra cài đặt bảo mật trình duyệt
// 4. Nếu vẫn lỗi, app sẽ tự động chuyển sang redirect mode

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
