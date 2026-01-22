import { Button } from "@/components/ui/button";
import { useModal } from "../hooks/user-model-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { CreditCard } from "lucide-react";
import React from 'react';

const PaymentPageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const user = useUser();
  const isModalOpen = isOpen && type === "paymentPage";

  const [vietQrUrl, setVietQrUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onStripeClick = async () => {
    try {
      const res = await axios.post("/api/checkout/stripe", {
        plan: data.paymentSelect,
        userId: user?.user?.id,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onVietQRClick = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/checkout/vietqr", {
        plan: data.paymentSelect,
        userId: user?.user?.id,
      });
      if (res.data.qrDataURL) {
        setVietQrUrl(res.data.qrDataURL);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVietQrUrl(null);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      {vietQrUrl ? (
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6 pb-2">
            <DialogTitle className="text-xl text-center font-bold">
              Scan with Banking App
            </DialogTitle>
            <DialogDescription className="text-center">
              Use any banking app to scan this QR code
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative w-64 h-64">
              <Image
                src={vietQrUrl}
                alt="VietQR Code"
                fill
                className="object-contain"
              />
            </div>
            <Button onClick={() => setVietQrUrl(null)} variant="ghost" className="w-full">
              Back to Payment Methods
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6 pb-2">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-xl text-center font-bold">
              Choose Payment Method
            </DialogTitle>
            <DialogDescription className="text-center">
              Select your preferred payment option to continue
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-3">
            <Button
              className="w-full h-14 justify-start gap-3 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200"
              variant="outline"
              onClick={onStripeClick}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-lg bg-[#635BFF] flex items-center justify-center">
                <Image
                  src="/stripe.png"
                  alt="Stripe"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Stripe</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Credit/Debit Card</span>
              </div>
            </Button>

            <Button
              className="w-full h-14 justify-start gap-3 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200"
              variant="outline"
              onClick={onVietQRClick}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0066B3] flex items-center justify-center">
                <Image
                  src="/vietqr.png"
                  alt="VietQR"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">VietQR</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Scan QR Code</span>
              </div>
            </Button>

            <Button
              className="w-full h-14 justify-start gap-3 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200"
              variant="outline"
              onClick={() => { }}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-lg bg-[#A50064] flex items-center justify-center">
                <Image
                  src="/momo.png"
                  alt="Momo"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">MoMo</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">E-Wallet Vietnam</span>
              </div>
            </Button>

            <Button
              className="w-full h-14 justify-start gap-3 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200"
              variant="outline"
              onClick={() => { }}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0066B3] flex items-center justify-center">
                <Image
                  src="/vnpay.png"
                  alt="VNPay"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">VNPay</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Bank Transfer Vietnam</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default PaymentPageModal;
