"use client"

import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserFromProfileSchema } from "@/lib/validations"
import { updateUserFromProfile } from "@/lib/acions/user.action"
import { Input } from "@/components/ui/input"

const ProfileForm = () => {
  const { data: session, update } = useSession()

  const form = useForm<z.infer<typeof updateUserFromProfileSchema>>({
    resolver: zodResolver(updateUserFromProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  })

  const onSubmit = async (
    values: z.infer<typeof updateUserFromProfileSchema>
  ) => {
    const res = await updateUserFromProfile(values)

    if (!res.success) {
      toast.error("Something went wrong!", {
        description: res.message,
      })
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    }
    await update(newSession)
    toast.success("Successful!", {
      description: res.message,
    })
  }
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    disabled
                    placeholder="Email"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="button col-span-2 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  )
}

export default ProfileForm
