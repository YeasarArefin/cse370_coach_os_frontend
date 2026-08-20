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
import { Batch, Student } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface EditStudentSheetProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: Batch[];
}

export function EditStudentSheet({
  student,
  open,
  onOpenChange,
  batches,
}: EditStudentSheetProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batchId, setBatchId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [validationError, setValidationError] = useState("");

  // Sync form state when student changes
  useEffect(() => {
    if (student) {
      setName(student.name || "");
      setEmail(student.email || "");
      setBatchId(student.batch_id || "");
      setPhone(student.phone || "");
      setAddress(student.address || "");
      setAdmissionDate(
        student.admission_date
          ? new Date(student.admission_date).toISOString().split("T")[0]
          : ""
      );
      setStatus(student.status || "active");
      setValidationError("");
    }
  }, [student]);

  // Check whether form values changed from initial student state
  const isFormDirty = useMemo(() => {
    if (!student) return false;
    const initialAdmissionDate = student.admission_date
      ? new Date(student.admission_date).toISOString().split("T")[0]
      : "";
    return (
      name !== (student.name || "") ||
      email !== (student.email || "") ||
      batchId !== (student.batch_id || "") ||
      phone !== (student.phone || "") ||
      address !== (student.address || "") ||
      admissionDate !== initialAdmissionDate ||
      status !== (student.status || "active")
    );
  }, [student, name, email, batchId, phone, address, admissionDate, status]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!student) return;

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/students/${student.student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          batch_id: batchId,
          phone: phone || null,
          address: address || null,
          admission_date: admissionDate || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update student profile.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student Updated", {
        description: `Profile for ${data.name || name} was updated.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update student details.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name || !email || !batchId) {
      const msg = "Name, email, and batch cohort are required.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    updateMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (updateMutation.isError
      ? updateMutation.error?.message || "Failed to update student."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Edit Student Profile
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Update student academic credentials and cohort assignment.
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
                htmlFor="edit-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Full Name *
              </label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address *
              </label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-batch"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Batch Cohort *
              </label>
              <Select
                value={batchId}
                onValueChange={(val) => val && setBatchId(val)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.batch_id} value={batch.batch_id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-phone"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Phone Number
                </label>
                <Input
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={updateMutation.isPending}
                  className="h-10 rounded-full px-4 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-admission-date"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Admission Date
                </label>
                <Input
                  id="edit-admission-date"
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  disabled={updateMutation.isPending}
                  className="h-10 rounded-full px-4 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-address"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Home Address
              </label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as "active" | "inactive")}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
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
