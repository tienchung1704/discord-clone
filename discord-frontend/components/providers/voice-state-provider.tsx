"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Lazy load LiveKit components to reduce initial bundle size
// Requirements: 12.3 - WHEN loading voice features THEN the Discord_Clone SHALL lazy load LiveKit components
const LiveKitRoom = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading voice components...</p>
      </div>
    ),
  }
);

const VideoConference = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.VideoConference),
  { ssr: false }
);

const RoomAudioRenderer = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.RoomAudioRenderer),
  { ssr: false }
);

// Import hook dynamically or statically? Statically is safer for hooks.
import { useLocalParticipant } from "@livekit/components-react";

const TTSPlayer = ({ audioBlob, onComplete }: { audioBlob: Blob | null, onComplete: () => void }) => {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!audioBlob || !localParticipant) return;

    const play = async () => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const dest = ctx.createMediaStreamDestination();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);
        source.connect(ctx.destination); // Local monitor
        source.start();

        const track = dest.stream.getAudioTracks()[0];
        const sender = await localParticipant.publishTrack(track, { name: "tts_audio" });

        source.onended = async () => {
          if (sender) await localParticipant.unpublishTrack(track);
          onComplete();
        };
      } catch (error) {
        console.error("TTS Playback error:", error);
        onComplete();
      }
    };
    play();
  }, [audioBlob, localParticipant, onComplete]);

  return null;
};

interface VoiceState {
  isConnected: boolean;
  channelId: string | null;
  channelName: string | null;
  serverId: string | null;
  serverName: string | null;
  isVideo: boolean;
  profileId: string | null;
  profileName: string | null;
  profileImageUrl: string | null;
  token: string | null;
}

interface VoiceStateContextType {
  voiceState: VoiceState;
  joinVoice: (params: {
    channelId: string;
    channelName: string;
    serverId: string;
    serverName: string;
    isVideo: boolean;
    profileId: string;
    profileName: string;
    profileImageUrl: string;
  }) => void;
  leaveVoice: () => void;
  isInVoiceChannel: (channelId: string) => boolean;
  speakMessage: (text: string) => Promise<void>;
}

const defaultState: VoiceState = {
  isConnected: false,
  channelId: null,
  channelName: null,
  serverId: null,
  serverName: null,
  isVideo: false,
  profileId: null,
  profileName: null,
  profileImageUrl: null,
  token: null,
};

const VoiceStateContext = createContext<VoiceStateContextType>({
  voiceState: defaultState,
  joinVoice: () => { },
  leaveVoice: () => { },
  isInVoiceChannel: () => false,
  speakMessage: async () => { },
});

export const useVoiceState = () => useContext(VoiceStateContext);


// Persistent LiveKit Room - single instance that stays connected
const PersistentLiveKitRoom = ({
  voiceState,
  onDisconnect,
  isViewingVoiceChannel,
  audioBlob,
  onAudioComplete
}: {
  voiceState: VoiceState;
  onDisconnect: () => void;
  isViewingVoiceChannel: boolean;
  audioBlob: Blob | null;
  onAudioComplete: () => void;
}) => {
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Lazy load LiveKit styles
  useEffect(() => {
    import("@livekit/components-styles").then(() => {
      setStylesLoaded(true);
    });
  }, []);

  if (!voiceState.token) return null;

  if (!stylesLoaded) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading voice styles...</p>
      </div>
    );
  }

  // Single LiveKitRoom instance - position changes based on viewing state
  return (
    <div
      className={cn(
        "fixed z-40 bg-[#313338]",
        isViewingVoiceChannel
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
      )}
      style={isViewingVoiceChannel ? {
        left: 'calc(72px + 240px)', // nav + server sidebar
        right: '240px', // right sidebar  
        top: '48px', // header height
        bottom: 0,
      } : {
        left: '-9999px',
        width: 0,
        height: 0,
      }}
    >
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={voiceState.token}
        connect={true}
        video={voiceState.isVideo}
        audio={true}
        onDisconnected={onDisconnect}
        className="h-full w-full"
      >

        <RoomAudioRenderer />
        <VideoConference />
        <TTSPlayer audioBlob={audioBlob} onComplete={onAudioComplete} />
      </LiveKitRoom>
    </div>
  );
};

export const VoiceStateProvider = ({ children }: { children: ReactNode }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(defaultState);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { socket } = useSocket();
  const params = useParams();
  const hasEmittedJoin = useRef(false);

  const currentChannelId = params?.channelId as string;
  const isViewingVoiceChannel = voiceState.isConnected && currentChannelId === voiceState.channelId;

  const joinVoice = useCallback(async (joinParams: {
    channelId: string;
    channelName: string;
    serverId: string;
    serverName: string;
    isVideo: boolean;
    profileId: string;
    profileName: string;
    profileImageUrl: string;
  }) => {
    hasEmittedJoin.current = false;

    const sanitizedName = joinParams.profileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim() || "User";

    try {
      const resp = await fetch(
        `/api/token?room=${joinParams.channelId}&username=${encodeURIComponent(sanitizedName)}`
      );
      const data = await resp.json();

      setVoiceState({
        isConnected: true,
        ...joinParams,
        token: data.token,
      });
    } catch (error) {
      console.error("[VoiceState] Token fetch error:", error);
    }
  }, []);

  const leaveVoice = useCallback(() => {
    if (socket && voiceState.serverId && voiceState.channelId && voiceState.profileId) {
      socket.emit("voice:leave-channel", {
        serverId: voiceState.serverId,
        channelId: voiceState.channelId,
        odId: voiceState.profileId,
      });
    }
    hasEmittedJoin.current = false;
    setVoiceState(defaultState);
  }, [socket, voiceState.serverId, voiceState.channelId, voiceState.profileId]);

  const isInVoiceChannel = useCallback((channelId: string) => {
    return voiceState.isConnected && voiceState.channelId === channelId;
  }, [voiceState]);

  const speakMessage = useCallback(async (text: string) => {
    if (!voiceState.isConnected) return;
    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error("TTS Request failed");
      const blob = await resp.blob();
      setAudioBlob(blob);
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }, [voiceState.isConnected]);

  // Socket events for voice participants
  useEffect(() => {
    if (!socket || !voiceState.isConnected || !voiceState.serverId || !voiceState.token || hasEmittedJoin.current) return;

    socket.emit("voice:join-server", voiceState.serverId);

    const participant = {
      odId: voiceState.profileId,
      odName: voiceState.profileName,
      odImageUrl: voiceState.profileImageUrl,
      odChannelId: voiceState.channelId,
    };

    setTimeout(() => {
      socket.emit("voice:join-channel", {
        serverId: voiceState.serverId,
        channelId: voiceState.channelId,
        participant,
      });
      hasEmittedJoin.current = true;
    }, 100);
  }, [socket, voiceState]);

  const contextValue = useMemo(() => ({
    voiceState, joinVoice, leaveVoice, isInVoiceChannel, speakMessage
  }), [voiceState, joinVoice, leaveVoice, isInVoiceChannel, speakMessage]);

  return (
    <VoiceStateContext.Provider value={contextValue}>
      {children}
      {voiceState.isConnected && voiceState.token && (
        <PersistentLiveKitRoom
          voiceState={voiceState}
          onDisconnect={leaveVoice}
          isViewingVoiceChannel={isViewingVoiceChannel}
          audioBlob={audioBlob}
          onAudioComplete={() => setAudioBlob(null)}
        />
      )}
    </VoiceStateContext.Provider>
  );
};
