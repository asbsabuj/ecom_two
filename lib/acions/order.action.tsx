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
import { PAGE_LIMIT } from "../constants"
import { Prisma } from "../generated/prisma"
import { revalidatePath } from "next/cache"

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

//pagination action
export async function getMyOrders({
  limit = PAGE_LIMIT,
  page,
}: {
  limit?: number
  page: number
}) {
  const session = await auth()

  if (!session) throw new Error("User unauthorized")

  //find the orders of a user
  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id! },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  })

  //get the data counter
  const dataCounter = await prisma.order.count({
    where: { userId: session?.user?.id! },
  })

  return {
    data,
    totalPages: Math.ceil(dataCounter / limit),
  }
}

type SalesDataType = {
  month: string
  totalSales: number
}[]

//get sales data and order summary
export async function getOrderSummary() {
  //get count for each resource
  const ordersCount = await prisma.order.count()
  const productsCount = await prisma.product.count()
  const usersCount = await prisma.user.count()

  //calculate total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  })

  //get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM
  "Order" GROUP BY to_char("createdAt", 'MM/YY')`

  // const salesDataRaw = await prisma.$queryRaw<
  //   Array<{ month: string; totalSales: Prisma.Decimal }>
  // >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }))

  //get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  })

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  }
}
// get all orders
export async function getAllOrders({
  limit = PAGE_LIMIT,
  page,
  query,
}: {
  limit?: number
  page: number
  query: string
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {}
  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true } },
    },
  })

  //get the data counter
  const dataCounter = await prisma.order.count()

  return {
    data,
    totalPages: Math.ceil(dataCounter / limit),
  }
}

//delete an order as admin
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    })
    revalidatePath("/admin/orders")

    return {
      success: true,
      message: "Order deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId })

    revalidatePath(`/order/${orderId}`)

    return {
      success: true,
      message: "Order is marked paid.",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

//update COD order to delivered
export async function updateOrderDelivered(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    })

    if (!order) throw new Error("Order not found!")
    if (!order.isPaid) throw new Error("Order is not paid yet.")

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    })

    revalidatePath(`/order/${orderId}`)

    return {
      success: true,
      message: "Order is marked delivered",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
