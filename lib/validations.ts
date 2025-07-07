import { z } from "zod"
import { formatNumberWithDecimal } from "./utils"
import { PAYMENT_METHODS } from "./constants"

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  )

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters "),
  slug: z.string().min(3, "Slug must have at least 3 characters "),
  category: z.string().min(3, "Category must have at least 3 characters "),
  brand: z.string().min(3, "Brand must have at least 3 characters "),
  description: z
    .string()
    .min(3, "Description must have at least 3 characters "),
  stock: z.coerce.number(),
  image: z.array(z.string()).min(1, "Product must have at least 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
})

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const signUpFormSchema = z
  .object({
    name: z.string().min(2, "Name must have at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match!",
    path: ["confirmPassword"],
  })

export const cartSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  qty: z.number().int().nonnegative("Quantity can not be a negative number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
})

export const insertCartSchema = z.object({
  items: z.array(cartSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  userId: z.string().optional().nullable(),
  sessionCartId: z.string().min(1, "Session cart ID is required"),
})

//shipping address schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters long"),
  street: z.string().min(3, "Street name must be at least 3 characters long"),
  city: z.string().min(3, "City must be at least 3 characters long"),
  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters long"),
  country: z.string().min(3, "Country must be at least 3 characters long"),
  lat: z.string().optional(),
  lon: z.string().optional(),
})

//payment method schema
export const paymentMethodsSchema = z
  .object({
    type: z.string().min(1, "Payment method is required."),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method.",
  })

//insert order schema
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method.",
  }),
  shippingAddress: shippingAddressSchema,
})

//insert order item schema
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
})
