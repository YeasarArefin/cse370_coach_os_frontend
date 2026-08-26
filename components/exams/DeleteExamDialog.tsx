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
import { Exam } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteExamDialogProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExamDialog({
  exam,
  open,
  onOpenChange,
}: DeleteExamDialogProps) {
  const queryClient = useQueryClient();

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!exam) return;

      const res = await fetch(`${backendUrl}/api/exams/${exam.exam_id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete exam.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam Deleted", {
        description: "The exam and all student results have been permanently removed.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Deletion Failed", {
        description: error.message || "Could not delete exam.",
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
            Delete Examination
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete exam{" "}
            <strong className="text-foreground">&quot;{exam?.title}&quot;</strong>?
            <br />
            This will permanently remove this exam and all associated student marks and rankings.
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
              "Delete Exam"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
