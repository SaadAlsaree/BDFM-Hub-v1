import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";


// Configuration for publicly accessible paths
const publicPaths = [
  "/",
  "/login",
  "/signout",
  "/auth/error",
  "/api/auth",
];

// Middleware function that runs on every request
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public path (no authentication required)
  const isPublicPath = publicPaths.some(publicPath =>
    pathname === publicPath ||
    pathname.startsWith(`${publicPath}/`) ||
    pathname.startsWith("/api/auth/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For all other paths, check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-here", // Should match the secret in route.ts
  });

  // If no token is found, redirect to signin page
  if (!token) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
