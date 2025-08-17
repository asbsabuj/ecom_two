"use server"

import { signIn, signOut } from "@/auth"
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodsSchema,
  updateUserFromAdminSchema,
} from "../validations"
import { prisma } from "@/db/prisma"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { hashSync } from "bcrypt-ts-edge"
import { formatError } from "../utils"
import { ShippingAddress } from "@/types"
import { auth } from "@/auth"
import { z } from "zod"
import { PAGE_LIMIT } from "../constants"
import { revalidatePath } from "next/cache"
import { getMyCart } from "./cart.action"

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

//signing out and clearing cart
export async function signOutUser() {
  // get current users cart and delete it so it does not persist to next user
  const currentCart = await getMyCart()
  await prisma.cart.delete({ where: { id: currentCart?.id } })
  await signOut()
}

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    const plainPassword = user.password

    user.password = hashSync(user.password, 10)

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    })

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    })

    return { success: true, message: "User registered successfully" }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return { success: false, message: formatError(error) }
  }
}

//get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  if (!user) throw new Error("User not found!")

  return user
}

//update user address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })

    if (!currentUser) throw new Error("User not found!")

    const address = shippingAddressSchema.parse(data)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    })
    return { success: true, message: "User updated successfully" }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

//update user's payment method

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodsSchema>
) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })

    if (!currentUser) throw new Error("User not found")

    const paymentMethod = paymentMethodsSchema.parse(data)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    })

    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//updating user from profile
export async function updateUserFromProfile(user: {
  name: string
  email: string
}) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })

    if (!currentUser) throw new Error("User not found!")

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: user.name,
      },
    })
    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// get all users
export async function getAllUsers({
  limit = PAGE_LIMIT,
  page,
}: {
  limit?: number
  page: number
}) {
  const data = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  })

  //get the data counter
  const dataCounter = await prisma.user.count()

  return {
    data,
    totalPages: Math.ceil(dataCounter / limit),
  }
}

// delete user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath("/admin/users")

    return {
      success: true,
      message: "User deleted successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

// update user from admin
export async function updateUserFromAdmin(
  user: z.infer<typeof updateUserFromAdminSchema>
) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "User updated successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
