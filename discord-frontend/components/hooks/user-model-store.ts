import { create } from "zustand";
import { Channel, ChannelType, Server } from "@/lib/generated/prisma";
export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage"
  | "joinServer"
  | "publicServer"
  | "createStartServer"
  | "createPublicServer"
  | "getPublicServer"
  | "payment"
  | "paymentPage"
  | "selectInterests"
  | "manageRoles"
  | "createDM";

interface ModalData {
  server?: Server;
  channel?: Channel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: Record<string, any>;
  paymentSelect?: {
    name: string;
    total: number;
    period: string;
  };
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  hobbyServer?: string;
  hobyyUser?: Record<string, any>;
  setHobbyServer: (hobby: string | undefined) => void;
  setHobbyUser: (hobby: Record<string, any> | undefined) => void;

}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null }),
  hobbyServer: undefined,
  hobyyUser: undefined,
  setHobbyServer: (hobby) => set({ hobbyServer: hobby }),
  setHobbyUser: (hobby) => set({ hobyyUser: hobby }),

}));