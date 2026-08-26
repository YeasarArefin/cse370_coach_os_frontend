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
import { Batch, Exam } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface EditExamSheetProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: Batch[];
}

export function EditExamSheet({
  exam,
  open,
  onOpenChange,
  batches,
}: EditExamSheetProps) {
  const queryClient = useQueryClient();

  const [batchId, setBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [totalMarks, setTotalMarks] = useState<string>("100");
  const [validationError, setValidationError] = useState("");

  // Sync state when exam changes
  useEffect(() => {
    if (exam) {
      setBatchId(exam.batch_id || "");
      setTitle(exam.title || "");
      setExamDate(
        exam.exam_date
          ? new Date(exam.exam_date).toISOString().split("T")[0]
          : ""
      );
      setTotalMarks(String(exam.total_marks || 100));
      setValidationError("");
    }
  }, [exam]);

  // Dirty check: whether any value changed from initial exam
  const isFormDirty = useMemo(() => {
    if (!exam) return false;
    const initialDate = exam.exam_date
      ? new Date(exam.exam_date).toISOString().split("T")[0]
      : "";
    return (
      batchId !== (exam.batch_id || "") ||
      title !== (exam.title || "") ||
      examDate !== initialDate ||
      totalMarks !== String(exam.total_marks || 100)
    );
  }, [exam, batchId, title, examDate, totalMarks]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!exam) return;

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/exams/${exam.exam_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: batchId,
          title,
          exam_date: examDate || null,
          total_marks: Number(totalMarks),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update exam.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["results", exam?.exam_id] });
      toast.success("Exam Updated", {
        description: `Changes to "${data.title || title}" have been saved.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update exam.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!batchId || !title.trim()) {
      const msg = "Please provide an assigned batch and exam title.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    const marks = Number(totalMarks);
    if (isNaN(marks) || marks <= 0) {
      const msg = "Total marks must be a valid positive number.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    updateMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (updateMutation.isError
      ? updateMutation.error?.message || "Failed to update exam."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Edit Examination
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Update exam schedule details, cohort assignment, or maximum marks.
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
                htmlFor="edit-exam-batch"
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
                htmlFor="edit-exam-title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Exam Title *
              </label>
              <Input
                id="edit-exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Exam Date */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-exam-date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Exam Date
              </label>
              <Input
                id="edit-exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Total Marks */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-exam-total-marks"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Total Maximum Marks *
              </label>
              <Input
                id="edit-exam-total-marks"
                type="number"
                min="1"
                step="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
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
