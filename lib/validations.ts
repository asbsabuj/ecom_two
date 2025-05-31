import { z } from "zod"
import { formatNumberWithDecimal } from "./utils"

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
