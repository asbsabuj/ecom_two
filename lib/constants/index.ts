export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "E-Com2"
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Next js e-commerce app for practice and learn"
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
export const LATEST_PRODUCT_LIMIT = Number(
  process.env.LATEST_PRODUCT_LIMIT || 4
)
export const signInDefaultValues = {
  email: "",
  password: "",
}

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
}

export const shippingAddressDefaultValues = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  country: "",
  lat: "",
  lon: "",
}

//payment method default values
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"]
export const DEFAULT_PAYMENT_METHODS =
  process.env.DEFAULT_PAYMENT_METHODS || "PayPal"

export const PAGE_LIMIT = Number(process.env.PAGE_LIMIT) || 12

//updating product default values
export const productDefaultValues = {
  name: "",
  slug: "",
  category: "",
  brand: "",
  description: "",
  stock: 0,
  image: [],
  isFeatured: false,
  price: "0",
  banner: null,
  rating: "0",
  numReviews: "0",
}

//roles for a user
export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"]

//default values for review form
export const defaultReviewFormValue = {
  title: "",
  description: "",
  rating: 0,
}

//default value for sender email
export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev"
