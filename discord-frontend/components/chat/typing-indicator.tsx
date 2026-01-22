"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/components/providers/socket-provider";

interface TypingUser {
  id: string;
  name: string;
  timestamp: number;
}

interface TypingIndicatorProps {
  channelId: string;
  currentUserId: string;
}

// Timeout for removing typing indicator (3 seconds as per requirements)
const TYPING_TIMEOUT = 3000;

/**
 * Formats the typing indicator text based on the number of users typing.
 * - 1 user: "User is typing..."
 * - 2 users: "User1 and User2 are typing..."
 * - 3+ users: "X users are typing..."
 */
export const formatTypingText = (users: TypingUser[]): string => {
  if (users.length === 0) return "";
  if (users.length === 1) return `${users[0].name} is typing...`;
  if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing...`;
  return `${users.length} users are typing...`;
};

/**
 * Removes expired typing users based on the timeout threshold.
 * A user is considered expired if their timestamp is older than TYPING_TIMEOUT.
 */
export const removeExpiredTypingUsers = (
  users: TypingUser[],
  currentTime: number,
  timeout: number = TYPING_TIMEOUT
): TypingUser[] => {
  return users.filter((user) => currentTime - user.timestamp < timeout);
};

/**
 * Updates the typing users list with a new typing event.
 * If the user already exists, updates their timestamp.
 * If the user is new, adds them to the list.
 */
export const updateTypingUsers = (
  currentUsers: TypingUser[],
  newUser: { userId: string; userName: string },
  timestamp: number
): TypingUser[] => {
  const existingIndex = currentUsers.findIndex((u) => u.id === newUser.userId);
  
  if (existingIndex >= 0) {
    // Update existing user's timestamp
    const updated = [...currentUsers];
    updated[existingIndex] = {
      ...updated[existingIndex],
      timestamp,
    };
    return updated;
  }
  
  // Add new user
  return [
    ...currentUsers,
    {
      id: newUser.userId,
      name: newUser.userName,
      timestamp,
    },
  ];
};

export const TypingIndicator = ({
  channelId,
  currentUserId,
}: TypingIndicatorProps) => {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Clean up expired typing users periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => removeExpiredTypingUsers(prev, Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    const typingKey = `typing:${channelId}`;

    const handleTyping = (data: {
      channelId: string;
      userId: string;
      userName: string;
    }) => {
      // Ignore own typing events
      if (data.userId === currentUserId) return;

      setTypingUsers((prev) =>
        updateTypingUsers(prev, data, Date.now())
      );
    };

    socket.on(typingKey, handleTyping);

    return () => {
      socket.off(typingKey, handleTyping);
    };
  }, [socket, channelId, currentUserId]);

  // Don't render if no one is typing
  if (typingUsers.length === 0) return null;

  const typingText = formatTypingText(typingUsers);

  return (
    <div className="px-4 py-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
      <span className="flex gap-0.5">
        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
          •
        </span>
      </span>
      <span>{typingText}</span>
    </div>
  );
};

export default TypingIndicator;
