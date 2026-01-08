# BIỂU ĐỒ HOẠT ĐỘNG: THAM GIA SERVER

## Mermaid Diagram

```mermaid
flowchart TD
    A[Bắt đầu] --> B{Phương thức tham gia?}
    
    B -->|Invite Link| C[User click invite link]
    C --> D[Trích xuất invite code]
    D --> E[Gọi API /invite/code]
    
    B -->|Public Server| F[User mở Explore]
    F --> G[Chọn hobby/sở thích]
    G --> H[Hiển thị danh sách server]
    H --> I[User chọn server]
    I --> J[Click Tham gia]
    J --> E
    
    E --> K{Invite code hợp lệ?}
    K -->|Không| L[Hiển thị lỗi: Link không hợp lệ]
    L --> M[Kết thúc]
    
    K -->|Có| N{Đã là thành viên?}
    N -->|Có| O[Redirect đến server]
    O --> M
    
    N -->|Không| P[Tạo Member record]
    P --> Q[Gán role GUEST]
    Q --> R[Redirect đến server]
    R --> S[Hiển thị channel general]
    S --> M
```

## Mô tả các hoạt động

| STT | Hoạt động | Mô tả |
|-----|-----------|-------|
| 1 | Click invite link | User truy cập URL /invite/{code} |
| 2 | Explore public | User duyệt server công khai theo hobby |
| 3 | Validate code | Kiểm tra invite code trong database |
| 4 | Check membership | Kiểm tra user đã join chưa |
| 5 | Create Member | INSERT vào bảng Member |
| 6 | Redirect | Chuyển hướng đến /servers/{id} |
