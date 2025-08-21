# 🚀 Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Chuẩn bị Firebase Project

### 1.1 Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Create a project"
3. Nhập tên project (ví dụ: `sleep-tracker-app`)
4. Bật Google Analytics (tùy chọn)
5. Click "Create project"

### 1.2 Thiết lập Authentication
1. Trong Firebase Console, vào **Authentication** > **Get started**
2. Chọn tab **Sign-in method**
3. Bật các provider:
   - **Google**: Click Enable > Chọn support email > Save
   - **Email/Password**: Click Enable > Save

### 1.3 Tạo Firestore Database
1. Vào **Firestore Database** > **Create database**
2. Chọn "Start in test mode" (sẽ config rules sau)
3. Chọn location gần nhất (asia-southeast1 cho VN)
4. Click "Done"

### 1.4 Thiết lập Web App
1. Vào **Project Settings** (icon gear) > **Your apps**
2. Click icon web (</>)
3. Nhập app nickname: `sleep-tracker-web`
4. Check "Also set up Firebase Hosting" (tùy chọn)
5. Click "Register app"
6. Copy config object để dùng sau

## Bước 2: Cấu hình Code

### 2.1 Cập nhật Firebase Config
Mở file `index.html` và thay thế phần config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key-from-firebase",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id", 
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 2.2 Thiết lập Firestore Rules
1. Vào **Firestore Database** > **Rules**
2. Thay thế rules hiện tại:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /sleepData/{sleepId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click "Publish"

## Bước 3: Deploy lên GitHub Pages

### 3.1 Tạo GitHub Repository
1. Tạo repository mới trên GitHub
2. Có thể đặt tên: `sleep-tracker` hoặc `quan-ly-giac-ngu`
3. Chọn Public (cần thiết cho GitHub Pages miễn phí)

### 3.2 Upload Code
```bash
git init
git add .
git commit -m "Initial commit: Sleep tracker app with Firebase"
git branch -M main
git remote add origin https://github.com/username/repository-name.git
git push -u origin main
```

### 3.3 Bật GitHub Pages
1. Vào repository Settings > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)**
5. Click **Save**

### 3.4 Đợi Deploy
- GitHub sẽ deploy tự động
- Đợi vài phút cho green checkmark
- URL sẽ là: `https://username.github.io/repository-name`

## Bước 4: Cấu hình Authorized Domains

### 4.1 Thêm Domain vào Firebase
1. Vào Firebase Console > **Authentication** > **Settings**
2. Scroll xuống "Authorized domains"
3. Click "Add domain"
4. Thêm: `username.github.io`
5. Click "Add"

### 4.2 Test Application
1. Truy cập GitHub Pages URL
2. Test đăng nhập Google
3. Test đăng ký/đăng nhập Email
4. Test lưu dữ liệu giấc ngủ
5. Test đồng bộ dữ liệu

## Bước 5: Tùy chỉnh và Tối ưu

### 5.1 Custom Domain (Tùy chọn)
Nếu có domain riêng:
1. Tạo file `CNAME` trong repository với domain name
2. Config DNS record trỏ về GitHub Pages
3. Thêm custom domain vào Firebase authorized domains

### 5.2 PWA Configuration
App đã được config sẵn làm PWA:
- Meta tags cho mobile
- Offline functionality
- App icons

### 5.3 Performance Optimization
- Firebase SDK đã được optimize
- Offline caching được bật
- Responsive design cho mọi thiết bị

## 🔧 Troubleshooting

### Lỗi Authentication
```
Firebase: Error (auth/unauthorized-domain)
```
**Giải pháp**: Thêm domain vào Firebase Authorized domains

### Lỗi Firestore Permission
```
Missing or insufficient permissions
```
**Giải pháp**: Kiểm tra Firestore rules và đảm bảo user đã đăng nhập

### App không load trên mobile
**Giải pháp**: Kiểm tra viewport meta tag và HTTPS

### Dữ liệu không sync
**Giải pháp**: Kiểm tra internet connection và Firebase config

## 📱 Testing Checklist

- [ ] Đăng nhập Google hoạt động
- [ ] Đăng ký Email hoạt động  
- [ ] Đăng nhập Email hoạt động
- [ ] Lưu sleep record
- [ ] Xem lịch sử
- [ ] Thống kê hiển thị đúng
- [ ] Offline mode hoạt động
- [ ] Sync khi online trở lại
- [ ] Responsive trên mobile
- [ ] PWA install prompt

## 🎉 Hoàn thành!

Ứng dụng của bạn đã sẵn sàng sử dụng trên:
`https://username.github.io/repository-name`

**Lưu ý**: Thay thế `username` và `repository-name` bằng thông tin thực tế của bạn.
