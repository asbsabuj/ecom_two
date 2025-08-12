"use server"

import { prisma } from "@/db/prisma"
import { convertToPlainObject, formatError } from "../utils"
import { PAGE_LIMIT, productDefaultValues } from "../constants"
import { revalidatePath } from "next/cache"
import z from "zod"
import { updateProductSchema, insertProductSchema } from "../validations"

export async function getLatestProduct() {
  const data = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  })
  return convertToPlainObject(data)
}

//get single product by its slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  })
}

//get all the products
export async function getAllProducts({
  page,
  limit = PAGE_LIMIT,
  query,
  category,
}: {
  page: number
  limit?: number
  query: string
  category: string
}) {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })

  const dataCount = await prisma.product.count()

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
}

//delete product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    })

    if (!productExists) throw new Error("Product not found!")

    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/admin/products")

    return {
      success: true,
      message: "Product deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//create a new product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data)
    await prisma.product.create({
      data: product,
    })

    revalidatePath("/admin/products")

    return {
      success: true,
      message: "Product created successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data)

    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    })

    if (!productExists) throw new Error("Product not found")

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    })

    revalidatePath("/admin/products")

    return {
      success: true,
      message: "Product updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
