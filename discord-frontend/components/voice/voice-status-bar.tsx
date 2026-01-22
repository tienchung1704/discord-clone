"use client";

import { useVoiceState } from "@/components/providers/voice-state-provider";
import { useParams, useRouter } from "next/navigation";
import { PhoneOff, Maximize2, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VoiceStatusBar = () => {
  const { voiceState, leaveVoice } = useVoiceState();
  const router = useRouter();
  const params = useParams();

  const currentChannelId = params?.channelId as string;
  const isViewingVoiceChannel = currentChannelId === voiceState.channelId;

  // Don't show if not connected or viewing the voice channel
  if (!voiceState.isConnected || isViewingVoiceChannel) return null;

  const goToVoiceChannel = () => {
    router.push(`/servers/${voiceState.serverId}/channels/${voiceState.channelId}`);
  };

  return (
    <div className="fixed bottom-4 left-20 z-50 bg-[#232428] rounded-lg shadow-lg border border-zinc-700 p-2 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <div className="text-sm">
          <div className="flex items-center gap-1">
            {voiceState.isVideo ? (
              <Video className="h-3 w-3 text-zinc-400" />
            ) : (
              <Mic className="h-3 w-3 text-zinc-400" />
            )}
            <p className="text-zinc-200 font-medium">{voiceState.channelName}</p>
          </div>
          <p className="text-xs text-zinc-400">{voiceState.serverName}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-200"
          onClick={goToVoiceChannel}
          title="Go to channel"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
          onClick={leaveVoice}
          title="Disconnect"
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
