import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatTypingText } from '../typing-indicator';

/**
 * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
 * **Validates: Requirements 7.4**
 *
 * Property: For any N users typing where N > 2, the indicator SHALL display
 * "N users are typing..." format.
 *
 * This test validates that:
 * 1. When 0 users are typing, empty string is returned
 * 2. When 1 user is typing, "User is typing..." format is used
 * 3. When 2 users are typing, "User1 and User2 are typing..." format is used
 * 4. When 3+ users are typing, "N users are typing..." format is used
 */

// Arbitrary for generating valid TypingUser objects
const typingUserArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  timestamp: fc.integer({ min: 0, max: 1000000000 }),
});

describe('Multiple Users Typing Display - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: For any N users typing where N > 2, the indicator SHALL display
   * "N users are typing..." format.
   */
  it('should display "N users are typing..." for 3 or more users', () => {
    fc.assert(
      fc.property(
        // Generate array of 3+ users with unique IDs
        fc.array(typingUserArb, { minLength: 3, maxLength: 20 })
          .map((users) => {
            // Ensure unique IDs by using index
            return users.map((user, index) => ({
              ...user,
              id: `${user.id}-${index}`,
            }));
          }),
        (users) => {
          const result = formatTypingText(users);

          // Should display "N users are typing..." format
          expect(result).toBe(`${users.length} users are typing...`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: For exactly 2 users typing, the indicator SHALL display
   * "User1 and User2 are typing..." format.
   */
  it('should display "User1 and User2 are typing..." for exactly 2 users', () => {
    fc.assert(
      fc.property(
        typingUserArb,
        typingUserArb,
        (user1, user2) => {
          // Ensure unique IDs
          const users = [
            user1,
            { ...user2, id: user2.id === user1.id ? `${user2.id}-2` : user2.id },
          ];

          const result = formatTypingText(users);

          // Should display "User1 and User2 are typing..." format
          expect(result).toBe(`${users[0].name} and ${users[1].name} are typing...`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: For exactly 1 user typing, the indicator SHALL display
   * "User is typing..." format.
   */
  it('should display "User is typing..." for exactly 1 user', () => {
    fc.assert(
      fc.property(typingUserArb, (user) => {
        const result = formatTypingText([user]);

        // Should display "User is typing..." format
        expect(result).toBe(`${user.name} is typing...`);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: For 0 users typing, the indicator SHALL return empty string.
   */
  it('should return empty string for 0 users', () => {
    const result = formatTypingText([]);
    expect(result).toBe('');
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: The count in "N users are typing..." SHALL exactly match
   * the number of users in the input array.
   */
  it('should have count matching exact number of users for N > 2', () => {
    fc.assert(
      fc.property(
        // Generate count between 3 and 100
        fc.integer({ min: 3, max: 100 }),
        (count) => {
          // Create array of users with specified count
          const users = Array.from({ length: count }, (_, i) => ({
            id: `user-${i}`,
            name: `User${i}`,
            timestamp: Date.now(),
          }));

          const result = formatTypingText(users);

          // Extract the number from the result
          const match = result.match(/^(\d+) users are typing\.\.\.$/);
          expect(match).not.toBeNull();
          expect(parseInt(match![1], 10)).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: For any number of users, the result SHALL always end with "typing..."
   * (except for empty array which returns empty string).
   */
  it('should always end with "typing..." for non-empty user lists', () => {
    fc.assert(
      fc.property(
        fc.array(typingUserArb, { minLength: 1, maxLength: 20 })
          .map((users) => {
            // Ensure unique IDs
            return users.map((user, index) => ({
              ...user,
              id: `${user.id}-${index}`,
            }));
          }),
        (users) => {
          const result = formatTypingText(users);

          // Should always end with "typing..."
          expect(result).toMatch(/typing\.\.\.$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 16: Multiple Users Typing Display**
   * **Validates: Requirements 7.4**
   *
   * Property: The format transition from "and" to "N users" SHALL occur
   * exactly at the boundary of 2 to 3 users.
   */
  it('should transition from "and" format to "N users" format at exactly 3 users', () => {
    fc.assert(
      fc.property(
        typingUserArb,
        typingUserArb,
        typingUserArb,
        (user1, user2, user3) => {
          // Create 2 users (should use "and" format)
          const twoUsers = [
            { ...user1, id: 'user-1' },
            { ...user2, id: 'user-2' },
          ];
          const twoUsersResult = formatTypingText(twoUsers);

          // Create 3 users (should use "N users" format)
          const threeUsers = [
            { ...user1, id: 'user-1' },
            { ...user2, id: 'user-2' },
            { ...user3, id: 'user-3' },
          ];
          const threeUsersResult = formatTypingText(threeUsers);

          // 2 users should use "and" format
          expect(twoUsersResult).toContain(' and ');
          expect(twoUsersResult).not.toMatch(/^\d+ users/);

          // 3 users should use "N users" format
          expect(threeUsersResult).toBe('3 users are typing...');
          expect(threeUsersResult).not.toContain(' and ');
        }
      ),
      { numRuns: 100 }
    );
  });
});
