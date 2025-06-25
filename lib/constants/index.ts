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
  : ["paypal", "stripe", "cashOnDelivery"]
export const DEFAULT_PAYMENT_METHODS =
  process.env.DEFAULT_PAYMENT_METHODS || "paypal"
