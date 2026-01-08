# BẢNG KIỂM THỬ HỆ THỐNG DISCORD CLONE

## 1. KIỂM THỬ CHỨC NĂNG ĐĂNG NHẬP/ĐĂNG KÝ

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC01 | Đăng nhập thành công | Email và mật khẩu hợp lệ | 1. Truy cập /sign-in<br>2. Nhập email<br>3. Nhập mật khẩu<br>4. Click Đăng nhập | Chuyển đến trang chính | | |
| TC02 | Đăng nhập sai mật khẩu | Email đúng, mật khẩu sai | 1. Truy cập /sign-in<br>2. Nhập email đúng<br>3. Nhập mật khẩu sai<br>4. Click Đăng nhập | Hiển thị lỗi "Mật khẩu không đúng" | | |
| TC03 | Đăng nhập email không tồn tại | Email chưa đăng ký | 1. Truy cập /sign-in<br>2. Nhập email không tồn tại<br>3. Click Đăng nhập | Hiển thị lỗi "Email không tồn tại" | | |
| TC04 | Đăng ký tài khoản mới | Thông tin hợp lệ | 1. Truy cập /sign-up<br>2. Nhập email mới<br>3. Nhập mật khẩu<br>4. Xác nhận email | Tạo tài khoản thành công | | |
| TC05 | Đăng ký email đã tồn tại | Email đã được sử dụng | 1. Truy cập /sign-up<br>2. Nhập email đã tồn tại | Hiển thị lỗi "Email đã được sử dụng" | | |

---

## 2. KIỂM THỬ CHỨC NĂNG QUẢN LÝ SERVER

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC06 | Tạo server mới | User đã đăng nhập | 1. Click nút "+"<br>2. Chọn "Create My Own"<br>3. Nhập tên server<br>4. Upload ảnh<br>5. Click Create | Server được tạo, user là Admin | | |
| TC07 | Tạo server không có tên | Để trống tên server | 1. Click nút "+"<br>2. Để trống tên<br>3. Click Create | Hiển thị lỗi "Tên server là bắt buộc" | | |
| TC08 | Tạo server công khai | User đã đăng nhập | 1. Click "+"<br>2. Chọn "Create for Community"<br>3. Nhập thông tin<br>4. Chọn hobby | Server công khai được tạo | | |
| TC09 | Chỉnh sửa server | User là Admin | 1. Click menu server<br>2. Chọn "Settings"<br>3. Sửa tên/ảnh<br>4. Click Save | Thông tin server được cập nhật | | |
| TC10 | Xóa server | User là Admin | 1. Click menu server<br>2. Chọn "Delete Server"<br>3. Xác nhận xóa | Server bị xóa, redirect về trang chính | | |
| TC11 | User thường không thể xóa server | User có role GUEST | 1. Click menu server | Không hiển thị option "Delete Server" | | |


---

## 3. KIỂM THỬ CHỨC NĂNG THAM GIA/RỜI SERVER

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC12 | Tham gia server qua invite link | Link hợp lệ | 1. Click invite link<br>2. Xác nhận tham gia | User trở thành thành viên với role GUEST | | |
| TC13 | Tham gia với link hết hạn | Link không hợp lệ | 1. Click invite link cũ | Hiển thị lỗi "Link không hợp lệ" | | |
| TC14 | Tham gia server đã là thành viên | User đã join server | 1. Click invite link | Redirect đến server (không tạo duplicate) | | |
| TC15 | Khám phá server công khai | User đã đăng nhập | 1. Click "Join Server"<br>2. Click "Explore Public Servers"<br>3. Chọn hobby | Hiển thị danh sách server phù hợp | | |
| TC16 | Tham gia server công khai | Server public tồn tại | 1. Từ danh sách public<br>2. Click "Join" | User trở thành thành viên | | |
| TC17 | Rời server | User là thành viên (không phải owner) | 1. Click menu server<br>2. Chọn "Leave Server"<br>3. Xác nhận | User bị xóa khỏi server | | |
| TC18 | Owner không thể rời server | User là Admin owner | 1. Click menu server | Không hiển thị option "Leave Server" | | |

