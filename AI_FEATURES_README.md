# 🌙 Quản lý Giấc ngủ - AI Features

## 🚀 Tính năng AI

### 1. Smart Sleep Advisor
- Phân tích dữ liệu giấc ngủ của bạn
- Đưa ra lời khuyên cá nhân hóa
- Gợi ý cải thiện chất lượng giấc ngủ

### 2. Sleep Pattern Analysis
- Phát hiện xu hướng giấc ngủ
- Cảnh báo khi có vấn đề về giấc ngủ
- Đề xuất thời gian đi ngủ tối ưu

## 🔧 Khắc phục lỗi đăng nhập Google

### Lỗi "popup-blocked" khi đăng nhập Google

**Nguyên nhân:**
- Trình duyệt chặn popup đăng nhập
- Ad blocker chặn popup
- Cài đặt bảo mật trình duyệt quá nghiêm ngặt

**Cách khắc phục:**

#### 1. Cho phép popup cho trang web này
- **Chrome/Edge:** Click vào biểu tượng khóa bên cạnh URL → "Site settings" → "Pop-ups and redirects" → "Allow"
- **Firefox:** Click vào biểu tượng khóa → "Site Permissions" → "Pop-ups" → "Allow"
- **Safari:** Preferences → Websites → Pop-up Windows → Chọn "Allow" cho domain này

#### 2. Tắt ad blocker tạm thời
- Tắt uBlock Origin, AdBlock Plus, hoặc các extension chặn quảng cáo
- Thêm trang web vào whitelist

#### 3. Kiểm tra cài đặt bảo mật
- **Chrome:** Settings → Privacy and security → Site Settings → Pop-ups and redirects
- **Firefox:** about:preferences#privacy → Permissions → Block pop-up windows
- **Safari:** Preferences → Security → Block pop-up windows

#### 4. Sử dụng chế độ redirect (tự động)
- App sẽ tự động chuyển sang chế độ redirect nếu popup bị chặn
- Bạn sẽ được chuyển hướng đến trang đăng nhập Google
- Sau khi đăng nhập, bạn sẽ được chuyển về app

#### 5. Sử dụng nút đăng nhập redirect trực tiếp
- Trong modal đăng nhập, sử dụng nút "Đăng nhập Google (Chế độ chuyển hướng)"
- Nút này sẽ chuyển hướng ngay lập tức mà không cần thử popup

#### 6. Kiểm tra trạng thái popup
- Sử dụng nút "Kiểm tra trạng thái Popup" để xem popup có bị chặn không
- Nút này sẽ hiển thị hướng dẫn chi tiết nếu có vấn đề

## 🛠️ Cài đặt Firebase

### 1. Tạo project Firebase
- Vào [Firebase Console](https://console.firebase.google.com/)
- Tạo project mới
- Thêm web app

### 2. Bật Authentication
- Authentication → Sign-in method
- Bật Google provider
- Thêm support email

### 3. Bật Firestore
- Firestore Database → Create database
- Chọn test mode hoặc production mode
- Thiết lập security rules

### 4. Cập nhật config
- Sao chép thông tin từ Project Settings
- Cập nhật vào `config.js`

## 📱 Tính năng chính

- ✅ Theo dõi giấc ngủ hàng ngày
- ✅ Phân tích chất lượng giấc ngủ
- ✅ Thống kê và biểu đồ
- ✅ Đồng bộ đám mây với Firebase
- ✅ Hoạt động offline
- ✅ Thông báo nhắc nhở
- ✅ Tương thích Safari

## 🌐 Triển khai

### GitHub Pages
1. Push code lên GitHub
2. Vào Settings → Pages
3. Chọn source branch
4. Cập nhật Firebase authorized domains

### Custom Domain
1. Thêm domain vào Firebase Console
2. Cập nhật DNS records
3. Cấu hình SSL

## 🔒 Bảo mật

- API keys được lưu trong `config.js`
- **KHÔNG push `config.js` lên GitHub**
- Sử dụng Firebase security rules
- Xác thực user trước khi truy cập dữ liệu

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser
2. Sử dụng nút "Kiểm tra trạng thái Popup"
3. Xem hướng dẫn khắc phục lỗi popup
4. Sử dụng nút "Đăng nhập Google (Chế độ chuyển hướng)"
5. Kiểm tra cài đặt Firebase
6. Đảm bảo domain được authorize

---

**Lưu ý:** App sẽ tự động xử lý lỗi popup bằng cách chuyển sang chế độ redirect, đảm bảo user luôn có thể đăng nhập được. Nếu vẫn gặp vấn đề, hãy sử dụng các nút fallback được cung cấp.