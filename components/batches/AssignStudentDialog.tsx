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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AssignStudentDialogProps {
  batchId: string;
  batchName: string;
  currentStudentIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignStudentDialog({
  batchId,
  batchName,
  currentStudentIds,
  open,
  onOpenChange,
}: AssignStudentDialogProps) {
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch all students
  const { data: allStudents = [], isLoading } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/students`);
      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }
      return res.json();
    },
    enabled: open,
  });

  // Filter out students already in this batch
  const availableStudents = allStudents.filter(
    (s) => !currentStudentIds.includes(s.student_id)
  );

  const selectedStudent = allStudents.find(
    (s) => s.student_id === selectedStudentId
  );

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudentId) return;

      const res = await fetch(`${backendUrl}/api/batches/${batchId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: selectedStudentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to assign student to batch.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch", batchId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student Enrolled", {
        description: `${selectedStudent?.name || "Student"} was enrolled in cohort "${batchName}".`,
      });
      setSelectedStudentId("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Enrollment Failed", {
        description: error.message || "Could not enroll student.",
      });
    },
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Validation Error", {
        description: "Please select a student to enroll.",
      });
      return;
    }
    assignMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
            <UserPlus className="size-5" />
            <span>Enroll Student to Batch</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enroll a student into{" "}
            <span className="font-semibold text-foreground">
              &quot;{batchName}&quot;
            </span>
            . Students can belong to multiple batches simultaneously.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="flex flex-col gap-4 py-2">
          {availableStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              {isLoading
                ? "Loading available students..."
                : "All registered students are already enrolled in this batch."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Student
                </label>
                <Select
                  value={selectedStudentId}
                  onValueChange={(val) => val && setSelectedStudentId(val)}
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                    <SelectValue placeholder="Choose a student to enroll...">
                      {selectedStudent ? selectedStudent.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem
                        key={student.student_id}
                        value={student.student_id}
                      >
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5 text-sm"
              onClick={() => onOpenChange(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full px-5 text-sm font-medium"
              disabled={
                !selectedStudentId ||
                assignMutation.isPending ||
                availableStudents.length === 0
              }
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Assigning...
                </>
              ) : (
                "Assign to Batch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
