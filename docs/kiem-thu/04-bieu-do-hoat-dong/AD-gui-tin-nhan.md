# BIỂU ĐỒ HOẠT ĐỘNG: GỬI TIN NHẮN

## Mermaid Diagram

```mermaid
flowchart TD
    A[Bắt đầu] --> B[User chọn kênh chat]
    B --> C[Hiển thị giao diện chat]
    C --> D[User nhập nội dung]
    D --> E{Có đính kèm file?}
    
    E -->|Có| F[Mở dialog upload]
    F --> G[User chọn file]
    G --> H[Upload lên UploadThing]
    H --> I[Nhận fileUrl]
    I --> J{Nội dung hợp lệ?}
    
    E -->|Không| J
    
    J -->|Không| K[Hiển thị lỗi]
    K --> D
    
    J -->|Có| L[Gửi request đến API]
    L --> M[Validate trên server]
    M --> N{Hợp lệ?}
    
    N -->|Không| O[Trả về lỗi 400]
    O --> K
    
    N -->|Có| P[Lưu vào database]
    P --> Q[Emit socket event]
    Q --> R[Broadcast đến tất cả client]
    R --> S[Hiển thị tin nhắn real-time]
    S --> T[Kết thúc]
```

## Mô tả các hoạt động

| STT | Hoạt động | Mô tả |
|-----|-----------|-------|
| 1 | Chọn kênh chat | User click vào kênh trong sidebar |
| 2 | Nhập nội dung | User gõ tin nhắn vào input |
| 3 | Upload file | Optional - đính kèm hình ảnh/file |
| 4 | Validate | Kiểm tra nội dung không rỗng |
| 5 | Lưu database | INSERT vào bảng Message |
| 6 | Socket emit | Gửi event qua Socket.IO |
| 7 | Broadcast | Gửi đến tất cả client trong channel |
