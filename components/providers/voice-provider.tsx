"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSocket } from "@/components/providers/socket-provider";

interface VoiceParticipant {
  odId: string;
  odName: string;
  odImageUrl: string;
  odChannelId: string;
}

interface VoiceChannelStore {
  [channelId: string]: VoiceParticipant[];
}

interface VoiceContextType {
  voiceChannels: VoiceChannelStore;
  getParticipants: (channelId: string) => VoiceParticipant[];
  currentServerId: string | null;
  setCurrentServerId: (serverId: string | null) => void;
}

const VoiceContext = createContext<VoiceContextType>({
  voiceChannels: {},
  getParticipants: () => [],
  currentServerId: null,
  setCurrentServerId: () => {},
});

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket, isConnected } = useSocket();
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannelStore>({});
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);

  useEffect(() => {
    console.log("[VoiceProvider] Effect:", { hasSocket: !!socket, currentServerId, isConnected });
    
    if (!socket || !currentServerId) return;

    const joinServer = () => {
      console.log("[VoiceProvider] Joining server room:", currentServerId);
      socket.emit("voice:join-server", currentServerId);
    };

    if (socket.connected) {
      joinServer();
    } else {
      console.log("[VoiceProvider] Socket not connected, waiting...");
      socket.on("connect", joinServer);
    }

    const handleUpdate = (data: VoiceChannelStore) => {
      console.log("[VoiceProvider] Received update:", data);
      setVoiceChannels(data);
    };

    const handleJoin = ({ channelId, participant }: { channelId: string; participant: VoiceParticipant }) => {
      console.log("[VoiceProvider] Participant joined:", participant.odName, "channel:", channelId);
      setVoiceChannels((prev) => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), participant],
      }));
    };

    const handleLeave = ({ channelId, odId }: { channelId: string; odId: string }) => {
      console.log("[VoiceProvider] Participant left:", odId, "channel:", channelId);
      setVoiceChannels((prev) => ({
        ...prev,
        [channelId]: (prev[channelId] || []).filter((p) => p.odId !== odId),
      }));
    };

    socket.on(`voice:${currentServerId}:update`, handleUpdate);
    socket.on(`voice:${currentServerId}:participant-join`, handleJoin);
    socket.on(`voice:${currentServerId}:participant-leave`, handleLeave);

    return () => {
      console.log("[VoiceProvider] Cleanup for server:", currentServerId);
      socket.off("connect", joinServer);
      socket.emit("voice:leave-server", currentServerId);
      socket.off(`voice:${currentServerId}:update`, handleUpdate);
      socket.off(`voice:${currentServerId}:participant-join`, handleJoin);
      socket.off(`voice:${currentServerId}:participant-leave`, handleLeave);
      setVoiceChannels({});
    };
  }, [socket, currentServerId, isConnected]);

  const getParticipants = useCallback((channelId: string) => {
    return voiceChannels[channelId] || [];
  }, [voiceChannels]);

  return (
    <VoiceContext.Provider value={{ 
      voiceChannels, 
      getParticipants, 
      currentServerId, 
      setCurrentServerId 
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
