"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { signInDefaultValues } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signInWithCredentials } from "@/lib/acions/user.action"
import { useSearchParams } from "next/navigation"

const SignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const SignInButton = () => {
    const { pending } = useFormStatus()

    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? "Signing In...." : "Sign In"}
      </Button>
    )
  }

  return (
    <form action={action}>
      <Input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="password"
            required
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
        </div>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" target="_self" className="link">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  )
}

export default SignInForm

//try {
//   const res = await signIn("credentials", {
//     redirect: true,
//     redirectTo: "/",
//     email,
//     password,
//   })
//   console.log(res)
// } catch (error) {
//   console.error("Sign-in failed", error)
// }
