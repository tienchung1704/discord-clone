# BIỂU ĐỒ USE CASE TỔNG QUÁT

## 1. Danh sách Actor

| STT | Actor | Mô tả |
|-----|-------|-------|
| 1 | Guest | Người dùng chưa đăng nhập |
| 2 | User | Thành viên đã đăng nhập (role: GUEST) |
| 3 | Moderator | Người điều hành (role: MODERATOR) |
| 4 | Admin | Quản trị viên (role: ADMIN) |

## 2. Danh sách Use Case

### 2.1. Guest
| UC_ID | Tên Use Case |
|-------|--------------|
| UC01 | Đăng ký tài khoản |
| UC02 | Đăng nhập |

### 2.2. User (kế thừa từ Guest đã đăng nhập)
| UC_ID | Tên Use Case |
|-------|--------------|
| UC03 | Tạo Server |
| UC04 | Tham gia Server |
| UC05 | Rời Server |
| UC06 | Gửi tin nhắn |
| UC07 | Gửi tin nhắn trực tiếp (DM) |
| UC08 | Upload file |
| UC09 | Thêm Reaction |
| UC10 | Tìm kiếm tin nhắn |
| UC11 | Tham gia kênh thoại |
| UC12 | Tham gia kênh video |
| UC13 | Thanh toán Premium |
| UC14 | Thay đổi trạng thái |
| UC15 | Khám phá server công khai |

### 2.3. Moderator (kế thừa từ User)
| UC_ID | Tên Use Case |
|-------|--------------|
| UC16 | Mời thành viên |
| UC17 | Tạo kênh |
| UC18 | Quản lý Roles |
| UC19 | Ghim tin nhắn |

### 2.4. Admin (kế thừa từ Moderator)
| UC_ID | Tên Use Case |
|-------|--------------|
| UC20 | Quản lý Server |
| UC21 | Quản lý thành viên |
| UC22 | Xóa kênh |
| UC23 | Xóa Server |
