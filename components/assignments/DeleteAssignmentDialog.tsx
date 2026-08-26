"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Assignment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteAssignmentDialogProps {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAssignmentDialog({
  assignment,
  open,
  onOpenChange,
}: DeleteAssignmentDialogProps) {
  const queryClient = useQueryClient();

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) return;

      const res = await fetch(
        `${backendUrl}/api/assignments/${assignment.assignment_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete assignment.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment Deleted", {
        description: "The assignment has been permanently deleted.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Deletion Failed", {
        description: error.message || "Could not delete assignment.",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="font-heading text-lg font-bold">
            Delete Assignment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete assignment{" "}
            <strong className="text-foreground">
              &quot;{assignment?.title}&quot;
            </strong>
            ?
            <br />
            This action cannot be undone and will permanently remove it from the batch.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-5 text-sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full px-5 text-sm font-medium"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Deleting...
              </>
            ) : (
              "Delete Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
