# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu để tối ưu hóa hiệu năng và nâng cấp tính năng cho ứng dụng Discord Clone. Dựa trên phân tích code hiện tại, project có một số vấn đề về hiệu năng cần được cải thiện và có thể bổ sung thêm các tính năng mới để nâng cao trải nghiệm người dùng.

## Glossary

- **Discord_Clone**: Ứng dụng chat real-time clone Discord được xây dựng với Next.js
- **Query_Client**: React Query client quản lý cache và fetching data
- **Socket_Provider**: Component quản lý kết nối WebSocket real-time
- **Prisma_Client**: ORM client để tương tác với database MySQL
- **Modal_Provider**: Component quản lý tất cả các modal dialogs trong ứng dụng
- **Server_Sidebar**: Component hiển thị danh sách channels và members của server
- **Message_Batch**: Số lượng tin nhắn được load trong mỗi lần fetch (hiện tại: 25)
- **Lazy_Loading**: Kỹ thuật chỉ load component khi cần thiết
- **Debounce**: Kỹ thuật giảm số lần gọi function trong khoảng thời gian ngắn
- **Memoization**: Kỹ thuật cache kết quả tính toán để tránh re-render không cần thiết

## Requirements

### Requirement 1: Tối ưu Query Client Configuration

**User Story:** As a user, I want the application to load data faster and cache efficiently, so that I can have a smoother experience without unnecessary loading states.

#### Acceptance Criteria

1. WHEN the Query_Client initializes THEN the Discord_Clone SHALL configure staleTime to 60 seconds for reducing unnecessary refetches
2. WHEN data is cached THEN the Query_Client SHALL retain cache for 5 minutes (gcTime) to improve navigation performance
3. WHEN the user navigates between channels THEN the Discord_Clone SHALL use cached data immediately while revalidating in background
4. WHEN network requests fail THEN the Query_Client SHALL retry up to 3 times with exponential backoff

### Requirement 2: Tối ưu Modal Provider với Lazy Loading

**User Story:** As a user, I want the application to load faster initially, so that I can start using it without waiting for all modals to load.

#### Acceptance Criteria

1. WHEN the application starts THEN the Modal_Provider SHALL lazy load modal components only when needed
2. WHEN a modal is opened for the first time THEN the Discord_Clone SHALL dynamically import the modal component
3. WHEN multiple modals exist THEN the Discord_Clone SHALL only render the currently active modal
4. WHEN a modal is closed THEN the Discord_Clone SHALL unmount the modal component to free memory

### Requirement 3: Tối ưu Database Queries với Select Fields

**User Story:** As a developer, I want database queries to be optimized, so that the application responds faster and uses less bandwidth.

#### Acceptance Criteria

1. WHEN fetching messages THEN the Discord_Clone SHALL select only required fields instead of full records
2. WHEN fetching server data THEN the Discord_Clone SHALL use selective includes to avoid over-fetching related data
3. WHEN fetching member lists THEN the Discord_Clone SHALL paginate results for servers with many members
4. WHEN querying profiles THEN the Discord_Clone SHALL exclude unnecessary fields like timestamps when not needed

### Requirement 4: Tối ưu Chat Messages với Virtualization

**User Story:** As a user, I want to scroll through thousands of messages smoothly, so that I can read chat history without lag.

#### Acceptance Criteria

1. WHEN displaying messages THEN the Discord_Clone SHALL use virtual scrolling to render only visible messages
2. WHEN the user scrolls quickly THEN the Discord_Clone SHALL maintain smooth 60fps scrolling performance
3. WHEN loading older messages THEN the Discord_Clone SHALL preserve scroll position accurately
4. WHEN a new message arrives THEN the Discord_Clone SHALL append it without re-rendering all messages

### Requirement 5: Tối ưu Socket Connection với Reconnection Strategy

**User Story:** As a user, I want my real-time connection to be stable, so that I receive messages without interruption.

#### Acceptance Criteria

1. WHEN the socket disconnects THEN the Socket_Provider SHALL attempt reconnection with exponential backoff
2. WHEN reconnection succeeds THEN the Discord_Clone SHALL sync missed messages automatically
3. WHEN the user's network changes THEN the Socket_Provider SHALL detect and reconnect gracefully
4. WHEN the socket is idle THEN the Discord_Clone SHALL send heartbeat pings to maintain connection

