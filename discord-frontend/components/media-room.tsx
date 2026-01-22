"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { useParams } from "next/navigation";

// Lazy load LiveKit components to reduce initial bundle size
// Requirements: 12.3 - WHEN loading voice features THEN the Discord_Clone SHALL lazy load LiveKit components
const LiveKitRoom = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col flex-1 justify-center items-center">
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

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  profileId?: string;
  profileName?: string;
  profileImageUrl?: string;
}

const MediaRoom = ({ 
  chatId, 
  video, 
  audio,
  profileId,
  profileName,
  profileImageUrl,
}: MediaRoomProps) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const params = useParams();
  const [token, setToken] = useState("");
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const serverId = params?.serverId as string;

  // Lazy load LiveKit styles
  useEffect(() => {
    import("@livekit/components-styles").then(() => {
      setStylesLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!user?.firstName && !user?.lastName) return;
    
    // Sanitize name for LiveKit - remove special chars, keep alphanumeric and spaces
    const rawName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const sanitizedName = rawName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9\s]/g, "") // Keep only alphanumeric and spaces
      .trim() || "User";

    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${chatId}&username=${encodeURIComponent(sanitizedName)}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  // Emit voice channel join/leave events
  useEffect(() => {
    console.log("[MediaRoom] Effect triggered:", { 
      hasSocket: !!socket, 
      serverId, 
      profileId, 
      hasToken: !!token,
      socketConnected: socket?.connected 
    });
    
    if (!socket || !serverId || !profileId || !token) return;

    const participant = {
      odId: profileId,
      odName: profileName || `${user?.firstName} ${user?.lastName}`,
      odImageUrl: profileImageUrl || user?.imageUrl || "",
      odChannelId: chatId,
    };

    const joinChannel = () => {
      console.log("[MediaRoom] Emitting voice:join-channel", { serverId, chatId, participant });
      socket.emit("voice:join-channel", {
        serverId,
        channelId: chatId,
        participant,
      });
    };

    // Join when socket is connected
    if (socket.connected) {
      joinChannel();
    } else {
      console.log("[MediaRoom] Socket not connected, waiting...");
      socket.on("connect", joinChannel);
    }

    return () => {
      console.log("[MediaRoom] Cleanup - leaving channel");
      socket.off("connect", joinChannel);
      socket.emit("voice:leave-channel", {
        serverId,
        channelId: chatId,
        odId: profileId,
      });
    };
  }, [socket, serverId, chatId, profileId, profileName, profileImageUrl, token, user]);

  if (token === "" || !stylesLoaded) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default MediaRoom;
