import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { compareSync } from "bcrypt-ts-edge"
//import { cookies } from "next/headers"
//import { NextResponse } from "next/server"
import { prisma } from "./db/prisma"

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
} satisfies NextAuthConfig
