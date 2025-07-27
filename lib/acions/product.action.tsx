"use server"

import { prisma } from "@/db/prisma"
import { convertToPlainObject, formatError } from "../utils"
import { PAGE_LIMIT } from "../constants"
import { format } from "path"
import { revalidatePath } from "next/cache"

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
