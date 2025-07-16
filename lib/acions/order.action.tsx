"use server"
import { auth } from "@/auth"
import { getMyCart } from "./cart.action"
import { getUserById } from "./user.action"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { CartItem, PaymentResult } from "@/types"
import { prisma } from "@/db/prisma"
import { formatError } from "../utils"
import { insertOrderSchema } from "../validations"
import { convertToPlainObject } from "../utils"

//create order and create order items
export async function CreateOrder() {
  try {
    const session = await auth()

    if (!session) throw new Error("User is not authenticated.")

    const cart = await getMyCart()
    const userId = session?.user?.id

    if (!userId) throw new Error("User not found!")

    const user = await getUserById(userId)

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Cart is empty!", redirectTo: "/cart" }
    }
    if (!user.address) {
      return {
        success: false,
        message: "Incomplete shipping address!",
        redirectTo: "/shipping-address",
      }
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Payment method not selected!",
        redirectTo: "/payment-method",
      }
    }

    //create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      itemsPrice: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
      paymentMethod: user.paymentMethod,
      shippingAddress: user.address,
    })

    //create order transaction to create order and orderitems in database
    const insertOrderId = await prisma.$transaction(async (tx) => {
      //create order
      const insertOrder = await tx.order.create({ data: order })
      //create order items from cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertOrder.id,
          },
        })
      }
      //clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
        },
      })
      console.log(insertOrder.id)
      return insertOrder.id
    })
    console.log(insertOrderId)
    if (!insertOrderId) throw new Error("Order not placed!")

    return {
      success: true,
      message: "Order created!",
      redirectTo: `/order/${insertOrderId}`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error

    return { success: false, message: formatError(error) }
  }
}

//get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  })
  return convertToPlainObject(data)
}

//update order to  paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string
  paymentResult?: PaymentResult
}) {
  //fetch order from database
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
    },
  })

  if (!order) throw new Error("Order not found!")
  if (order.isPaid) throw new Error("Already paid!")

  //transaction to update order and product stock
  await prisma.$transaction(async (tx) => {
    //iterate over product qty to update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      })
    }
    //set the order to be paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    })
  })
  //get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  })
  if (!updatedOrder) throw new Error("Order not found!")
}
