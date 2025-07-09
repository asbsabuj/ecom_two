import { Metadata } from "next"
import { getOrderById } from "@/lib/acions/order.action"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Order Details",
}

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {
  const { id } = await props.params

  const order = await getOrderById(id)

  if (!order) notFound()
  return <>datils {order.itemsPrice}</>
}

export default OrderDetailsPage
