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
import { Batch } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteBatchDialogProps {
  batch: Batch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBatchDialog({
  batch,
  open,
  onOpenChange,
}: DeleteBatchDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!batch) return;

      const backendUrl =
        process.env.BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/batches/${batch.batch_id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete batch.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Batch Removed", {
        description: `Batch "${batch?.name}" was deleted successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Delete Failed", {
        description: error.message || "Could not delete batch.",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogTitle className="font-heading text-lg font-bold">
            Delete Batch Cohort
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to delete batch{" "}
            <span className="font-semibold text-foreground">
              &quot;{batch?.name}&quot;
            </span>
            ? This will remove all associated cohort records and schedules.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-full px-5 text-sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-full px-5 text-sm font-medium"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Deleting...
              </>
            ) : (
              "Delete Batch"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
