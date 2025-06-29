import { Metadata } from "next"
import { getUserById } from "@/lib/acions/user.action"
import { auth } from "@/auth"
import CheckoutSteps from "@/components/shared/checkout-steps"
import PaymentMethodForm from "./payment-method-form"

export const metadata: Metadata = {
  title: "Payment Method",
}

const PaymentMethodPage = async () => {
  const session = await auth()

  const userId = session?.user?.id

  if (!userId) throw new Error("User not found!")

  const user = await getUserById(userId)
  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  )
}

export default PaymentMethodPage
