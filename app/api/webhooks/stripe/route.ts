import { NextRequest, NextResponse } from "next/server"
import { updateOrderToPaid } from "@/lib/acions/order.action"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  //build the webhook event
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOKS_SECRET as string
  )

  //check for successful payment
  if (event.type === "charge.succeeded") {
    const { object } = event.data

    //update order status
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        paidPrice: (object.amount / 100).toFixed(),
      },
    })
    return NextResponse.json({
      message: "updateOrdertoPaid is successful",
    })
  }
  return NextResponse.json({
    message: "event s not charge.succeeded",
  })
}
