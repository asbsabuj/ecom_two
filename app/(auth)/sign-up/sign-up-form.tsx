"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { signUpDefaultValues } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { startTransition, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signUpUser } from "@/lib/acions/user.action"
import { useSearchParams } from "next/navigation"
import { EyeOff, EyeIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const SignUpForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [cpVisible, setCpVisible] = useState(false)

  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: "",
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  //   const toggleVisibility = () => {
  //     setIsVisible((prev) => !prev)
  //   }

  const SignUpButton = () => {
    const { pending } = useFormStatus()

    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? "Submitting...." : "Sign Up"}
      </Button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(() => action(new FormData(e.currentTarget)))
      }} /*action={action}*/
    >
      <Input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            autoComplete="password"
            required
            defaultValue={signUpDefaultValues.password}
            type={isVisible ? "text" : "password"}
            className={cn("pe-12")}
          />
          <button
            type="button"
            className="absolute py-8 pr-5 inset-y-0 right-0 flex items-center px-2 cursor-pointer text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? (
              <EyeIcon className="stroke-muted-foreground size-5" />
            ) : (
              <EyeOff className="stroke-muted-foreground size-5" />
            )}
          </button>
        </div>
        <div className="relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="confirmPassword"
            required
            defaultValue={signUpDefaultValues.confirmPassword}
            type={cpVisible ? "text" : "password"}
            className={cn("pe-12")}
          />
          <button
            type="button"
            className="absolute py-8 pr-5 inset-y-0 right-0 flex items-center px-2 cursor-pointer text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => setCpVisible(!cpVisible)}
          >
            {cpVisible ? (
              <EyeIcon className="stroke-muted-foreground size-5" />
            ) : (
              <EyeOff className="stroke-muted-foreground size-5" />
            )}
          </button>
        </div>

        <div>
          <SignUpButton />
        </div>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" target="_self" className="link font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  )
}

export default SignUpForm

{
  /* <div>
          <Label htmlFor="password">password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="password"
            required
            defaultValue={signUpDefaultValues.password}
          />
        </div> */
}
{
  /* <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="confirmPassword"
            required
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div> */
}
