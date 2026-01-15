import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discord Clone",
  description: "Discord Clone with Next.js, React.js, TailWindCSS & TypeScript.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
