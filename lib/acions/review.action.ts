"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/db/prisma"
import { insertReviewsSchema } from "../validations"
import { formatError } from "../utils"
import { revalidatePath } from "next/cache"

//action for creating a new review or updating an existing one
export async function createUpdateReview(
  data: z.infer<typeof insertReviewsSchema>
) {
  try {
    const session = await auth()
    if (!session) throw new Error("User not authenticated")

    //store and validate a review
    const review = insertReviewsSchema.parse({
      ...data,
      userId: session.user.id,
    })

    //get the product to be reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    })
    if (!product) throw new Error("Product not found")

    //check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    })

    //create or update a review
    await prisma.$transaction(async (tx) => {
      if (existingReview) {
        //update review
        await tx.review.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        })
      } else {
        //create review
        await tx.review.create({
          data: review,
        })
      }

      //get avg rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      })

      //count the number of reviews of a product
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      })

      //update rating and numReviews in product model/table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      })
    })

    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message: "Product reviewed successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//get all reviews
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return { data }
}

//get review from the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string
}) {
  const session = await auth()

  if (!session) throw new Error("User is not authenticated")

  const data = await prisma.review.findFirst({
    where: { productId, userId: session?.user?.id },
  })

  return { data }
}
