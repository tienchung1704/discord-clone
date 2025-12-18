import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  try {
    if (!res.socket?.server) {
      res.status(500).end();
      return;
    }

    if (!res.socket.server.io) {
      const path = "/api/socket/io";
      const httpServer: NetServer = res.socket.server as any;
      const io = new ServerIO(httpServer, {
        path: path,
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        // Optimized settings for speed
        pingTimeout: 30000,
        pingInterval: 10000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e6, // 1MB
        // Compression for faster data transfer
        perMessageDeflate: {
          threshold: 1024, // Only compress messages > 1KB
        },
        // Allow concurrent connections
        allowEIO3: true,
      });

      // Store voice channel participants per server
      const voiceChannels: Record<string, Record<string, any[]>> = {};

      io.on("connection", (socket) => {
        // Heartbeat ping/pong mechanism for connection health
        socket.on("heartbeat:ping", (data: { timestamp: number }) => {
          // Respond with pong immediately to measure latency
          socket.emit("heartbeat:pong", { timestamp: data.timestamp });
        });

        // Handle missed messages sync request
        socket.on("sync:missed-messages", (data: { since: number }) => {
          console.log("[Socket] Missed messages sync requested since:", new Date(data.since).toISOString());
          // In a full implementation, this would query the database for messages
          // sent after the 'since' timestamp and emit them back to the client.
          // For now, we acknowledge the request - the actual sync will be handled
          // by the client refetching via React Query when it detects reconnection.
          socket.emit("sync:missed-messages:response", { 
            messages: [],
            syncedAt: Date.now()
          });
        });

        // Typing indicator events
        socket.on("typing:start", (data: { channelId: string; userId: string; userName: string }) => {
          // Broadcast typing event to all users in the channel except the sender
          const typingKey = `typing:${data.channelId}`;
          socket.broadcast.emit(typingKey, {
            channelId: data.channelId,
            userId: data.userId,
            userName: data.userName,
          });
        });

        // Voice channel events
        socket.on("voice:join-server", (serverId: string) => {
          console.log("[Socket] voice:join-server:", serverId, "socketId:", socket.id);
          socket.join(`voice:${serverId}`);
          if (voiceChannels[serverId]) {
            console.log("[Socket] Sending current voice state:", voiceChannels[serverId]);
            socket.emit(`voice:${serverId}:update`, voiceChannels[serverId]);
          }
        });

        socket.on("voice:leave-server", (serverId: string) => {
          console.log("[Socket] voice:leave-server:", serverId);
          socket.leave(`voice:${serverId}`);
        });

        socket.on("voice:join-channel", ({ serverId, channelId, participant }) => {
          console.log("[Socket] voice:join-channel:", { serverId, channelId, participant });
          
          if (!voiceChannels[serverId]) {
            voiceChannels[serverId] = {};
          }
          if (!voiceChannels[serverId][channelId]) {
            voiceChannels[serverId][channelId] = [];
          }
          
          const exists = voiceChannels[serverId][channelId].find(
            (p) => p.odId === participant.odId
          );
          
          if (!exists) {
            voiceChannels[serverId][channelId].push(participant);
            console.log("[Socket] Broadcasting participant-join, voiceChannels:", voiceChannels);
            io.to(`voice:${serverId}`).emit(`voice:${serverId}:participant-join`, {
              channelId,
              participant,
            });
          }
        });

        socket.on("voice:leave-channel", ({ serverId, channelId, odId }) => {
          console.log("[Socket] voice:leave-channel:", { serverId, channelId, odId });
          if (voiceChannels[serverId]?.[channelId]) {
            voiceChannels[serverId][channelId] = voiceChannels[serverId][channelId].filter(
              (p) => p.odId !== odId
            );
            io.to(`voice:${serverId}`).emit(`voice:${serverId}:participant-leave`, {
              channelId,
              odId,
            });
          }
        });

        socket.on("error", (error) => {
          console.error("[Socket Error]", error);
        });

        socket.on("disconnect", () => {
          // Clean up voice channels when user disconnects
          // This is a simplified version - in production you'd track socket -> user mapping
        });
      });

      io.engine.on("connection_error", (err) => {
        console.error("[Socket Connection Error]", err.message);
      });

      res.socket.server.io = io;
    }
    res.end();
  } catch (error) {
    console.error("[Socket IO Handler Error]", error);
    res.status(500).end();
  }
};

export default ioHandler;
