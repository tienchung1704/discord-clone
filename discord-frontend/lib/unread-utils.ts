/**
 * Utility functions for unread message tracking
 * These functions are extracted for testability
 * Requirements: 9.1, 9.2, 9.3
 */

export interface UnreadState {
  [channelId: string]: number;
}

export interface Message {
  id: string;
  channelId: string;
  profileId: string;
  createdAt: Date;
}

export interface ReadState {
  channelId: string;
  profileId: string;
  lastReadMessageId: string | null;
  lastReadAt: Date;
}

/**
 * Calculate unread count for a channel based on messages and read state
 * Requirements: 9.1, 9.2
 * 
 * @param messages - All messages in the channel
 * @param readState - The user's read state for the channel (null if never read)
 * @returns The number of unread messages
 */
export function calculateUnreadCount(
  messages: Message[],
  readState: ReadState | null
): number {
  if (!messages.length) {
    return 0;
  }

  if (!readState || !readState.lastReadMessageId) {
    // No read state means all messages are unread
    return messages.length;
  }

  // Find the last read message
  const lastReadMessage = messages.find(
    (m) => m.id === readState.lastReadMessageId
  );

  if (!lastReadMessage) {
    // Last read message not found (possibly deleted), count all messages
    return messages.length;
  }

  // Count messages created after the last read message
  const unreadCount = messages.filter(
    (m) => m.createdAt > lastReadMessage.createdAt
  ).length;

  return unreadCount;
}

/**
 * Check if a channel should be marked as unread when a new message arrives
 * Requirements: 9.1
 * 
 * @param newMessage - The new message that arrived
 * @param currentChannelId - The channel the user is currently viewing (null if none)
 * @param currentProfileId - The current user's profile ID
 * @returns true if the channel should be marked as unread
 */
export function shouldMarkChannelUnread(
  newMessage: Message,
  currentChannelId: string | null,
  currentProfileId: string
): boolean {
  // Don't mark as unread if user is viewing this channel
  if (newMessage.channelId === currentChannelId) {
    return false;
  }

  // Don't mark as unread for own messages
  if (newMessage.profileId === currentProfileId) {
    return false;
  }

  return true;
}

/**
 * Update unread counts when a new message arrives
 * Requirements: 9.1, 9.2
 * 
 * @param currentCounts - Current unread counts state
 * @param newMessage - The new message that arrived
 * @param currentChannelId - The channel the user is currently viewing
 * @param currentProfileId - The current user's profile ID
 * @returns Updated unread counts
 */
export function updateUnreadCountsOnNewMessage(
  currentCounts: UnreadState,
  newMessage: Message,
  currentChannelId: string | null,
  currentProfileId: string
): UnreadState {
  if (!shouldMarkChannelUnread(newMessage, currentChannelId, currentProfileId)) {
    return currentCounts;
  }

  return {
    ...currentCounts,
    [newMessage.channelId]: (currentCounts[newMessage.channelId] || 0) + 1,
  };
}

/**
 * Mark a channel as read (set unread count to 0)
 * Requirements: 9.3
 * 
 * @param currentCounts - Current unread counts state
 * @param channelId - The channel to mark as read
 * @returns Updated unread counts with the channel's count set to 0
 */
export function markChannelAsRead(
  currentCounts: UnreadState,
  channelId: string
): UnreadState {
  return {
    ...currentCounts,
    [channelId]: 0,
  };
}

/**
 * Get the unread count for a specific channel
 * Requirements: 9.2
 * 
 * @param counts - Current unread counts state
 * @param channelId - The channel to get count for
 * @returns The unread count (0 if not found)
 */
export function getUnreadCount(
  counts: UnreadState,
  channelId: string
): number {
  return counts[channelId] || 0;
}
