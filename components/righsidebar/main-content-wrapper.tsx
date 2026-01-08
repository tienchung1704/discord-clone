"use client";

import { useSidebarStore } from "@/components/hooks/use-sidebar-store";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export const MainContentWrapper = ({ children }: MainContentWrapperProps) => {
  const { isRightSidebarOpen } = useSidebarStore();

  return (
    <main className={`h-full md:pl-60 ${isRightSidebarOpen ? "md:pr-60" : ""}`}>
      {children}
    </main>
  );
};
