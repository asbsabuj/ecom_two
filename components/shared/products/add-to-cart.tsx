"use client"

import { Cart, CartItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Loader } from "lucide-react"
import { addItemsToCart, removeItemFromCart } from "@/lib/acions/cart.action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemsToCart(item)

      if (!res.success) {
        toast.error("Something went wrong!", {
          description: res.message,
        })
        return
      }
      toast.success("Successful!", {
        className: "bg-primary text-white hover-bg-gray-800",
        description: res.message,
        action: {
          label: "Go to cart",
          onClick: () => router.push("/cart"),
        },
      })
    })
  }

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)

      if (res.success) {
        toast.warning("Removed one item!!", {
          description: res.message,
        })
      } else {
        toast.error("Error!", {
          description: res.message,
        })
      }

      return
    })
  }

  const existingItem =
    cart && cart.items.find((x) => x.productId === item.productId)

  return existingItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin " />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existingItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}{" "}
      Add To Cart
    </Button>
  )
}

export default AddToCart
