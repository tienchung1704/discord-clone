import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function InviteCodePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const profile = await currentProfile();
  if (!profile) {
    return <RedirectToSignIn />;
  }

  if (!inviteCode) {
    redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    redirect(`/servers/${existingServer.id}`);
  }

  const server = await db.server.update({
    where: { inviteCode },
    data: {
      members: {
        create: [{ profileId: profile.id }],
      },
    },
  });

  if (server) {
    redirect(`/servers/${server.id}`);
  }

  return null;
}