---

## 4. KIỂM THỬ CHỨC NĂNG GỬI TIN NHẮN

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC19 | Gửi tin nhắn văn bản | User trong channel | 1. Chọn channel<br>2. Nhập tin nhắn<br>3. Nhấn Enter | Tin nhắn hiển thị real-time | | |
| TC20 | Gửi tin nhắn rỗng | Không nhập nội dung | 1. Chọn channel<br>2. Nhấn Enter (không nhập gì) | Không gửi được, không có lỗi | | |
| TC21 | Gửi tin nhắn kèm file | User trong channel | 1. Click icon đính kèm<br>2. Chọn file<br>3. Gửi | Tin nhắn với file được hiển thị | | |
| TC22 | Gửi tin nhắn kèm hình ảnh | File là ảnh (jpg, png) | 1. Click đính kèm<br>2. Chọn ảnh<br>3. Gửi | Ảnh hiển thị preview trong chat | | |
| TC23 | Xóa tin nhắn của mình | User là chủ tin nhắn | 1. Hover tin nhắn<br>2. Click icon xóa<br>3. Xác nhận | Tin nhắn hiển thị "Tin nhắn đã bị xóa" | | |
| TC24 | Chỉnh sửa tin nhắn | User là chủ tin nhắn | 1. Hover tin nhắn<br>2. Click icon sửa<br>3. Sửa nội dung<br>4. Nhấn Enter | Tin nhắn được cập nhật, hiển thị "(edited)" | | |
| TC25 | Gửi tin nhắn với emoji | User trong channel | 1. Click icon emoji<br>2. Chọn emoji<br>3. Gửi | Tin nhắn với emoji hiển thị đúng | | |


---

## 5. KIỂM THỬ CHỨC NĂNG TIN NHẮN TRỰC TIẾP (DM)

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC26 | Gửi DM cho thành viên | 2 user đã đăng nhập | 1. Click vào avatar thành viên<br>2. Chọn "Message"<br>3. Nhập tin nhắn<br>4. Gửi | Tin nhắn DM được gửi thành công | | |
| TC27 | Nhận thông báo DM | User B nhận DM từ A | 1. User A gửi DM<br>2. User B kiểm tra | User B nhận email thông báo | | |
| TC28 | Xem lịch sử DM | Đã có cuộc hội thoại | 1. Mở DM với user<br>2. Scroll lên | Hiển thị tin nhắn cũ (pagination) | | |

---

## 6. KIỂM THỬ CHỨC NĂNG REACTION

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC29 | Thêm reaction vào tin nhắn | Tin nhắn tồn tại | 1. Hover tin nhắn<br>2. Click icon emoji<br>3. Chọn emoji | Reaction hiển thị dưới tin nhắn | | |
| TC30 | Xóa reaction của mình | Đã thêm reaction | 1. Click vào reaction đã thêm | Reaction bị xóa | | |
| TC31 | Nhiều user cùng reaction | 2+ user react cùng emoji | 1. User A react 👍<br>2. User B react 👍 | Hiển thị 👍 2 với danh sách user | | |

---

## 7. KIỂM THỬ CHỨC NĂNG TÌM KIẾM

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC32 | Tìm kiếm tin nhắn | Có tin nhắn trong channel | 1. Click icon search<br>2. Nhập từ khóa<br>3. Enter | Hiển thị danh sách tin nhắn khớp | | |
| TC33 | Tìm kiếm không có kết quả | Từ khóa không tồn tại | 1. Click search<br>2. Nhập từ khóa lạ | Hiển thị "Không tìm thấy kết quả" | | |
| TC34 | Click vào kết quả tìm kiếm | Có kết quả tìm kiếm | 1. Tìm kiếm<br>2. Click vào kết quả | Scroll đến tin nhắn đó | | |

---

