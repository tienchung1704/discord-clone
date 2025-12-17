"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      timeout: 20000,
      forceNew: false,
      multiplex: true,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("[Socket] Connection error:", error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};