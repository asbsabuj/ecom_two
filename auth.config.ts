import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "./db/prisma"
import { compareSync } from "bcrypt-ts-edge"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (credentials == null) return null

        // check if user exists in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        })

        //check if user exists and password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          )

          //If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        }
        // if user does not exist or password doesnot match
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      if (trigger === "update") {
        session.user.name = user.name
      }
      return session
    },
    async jwt({ user, trigger, session, token }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role

        if (user.name === "NO_NAME") {
          user.name = user.email!.split("@")[0]

          await prisma.user.update({
            where: { id: user.id },
            data: { name: user.name },
          })
        }

        const cookiesObject = await cookies()
        const sessionCartId = cookiesObject.get("sessionCartId")?.value

        if (sessionCartId) {
          const sessionCart = await prisma.cart.findFirst({
            where: { sessionCartId },
          })

          if (sessionCart) {
            //delete current user cart
            await prisma.cart.deleteMany({
              where: { userId: user.id },
            })

            //assign new cart
            await prisma.cart.update({
              where: { id: sessionCart.id },
              data: { userId: user.id },
            })
          }
        }
      }
      return token
    },
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
} satisfies NextAuthConfig
