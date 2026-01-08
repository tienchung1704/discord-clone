# ĐẶC TẢ USE CASE: THAM GIA SERVER (UC04)

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| Mã UC | UC04 |
| Tên UC | Tham gia Server |
| Actor | User |
| Mô tả | Cho phép người dùng tham gia server qua invite link hoặc server công khai |
| Tiền điều kiện | User đã đăng nhập |
| Hậu điều kiện | User trở thành thành viên của server với role GUEST |

## 2. Luồng sự kiện chính (Main Flow) - Qua Invite Link
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 1 | User click vào invite link | - |
| 2 | - | Validate invite code |
| 3 | - | Kiểm tra user đã là thành viên chưa |
| 4 | - | Tạo Member record với role GUEST |
| 5 | - | Redirect đến server |

## 3. Luồng thay thế (Alternative Flow)
### 3a. Tham gia qua Server công khai
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 3a.1 | User click "Khám phá server công khai" | Hiển thị danh sách server theo hobby |
| 3a.2 | User chọn server | Hiển thị thông tin server |
| 3a.3 | User click "Tham gia" | Tạo Member record |
| 3a.4 | - | Redirect đến server |

## 4. Luồng ngoại lệ (Exception Flow)
### 4a. Invite code không hợp lệ
| Bước | Hệ thống |
|------|----------|
| 4a.1 | Hiển thị "Link mời không hợp lệ hoặc đã hết hạn" |

### 4b. Đã là thành viên
| Bước | Hệ thống |
|------|----------|
| 4b.1 | Redirect trực tiếp đến server |

## 5. Yêu cầu phi chức năng
- Invite code là UUID unique
- Hỗ trợ deep link
