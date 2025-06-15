"use client"

import { CartItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { addItemsToCart } from "@/lib/acions/cart.action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter()

  const handleAddToCart = async () => {
    const res = await addItemsToCart(item)

    if (!res.success) {
      toast.error("Something went wrong!", {
        description: res.message,
      })
      return
    }
    toast.success("Successful!", {
      className: "bg-primary text-white hover-bg-gray-800",
      description: `${item.name} added to cart`,
      action: {
        label: "Go to cart",
        onClick: () => router.push("/cart"),
      },
    })
  }
  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <Plus /> Add To Cart
    </Button>
  )
}

export default AddToCart
