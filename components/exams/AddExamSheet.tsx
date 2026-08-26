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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddExamSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: Batch[];
  defaultBatchId?: string;
}

export function AddExamSheet({
  open,
  onOpenChange,
  batches,
  defaultBatchId,
}: AddExamSheetProps) {
  const queryClient = useQueryClient();

  const [batchId, setBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalMarks, setTotalMarks] = useState<string>("100");
  const [validationError, setValidationError] = useState("");

  // Sync default batch
  useEffect(() => {
    if (defaultBatchId) {
      setBatchId(defaultBatchId);
    } else if (batches.length > 0 && !batchId) {
      setBatchId(batches[0].batch_id);
    }
  }, [defaultBatchId, batches, batchId]);

  const resetForm = () => {
    setTitle("");
    setExamDate(new Date().toISOString().split("T")[0]);
    setTotalMarks("100");
    if (defaultBatchId) {
      setBatchId(defaultBatchId);
    } else if (batches.length > 0) {
      setBatchId(batches[0].batch_id);
    }
    setValidationError("");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/exams`, {
        method: "POST",
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
        throw new Error(data.message || "Failed to create exam.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam Created", {
        description: `"${data.title}" was scheduled for ${data.batch_name || "the batch"}.`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Creation Failed", {
        description: error.message || "Could not create exam.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!batchId || !title.trim()) {
      const msg = "Please provide an assigned batch cohort and exam title.";
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

    createMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (createMutation.isError
      ? createMutation.error?.message || "Failed to create exam."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Create Examination
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Schedule a test, quiz, or midterm for a batch cohort.
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
                htmlFor="exam-batch"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Assigned Batch *
              </label>
              {batches.length > 0 ? (
                <Select
                  value={batchId}
                  onValueChange={(val) => val && setBatchId(val)}
                  disabled={createMutation.isPending}
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
              ) : (
                <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground text-center">
                  No batches available. Please create a batch first.
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="exam-title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Exam Title *
              </label>
              <Input
                id="exam-title"
                placeholder="e.g. Physics Midterm Examination 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Exam Date */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="exam-date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Exam Date
              </label>
              <Input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Total Marks */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="exam-total-marks"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Total Maximum Marks *
              </label>
              <Input
                id="exam-total-marks"
                type="number"
                min="1"
                step="1"
                placeholder="100"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
                disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-6 text-sm font-medium"
                disabled={createMutation.isPending || batches.length === 0}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Creating Exam...
                  </>
                ) : (
                  "Create Examination"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
