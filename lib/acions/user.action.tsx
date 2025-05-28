"use server"

import { signIn, signOut } from "@/auth"
import { signInFormSchema } from "../validations"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    await signIn("credentials", user)

    return { success: true, message: "signed in successfully" }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return { success: false, message: "Invalid email or password" }
  }
}

export async function signOutUser() {
  await signOut()
}

//  try {
//     const user = signInFormSchema.parse({
//       email: formData.get("email"),
//       password: formData.get("password"),
//     })

//     await signIn("credentials", user)
//     return { success: true, message: "sign in successfully" }
//   } catch (error: any) {
//     return { success: false, message: "Invalid email or password" }

//   }
// }

// let errorMessage =
//   "An unknown error occurred - Please contact the administrator"
// if (error.message && error.message != "") errorMessage = error.message
// const response = {
//   error: errorMessage,
//   success: false,
//   message: "Invalid email or password",
// }
// return response
