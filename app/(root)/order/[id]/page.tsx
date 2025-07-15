import { Metadata } from "next"
import { getOrderById } from "@/lib/acions/order.action"
import { notFound } from "next/navigation"
import OrderDetailsTable from "./order-details-table"
import { ShippingAddress } from "@/types"
import Stripe from "stripe"

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

  let client_secret = null

  //if payment is not done and method is stripe
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    //init a new stripe session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

    //create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id },
    })
    client_secret = paymentIntent.client_secret
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      stripeClientSecret={client_secret}
    />
  )
}

export default OrderDetailsPage
