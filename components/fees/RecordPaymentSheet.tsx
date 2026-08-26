"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Student } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface RecordPaymentSheetProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth: string;
}

export function RecordPaymentSheet({
  student,
  open,
  onOpenChange,
  defaultMonth,
}: RecordPaymentSheetProps) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("1500");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [month, setMonth] = useState(defaultMonth);
  const [validationError, setValidationError] = useState("");

  // Sync amount and month when student or defaultMonth changes
  useEffect(() => {
    if (student) {
      const calculatedFee =
        student.total_fee ??
        (student.batches?.reduce((acc, b) => acc + (b.fee || 0), 0) || 1500);
      setAmount(String(calculatedFee));
      setMonth(defaultMonth);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setValidationError("");
    }
  }, [student, defaultMonth]);

  const resetForm = () => {
    setAmount("1500");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setMonth(defaultMonth);
    setValidationError("");
  };

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!student) throw new Error("No student selected");

      const res = await fetch(`${backendUrl}/api/fees/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.student_id,
          amount: Number(amount),
          payment_date: paymentDate,
          month,
          status: "paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record payment");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["recentPayments"] });
      toast.success("Payment Recorded", {
        description: `Payment of ৳${Number(amount).toLocaleString()} recorded for ${data.student_name}.`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to Record", {
        description: error.message || "Could not record payment.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const msg = "Amount must be a valid positive number.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    if (!month.trim()) {
      const msg = "Month is required (e.g. August 2026).";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    createMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (createMutation.isError
      ? createMutation.error?.message || "Failed to record payment."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Record Payment
          </SheetTitle>
          {student && (
            <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <User className="size-3.5" />
              <span className="font-medium text-foreground">
                {student.name}
              </span>
              <span>·</span>
              <span>{student.email}</span>
            </SheetDescription>
          )}
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-between"
        >
          <div className="flex flex-col gap-4 p-6">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-xl py-2.5">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Auto-Calculated Batch Fee Breakdown Banner */}
            {student && student.batches && student.batches.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-primary">
                  <span>Enrolled Batches ({student.batches.length}):</span>
                  <span className="font-mono text-sm">
                    Total: ৳{student.total_fee?.toLocaleString() || student.batches.reduce((a, b) => a + (b.fee || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-1 text-muted-foreground">
                  {student.batches.map((b) => (
                    <div key={b.batch_id} className="flex items-center justify-between">
                      <span>• {b.name}</span>
                      <span className="font-mono text-foreground font-medium">
                        ৳{Number(b.fee ?? 0).toLocaleString()}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (৳) *
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Month */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fee Month *
              </label>
              <Input
                type="text"
                placeholder="e.g. August 2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
              <span className="text-xs text-muted-foreground">
                Format: Month Year (e.g. August 2026)
              </span>
            </div>

            {/* Payment Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Date *
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