### Requirement 6: Thêm tính năng Message Search

**User Story:** As a user, I want to search for messages in a channel, so that I can find specific conversations quickly.

#### Acceptance Criteria

1. WHEN a user types in the search box THEN the Discord_Clone SHALL debounce input for 300ms before searching
2. WHEN search results are returned THEN the Discord_Clone SHALL highlight matching text in results
3. WHEN a user clicks a search result THEN the Discord_Clone SHALL scroll to that message in the channel
4. WHEN no results are found THEN the Discord_Clone SHALL display a helpful empty state message

### Requirement 7: Thêm tính năng Typing Indicators

**User Story:** As a user, I want to see when others are typing, so that I know someone is about to send a message.

#### Acceptance Criteria

1. WHEN a user starts typing THEN the Discord_Clone SHALL emit a typing event via socket
2. WHEN typing events are received THEN the Discord_Clone SHALL display typing indicator with user names
3. WHEN a user stops typing for 3 seconds THEN the Discord_Clone SHALL remove the typing indicator
4. WHEN multiple users are typing THEN the Discord_Clone SHALL display "X users are typing..."

### Requirement 8: Thêm tính năng Message Reactions

**User Story:** As a user, I want to react to messages with emojis, so that I can express my feelings without sending a new message.

#### Acceptance Criteria

1. WHEN a user clicks the reaction button THEN the Discord_Clone SHALL display an emoji picker
2. WHEN a reaction is added THEN the Discord_Clone SHALL update the message in real-time for all users
3. WHEN a user clicks an existing reaction THEN the Discord_Clone SHALL toggle their reaction on/off
4. WHEN displaying reactions THEN the Discord_Clone SHALL show reaction count and list of users who reacted

### Requirement 9: Thêm tính năng Unread Message Indicators

**User Story:** As a user, I want to see which channels have unread messages, so that I can quickly find new conversations.

#### Acceptance Criteria

1. WHEN a new message arrives in a channel THEN the Discord_Clone SHALL mark that channel as unread
2. WHEN displaying channels THEN the Discord_Clone SHALL show unread count badge on channel items
3. WHEN a user opens a channel THEN the Discord_Clone SHALL mark all messages as read
4. WHEN a user scrolls to the bottom THEN the Discord_Clone SHALL clear the unread indicator

### Requirement 10: Tối ưu Image Loading với Blur Placeholder

**User Story:** As a user, I want images to load progressively, so that I see content faster without layout shifts.

#### Acceptance Criteria

1. WHEN loading images THEN the Discord_Clone SHALL display a blur placeholder immediately
2. WHEN images are loaded THEN the Discord_Clone SHALL fade in the full image smoothly
3. WHEN images fail to load THEN the Discord_Clone SHALL display a fallback placeholder
4. WHEN displaying avatars THEN the Discord_Clone SHALL use optimized image sizes based on display size

### Requirement 11: Thêm tính năng Pin Messages

**User Story:** As a moderator, I want to pin important messages, so that users can easily find key information.

#### Acceptance Criteria

1. WHEN a moderator pins a message THEN the Discord_Clone SHALL add it to the pinned messages list
2. WHEN viewing pinned messages THEN the Discord_Clone SHALL display them in a dedicated panel
3. WHEN a pinned message is clicked THEN the Discord_Clone SHALL scroll to that message in the channel
4. WHEN a message is unpinned THEN the Discord_Clone SHALL remove it from the pinned list immediately

### Requirement 12: Tối ưu Bundle Size với Code Splitting

**User Story:** As a user, I want the application to load faster on slow connections, so that I can start chatting sooner.

#### Acceptance Criteria

1. WHEN the application builds THEN the Discord_Clone SHALL split code by route for smaller initial bundles
2. WHEN loading emoji picker THEN the Discord_Clone SHALL lazy load the emoji-mart library
3. WHEN loading voice features THEN the Discord_Clone SHALL lazy load LiveKit components
4. WHEN analyzing bundle THEN the Discord_Clone SHALL keep initial JS bundle under 200KB gzipped
