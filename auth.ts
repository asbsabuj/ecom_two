import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcrypt-ts-edge"
import type { NextAuthConfig } from "next-auth"
import { CredentialsSignin } from "next-auth"

export class UserDoesNotExistError extends CredentialsSignin {
  code = "AuthError"
  message = "User does not exist - Please check credentials"
}

export class PasswordInccorectError extends CredentialsSignin {
  code = "AuthError"
  message = "Password is incorrect - Please check credentials"
}

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

        try {
          if (!user) {
            throw new UserDoesNotExistError()
          }
          if (user && user.password) {
            const isMatch = compareSync(
              credentials.password as string,
              user.password
            )
            if (!isMatch) {
              throw new PasswordInccorectError()
            }
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          if (
            error instanceof UserDoesNotExistError ||
            error instanceof PasswordInccorectError
          ) {
            throw error
          } else {
            throw new Error("Unexpected error occurred during authorization")
          }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      console.log(token)

      if (trigger === "update") {
        session.user.name = user.name
      }
      return session
    },
    async jwt({ user, trigger, session, token }: any) {
      if (user) {
        token.role = user.role

        if (user.name === "NO_NAME") {
          user.name = user.email!.split("@")[0]

          await prisma.user.update({
            where: { id: user.id },
            data: { name: user.name },
          })
        }
      }
      return token
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// export class UserDoesNotExistError extends CredentialsSignin {
//   code = "AuthError"
//   message = "User does not exist - Please check credentials"
// }

// export class PasswordInccorectError extends CredentialsSignin {
//   code = "AuthError"
//   message = "Password is incorrect - Please check credentials"
// }

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

//check if user exists and password matches
// if (user && user.password) {
//   const isMatch = compareSync(
//     credentials.password as string,
//     user.password
//   )

//   //if password matches
//   if (isMatch) {
//     return {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     }
//   }
// }
// //password does not match, return null
// return null
