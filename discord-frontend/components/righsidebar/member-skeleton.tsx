import { Skeleton } from "@/components/ui/skeleton";

export const MemberSkeleton = () => {
  return (
    <div className="flex items-center gap-x-3 px-2 py-1.5">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  );
};

export const RightSidebarSkeleton = () => {
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Members List */}
      <div className="flex-1 px-2 py-3 space-y-4">
        {/* Admin Section */}
        <div>
          <Skeleton className="h-7 w-full rounded-md mb-2" />
          <MemberSkeleton />
        </div>
        
        {/* Members Section */}
        <div>
          <Skeleton className="h-7 w-full rounded-md mb-2" />
          <MemberSkeleton />
          <MemberSkeleton />
          <MemberSkeleton />
        </div>
      </div>
    </div>
  );
};
