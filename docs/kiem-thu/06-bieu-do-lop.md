# BIỂU ĐỒ LỚP (CLASS DIAGRAM)

## Mermaid Class Diagram

```mermaid
classDiagram
    class Profile {
        +String id
        +String userId
        +String name
        +String imageUrl
        +String email
        +Boolean isPremium
        +UserStatus status
        +DateTime lastSeen
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Server {
        +String id
        +String name
        +String imageUrl
        +String inviteCode
        +String profileId
        +String hobby
        +Boolean isPublic
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Member {
        +String id
        +MemberRole role
        +String profileId
        +String serverId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Channel {
        +String id
        +String name
        +ChannelType type
        +String profileId
        +String serverId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Message {
        +String id
        +String content
        +String fileUrl
        +String memberId
        +String channelId
        +Boolean deleted
        +DateTime createdAt
        +DateTime updatedAt
    }

    class CustomRole {
        +String id
        +String name
        +String color
        +Int position
        +String serverId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Reaction {
        +String id
        +String emoji
        +String messageId
        +String memberId
        +DateTime createdAt
    }

    class GlobalConversation {
        +String id
        +String profileOneId
        +String profileTwoId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class GlobalDirectMessage {
        +String id
        +String content
        +String fileUrl
        +String profileId
        +String conversationId
        +Boolean deleted
        +DateTime createdAt
        +DateTime updatedAt
    }

    class PinnedMessage {
        +String id
        +String messageId
        +String channelId
        +String pinnedById
        +DateTime pinnedAt
    }

    %% Relationships
    Profile "1" --> "*" Server : owns
    Profile "1" --> "*" Member : has
    Server "1" --> "*" Member : contains
    Server "1" --> "*" Channel : has
    Server "1" --> "*" CustomRole : has
    Member "1" --> "*" Message : sends
    Channel "1" --> "*" Message : contains
    Message "1" --> "*" Reaction : has
    Message "1" --> "0..1" PinnedMessage : pinned
    Member "1" --> "*" Reaction : adds
    Profile "1" --> "*" GlobalConversation : initiates
    GlobalConversation "1" --> "*" GlobalDirectMessage : contains
```

## Mô tả các lớp chính

| Lớp | Mô tả |
|-----|-------|
| Profile | Thông tin người dùng (từ Clerk) |
| Server | Máy chủ/nhóm chat |
| Member | Thành viên trong server |
| Channel | Kênh chat (TEXT/AUDIO/VIDEO) |
| Message | Tin nhắn trong channel |
| CustomRole | Role tùy chỉnh trong server |
| Reaction | Emoji reaction trên tin nhắn |
| GlobalConversation | Cuộc hội thoại DM |
| GlobalDirectMessage | Tin nhắn trực tiếp |
| PinnedMessage | Tin nhắn được ghim |

## Enum Types

```
MemberRole: ADMIN | MODERATOR | GUEST
ChannelType: TEXT | AUDIO | VIDEO
UserStatus: ONLINE | IDLE | DND | OFFLINE
HobbyType: GAMING | MUSIC | PROGRAMMING | MOVIES | SPORTS | ANIME | BOOKS | TECHNOLOGY | TRAVEL | FOOD
```
