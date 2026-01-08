# ĐẶC TẢ USE CASE: QUẢN LÝ THÀNH VIÊN (UC21)

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| Mã UC | UC21 |
| Tên UC | Quản lý thành viên |
| Actor | Admin |
| Mô tả | Cho phép Admin kick thành viên và thay đổi role |
| Tiền điều kiện | User có role ADMIN trong server |
| Hậu điều kiện | Thành viên bị kick hoặc role được cập nhật |

## 2. Luồng sự kiện chính (Main Flow) - Thay đổi Role
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 1 | Admin mở menu Server | Hiển thị dropdown menu |
| 2 | Admin click "Manage Members" | Hiển thị danh sách thành viên |
| 3 | Admin click menu của thành viên | Hiển thị options |
| 4 | Admin chọn "Role" > chọn role mới | - |
| 5 | - | Cập nhật role trong database |
| 6 | - | Refresh danh sách thành viên |

## 3. Luồng thay thế (Alternative Flow)
### 3a. Kick thành viên
| Bước | Actor | Hệ thống |
|------|-------|----------|
| 3a.1 | Admin click "Kick" | Hiển thị xác nhận |
| 3a.2 | Admin xác nhận | Xóa Member record |
| 3a.3 | - | Thành viên bị đưa ra khỏi server |

## 4. Luồng ngoại lệ (Exception Flow)
### 4a. Không thể kick chính mình
| Bước | Hệ thống |
|------|----------|
| 4a.1 | Không hiển thị option Kick cho Admin owner |

### 4b. Không thể thay đổi role của owner
| Bước | Hệ thống |
|------|----------|
| 4b.1 | Không hiển thị menu cho server owner |

## 5. Các Role có thể gán
| Role | Quyền hạn |
|------|-----------|
| GUEST | Gửi tin nhắn, tham gia voice |
| MODERATOR | + Mời, tạo kênh, quản lý roles, ghim tin nhắn |
| ADMIN | + Quản lý server, kick, xóa server |
