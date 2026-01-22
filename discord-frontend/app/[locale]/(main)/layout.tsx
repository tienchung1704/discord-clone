import { NanigationSideBar } from "@/components/navigation/navigation-sidebar";
import { VoiceStatusBar } from "@/components/voice/voice-status-bar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NanigationSideBar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
      <VoiceStatusBar />
    </div>
  );
};

export default MainLayout;
