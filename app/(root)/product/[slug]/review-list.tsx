"use client"

import { useState } from "react"
import Link from "next/link"
import { Review } from "@/types"

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string
  productId: string
  productSlug: string
}) => {
  console.log(userId, productId, productSlug)
  const [reviews, setReviews] = useState<Review[]>([])

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet!</div>}
      {userId ? (
        <>{/* Review form */}</>
      ) : (
        <div>
          Please
          <Link
            className="text-blue-700 px-2"
            href={`/sign-in?callbackUrl=/product/
            ${productSlug}`}
          >
            Sign In
          </Link>
          to write a review.
        </div>
      )}
    </div>
  )
}

export default ReviewList
