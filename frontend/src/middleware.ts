import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/lib/config";

const PUBLIC_PATHS = ['/registrazione', '/login'];
const PRIVATE_PATHS = ["/dashboard"]

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      if (request.nextUrl.pathname === '/dashboard')
        return NextResponse.rewrite(new URL('/dashboard/ordini', request.url))

      return NextResponse.next({
        request: {
          headers
        }
      });
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', { reason });

      if (PRIVATE_PATHS.find(f => request.nextUrl.pathname.includes(f))) {
        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      }

      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    }
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
    "/dashboard"
  ],
};