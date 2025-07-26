"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useTransition } from "react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../ui/alert-dialog"

const DeleteDialog = ({
  id,
  action,
}: {
  id: string
  action: (id: string) => Promise<{ success: boolean; message: string }>
}) => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeleteClick = () => {
    startTransition(async () => {
      const res = await action(id)

      if (!res.success) {
        toast.error("Something is wrong", {
          description: res.message,
        })
      } else {
        setOpen(false)
        toast.success("Deleted!", {
          description: res.message,
        })
      }
    })
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="ml-2">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can't be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={handleDeleteClick}
          >
            {isPending ? "Deleting..." : "Deleted"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDialog
