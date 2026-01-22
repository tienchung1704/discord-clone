import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

import { DMSidebar } from "@/components/navigation/dm-sidebar";

const DMLayout = async ({ children }: { children: React.ReactNode }) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <DMSidebar />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default DMLayout;
