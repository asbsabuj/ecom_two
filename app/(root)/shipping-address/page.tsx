import { auth } from "@/auth"
import { Metadata } from "next"
import { getMyCart } from "@/lib/acions/cart.action"
import { ShippingAddress } from "@/types"
import { getUserById } from "@/lib/acions/user.action"
import { redirect } from "next/navigation"
import ShippingAddressForm from "./shipping-address-form"

export const metadata: Metadata = {
  title: "Shipping-Address",
}

const ShippingAddressPage = async () => {
  const cart = await getMyCart()
  if (!cart || cart.items.length === 0) redirect("/cart")

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) throw new Error(" No user ID!")

  const user = await getUserById(userId)

  return (
    <>
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  )
}

export default ShippingAddressPage
