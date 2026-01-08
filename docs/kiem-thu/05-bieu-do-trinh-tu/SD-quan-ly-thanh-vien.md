# BIỂU ĐỒ TRÌNH TỰ: QUẢN LÝ THÀNH VIÊN

## Mermaid Sequence Diagram - Thay đổi Role

```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as MembersModal
    participant API as /api/members/{id}
    participant DB as Database

    A->>UI: Click "Manage Members"
    UI->>UI: Open modal
    UI-->>A: Hiển thị danh sách thành viên
    
    A->>UI: Click menu thành viên
    A->>UI: Chọn Role > MODERATOR
    UI->>API: PATCH {role: "MODERATOR"}
    
    API->>API: currentProfile()
    API->>API: Verify Admin role
    
    alt Not Admin
        API-->>UI: 401 Unauthorized
    else Is Admin
        API->>DB: server.update(members.update)
        DB-->>API: Updated server with members
        API-->>UI: 200 OK + server data
        UI->>UI: Refresh member list
        UI-->>A: Hiển thị role mới
    end
```

## Mermaid Sequence Diagram - Kick Member

```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as MembersModal
    participant API as /api/members/{id}
    participant DB as Database
    participant Socket as Socket.IO
    participant M as Kicked Member

    A->>UI: Click "Kick" trên thành viên
    UI->>API: DELETE ?serverId={id}
    
    API->>API: currentProfile()
    API->>API: Verify ownership
    
    alt Not Owner
        API-->>UI: 401 Unauthorized
    else Is Owner
        API->>DB: members.deleteMany({id, profileId != owner})
        DB-->>API: Updated server
        API-->>UI: 200 OK
        UI->>UI: Remove member from list
        UI-->>A: Cập nhật danh sách
        
        Note over Socket,M: Member bị kick sẽ mất quyền truy cập
    end
```

## Mô tả các đối tượng

| Đối tượng | Mô tả |
|-----------|-------|
| Admin | Người có quyền ADMIN |
| MembersModal | Component quản lý thành viên |
| API | REST API endpoint |
| Database | MySQL via Prisma |
