import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  markChannelAsRead,
  getUnreadCount,
  updateUnreadCountsOnNewMessage,
  UnreadState,
  Message,
} from '../unread-utils';

/**
 * **Feature: performance-optimization, Property 22: Read State on Channel Open**
 * **Validates: Requirements 9.3**
 *
 * Property: For any channel opened by a user, the unread count for that channel
 * SHALL become 0.
 */

// Arbitrary for generating valid UUIDs
const uuidArb = fc.uuid();

// Arbitrary for generating valid UnreadState with positive counts
const unreadStateWithCountsArb = fc.dictionary(
  uuidArb,
  fc.integer({ min: 1, max: 1000 }) // Positive unread counts
);

describe('Read State on Channel Open - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: For any channel with unread messages, when the user opens that channel,
   * the unread count SHALL become 0.
   */
  it('should set unread count to 0 when channel is opened', () => {
    fc.assert(
      fc.property(
        unreadStateWithCountsArb,
        uuidArb, // channelId to open
        fc.integer({ min: 1, max: 1000 }), // initial unread count
        (otherCounts, channelId, initialCount) => {
          // Set up initial state with unread messages
          const initialState: UnreadState = {
            ...otherCounts,
            [channelId]: initialCount,
          };

          // Verify initial count is positive
          expect(getUnreadCount(initialState, channelId)).toBe(initialCount);

          // Mark channel as read (simulating channel open)
          const updatedState = markChannelAsRead(initialState, channelId);

          // Unread count should be 0
          expect(getUnreadCount(updatedState, channelId)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: When a channel is opened, only that channel's unread count SHALL change;
   * other channels' counts SHALL remain unchanged.
   */
  it('should only affect the opened channel, not other channels', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.integer({ min: 0, max: 1000 })),
        uuidArb, // channelId to open
        fc.integer({ min: 1, max: 1000 }), // count for opened channel
        (otherCounts, openedChannelId, openedChannelCount) => {
          // Set up initial state
          const initialState: UnreadState = {
            ...otherCounts,
            [openedChannelId]: openedChannelCount,
          };

          // Mark channel as read
          const updatedState = markChannelAsRead(initialState, openedChannelId);

          // Verify opened channel is now 0
          expect(getUnreadCount(updatedState, openedChannelId)).toBe(0);

          // Verify all other channels remain unchanged
          for (const [channelId, count] of Object.entries(otherCounts)) {
            if (channelId !== openedChannelId) {
              expect(getUnreadCount(updatedState, channelId)).toBe(count);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: Opening a channel with 0 unread messages SHALL keep the count at 0.
   */
  it('should keep count at 0 when opening channel with no unread messages', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.integer({ min: 0, max: 1000 })),
        uuidArb, // channelId to open
        (otherCounts, channelId) => {
          // Set up initial state with 0 unread for the channel
          const initialState: UnreadState = {
            ...otherCounts,
            [channelId]: 0,
          };

          // Mark channel as read
          const updatedState = markChannelAsRead(initialState, channelId);

          // Count should still be 0
          expect(getUnreadCount(updatedState, channelId)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: Opening a channel not in the state SHALL add it with count 0.
   */
  it('should add channel with count 0 when opening channel not in state', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.integer({ min: 0, max: 1000 })),
        uuidArb, // channelId to open (not in state)
        (existingCounts, newChannelId) => {
          // Ensure channel is not in existing counts
          fc.pre(!(newChannelId in existingCounts));

          // Mark channel as read
          const updatedState = markChannelAsRead(existingCounts, newChannelId);

          // Channel should now exist with count 0
          expect(getUnreadCount(updatedState, newChannelId)).toBe(0);
          expect(newChannelId in updatedState).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: After opening a channel, new messages in OTHER channels SHALL still
   * increment their unread counts correctly.
   */
  it('should correctly track new messages in other channels after opening one', () => {
    fc.assert(
      fc.property(
        uuidArb, // openedChannelId
        uuidArb, // otherChannelId
        uuidArb, // currentProfileId
        fc.integer({ min: 1, max: 10 }), // number of new messages
        (openedChannelId, otherChannelId, currentProfileId, messageCount) => {
          // Ensure different channels
          fc.pre(openedChannelId !== otherChannelId);

          // Start with some unread in both channels
          let state: UnreadState = {
            [openedChannelId]: 5,
            [otherChannelId]: 3,
          };

          // Open the first channel (mark as read)
          state = markChannelAsRead(state, openedChannelId);

          // Verify opened channel is now 0
          expect(getUnreadCount(state, openedChannelId)).toBe(0);

          // Simulate new messages arriving in the other channel
          for (let i = 0; i < messageCount; i++) {
            const message: Message = {
              id: `msg-${i}`,
              channelId: otherChannelId,
              profileId: `other-user-${i}`,
              createdAt: new Date(),
            };

            state = updateUnreadCountsOnNewMessage(
              state,
              message,
              openedChannelId, // User is viewing openedChannelId
              currentProfileId
            );
          }

          // Other channel should have increased count
          expect(getUnreadCount(state, otherChannelId)).toBe(3 + messageCount);

          // Opened channel should still be 0
          expect(getUnreadCount(state, openedChannelId)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: Opening a channel multiple times SHALL always result in count 0.
   * (Idempotent operation)
   */
  it('should be idempotent - multiple opens result in same state', () => {
    fc.assert(
      fc.property(
        fc.dictionary(uuidArb, fc.integer({ min: 0, max: 1000 })),
        uuidArb, // channelId to open
        fc.integer({ min: 1, max: 1000 }), // initial count
        fc.integer({ min: 2, max: 5 }), // number of times to open
        (otherCounts, channelId, initialCount, openTimes) => {
          let state: UnreadState = {
            ...otherCounts,
            [channelId]: initialCount,
          };

          // Open the channel multiple times
          for (let i = 0; i < openTimes; i++) {
            state = markChannelAsRead(state, channelId);
          }

          // Count should be 0 regardless of how many times opened
          expect(getUnreadCount(state, channelId)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 22: Read State on Channel Open**
   * **Validates: Requirements 9.3**
   *
   * Property: After opening a channel, if new messages arrive in that same channel
   * while the user is still viewing it, the count SHALL remain 0.
   */
  it('should keep count at 0 for messages in currently viewed channel', () => {
    fc.assert(
      fc.property(
        uuidArb, // channelId
        uuidArb, // currentProfileId
        fc.integer({ min: 1, max: 10 }), // number of new messages
        (channelId, currentProfileId, messageCount) => {
          // Start with some unread
          let state: UnreadState = { [channelId]: 5 };

          // Open the channel (mark as read)
          state = markChannelAsRead(state, channelId);
          expect(getUnreadCount(state, channelId)).toBe(0);

          // Simulate new messages arriving while user is viewing this channel
          for (let i = 0; i < messageCount; i++) {
            const message: Message = {
              id: `msg-${i}`,
              channelId,
              profileId: `other-user-${i}`,
              createdAt: new Date(),
            };

            state = updateUnreadCountsOnNewMessage(
              state,
              message,
              channelId, // User is viewing this channel
              currentProfileId
            );
          }

          // Count should still be 0 since user is viewing the channel
          expect(getUnreadCount(state, channelId)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
