"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Layers,
  Printer,
  User
} from "lucide-react";
import { useRef } from "react";

interface PaymentInvoiceDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName?: string;
}

export function PaymentInvoiceDialog({
  payment,
  open,
  onOpenChange,
  batchName,
}: PaymentInvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const invoiceNumber = `INV-${(payment.payment_id || "").slice(0, 8).toUpperCase()}`;
  const formattedDate = payment.payment_date
    ? new Date(payment.payment_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Fee Payment Invoice</DialogTitle>
          <DialogDescription>
            Official fee payment receipt for {payment.student_name || "student"}
          </DialogDescription>
        </DialogHeader>

        {/* Printable Invoice Container */}
        <div
          ref={invoiceRef}
          id="printable-invoice"
          className="flex flex-col gap-6 p-6 sm:p-8 bg-card text-foreground"
        >
          {/* 1. Header: CoachOS Branding & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <BookOpen className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg leading-tight tracking-tight">
                  CoachOS
                </span>
                <span className="text-xs text-muted-foreground">
                  Academic & Admission Coaching System
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col gap-0.5">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Receipt / Invoice
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {invoiceNumber}
              </span>
              <span className="text-xs text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
                <Calendar className="size-3" />
                <span>Date: {formattedDate}</span>
              </span>
            </div>
          </div>

          {/* 2. Bill To / Student Information & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Billed To (Student)
              </span>
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                {payment.student_name || "Student"}
              </span>
              {payment.student_email && (
                <span className="text-xs text-muted-foreground font-mono">
                  {payment.student_email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Payment Status
              </span>
              <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-0.5 text-xs font-semibold gap-1.5 shadow-none w-fit">
                <CheckCircle2 className="size-3.5" />
                PAID & VERIFIED
              </Badge>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Billing Cycle: <strong>{payment.month}</strong>
              </span>
            </div>
          </div>

          {/* 3. Itemized Fee Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Description / Course Batch</th>
                  <th className="px-4 py-2.5 text-center">Billing Month</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        Monthly Tuition & Course Coaching Fee
                      </span>
                      {batchName && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="size-3 text-primary" />
                          <span>Batch: {batchName}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-muted-foreground font-medium">
                    {payment.month}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground">
                    ৳{Number(payment.amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="border-t border-border bg-muted/10 font-medium">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Amount Paid:
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{Number(payment.amount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 4. Footer Note & Security Signature Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground pt-2 border-t border-dashed border-border">
            <span>
              This is a computer-generated official receipt. No physical signature is required.
            </span>
            <span className="font-mono text-[11px] text-muted-foreground/70 shrink-0">
              Auth ID: {payment.payment_id}
            </span>
          </div>
        </div>

        {/* Action Controls (Hidden during print) */}
        <DialogFooter className="border-t border-border p-4 bg-muted/20 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-5 text-sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="rounded-full px-5 text-sm font-medium gap-2 border-border hover:bg-muted"
            >
              <Printer className="size-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
