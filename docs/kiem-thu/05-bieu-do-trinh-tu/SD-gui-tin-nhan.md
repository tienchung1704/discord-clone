# BIỂU ĐỒ TRÌNH TỰ: GỬI TIN NHẮN

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as ChatInput
    participant API as /api/socket/messages
    participant DB as Database
    participant Socket as Socket.IO
    participant Others as Other Users

    U->>UI: Nhập tin nhắn
    U->>UI: Nhấn Enter/Send
    UI->>UI: Validate content
    
    alt Content rỗng
        UI-->>U: Hiển thị lỗi
    else Content hợp lệ
        UI->>API: POST {content, channelId, serverId}
        API->>API: currentProfilePages()
        
        alt Unauthorized
            API-->>UI: 401 Unauthorized
            UI-->>U: Redirect to login
        else Authorized
            API->>DB: findFirst(member)
            DB-->>API: member data
            
            alt Member not found
                API-->>UI: 404 Not authorized
            else Member found
                API->>DB: create(message)
                DB-->>API: message with member & profile
                API->>Socket: emit(chat:{channelId}:messages)
                Socket->>Others: broadcast message
                API-->>UI: 200 OK + message
                UI->>UI: Update local state
                UI-->>U: Hiển thị tin nhắn
                Others-->>Others: Hiển thị tin nhắn real-time
            end
        end
    end
```

## Mô tả các đối tượng

| Đối tượng | Mô tả |
|-----------|-------|
| User | Người dùng tương tác |
| ChatInput | Component nhập tin nhắn |
| API | Socket API endpoint |
| Database | MySQL via Prisma |
| Socket.IO | Real-time server |
| Other Users | Các thành viên khác trong channel |

## Các message chính

| STT | Message | Mô tả |
|-----|---------|-------|
| 1 | POST /api/socket/messages | Gửi tin nhắn mới |
| 2 | emit(chat:{channelId}:messages) | Broadcast qua socket |
| 3 | 200 OK | Phản hồi thành công |
