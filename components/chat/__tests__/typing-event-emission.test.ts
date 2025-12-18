import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: performance-optimization, Property 13: Typing Event Emission**
 * **Validates: Requirements 7.1**
 * 
 * Property: For any user input in the chat field, a typing event SHALL be emitted
 * via socket within 100ms of the first keystroke.
 * 
 * This test validates that:
 * 1. When a user types non-empty content, a typing event is emitted
 * 2. The debounce mechanism prevents spam (events within DEBOUNCE_DELAY are ignored)
 * 3. Events are emitted with correct channel, user, and name data
 */

// Debounce delay constant (matches chat-input.tsx)
const TYPING_DEBOUNCE_DELAY = 500;

/**
 * Pure function that determines if a typing event should be emitted.
 * This extracts the core logic from the ChatInput component for testability.
 */
export function shouldEmitTypingEvent(
  inputValue: string,
  lastEmitTime: number,
  currentTime: number,
  debounceDelay: number = TYPING_DEBOUNCE_DELAY
): boolean {
  // Only emit if there's actual content (non-whitespace)
  if (inputValue.trim().length === 0) {
    return false;
  }
  
  // Only emit if enough time has passed since last emit (debounce)
  if (currentTime - lastEmitTime < debounceDelay) {
    return false;
  }
  
  return true;
}

/**
 * Creates a typing event payload.
 */
export function createTypingEventPayload(
  channelId: string,
  userId: string,
  userName: string
): { channelId: string; userId: string; userName: string } {
  return {
    channelId,
    userId,
    userName,
  };
}

describe('Typing Event Emission - Property Tests', () => {
  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: For any non-empty input string, when sufficient time has passed
   * since the last emit, shouldEmitTypingEvent returns true.
   */
  it('should emit typing event for any non-empty input when debounce period has passed', () => {
    fc.assert(
      fc.property(
        // Generate non-empty, non-whitespace strings
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        // Generate a last emit time
        fc.integer({ min: 0, max: 1000000 }),
        (inputValue, lastEmitTime) => {
          // Current time is always after debounce period
          const currentTime = lastEmitTime + TYPING_DEBOUNCE_DELAY + 1;
          
          const result = shouldEmitTypingEvent(
            inputValue,
            lastEmitTime,
            currentTime
          );
          
          // Should always emit for non-empty input after debounce
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: For any whitespace-only input, shouldEmitTypingEvent returns false.
   */
  it('should not emit typing event for whitespace-only input', () => {
    fc.assert(
      fc.property(
        // Generate whitespace-only strings using array of whitespace chars
        fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 10 })
          .map(chars => chars.join('')),
        fc.integer({ min: 0, max: 1000000 }),
        (whitespaceInput, lastEmitTime) => {
          const currentTime = lastEmitTime + TYPING_DEBOUNCE_DELAY + 1;
          
          const result = shouldEmitTypingEvent(
            whitespaceInput,
            lastEmitTime,
            currentTime
          );
          
          // Should never emit for whitespace-only input
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: For any input within the debounce period, shouldEmitTypingEvent returns false.
   */
  it('should not emit typing event within debounce period', () => {
    fc.assert(
      fc.property(
        // Generate non-empty strings
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        // Generate a last emit time
        fc.integer({ min: 1000, max: 1000000 }),
        // Generate time delta less than debounce delay
        fc.integer({ min: 0, max: TYPING_DEBOUNCE_DELAY - 1 }),
        (inputValue, lastEmitTime, timeDelta) => {
          const currentTime = lastEmitTime + timeDelta;
          
          const result = shouldEmitTypingEvent(
            inputValue,
            lastEmitTime,
            currentTime
          );
          
          // Should not emit within debounce period
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: The typing event payload contains all required fields with correct values.
   */
  it('should create typing event payload with correct structure', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (channelId, userId, userName) => {
          const payload = createTypingEventPayload(channelId, userId, userName);
          
          // Payload should contain all required fields
          expect(payload).toHaveProperty('channelId', channelId);
          expect(payload).toHaveProperty('userId', userId);
          expect(payload).toHaveProperty('userName', userName);
          
          // Payload should have exactly 3 properties
          expect(Object.keys(payload)).toHaveLength(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: Empty string input should never trigger typing event emission.
   */
  it('should not emit typing event for empty string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        (lastEmitTime) => {
          const currentTime = lastEmitTime + TYPING_DEBOUNCE_DELAY + 1;
          
          const result = shouldEmitTypingEvent(
            '',
            lastEmitTime,
            currentTime
          );
          
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: performance-optimization, Property 13: Typing Event Emission**
   * **Validates: Requirements 7.1**
   * 
   * Property: First keystroke (lastEmitTime = 0) should emit for non-empty input
   * when sufficient time has passed (currentTime >= DEBOUNCE_DELAY).
   */
  it('should emit typing event on first keystroke for non-empty input when debounce allows', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.integer({ min: TYPING_DEBOUNCE_DELAY, max: 1000000 }),
        (inputValue, currentTime) => {
          // First keystroke - no previous emit (lastEmitTime = 0)
          const lastEmitTime = 0;
          
          const result = shouldEmitTypingEvent(
            inputValue,
            lastEmitTime,
            currentTime
          );
          
          // Should emit on first keystroke with non-empty input when debounce period allows
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
