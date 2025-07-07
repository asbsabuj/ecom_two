import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ request, auth }: any) {
      //array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/place-order/,
        /\/payment-method/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ]

      //get pathname from the req url object
      const { pathname } = request.nextUrl

      //check if user is autheticated and trying to access a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false

      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID()

        const newRequestHeaders = new Headers(request.headers)

        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        })
        response.cookies.set("sessionCartId", sessionCartId)
        return response
      } else {
        return true
      }
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
