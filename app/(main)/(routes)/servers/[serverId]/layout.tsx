import { Suspense } from "react";
import { ShowMemberChannel } from "@/components/righsidebar/right-sidebar";
import { RightSidebarSkeleton } from "@/components/righsidebar/member-skeleton";
import { RightSidebarContainer } from "@/components/righsidebar/right-sidebar-container";
import { MainContentWrapper } from "@/components/righsidebar/main-content-wrapper";
import { ServerSidebar } from "@/components/server/server-siderbar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) => {
  const { serverId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    select: { id: true },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      <MainContentWrapper>{children}</MainContentWrapper>
      <RightSidebarContainer>
        <div className="hidden md:flex w-60 flex-col fixed top-12 bottom-0 right-0 border-l border-zinc-200 dark:border-zinc-700 z-10 overflow-hidden">
          <Suspense fallback={<RightSidebarSkeleton />}>
            <ShowMemberChannel serverId={serverId} />
          </Suspense>
        </div>
      </RightSidebarContainer>
    </div>
  );
};

export default ServerIdLayout;