## 8. KIỂM THỬ CHỨC NĂNG GHIM TIN NHẮN

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC35 | Ghim tin nhắn (Moderator) | User có role MODERATOR+ | 1. Hover tin nhắn<br>2. Click "Pin"<br>3. Xác nhận | Tin nhắn được ghim | | |
| TC36 | User thường không thể ghim | User có role GUEST | 1. Hover tin nhắn | Không hiển thị option "Pin" | | |
| TC37 | Xem danh sách tin nhắn ghim | Có tin nhắn đã ghim | 1. Click icon Pin trên header | Hiển thị panel tin nhắn đã ghim | | |
| TC38 | Bỏ ghim tin nhắn | Moderator+ | 1. Mở panel Pin<br>2. Click "Unpin" | Tin nhắn bị bỏ ghim | | |


---

## 9. KIỂM THỬ CHỨC NĂNG QUẢN LÝ KÊNH

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC39 | Tạo kênh TEXT | User là Moderator+ | 1. Click menu server<br>2. Chọn "Create Channel"<br>3. Nhập tên, chọn TEXT<br>4. Create | Kênh TEXT được tạo | | |
| TC40 | Tạo kênh VOICE | User là Moderator+ | 1. Create Channel<br>2. Chọn type AUDIO | Kênh Voice được tạo | | |
| TC41 | Tạo kênh VIDEO | User là Moderator+ | 1. Create Channel<br>2. Chọn type VIDEO | Kênh Video được tạo | | |
| TC42 | Tạo kênh tên "general" | Bất kỳ | 1. Create Channel<br>2. Nhập tên "general" | Hiển thị lỗi "Không thể đặt tên general" | | |
| TC43 | Chỉnh sửa kênh | User là Moderator+ | 1. Click icon settings trên kênh<br>2. Sửa tên<br>3. Save | Tên kênh được cập nhật | | |
| TC44 | Xóa kênh | User là Admin | 1. Click settings kênh<br>2. Click Delete<br>3. Xác nhận | Kênh bị xóa | | |
| TC45 | Không thể xóa kênh general | Kênh general | 1. Kiểm tra kênh general | Không có option xóa | | |

---

## 10. KIỂM THỬ CHỨC NĂNG QUẢN LÝ THÀNH VIÊN

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC46 | Xem danh sách thành viên | User là Admin | 1. Click menu server<br>2. Chọn "Manage Members" | Hiển thị danh sách với role | | |
| TC47 | Thay đổi role thành MODERATOR | User là Admin | 1. Manage Members<br>2. Click menu thành viên<br>3. Role > Moderator | Role được cập nhật | | |
| TC48 | Thay đổi role thành GUEST | User là Admin | 1. Manage Members<br>2. Role > Guest | Role được cập nhật | | |
| TC49 | Kick thành viên | User là Admin | 1. Manage Members<br>2. Click "Kick"<br>3. Xác nhận | Thành viên bị xóa khỏi server | | |
| TC50 | Không thể kick chính mình | Admin owner | 1. Manage Members<br>2. Kiểm tra bản thân | Không hiển thị option Kick | | |

---

## 11. KIỂM THỬ CHỨC NĂNG QUẢN LÝ ROLES

| TC_ID | Tên Test Case | Điều kiện đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-------|---------------|-------------------|---------------------|------------------|-----------------|------------|
| TC51 | Tạo custom role | User là Moderator+ | 1. Click "Manage Roles"<br>2. Nhập tên role<br>3. Chọn màu<br>4. Click + | Role mới được tạo | | |
| TC52 | Gán role cho thành viên | Role đã tồn tại | 1. Manage Roles<br>2. Click icon Users<br>3. Click thành viên | Thành viên được gán role | | |
| TC53 | Gỡ role khỏi thành viên | Thành viên có role | 1. Manage Roles<br>2. Click thành viên đã có role | Role bị gỡ | | |
| TC54 | Xóa custom role | Role tồn tại | 1. Manage Roles<br>2. Click icon Trash | Role bị xóa | | |
| TC55 | Hiển thị màu role trong chat | Thành viên có custom role | 1. Gửi tin nhắn | Tên hiển thị với màu của role | | |
