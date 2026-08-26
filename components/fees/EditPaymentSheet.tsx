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
import { Payment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ReceiptText } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface EditPaymentSheetProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentSheet({
  payment,
  open,
  onOpenChange,
}: EditPaymentSheetProps) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [month, setMonth] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (payment) {
      setAmount(String(payment.amount));
      setPaymentDate(
        payment.payment_date
          ? new Date(payment.payment_date).toISOString().split("T")[0]
          : ""
      );
      setMonth(payment.month || "");
      setValidationError("");
    }
  }, [payment]);

  // Dirty check
  const isFormDirty = useMemo(() => {
    if (!payment) return false;
    const initialDate = payment.payment_date
      ? new Date(payment.payment_date).toISOString().split("T")[0]
      : "";
    return (
      amount !== String(payment.amount) ||
      paymentDate !== initialDate ||
      month !== (payment.month || "")
    );
  }, [payment, amount, paymentDate, month]);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!payment) throw new Error("No payment selected");

      const res = await fetch(
        `${backendUrl}/api/fees/payments/${payment.payment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            payment_date: paymentDate,
            month,
            status: "paid",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update payment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["recentPayments"] });
      queryClient.invalidateQueries({
        queryKey: ["studentPayments", payment?.student_id],
      });
      toast.success("Payment Updated", {
        description: "Payment record has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update payment.",
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
      return;
    }

    if (!month.trim()) {
      const msg = "Month is required.";
      setValidationError(msg);
      return;
    }

    updateMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (updateMutation.isError
      ? updateMutation.error?.message || "Failed to update."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Edit Payment
          </SheetTitle>
          {payment && (
            <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <ReceiptText className="size-3.5" />
              <span className="font-medium text-foreground">
                {payment.student_name || "Student"}
              </span>
              <span>·</span>
              <span>{payment.month}</span>
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

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (৳) *
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
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
                title={
                  !isFormDirty ? "Make changes to enable update" : undefined
                }
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
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
