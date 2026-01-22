import { Button } from "@/components/ui/button";
import { useModal } from "../hooks/user-model-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { CreditCard, ScanFace, Smile, UploadCloudIcon } from "lucide-react";

const paymentSelect = {
  basic: {
    name: "Basic",
    total: 7.99,
    period: "month",
  },
  premium: {
    name: "Premium",
    total: 82.99,
    period: "year",
  },
};

const PaymentModal = () => {
  const { isOpen, onClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && type === "payment";


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-700 dark:text-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-left font-bold">
            Select Plan
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500"></DialogDescription>
        </DialogHeader>
        <div className="items-center">
          <Button
            variant="outline"
            className="text-left m-6 grid w-[460px]  h-[260px] "
            onClick={() =>
              onOpen("paymentPage", { paymentSelect: paymentSelect.basic })
            }
          >
            <p className="text-3xl italic text-blue-300 drop-shadow-[0_2px_3px_rgba(0,2,0,0.3)] font-extrabold">
              {paymentSelect.basic.name}
            </p>{" "}
            $ {paymentSelect.basic.total} / {paymentSelect.basic.period}
            <Separator className="my-4" />
            <div className="flex gap-5 items-center ">
              <UploadCloudIcon className="h-4 w-4" />
              50MB Uploads
            </div>
            <div className="flex gap-5 items-center">
              <ScanFace className="h-4 w-4" />
              Unlimited Super Reactions
            </div>
            <div className="flex gap-5 items-center">
              <Smile className="h-4 w-4" />
              Custom emoji anywhere
            </div>
            <div className="mb-1"></div>
          </Button>
          <Button
            variant="outline"
            className="text-left m-6 grid w-[460px]  h-[260px] "
            onClick={() =>
              onOpen("paymentPage", { paymentSelect: paymentSelect.premium })
            }
          >
            <p className="text-3xl italic text-purple-300 drop-shadow-[0_2px_3px_rgba(0,2,0,0.3)] font-extrabold">
              {paymentSelect.premium.name}
            </p>{" "}
            $ {paymentSelect.premium.total} / {paymentSelect.premium.period}
            <Separator className="my-4" />
            <div className="flex gap-5 items-center ">
              <UploadCloudIcon className="h-4 w-4" />
              200MB Uploads per months
            </div>
            <div className="flex gap-5 items-center">
              <ScanFace className="h-4 w-4" />
              Unlimited Super Reactions
            </div>
            <div className="flex gap-5 items-center">
              <Smile className="h-4 w-4" />
              Custom emoji anywhere
            </div>
            <div className="flex gap-5 items-center">
              <CreditCard className="h-4 w-4" />2 more free months
            </div>
            <div className="mb-1"></div>
          </Button>
        </div>

        <DialogFooter className="bg-gray-100 dark:bg-zinc-700 dark:text-white w-full items-center align-middle grid  px-6 py-4"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
