import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { VoiceProvider } from "@/components/providers/voice-provider";
import { VoiceStateProvider } from "@/components/providers/voice-state-provider";
import QueryProvider from "@/components/providers/query-provider";
import "react-toastify/dist/ReactToastify.css";
import { Open_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata = {
    title: "Discord Clone",
    description: "Discord Clone with Next.js, React.js, TailWindCSS & TypeScript.",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const messages = await getMessages();
    const { locale } = await params;

    return (
        <ClerkProvider>
            <html lang={locale} suppressHydrationWarning>
                <body className={cn(openSans.className, "bg-white dark:bg-[#313338]")} suppressHydrationWarning>
                    <NextIntlClientProvider messages={messages}>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            storageKey="discord-clone-theme"
                        >
                            <SocketProvider>
                                <VoiceProvider>
                                    <VoiceStateProvider>
                                        <ModalProvider />
                                        <QueryProvider>
                                            <ToastContainer position="top-right" autoClose={3000} />
                                            {children}
                                        </QueryProvider>
                                    </VoiceStateProvider>
                                </VoiceProvider>
                            </SocketProvider>
                        </ThemeProvider>
                        <Analytics />
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
