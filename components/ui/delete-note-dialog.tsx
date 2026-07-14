"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { NotesResponse } from "@/lib/api/notes"

async function deleteNote(id: string) {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? "Failed to delete note")
  return body
}

export function DeleteNoteDialog({ noteId, noteTitle }: { noteId: string; noteTitle: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onMutate: async () => {
      toast.loading("Deleting note...", { id: "delete-note" })

      await queryClient.cancelQueries({ queryKey: ["notes"] })

      const previousQueries = queryClient.getQueriesData({ queryKey: ["notes"] })

      queryClient.setQueriesData({ queryKey: ["notes"] }, (oldData: NotesResponse | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          notes: oldData.notes.filter((n) => n._id !== noteId),
        }
      })

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error("Failed to delete note", {
        id: "delete-note",
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(),
        },
      })
    },
    onSuccess: () => {
      toast.success("Note deleted successfully", { id: "delete-note" })
      setOpen(false)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={15} strokeWidth={2} />
          Delete Note
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Note?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the uploaded file, generated questions, answers, and all associated data.
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
