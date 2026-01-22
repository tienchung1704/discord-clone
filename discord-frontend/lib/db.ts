import { PrismaClient } from "@/lib/generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

// Tối ưu Prisma với logging và connection pooling
export const db =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;