"use client";

import { useEffect } from "react";
import { useVoiceState } from "@/components/providers/voice-state-provider";
import { Loader2 } from "lucide-react";

interface VoiceChannelViewProps {
  channelId: string;
  channelName: string;
  serverId: string;
  serverName: string;
  isVideo: boolean;
  profileId: string;
  profileName: string;
  profileImageUrl: string;
}

export const VoiceChannelView = ({
  channelId,
  channelName,
  serverId,
  serverName,
  isVideo,
  profileId,
  profileName,
  profileImageUrl,
}: VoiceChannelViewProps) => {
  const { voiceState, joinVoice, isInVoiceChannel } = useVoiceState();

  // Auto-join voice channel when viewing
  useEffect(() => {
    // If not connected or connected to different channel, join this one
    if (!voiceState.isConnected || voiceState.channelId !== channelId) {
      joinVoice({
        channelId,
        channelName,
        serverId,
        serverName,
        isVideo,
        profileId,
        profileName,
        profileImageUrl,
      });
    }
  }, [channelId]);

  // Show loading while connecting
  if (!isInVoiceChannel(channelId) || !voiceState.token) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Connecting to voice channel...
        </p>
      </div>
    );
  }

  // LiveKit UI is rendered by VoiceStateProvider with fixed positioning
  // This component just triggers the join and provides a placeholder
  return (
    <div className="flex-1">
      {/* LiveKit VideoConference is rendered by VoiceStateProvider as fixed overlay */}
    </div>
  );
};
