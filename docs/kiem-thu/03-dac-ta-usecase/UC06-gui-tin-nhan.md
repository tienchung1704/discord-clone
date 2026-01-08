# ĐẶC TẢ USE CASE: GỬI TIN NHẮN (UC06)

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| Mã UC | UC06 |
| Tên UC | Gửi tin nhắn |
| Actor | User, Moderator, Admin |
| Mô tả | Cho phép người dùng gửi tin nhắn văn bản trong kênh chat |
| Tiền điều kiện | User đã đăng nhập và là thành viên của server |
| Hậu điều kiện | Tin nhắn được lưu vào database và hiển thị real-time |

## 2. Luồng sự kiện chính (Main Flow)
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 1 | User chọn kênh chat | Hiển thị giao diện chat |
| 2 | User nhập nội dung tin nhắn | - |
| 3 | User nhấn Enter hoặc nút Gửi | - |
| 4 | - | Validate nội dung tin nhắn |
| 5 | - | Lưu tin nhắn vào database |
| 6 | - | Emit socket event |
| 7 | - | Hiển thị tin nhắn real-time cho tất cả thành viên |

## 3. Luồng thay thế (Alternative Flow)
### 3a. Gửi tin nhắn kèm file
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 3a.1 | User click icon đính kèm | Mở dialog upload file |
| 3a.2 | User chọn file | Upload file lên UploadThing |
| 3a.3 | - | Lưu tin nhắn với fileUrl |

## 4. Luồng ngoại lệ (Exception Flow)
### 4a. Tin nhắn rỗng
| Bước | Hệ thống |
|------|----------|
| 4a.1 | Hiển thị thông báo "Nội dung không được để trống" |
| 4a.2 | Không gửi tin nhắn |

### 4b. Mất kết nối
| Bước | Hệ thống |
|------|----------|
| 4b.1 | Hiển thị trạng thái "Đang kết nối lại..." |
| 4b.2 | Tự động retry khi có kết nối |

## 5. Yêu cầu phi chức năng
- Thời gian phản hồi: < 500ms
- Hỗ trợ emoji và markdown
- Tin nhắn tối đa 2000 ký tự
