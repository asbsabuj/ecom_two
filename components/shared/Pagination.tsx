"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../ui/button"
import { createPaginationUrl } from "@/lib/utils"

type PaginationProps = {
  page: number | string
  totalPages: number
  urlPathName?: string
}

const Pagination = ({ page, totalPages, urlPathName }: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (BtnType: string) => {
    const pageValue = BtnType === "next" ? Number(page) + 1 : Number(page) - 1

    const newUrl = createPaginationUrl({
      params: searchParams.toString(),
      key: urlPathName || "page",
      value: pageValue.toString(),
    })

    router.push(newUrl)
  }

  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) <= 1}
        onClick={() => handleClick("prev")}
      >
        Previous
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick("next")}
      >
        Next
      </Button>
    </div>
  )
}

export default Pagination
