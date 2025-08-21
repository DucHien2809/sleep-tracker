# 🌙 Ứng dụng Quản lý Giấc ngủ

Ứng dụng web hiện đại để theo dõi và quản lý giấc ngủ với tích hợp Firebase cho đăng nhập và đồng bộ dữ liệu cross-device.

## ✨ Tính năng

### 🔐 Xác thực người dùng
- Đăng nhập với Google
- Đăng nhập/đăng ký bằng Email/Password
- Quản lý profile người dùng
- Đăng xuất an toàn

### 📊 Quản lý giấc ngủ
- Ghi nhận thời gian đi ngủ và thức dậy
- Đánh giá chất lượng giấc ngủ (1-5 sao)
- Thêm ghi chú cho từng đêm ngủ
- Hành động nhanh: "Đi ngủ ngay" và "Vừa thức dậy"

### 📈 Thống kê và báo cáo
- Dashboard tổng quan với các chỉ số chính
- Lịch sử giấc ngủ có thể lọc (7 ngày, 30 ngày, tất cả)
- Biểu đồ thống kê thời gian ngủ
- Tính toán trung bình thời gian ngủ và chất lượng

### ⚙️ Cài đặt
- Thiết lập mục tiêu giấc ngủ
- Nhắc nhở đi ngủ
- Bật/tắt thông báo
- Quản lý dữ liệu

### 🔄 Đồng bộ dữ liệu
- Lưu trữ cloud với Firebase Firestore
- Đồng bộ tự động khi online
- Hoạt động offline với localStorage
- Sync dữ liệu khi kết nối trở lại

### 📱 Tối ưu di động
- Responsive design
- PWA ready
- Tối ưu cho Safari/iOS
- Touch-friendly interface

## 🚀 Cài đặt và Triển khai

### Bước 1: Thiết lập Firebase

1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)

2. Bật Authentication:
   - Vào Authentication > Sign-in method
   - Bật Google và Email/Password

3. Tạo Firestore Database:
   - Vào Firestore Database
   - Tạo database (bắt đầu với test mode)

4. Cấu hình web app:
   - Vào Project Settings > Your apps
   - Thêm web app và lấy config

5. Cập nhật Firebase config trong `index.html`:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### Bước 2: Triển khai trên GitHub Pages

1. Push code lên GitHub repository

2. Vào Settings > Pages

3. Chọn source: Deploy from a branch

4. Chọn branch: main (hoặc branch chứa code)

5. Folder: / (root)

6. Save và đợi deploy

### Bước 3: Cấu hình Domain cho Firebase

1. Trong Firebase Console > Authentication > Settings

2. Thêm domain GitHub Pages vào "Authorized domains":
   - `username.github.io` (domain chính)
   - `username.github.io/repository-name` (nếu không phải repo username.github.io)

## 🛠️ Cấu trúc Project

```
sleep-tracker/
├── index.html          # Trang chính với UI và Firebase config
├── script.js           # Logic ứng dụng và Firebase integration
├── styles.css          # Styling và responsive design
└── README.md          # Hướng dẫn này
```

## 🔧 Tùy chỉnh

### Thay đổi chủ đề màu sắc
Chỉnh sửa CSS variables trong `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #43e97b;
    --warning-color: #ffa502;
    --error-color: #ff6b6b;
}
```

### Tùy chỉnh Firebase rules
Thiết lập Firestore rules để bảo mật dữ liệu:
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

## 📱 PWA Configuration

Ứng dụng đã được tối ưu để hoạt động như Progressive Web App:

- Meta tags cho mobile optimization
- App icons và manifest
- Offline functionality
- Safari/iOS specific optimizations

## 🐛 Troubleshooting

### Lỗi Firebase Authentication
- Kiểm tra domain được thêm vào Authorized domains
- Đảm bảo API keys đúng
- Kiểm tra browser console để xem lỗi chi tiết

### Dữ liệu không đồng bộ
- Kiểm tra kết nối internet
- Xem Firestore rules có cho phép read/write không
- Kiểm tra user đã đăng nhập chưa

### Vấn đề hiển thị trên di động
- Đảm bảo viewport meta tag được cài đặt đúng
- Kiểm tra CSS media queries
- Test trên các thiết bị khác nhau

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🌟 Credits

- Icons: Font Awesome
- Design inspiration: Modern sleep tracking apps
- Built with: Vanilla JavaScript, Firebase, CSS Grid/Flexbox

---

**Chúc bạn có những giấc ngủ ngon! 🌙✨**
