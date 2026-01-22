"use client";

import { useSidebarStore } from "@/components/hooks/use-sidebar-store";

interface RightSidebarContainerProps {
  children: React.ReactNode;
}

export const RightSidebarContainer = ({ children }: RightSidebarContainerProps) => {
  const { isRightSidebarOpen } = useSidebarStore();

  if (!isRightSidebarOpen) return null;

  return <>{children}</>;
};
