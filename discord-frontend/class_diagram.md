# Detailed Class Diagram (Discord Clone)

This diagram follows the detailed UML style (Attributes + Methods) based on the project's logic and data structure.

```mermaid
classDiagram
    direction TB
    
    %% User & Profile System
    class Profile {
        - id: String {PK}
        - userId: String {unique}
        - name: String
        - email: String
        - imageUrl: String
        - isPremium: Boolean
        - status: UserStatus
        - lastSeen: DateTime
        - createdAt: DateTime
        - updatedAt: DateTime
        + updateProfile(data: ProfileData): void
        + setStatus(status: UserStatus): void
        + createServer(name: String): Server
        + joinServer(inviteCode: String): Member
        + addHobby(hobbyId: String): void
    }

    class Hobby {
        - id: String {PK}
        - type: HobbyType
        + getProfiles(): Profile[]
    }
    
    class ProfileHobby {
        - id: String {PK}
        - profileId: String {FK}
        - hobbyId: String {FK}
    }

    %% Server System
    class Server {
        - id: String {PK}
        - name: String
        - imageUrl: String
        - inviteCode: String {unique}
        - profileId: String {FK}
        - isPublic: Boolean
        - hobby: String?
        - createdAt: DateTime
        - updatedAt: DateTime
        + updateServer(data: ServerData): void
        + deleteServer(): void
        + generateInvite(): String
        + getMembers(): Member[]
        + getChannels(): Channel[]
    }

    class Member {
        - id: String {PK}
        - role: MemberRole
        - profileId: String {FK}
        - serverId: String {FK}
        - createdAt: DateTime
        - updatedAt: DateTime
        + updateRole(role: MemberRole): void
        + kick(): void
        + ban(): void
        + sendDirectMessage(content: String): Message
    }

    class CustomRole {
        - id: String {PK}
        - name: String
        - color: String
        - position: Int
        - serverId: String {FK}
        + assignTo(memberId: String): void
        + removeFrom(memberId: String): void
    }

    %% Channel & Chat System
    class Channel {
        - id: String {PK}
        - name: String
        - type: ChannelType
        - profileId: String {FK}
        - serverId: String {FK}
        - createdAt: DateTime
        - updatedAt: DateTime
        + sendMessage(content: String, fileUrl: String?): Message
        + deleteChannel(): void
        + updateChannel(name: String, type: ChannelType): void
    }

    class Message {
        - id: String {PK}
        - content: String {Text}
        - fileUrl: String?
        - memberId: String {FK}
        - channelId: String {FK}
        - deleted: Boolean
        - createdAt: DateTime
        - updatedAt: DateTime
        + edit(content: String): void
        + delete(): void
        + pin(): void
        + addReaction(emoji: String): void
    }

    class Reaction {
        - id: String {PK}
        - emoji: String
        - messageId: String {FK}
        - memberId: String {FK}
        - createdAt: DateTime
    }

    class PinnedMessage {
        - id: String {PK}
        - messageId: String {FK}
        - channelId: String {FK}
        - pinnedById: String {FK}
        + unpin(): void
    }

    %% Direct Messaging System
    class GlobalConversation {
        - id: String {PK}
        - profileOneId: String {FK}
        - profileTwoId: String {FK}
        - createdAt: DateTime
        + getMessages(): GlobalDirectMessage[]
    }

    class GlobalDirectMessage {
        - id: String {PK}
        - content: String
        - fileUrl: String?
        - profileId: String {FK}
        - conversationId: String {FK}
        - deleted: Boolean
        + edit(content: String): void
        + delete(): void
    }
    
    %% Relationships with Cardinality
    
    Profile "1" --> "0..*" Server : owns
    Profile "1" --> "0..*" ProfileHobby : has
    Hobby "1" --> "0..*" ProfileHobby : includes
    
    Server "1" *-- "0..*" Channel : contains
    Server "1" *-- "0..*" Member : has members
    Server "1" *-- "0..*" CustomRole : defines roles
    
    Profile "1" -- "0..*" Member : identity for
    
    Member "0..*" --> "0..*" CustomRole : assigned roles
    
    Channel "1" *-- "0..*" Message : stream
    Member "1" --> "0..*" Message : posts
    
    Message "1" *-- "0..*" Reaction : has
    Member "1" --> "0..*" Reaction : reacts
    
    Message "1" -- "0..1" PinnedMessage : can be
    
    %% DM Relations
    Profile "1" --> "0..*" GlobalConversation : participates
    GlobalConversation "1" *-- "0..*" GlobalDirectMessage : history
```

## Data Types

### Enums
*   **UserStatus**: `ONLINE`, `IDLE`, `DND`, `OFFLINE`
*   **MemberRole**: `ADMIN`, `MODERATOR`, `GUEST`
*   **ChannelType**: `TEXT`, `AUDIO`, `VIDEO`
*   **HobbyType**: `GAMING`, `MUSIC`, `PROGRAMMING`, `MOVIES`, `ANIME`, `BOOKS`, `TECHNOLOGY`, `SPORTS`, `TRAVEL`, `FOOD`

### Notes
*   `{PK}`: Primary Key
*   `{FK}`: Foreign Key
*   `{unique}`: Unique Constraint
*   Methods (e.g., `updateProfile`, `sendMessage`) are inferred from typical application logic, as Prisma schemas do not define behavior.
