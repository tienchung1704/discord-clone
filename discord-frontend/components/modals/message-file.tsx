"use client";

import * as z from "zod";
import qs from "query-string";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/hooks/user-model-store";
import { FileUpload } from "@/components/file-upload";
import { Upload } from "lucide-react";

const formSchema = z.object({
  fileUrl: z.string().min(1, { message: "Attachment is required." }),
});

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { apiUrl, query } = data;
  const isModalOpen = isOpen && type === "messageFile";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });
      await axios.post(url, { ...values, content: values.fileUrl });
      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            Upload File
          </DialogTitle>
          <DialogDescription className="text-center">
            Send a file as a message to the channel
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="bg-zinc-50 dark:bg-[#2b2d31] px-6 py-4">
              <Button
                disabled={isLoading}
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Send File
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
