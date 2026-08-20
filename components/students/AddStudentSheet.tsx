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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AddStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: Batch[];
}

export function AddStudentSheet({
  open,
  onOpenChange,
  batches,
}: AddStudentSheetProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [validationError, setValidationError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setBatchId(batches.length > 0 ? batches[0].batch_id : "");
    setPhone("");
    setAddress("");
    setAdmissionDate(new Date().toISOString().split("T")[0]);
    setStatus("active");
    setValidationError("");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          batch_id: batchId,
          phone: phone || null,
          address: address || null,
          admission_date: admissionDate || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create student account.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student Account Created", {
        description: `Login account for ${data.name} (${data.email}) is ready.`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Account Creation Failed", {
        description: error.message || "Could not create student account.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name || !email || !password || !batchId) {
      const msg = "Please fill in all required fields (Name, Email, Login Password, Batch).";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    if (password.length < 6) {
      const msg = "Student password must be at least 6 characters long.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    createMutation.mutate();
  };

  const errorMessage =
    validationError ||
    (createMutation.isError
      ? createMutation.error?.message || "Failed to add student."
      : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Create Student Account
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Create login credentials and assign the student to a batch.
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
                Student Full Name *
              </label>
              <Input
                id="name"
                placeholder="e.g. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Login Email Address *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="student@coaching.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Student Login Password *
                </label>
                <span className="text-[11px] text-muted-foreground">Min 6 chars</span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={createMutation.isPending}
                  className="h-10 rounded-full pl-4 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="batch"
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
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.batch_id} value={batch.batch_id}>
                        {batch.name}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  placeholder="01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={createMutation.isPending}
                  className="h-10 rounded-full px-4 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admission_date"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Admission Date
                </label>
                <Input
                  id="admission_date"
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  disabled={createMutation.isPending}
                  className="h-10 rounded-full px-4 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="address"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Home Address
              </label>
              <Input
                id="address"
                placeholder="City, Area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={createMutation.isPending}
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Enrollment Status
              </label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as "active" | "inactive")}
                disabled={createMutation.isPending}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Student Account"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
