"use server"

import { CartItem } from "@/types"
import { cookies } from "next/headers"
import { convertToPlainObject, formatError, round2 } from "../utils"
import { auth } from "@/auth"
import { prisma } from "@/db/prisma"
import { cartSchema, insertCartSchema } from "../validations"
import { revalidatePath } from "next/cache"

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export async function addItemsToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value
    if (!sessionCartId) throw new Error("Cart session not found!")

    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    const cart = await getMyCart()

    const item = cartSchema.parse(data)

    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    })

    if (!product) {
      throw new Error("Product not found!")
    }

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      })

      await prisma.cart.create({
        data: newCart,
      })

      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`,
      }
    } else {
      //check existing items in cart
      const existingItems = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      )

      if (existingItems) {
        //check stock
        if (product.stock < existingItems.qty + 1) {
          throw new Error("Sorry! This product does not have enough stock!")
        }

        //increase quantity
        ;(cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existingItems.qty + 1
      } else {
        //if item not in cart
        //check stock

        if (product.stock < 1) throw new Error("Not enough stock!")

        //add item in cart.items
        cart.items.push(item)
      }

      //add ton the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items as CartItem[]),
        },
      })
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} ${
          existingItems ? "updated in" : "added to"
        } cart`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    //check user session cookies
    const sessionCartId = (await cookies()).get("sessionCartId")?.value
    if (!sessionCartId) throw new Error("Cart session not found!")

    //get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    })
    if (!product) throw new Error("Product not found!")

    //get user cart
    const cart = await getMyCart()
    if (!cart) throw new Error("Cart not found!")

    //check item
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    )
    if (!exist) throw new Error("Item not found")

    //removing from cart

    //if qty is 1, then removing from cart
    if (exist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      )
    } else {
      ;(cart.items as CartItem[]).find(
        (x) => x.productId === exist.productId
      )!.qty = exist.qty - 1
    }

    //update database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items as CartItem[]),
      },
    })

    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message: `${product.name} is removed from cart!`,
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value
  if (!sessionCartId) throw new Error("Cart session not found!")

  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  })

  if (!cart) return undefined

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  })
}
