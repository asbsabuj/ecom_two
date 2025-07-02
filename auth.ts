import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcrypt-ts-edge"
import type { NextAuthConfig } from "next-auth"
// import { CredentialsSignin } from "next-auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// export class UserDoesNotExistError extends CredentialsSignin {
//   code = "AuthError"
//   message = "User does not exist - Please check credentials"
// }

// export class PasswordInccorectError extends CredentialsSignin {
//   code = "AuthError"
//   message = "Password is incorrect - Please check credentials"
// }

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
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

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// try {
//           if (!user) {
//             throw new UserDoesNotExistError()
//           }
//           if (user && user.password) {
//             const isMatch = compareSync(
//               credentials.password as string,
//               user.password
//             )
//             if (!isMatch) {
//               throw new PasswordInccorectError()
//             }
//           }
//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//           }
//         } catch (error) {
//           if (
//             error instanceof UserDoesNotExistError ||
//             error instanceof PasswordInccorectError
//           ) {
//             throw error
//           } else {
//             throw new Error("Unexpected error occurred during authorization")
//           }
//         }
