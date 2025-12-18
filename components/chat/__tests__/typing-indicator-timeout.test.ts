import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  removeExpiredTypingUsers,
  formatTypingText,
  updateTypingUsers,
} from '../typing-indicator';

/**
 * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
 * **Validates: Requirements 7.3**
 *
 * Property: For any typing indicator displayed, if no typing event is received
 * for 3 seconds, the indicator SHALL be removed.
 *
 * This test validates that:
 * 1. Users whose timestamp is older than TYPING_TIMEOUT (3000ms) are removed
 * 2. Users whose timestamp is within TYPING_TIMEOUT are retained
 * 3. The timeout boundary is correctly handled (exactly 3000ms)
 */

// Timeout constant (matches typing-indicator.tsx)
const TYPING_TIMEOUT = 3000;

// Arbitrary for generating valid TypingUser objects
// Using reasonable timestamp range to avoid overflow issues
const typingUserArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  timestamp: fc.integer({ min: 0, max: 1000000000 }),
});

describe('Typing Indicator Timeout - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: For any typing user whose timestamp is older than 3 seconds,
   * that user SHALL be removed from the typing users list.
   */
  it('should remove users whose timestamp is older than 3 seconds', () => {
    fc.assert(
      fc.property(
        typingUserArb,
        // Time delta greater than timeout
        fc.integer({ min: TYPING_TIMEOUT + 1, max: TYPING_TIMEOUT + 10000 }),
        (user, timeDelta) => {
          const currentTime = user.timestamp + timeDelta;
          const users = [user];

          const result = removeExpiredTypingUsers(users, currentTime, TYPING_TIMEOUT);

          // User should be removed since their timestamp is older than 3 seconds
          expect(result).toHaveLength(0);
          expect(result.find((u) => u.id === user.id)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: For any typing user whose timestamp is within 3 seconds,
   * that user SHALL be retained in the typing users list.
   */
  it('should retain users whose timestamp is within 3 seconds', () => {
    fc.assert(
      fc.property(
        typingUserArb,
        // Time delta less than timeout
        fc.integer({ min: 0, max: TYPING_TIMEOUT - 1 }),
        (user, timeDelta) => {
          const currentTime = user.timestamp + timeDelta;
          const users = [user];

          const result = removeExpiredTypingUsers(users, currentTime, TYPING_TIMEOUT);

          // User should be retained since their timestamp is within 3 seconds
          expect(result).toHaveLength(1);
          expect(result[0].id).toBe(user.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: For any list of typing users with mixed timestamps,
   * only users within the timeout window SHALL be retained.
   */
  it('should correctly filter mixed list of expired and active users', () => {
    fc.assert(
      fc.property(
        // Generate a base timestamp
        fc.integer({ min: 10000, max: 100000 }),
        // Generate list of users with varying timestamps relative to current time
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
            // Offset from current time (negative = in the past)
            offset: fc.integer({ min: -10000, max: 0 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (currentTime, userOffsets) => {
          // Create users with timestamps based on offsets from current time
          const users = userOffsets.map((u, index) => ({
            id: u.id,
            name: u.name,
            timestamp: currentTime + u.offset,
          }));

          const result = removeExpiredTypingUsers(users, currentTime, TYPING_TIMEOUT);

          // Verify each user in result is within timeout
          for (const user of result) {
            const age = currentTime - user.timestamp;
            expect(age).toBeLessThan(TYPING_TIMEOUT);
          }

          // Verify no expired users are in result
          const expiredUsers = users.filter(
            (u) => currentTime - u.timestamp >= TYPING_TIMEOUT
          );
          for (const expired of expiredUsers) {
            expect(result.find((r) => r.id === expired.id)).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: At exactly 3 seconds (boundary), the user SHALL be removed.
   * The condition is "< timeout", so exactly at timeout should be removed.
   */
  it('should remove user at exactly 3 second boundary', () => {
    fc.assert(
      fc.property(typingUserArb, (user) => {
        // Current time is exactly TYPING_TIMEOUT after user's timestamp
        const currentTime = user.timestamp + TYPING_TIMEOUT;
        const users = [user];

        const result = removeExpiredTypingUsers(users, currentTime, TYPING_TIMEOUT);

        // User should be removed at exactly 3 seconds (>= timeout means expired)
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: For an empty typing users list, the result SHALL be empty.
   */
  it('should return empty array for empty input', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000 }), (currentTime) => {
        const result = removeExpiredTypingUsers([], currentTime, TYPING_TIMEOUT);

        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: When all users are expired, the typing indicator text SHALL be empty.
   */
  it('should produce empty typing text when all users are expired', () => {
    fc.assert(
      fc.property(
        fc.array(typingUserArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: TYPING_TIMEOUT + 1, max: TYPING_TIMEOUT + 10000 }),
        (users, extraTime) => {
          // Set current time so all users are expired
          const maxTimestamp = Math.max(...users.map((u) => u.timestamp));
          const currentTime = maxTimestamp + extraTime;

          const activeUsers = removeExpiredTypingUsers(users, currentTime, TYPING_TIMEOUT);
          const typingText = formatTypingText(activeUsers);

          // All users expired, so typing text should be empty
          expect(activeUsers).toHaveLength(0);
          expect(typingText).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 15: Typing Indicator Timeout**
   * **Validates: Requirements 7.3**
   *
   * Property: Updating a user's timestamp should reset their timeout window.
   * If a user types again before timeout, they should remain in the list.
   */
  it('should reset timeout when user types again', () => {
    fc.assert(
      fc.property(
        typingUserArb,
        // Initial time after user started typing
        fc.integer({ min: 1000, max: TYPING_TIMEOUT - 500 }),
        (initialUser, timeSinceFirstType) => {
          const initialTime = initialUser.timestamp + timeSinceFirstType;

          // User types again, updating their timestamp
          const updatedUsers = updateTypingUsers(
            [initialUser],
            { userId: initialUser.id, userName: initialUser.name },
            initialTime
          );

          // Check that user's timestamp was updated
          expect(updatedUsers).toHaveLength(1);
          expect(updatedUsers[0].timestamp).toBe(initialTime);

          // Now check timeout from the new timestamp
          // Even if we wait almost 3 seconds from the NEW timestamp, user should remain
          const checkTime = initialTime + TYPING_TIMEOUT - 1;
          const result = removeExpiredTypingUsers(updatedUsers, checkTime, TYPING_TIMEOUT);

          expect(result).toHaveLength(1);
          expect(result[0].id).toBe(initialUser.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
