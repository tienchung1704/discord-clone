import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized ");
  return { userId };
};

export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Upload server image done:", file.url);
    }),

  messageFile: f(["image", "pdf"])
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Upload message file done:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
