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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AddBatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBatchSheet({ open, onOpenChange }: AddBatchSheetProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<"active" | "completed" | "inactive">(
    "active"
  );
  const [validationError, setValidationError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setStatus("active");
    setValidationError("");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/batches`, {
        method: "POST",
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
        throw new Error(data.message || "Failed to create batch.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch Created", {
        description: `Batch "${data.name}" was created successfully.`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Creation Failed", {
        description: error.message || "Could not create batch.",
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

    createMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (createMutation.isError
      ? createMutation.error?.message || "Failed to create batch."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Create Batch Cohort
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Set up a new teaching batch to organize students and schedules.
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
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Batch Name *
              </label>
              <Input
                id="name"
                placeholder="e.g. Physics 2026 - Morning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description / Syllabus
              </label>
              <Input
                id="description"
                placeholder="e.g. Advanced calculus, kinematics, and mechanics"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="start_date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Start Date
              </label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Batch Status
              </label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setStatus(val as "active" | "completed" | "inactive")
                }
                disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-6 text-sm font-medium"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Creating...
                  </>
                ) : (
                  "Create Batch"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
