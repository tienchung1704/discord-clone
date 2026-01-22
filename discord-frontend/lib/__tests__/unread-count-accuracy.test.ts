import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateUnreadCount,
  getUnreadCount,
  updateUnreadCountsOnNewMessage,
  UnreadState,
  Message,
  ReadState,
} from '../unread-utils';

/**
 * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
 * **Validates: Requirements 9.2**
 *
 * Property: For any channel with N unread messages, the badge SHALL display the value N.
 */

// Arbitrary for generating valid UUIDs
const uuidArb = fc.uuid();

// Arbitrary for generating valid dates in a reasonable range
const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') });

// Arbitrary for generating valid Message objects
const messageArb = fc.record({
  id: uuidArb,
  channelId: uuidArb,
  profileId: uuidArb,
  createdAt: dateArb,
});

// Arbitrary for generating a list of messages with sequential timestamps
const orderedMessagesArb = (channelId: string, count: number) =>
  fc.array(
    fc.record({
      id: uuidArb,
      profileId: uuidArb,
    }),
    { minLength: count, maxLength: count }
  ).map((msgs) =>
    msgs.map((m, index) => ({
      ...m,
      channelId,
      createdAt: new Date(2024, 0, 1, 0, 0, index), // Sequential timestamps
    }))
  );

describe('Unread Count Badge Accuracy - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: For any channel with no read state (never visited),
   * the unread count SHALL equal the total number of messages.
   */
  it('should show all messages as unread when channel has never been read', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        fc.integer({ min: 0, max: 50 }), // number of messages
        (channelId, messageCount) => {
          // Generate messages for the channel
          const messages: Message[] = Array.from({ length: messageCount }, (_, i) => ({
            id: `msg-${i}`,
            channelId,
            profileId: `user-${i}`,
            createdAt: new Date(2024, 0, 1, 0, 0, i),
          }));

          // No read state (null)
          const readState: ReadState | null = null;

          const unreadCount = calculateUnreadCount(messages, readState);

          // All messages should be unread
          expect(unreadCount).toBe(messageCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: For any channel where the user has read up to message M,
   * the unread count SHALL equal the number of messages after M.
   */
  it('should accurately count messages after last read message', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        uuidArb, // profileId
        fc.integer({ min: 1, max: 20 }), // total messages
        fc.integer({ min: 0, max: 19 }), // index of last read message
        (channelId, profileId, totalMessages, lastReadIndex) => {
          // Ensure lastReadIndex is valid
          fc.pre(lastReadIndex < totalMessages);

          // Generate messages with sequential timestamps
          const messages: Message[] = Array.from({ length: totalMessages }, (_, i) => ({
            id: `msg-${i}`,
            channelId,
            profileId: `user-${i}`,
            createdAt: new Date(2024, 0, 1, 0, 0, i),
          }));

          // Create read state pointing to the message at lastReadIndex
          const readState: ReadState = {
            channelId,
            profileId,
            lastReadMessageId: messages[lastReadIndex].id,
            lastReadAt: new Date(),
          };

          const unreadCount = calculateUnreadCount(messages, readState);

          // Unread count should be messages after lastReadIndex
          const expectedUnread = totalMessages - lastReadIndex - 1;
          expect(unreadCount).toBe(expectedUnread);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: For any channel where the user has read the latest message,
   * the unread count SHALL be 0.
   */
  it('should show 0 unread when user has read the latest message', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        uuidArb, // profileId
        fc.integer({ min: 1, max: 50 }), // number of messages
        (channelId, profileId, messageCount) => {
          // Generate messages
          const messages: Message[] = Array.from({ length: messageCount }, (_, i) => ({
            id: `msg-${i}`,
            channelId,
            profileId: `user-${i}`,
            createdAt: new Date(2024, 0, 1, 0, 0, i),
          }));

          // Read state points to the last message
          const lastMessage = messages[messages.length - 1];
          const readState: ReadState = {
            channelId,
            profileId,
            lastReadMessageId: lastMessage.id,
            lastReadAt: new Date(),
          };

          const unreadCount = calculateUnreadCount(messages, readState);

          // No unread messages
          expect(unreadCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: For any empty channel, the unread count SHALL be 0.
   */
  it('should show 0 unread for empty channel', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        uuidArb, // profileId
        fc.boolean(), // whether read state exists
        (channelId, profileId, hasReadState) => {
          const messages: Message[] = [];

          const readState: ReadState | null = hasReadState
            ? {
                channelId,
                profileId,
                lastReadMessageId: null,
                lastReadAt: new Date(),
              }
            : null;

          const unreadCount = calculateUnreadCount(messages, readState);

          expect(unreadCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: The getUnreadCount function SHALL return the exact value stored
   * in the unread state for a given channel.
   */
  it('should return exact stored unread count value', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.nat({ max: 1000 })),
        uuidArb, // channelId to query
        fc.nat({ max: 1000 }), // expected count
        (otherCounts, channelId, expectedCount) => {
          const counts: UnreadState = {
            ...otherCounts,
            [channelId]: expectedCount,
          };

          const result = getUnreadCount(counts, channelId);

          expect(result).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: For any channel not in the unread state, getUnreadCount SHALL return 0.
   */
  it('should return 0 for channels not in unread state', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.nat({ max: 1000 })),
        uuidArb, // channelId to query (not in dictionary)
        (counts, queryChannelId) => {
          // Ensure the channel is not in the counts
          fc.pre(!(queryChannelId in counts));

          const result = getUnreadCount(counts, queryChannelId);

          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: After N messages arrive in a channel (from other users, not currently viewed),
   * the unread count SHALL be exactly N.
   */
  it('should accurately track count after multiple messages', () => {
    fc.assert(
      fc.property(
        uuidArb, // targetChannelId
        uuidArb, // currentChannelId (different)
        uuidArb, // currentProfileId
        fc.integer({ min: 1, max: 20 }), // number of messages
        (targetChannelId, currentChannelId, currentProfileId, messageCount) => {
          // Ensure different channels
          fc.pre(targetChannelId !== currentChannelId);

          let counts: UnreadState = {};

          // Simulate N messages arriving
          for (let i = 0; i < messageCount; i++) {
            const message: Message = {
              id: `msg-${i}`,
              channelId: targetChannelId,
              profileId: `other-user-${i}`, // Different from current user
              createdAt: new Date(2024, 0, 1, 0, 0, i),
            };

            counts = updateUnreadCountsOnNewMessage(
              counts,
              message,
              currentChannelId,
              currentProfileId
            );
          }

          // Unread count should be exactly N
          expect(getUnreadCount(counts, targetChannelId)).toBe(messageCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 21: Unread Count Badge Accuracy**
   * **Validates: Requirements 9.2**
   *
   * Property: When read state references a deleted/missing message,
   * all messages SHALL be counted as unread.
   */
  it('should count all messages as unread when last read message is missing', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        uuidArb, // profileId
        fc.integer({ min: 1, max: 50 }), // number of messages
        (channelId, profileId, messageCount) => {
          // Generate messages
          const messages: Message[] = Array.from({ length: messageCount }, (_, i) => ({
            id: `msg-${i}`,
            channelId,
            profileId: `user-${i}`,
            createdAt: new Date(2024, 0, 1, 0, 0, i),
          }));

          // Read state points to a non-existent message
          const readState: ReadState = {
            channelId,
            profileId,
            lastReadMessageId: 'non-existent-message-id',
            lastReadAt: new Date(),
          };

          const unreadCount = calculateUnreadCount(messages, readState);

          // All messages should be unread since last read message is missing
          expect(unreadCount).toBe(messageCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
