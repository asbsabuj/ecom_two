"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { defaultReviewFormValue } from "@/lib/constants"
import { toast } from "sonner"
import { insertReviewsSchema } from "@/lib/validations"
import { useState } from "react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon } from "lucide-react"
import {
  createUpdateReview,
  getReviewByProductId,
} from "@/lib/acions/review.action"

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string
  productId: string
  onReviewSubmitted: () => void
}) => {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof insertReviewsSchema>>({
    resolver: zodResolver(insertReviewsSchema),
    defaultValues: defaultReviewFormValue,
  })

  //handle form open
  const handleFormOpen = async () => {
    form.setValue("productId", productId)
    form.setValue("userId", userId)

    const review = await getReviewByProductId({ productId })

    if (review.data) {
      form.setValue("title", review.data.title)
      form.setValue("description", review.data.description)
      form.setValue("rating", review.data.rating)
    }

    setOpen(true)
  }

  //handle form submit
  const onSubmit: SubmitHandler<z.infer<typeof insertReviewsSchema>> = async (
    values
  ) => {
    const res = await createUpdateReview({ ...values, productId })

    if (!res.success) {
      toast.error("Something went wrong.", {
        description: res.message,
      })
    }

    setOpen(false)

    onReviewSubmitted()

    toast.success("Successful", {
      description: res.message,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleFormOpen} variant="default">
        Write a review
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Write a review</DialogTitle>
              <DialogDescription>
                Share your thoughts with other customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <SelectItem
                            key={index}
                            value={(index + 1).toString()}
                          >
                            {index + 1} <StarIcon className="inline, h-4 w-4" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewForm
