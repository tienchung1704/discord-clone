import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
});

const isProtectedRoute = createRouteMatcher([
  "/:locale/dm(.*)",
  "/:locale/servers(.*)",
  "/dm(.*)",
  "/servers(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/api/uploadthing(.*)",
  "/api/socket(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Skip intlMiddleware for API and socket routes
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/socket')) {
    return;
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
