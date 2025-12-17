import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ChatHeader } from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { ChannelType } from "@/lib/generated/prisma";
import { RedirectToSignIn } from "@clerk/nextjs";
import { VoiceChannelView } from "@/components/voice/voice-channel-view";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

export default async function ChannelIdPage({ params }: ChannelIdPageProps) {
  const { channelId, serverId } = await params; 
  const profile = await currentProfile();

  if (!profile) return <RedirectToSignIn />

  const channel = await db.channel.findUnique({
    where: { id: channelId }
  });

  const member = await db.member.findFirst({
    where: { serverId: serverId, profileId: profile.id }
  });

  const server = await db.server.findUnique({
    where: { id: serverId },
    select: { name: true }
  });

  if (!channel || !member || !server) return redirect("/");

  const isVoiceChannel = channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId
            }}
          />
        </>
      )}
      {isVoiceChannel && (
        <VoiceChannelView
          channelId={channel.id}
          channelName={channel.name}
          serverId={serverId}
          serverName={server.name}
          isVideo={channel.type === ChannelType.VIDEO}
          profileId={profile.id}
          profileName={profile.name}
          profileImageUrl={profile.imageUrl}
        />
      )}
    </div>
  );
}