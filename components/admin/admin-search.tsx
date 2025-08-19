"use client"

import { useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "../ui/input"

const AdminSearch = () => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "")

  const formUrlAction = pathName.includes("/admin/orders")
    ? "/admin/orders"
    : pathName.includes("/admin/users")
    ? "/admin/users"
    : "/admin/products"

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "")
  }, [searchParams])

  return (
    <form action={formUrlAction} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  )
}

export default AdminSearch
