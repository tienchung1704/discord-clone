"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { useModal, ModalType } from "@/components/hooks/user-model-store";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all modal components - only loaded when needed
const CreateServerModal = lazy(() =>
  import("@/components/modals/create-server-modal").then((mod) => ({
    default: mod.CreateServerModal,
  }))
);

const PublicServerModal = lazy(() =>
  import("@/components/modals/select-hobby-server-modal").then((mod) => ({
    default: mod.PublicServerModal,
  }))
);

const JoinServerModal = lazy(() =>
  import("@/components/modals/jion-server-modal")
);

const CreatePublicServerModal = lazy(() =>
  import("@/components/modals/create-server-public-modal").then((mod) => ({
    default: mod.CreatePublicServerModal,
  }))
);

const InviteModal = lazy(() =>
  import("@/components/modals/invite-modal").then((mod) => ({
    default: mod.InviteModal,
  }))
);

const MembersModal = lazy(() =>
  import("@/components/modals/members-modal").then((mod) => ({
    default: mod.MembersModal,
  }))
);

const EditServerModal = lazy(() =>
  import("@/components/modals/sever-modal").then((mod) => ({
    default: mod.EditServerModal,
  }))
);


const CreateChannelModal = lazy(() =>
  import("@/components/modals/create-channel-modal").then((mod) => ({
    default: mod.CreateChannelModal,
  }))
);

const LeaveServerModal = lazy(() =>
  import("@/components/modals/leave-server-modal").then((mod) => ({
    default: mod.LeaveServerModal,
  }))
);

const DeleteServerModal = lazy(() =>
  import("@/components/modals/delete-server-modal").then((mod) => ({
    default: mod.DeleteServerModal,
  }))
);

const DeleteChannelModal = lazy(() =>
  import("@/components/modals/delete-channel-modal").then((mod) => ({
    default: mod.DeleteChannelModal,
  }))
);

const EditChanelModal = lazy(() =>
  import("@/components/modals/edit-channel-modal").then((mod) => ({
    default: mod.EditChanelModal,
  }))
);

const MessageFileModal = lazy(() =>
  import("@/components/modals/message-file").then((mod) => ({
    default: mod.MessageFileModal,
  }))
);

const DeleteMessageModal = lazy(() =>
  import("@/components/modals/delete-message").then((mod) => ({
    default: mod.DeleteMessageModal,
  }))
);

const SelectInterestsModal = lazy(() =>
  import("@/components/modals/select-interest-modal").then((mod) => ({
    default: mod.SelectInterestsModal,
  }))
);

const PaymentModal = lazy(() => import("@/components/modals/payment"));

const StartServerModal = lazy(() =>
  import("@/components/modals/start-server-modal").then((mod) => ({
    default: mod.StartServerModal,
  }))
);

const GetPublicServerModal = lazy(() =>
  import("@/components/modals/get-public-server-modal").then((mod) => ({
    default: mod.GetPublicServerModal,
  }))
);

const PaymentPageModal = lazy(() =>
  import("@/components/modals/payment-page-modal")
);

const ManageRolesModal = lazy(() =>
  import("@/components/modals/manage-roles-modal").then((mod) => ({
    default: mod.ManageRolesModal,
  }))
);


// Modal loading skeleton fallback
const ModalLoadingSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-6" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  </div>
);

// Map modal types to their lazy-loaded components
const MODAL_COMPONENTS: Record<ModalType, React.LazyExoticComponent<React.ComponentType<any>>> = {
  createServer: CreateServerModal,
  publicServer: PublicServerModal,
  joinServer: JoinServerModal,
  createPublicServer: CreatePublicServerModal,
  invite: InviteModal,
  members: MembersModal,
  editServer: EditServerModal,
  createChannel: CreateChannelModal,
  leaveServer: LeaveServerModal,
  deleteServer: DeleteServerModal,
  deleteChannel: DeleteChannelModal,
  editChannel: EditChanelModal,
  messageFile: MessageFileModal,
  deleteMessage: DeleteMessageModal,
  selectInterests: SelectInterestsModal,
  payment: PaymentModal,
  createStartServer: StartServerModal,
  getPublicServer: GetPublicServerModal,
  paymentPage: PaymentPageModal,
  manageRoles: ManageRolesModal,
};

export const LazyModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { type, isOpen } = useModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Only render the active modal - Requirements 2.3, 2.4
  if (!isOpen || !type) {
    return null;
  }

  const ModalComponent = MODAL_COMPONENTS[type];

  if (!ModalComponent) {
    return null;
  }

  // Render only the active modal with Suspense fallback - Requirements 2.1, 2.2
  return (
    <Suspense fallback={<ModalLoadingSkeleton />}>
      <ModalComponent />
    </Suspense>
  );
};
