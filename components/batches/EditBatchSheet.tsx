"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Batch } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface EditBatchSheetProps {
  batch: Batch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBatchSheet({
  batch,
  open,
  onOpenChange,
}: EditBatchSheetProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "inactive">(
    "active"
  );
  const [validationError, setValidationError] = useState("");

  // Sync form state when batch changes
  useEffect(() => {
    if (batch) {
      setName(batch.name || "");
      setDescription(batch.description || "");
      setStartDate(
        batch.start_date
          ? new Date(batch.start_date).toISOString().split("T")[0]
          : ""
      );
      setStatus(batch.status || "active");
      setValidationError("");
    }
  }, [batch]);

  // Check whether form values changed from initial batch state
  const isFormDirty = useMemo(() => {
    if (!batch) return false;
    const initialStartDate = batch.start_date
      ? new Date(batch.start_date).toISOString().split("T")[0]
      : "";
    return (
      name !== (batch.name || "") ||
      description !== (batch.description || "") ||
      startDate !== initialStartDate ||
      status !== (batch.status || "active")
    );
  }, [batch, name, description, startDate, status]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!batch) return;

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/batches/${batch.batch_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          start_date: startDate || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update batch.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Batch Updated", {
        description: `Batch "${data.name || name}" has been updated.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update batch.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      const msg = "Batch name is required.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    updateMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (updateMutation.isError
      ? updateMutation.error?.message || "Failed to update batch."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Edit Batch Cohort
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Update batch details, curriculum description, and operational status.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between">
          <div className="flex flex-col gap-4 p-6">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-xl py-2.5">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-batch-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Batch Name *
              </label>
              <Input
                id="edit-batch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-batch-description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description / Syllabus
              </label>
              <Input
                id="edit-batch-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-batch-start-date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Start Date
              </label>
              <Input
                id="edit-batch-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-batch-status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Batch Status
              </label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setStatus(val as "active" | "completed" | "inactive")
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="border-t border-border p-4 sm:p-6 bg-muted/20">
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-5 text-sm"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-6 text-sm font-medium"
                disabled={!isFormDirty || updateMutation.isPending}
                title={!isFormDirty ? "Make changes to enable update" : undefined}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
