"use client";

import { useEffect, useState } from "react";
import { InviteModal } from "@/components/modals/invite-modal";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { EditServerModal } from "@/components/modals/sever-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { EditChanelModal } from "@/components/modals/edit-channel-modal";
import { MessageFileModal } from "@/components/modals/message-file";
import { DeleteMessageModal } from "@/components/modals/delete-message";
import JoinServerModal from "../modals/jion-server-modal";
import { SelectInterestsModal } from "@/components/modals/select-interest-modal";
import { StartServerModal } from "../modals/start-server-modal";
import { PublicServerModal } from "../modals/select-hobby-server-modal";
import { CreatePublicServerModal } from "../modals/create-server-public-modal";
import { GetPublicServerModal } from "../modals/get-public-server-modal";
import PaymentModal from "../modals/payment";
import PaymentPageModal from "../modals/payment-page-modal";
import { ManageRolesModal } from "../modals/manage-roles-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log("ModalProvider mounted");
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <PublicServerModal />
      <JoinServerModal />
      <CreatePublicServerModal />
      <InviteModal />
      <MembersModal />
      <EditServerModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChanelModal />
      <MessageFileModal />
      <DeleteMessageModal />
      <SelectInterestsModal />
      <PaymentModal />
      <StartServerModal />
      <GetPublicServerModal />
      <PaymentPageModal />
      <ManageRolesModal />
    </>
  );
};
