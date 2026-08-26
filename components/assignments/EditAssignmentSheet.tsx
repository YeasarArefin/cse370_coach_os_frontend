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
import { Textarea } from "@/components/ui/textarea";
import { Assignment, Batch } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface EditAssignmentSheetProps {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: Batch[];
}

export function EditAssignmentSheet({
  assignment,
  open,
  onOpenChange,
  batches,
}: EditAssignmentSheetProps) {
  const queryClient = useQueryClient();

  const [batchId, setBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [validationError, setValidationError] = useState("");

  // Sync state when assignment changes
  useEffect(() => {
    if (assignment) {
      setBatchId(assignment.batch_id || "");
      setTitle(assignment.title || "");
      setDescription(assignment.description || "");
      setDeadline(
        assignment.deadline
          ? new Date(assignment.deadline).toISOString().split("T")[0]
          : ""
      );
      setValidationError("");
    }
  }, [assignment]);

  // Check whether form values changed from initial assignment state
  const isFormDirty = useMemo(() => {
    if (!assignment) return false;
    const initialDeadline = assignment.deadline
      ? new Date(assignment.deadline).toISOString().split("T")[0]
      : "";
    return (
      batchId !== (assignment.batch_id || "") ||
      title !== (assignment.title || "") ||
      description !== (assignment.description || "") ||
      deadline !== initialDeadline
    );
  }, [assignment, batchId, title, description, deadline]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) return;

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(
        `${backendUrl}/api/assignments/${assignment.assignment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_id: batchId,
            title,
            description: description || null,
            deadline: deadline || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update assignment.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment Updated", {
        description: `Changes to "${data.title || title}" have been saved.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update assignment.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!batchId || !title.trim()) {
      const msg = "Please provide an assigned batch and assignment title.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    updateMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (updateMutation.isError
      ? updateMutation.error?.message || "Failed to update assignment."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Edit Assignment
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Update assignment instructions, batch cohort, or submission deadline.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between">
          <div className="flex flex-col gap-4 p-6">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-xl py-2.5">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Batch Select */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-assignment-batch"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Assigned Batch *
              </label>
              <Select
                value={batchId}
                onValueChange={(val) => val && setBatchId(val)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                  <SelectValue placeholder="Select batch cohort">
                    {batches.find((b) => b.batch_id === batchId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.batch_id} value={b.batch_id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-assignment-title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Assignment Title *
              </label>
              <Input
                id="edit-assignment-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-assignment-deadline"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Submission Deadline
              </label>
              <Input
                id="edit-assignment-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Description / Instructions */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-assignment-description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Instructions & Details
              </label>
              <Textarea
                id="edit-assignment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={updateMutation.isPending}
                className="rounded-xl p-3 text-sm resize-none"
              />
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
                    Saving Changes...
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
