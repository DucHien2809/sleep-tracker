// Firebase Configuration Example
// Sao chép file này thành firebase-config.js và cập nhật với thông tin project của bạn

const firebaseConfig = {
    // Thay thế bằng thông tin từ Firebase Console > Project Settings > Your apps
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Firestore Security Rules (cần thiết lập trong Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ user đã đăng nhập mới có thể truy cập dữ liệu của chính họ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Dữ liệu giấc ngủ của user
      match /sleepData/{sleepId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
*/

// Authentication Configuration
// 1. Bật Google Sign-in:
//    - Vào Firebase Console > Authentication > Sign-in method
//    - Bật Google provider
//    - Thêm support email

// 2. Bật Email/Password:
//    - Bật Email/Password provider
//    - Có thể bật Email link (passwordless sign-in)

// 3. Authorized domains:
//    - Thêm domain GitHub Pages: username.github.io
//    - Nếu custom domain: your-domain.com

// Production Deployment Checklist:
// □ Cập nhật firebaseConfig với thông tin production
// □ Thiết lập Firestore security rules
// □ Bật authentication providers cần thiết  
// □ Thêm authorized domains
// □ Test authentication flow
// □ Test data sync
// □ Test offline functionality
