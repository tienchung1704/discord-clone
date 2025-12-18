"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

// Exponential backoff configuration
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 16000; // 16 seconds max
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 25000; // 25 seconds

// Calculate exponential backoff delay
export const calculateBackoffDelay = (attempt: number, initialDelay: number = INITIAL_RECONNECT_DELAY, maxDelay: number = MAX_RECONNECT_DELAY): number => {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempt: number;
  lastDisconnectTime: number | null;
  syncMissedMessages: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnectAttempt: 0,
  lastDisconnectTime: null,
  syncMissedMessages: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastDisconnectTime, setLastDisconnectTime] = useState<number | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to sync missed messages after reconnection
  const syncMissedMessages = useCallback(() => {
    if (!lastDisconnectTime) return;
    
    // Emit event to request missed messages since last disconnect
    if (socketRef.current?.connected) {
      console.log("[Socket] Syncing missed messages since:", new Date(lastDisconnectTime).toISOString());
      socketRef.current.emit("sync:missed-messages", { since: lastDisconnectTime });
    }
  }, [lastDisconnectTime]);

  // Start heartbeat ping mechanism
  const startHeartbeat = useCallback(() => {
    // Clear any existing heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        const pingTime = Date.now();
        socketRef.current.emit("heartbeat:ping", { timestamp: pingTime });
        console.log("[Socket] Heartbeat ping sent at:", new Date(pingTime).toISOString());
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Manual reconnection with exponential backoff
  const attemptReconnect = useCallback((attempt: number) => {
    if (attempt >= MAX_RECONNECT_ATTEMPTS) {
      console.log("[Socket] Max reconnection attempts reached");
      return;
    }

    const delay = calculateBackoffDelay(attempt);
    console.log(`[Socket] Attempting reconnection in ${delay}ms (attempt ${attempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        setReconnectAttempt(attempt + 1);
        socketRef.current.connect();
      }
    }, delay);
  }, []);

  useEffect(() => {
    // Prevent duplicate connections
    if (socketRef.current) return;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

    const socketInstance = ClientIO(baseUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      // Use polling first in dev, then upgrade to websocket
      transports: ["polling", "websocket"],
      upgrade: true,
      // Disable built-in reconnection - we handle it manually with exponential backoff
      reconnection: false,
      timeout: 20000,
      forceNew: false,
      multiplex: true,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance.id);
      setIsConnected(true);
      setReconnectAttempt(0);
      
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Start heartbeat mechanism
      startHeartbeat();
      
      // Sync missed messages if this is a reconnection
      if (lastDisconnectTime) {
        console.log("[Socket] Reconnected, syncing missed messages...");
        socketInstance.emit("sync:missed-messages", { since: lastDisconnectTime });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
      setLastDisconnectTime(Date.now());
      
      // Stop heartbeat on disconnect
      stopHeartbeat();
      
      // Don't attempt reconnection if disconnect was intentional
      if (reason === "io client disconnect" || reason === "io server disconnect") {
        console.log("[Socket] Intentional disconnect, not reconnecting");
        return;
      }
      
      // Start exponential backoff reconnection
      attemptReconnect(0);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("[Socket] Connection error:", error.message);
      setIsConnected(false);
      
      // Attempt reconnection on connection error
      attemptReconnect(reconnectAttempt);
    });

    // Handle heartbeat pong response
    socketInstance.on("heartbeat:pong", (data: { timestamp: number }) => {
      const latency = Date.now() - data.timestamp;
      console.log(`[Socket] Heartbeat pong received, latency: ${latency}ms`);
    });

    // Handle missed messages sync response
    socketInstance.on("sync:missed-messages:response", (data: { messages: unknown[] }) => {
      console.log(`[Socket] Received ${data.messages?.length || 0} missed messages`);
      // The actual message handling will be done by the chat socket hooks
    });

    setSocket(socketInstance);

    return () => {
      stopHeartbeat();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [startHeartbeat, stopHeartbeat, attemptReconnect, lastDisconnectTime, reconnectAttempt]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnectAttempt, lastDisconnectTime, syncMissedMessages }}>
      {children}
    </SocketContext.Provider>
  );
};