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
import { Payment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeletePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePaymentDialog({
  payment,
  open,
  onOpenChange,
}: DeletePaymentDialogProps) {
  const queryClient = useQueryClient();

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!payment) throw new Error("No payment selected");

      const res = await fetch(
        `${backendUrl}/api/fees/payments/${payment.payment_id}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete payment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["recentPayments"] });
      queryClient.invalidateQueries({
        queryKey: ["studentPayments", payment?.student_id],
      });
      toast.success("Payment Deleted", {
        description: "The payment record has been removed.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Deletion Failed", {
        description: error.message || "Could not delete payment.",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="font-heading text-lg font-bold">
            Delete Payment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete the payment record for{" "}
            <strong className="text-foreground">
              {payment?.student_name || "this student"}
            </strong>{" "}
            ({payment?.month})?
            <br />
            This action is permanent and cannot be undone.
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
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Deleting...
              </>
            ) : (
              "Delete Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
