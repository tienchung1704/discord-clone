import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import z from "zod";
import { useModal } from "../hooks/user-model-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Compass, Link2 } from "lucide-react";

const formSchema = z.object({
    link: z.string().min(1, { message: "Server link is required." }),
});

const JoinServerModal = () => {
    const { isOpen, onClose, type, onOpen } = useModal();
    const isModalOpen = isOpen && type === "joinServer";

    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            link: "",
        },
    });
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = new URL(values.link);
            const inviteRoute = url.pathname.substring(url.pathname.indexOf("/invite"));
            router.push(inviteRoute);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6 pb-2">
                    <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Link2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold">
                        Join a Server
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Enter an invite link below to join an existing server
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-2">
                        <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
                                        Invite Link
                                    </FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="https://discord.gg/aBcdxYz23"
                                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors px-6"
                                        >
                                            Join
                                        </Button>
                                    </div>
                                    <FormMessage className="text-rose-500" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                
                <DialogFooter className="bg-zinc-50 dark:bg-[#2b2d31] w-full px-6 py-5 flex-col gap-3">
                    <Button
                        className="w-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
                        variant="secondary"
                        onClick={() => {
                            onOpen("selectInterests");
                        }}
                    >
                        <Compass className="w-4 h-4 mr-2" />
                        Explore Public Servers
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default JoinServerModal;
