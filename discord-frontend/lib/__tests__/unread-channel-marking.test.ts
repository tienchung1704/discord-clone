import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  shouldMarkChannelUnread,
  updateUnreadCountsOnNewMessage,
  markChannelAsRead,
  getUnreadCount,
  calculateUnreadCount,
  UnreadState,
  Message,
  ReadState,
} from '../unread-utils';

/**
 * **Feature: performance-optimization, Property 20: Unread Channel Marking**
 * **Validates: Requirements 9.1**
 *
 * Property: For any new message in a channel the user is not currently viewing,
 * that channel SHALL be marked as unread.
 */

// Arbitrary for generating valid UUIDs
const uuidArb = fc.uuid();

// Arbitrary for generating valid Message objects
const messageArb = fc.record({
  id: uuidArb,
  channelId: uuidArb,
  profileId: uuidArb,
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

// Arbitrary for generating valid UnreadState
const unreadStateArb = fc.dictionary(uuidArb, fc.nat({ max: 1000 }));

describe('Unread Channel Marking - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: For any new message in a channel the user is NOT currently viewing,
   * and the message is NOT from the current user, the channel SHALL be marked as unread.
   */
  it('should mark channel as unread when new message arrives in non-viewed channel from another user', () => {
    fc.assert(
      fc.property(
        messageArb,
        uuidArb, // currentChannelId (different from message channel)
        uuidArb, // currentProfileId (different from message author)
        (message, currentChannelId, currentProfileId) => {
          // Ensure the message is in a different channel and from a different user
          fc.pre(message.channelId !== currentChannelId);
          fc.pre(message.profileId !== currentProfileId);

          const result = shouldMarkChannelUnread(message, currentChannelId, currentProfileId);

          // Channel should be marked as unread
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: For any new message in the channel the user IS currently viewing,
   * the channel SHALL NOT be marked as unread.
   */
  it('should NOT mark channel as unread when user is viewing that channel', () => {
    fc.assert(
      fc.property(
        messageArb,
        uuidArb, // currentProfileId
        (message, currentProfileId) => {
          // User is viewing the same channel where message arrived
          const currentChannelId = message.channelId;

          const result = shouldMarkChannelUnread(message, currentChannelId, currentProfileId);

          // Channel should NOT be marked as unread
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: For any new message from the current user,
   * the channel SHALL NOT be marked as unread (own messages don't count).
   */
  it('should NOT mark channel as unread for own messages', () => {
    fc.assert(
      fc.property(
        messageArb,
        uuidArb, // currentChannelId
        (message, currentChannelId) => {
          // Message is from the current user
          const currentProfileId = message.profileId;

          const result = shouldMarkChannelUnread(message, currentChannelId, currentProfileId);

          // Channel should NOT be marked as unread for own messages
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: When a new message arrives in a non-viewed channel from another user,
   * the unread count for that channel SHALL increase by exactly 1.
   */
  it('should increment unread count by 1 when marking channel as unread', () => {
    fc.assert(
      fc.property(
        unreadStateArb,
        messageArb,
        uuidArb, // currentChannelId
        uuidArb, // currentProfileId
        (initialCounts, message, currentChannelId, currentProfileId) => {
          // Ensure conditions for marking as unread
          fc.pre(message.channelId !== currentChannelId);
          fc.pre(message.profileId !== currentProfileId);

          const initialCount = getUnreadCount(initialCounts, message.channelId);
          const updatedCounts = updateUnreadCountsOnNewMessage(
            initialCounts,
            message,
            currentChannelId,
            currentProfileId
          );
          const newCount = getUnreadCount(updatedCounts, message.channelId);

          // Count should increase by exactly 1
          expect(newCount).toBe(initialCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: When a message arrives but should not mark channel as unread,
   * the unread counts SHALL remain unchanged.
   */
  it('should not change unread counts when message should not mark channel as unread', () => {
    fc.assert(
      fc.property(
        unreadStateArb,
        messageArb,
        (initialCounts, message) => {
          // User is viewing the channel where message arrived
          const currentChannelId = message.channelId;
          const currentProfileId = 'different-user-id';

          const updatedCounts = updateUnreadCountsOnNewMessage(
            initialCounts,
            message,
            currentChannelId,
            currentProfileId
          );

          // Counts should remain unchanged
          expect(updatedCounts).toEqual(initialCounts);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: Multiple messages in the same non-viewed channel SHALL each
   * increment the unread count by 1.
   */
  it('should correctly accumulate unread count for multiple messages', () => {
    fc.assert(
      fc.property(
        fc.array(messageArb, { minLength: 1, maxLength: 10 }),
        uuidArb, // targetChannelId
        uuidArb, // currentChannelId
        uuidArb, // currentProfileId
        (messages, targetChannelId, currentChannelId, currentProfileId) => {
          // Ensure all messages are in target channel and conditions for marking as unread
          fc.pre(targetChannelId !== currentChannelId);

          // Modify messages to be in target channel and from different users
          const channelMessages = messages.map((m) => ({
            ...m,
            channelId: targetChannelId,
            profileId: `other-user-${m.id}`, // Different from currentProfileId
          }));

          let counts: UnreadState = {};
          for (const msg of channelMessages) {
            counts = updateUnreadCountsOnNewMessage(
              counts,
              msg,
              currentChannelId,
              currentProfileId
            );
          }

          // Final count should equal number of messages
          expect(getUnreadCount(counts, targetChannelId)).toBe(channelMessages.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 20: Unread Channel Marking**
   * **Validates: Requirements 9.1**
   *
   * Property: When currentChannelId is null (user not viewing any channel),
   * any message from another user SHALL mark its channel as unread.
   */
  it('should mark channel as unread when user is not viewing any channel', () => {
    fc.assert(
      fc.property(
        messageArb,
        uuidArb, // currentProfileId
        (message, currentProfileId) => {
          // User is not viewing any channel
          const currentChannelId = null;
          
          // Message is from a different user
          fc.pre(message.profileId !== currentProfileId);

          const result = shouldMarkChannelUnread(message, currentChannelId, currentProfileId);

          // Channel should be marked as unread
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
