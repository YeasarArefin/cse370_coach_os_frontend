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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Batch, Student } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  Layers,
  Loader2,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AssignStudentDialog } from "./AssignStudentDialog";

interface BatchDetailSheetProps {
  batchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BatchWithStudents extends Batch {
  students: Student[];
}

export function BatchDetailSheet({
  batchId,
  open,
  onOpenChange,
}: BatchDetailSheetProps) {
  const queryClient = useQueryClient();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);

  const backendUrl =
    process.env.BACKEND_URL || "http://localhost:5000";

  // Fetch batch details and enrolled students
  const { data: batch, isLoading } = useQuery<BatchWithStudents>({
    queryKey: ["batch", batchId],
    queryFn: async () => {
      if (!batchId) throw new Error("No batch id provided");
      const res = await fetch(`${backendUrl}/api/batches/${batchId}`);
      if (!res.ok) {
        throw new Error("Failed to load batch details");
      }
      return res.json();
    },
    enabled: !!batchId && open,
  });

  // Remove student mutation
  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!batchId) return;

      const res = await fetch(
        `${backendUrl}/api/batches/${batchId}/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove student from batch.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch", batchId] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student Removed", {
        description: `${studentToRemove?.name || "Student"} was removed from "${batch?.name}".`,
      });
      setStudentToRemove(null);
    },
    onError: (error: Error) => {
      toast.error("Removal Failed", {
        description: error.message || "Could not remove student.",
      });
    },
  });

  const handleConfirmRemove = () => {
    if (!studentToRemove) return;
    removeStudentMutation.mutate(studentToRemove.student_id);
  };

  const students = batch?.students || [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-2xl md:max-w-3xl overflow-y-auto">
          {/* Header */}
          <SheetHeader className="border-b border-border p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </div>
                <div>
                  <SheetTitle className="font-heading text-xl font-bold">
                    {batch?.name || "Batch Overview"}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    {batch?.description || "Curriculum details & enrolled student roster."}
                  </SheetDescription>
                </div>
              </div>

              {batch?.status && (
                <Badge
                  variant="secondary"
                  className={`capitalize text-xs font-medium rounded-full ${batch.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {batch.status}
                </Badge>
              )}
            </div>

            {/* Quick Metadata Stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <UserCheck className="size-3.5" />
                <span>
                  Teacher: <strong className="text-foreground">{batch?.teacher_name || "—"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>
                  Start:{" "}
                  <strong className="text-foreground">
                    {batch?.start_date
                      ? new Date(batch.start_date).toLocaleDateString()
                      : "—"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>
                  Enrolled:{" "}
                  <strong className="text-foreground">{students.length}</strong>
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Body: Students Roster in this Batch */}
          <div className="flex flex-1 flex-col p-6 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Enrolled Students ({students.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Students currently assigned to this batch.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setIsAssignOpen(true)}
                className="h-8 rounded-full px-3.5 text-xs font-medium gap-1.5 shadow-none"
              >
                <UserPlus className="size-3.5" data-icon="inline-start" />
                <span>Add Student</span>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <Users className="size-8 text-muted-foreground stroke-1 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No students in this batch yet
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                  Click &quot;Add Student&quot; above to assign existing students to this cohort.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border">
                      <TableHead className="py-2.5 pl-3 text-xs font-semibold uppercase tracking-wider">
                        Student
                      </TableHead>
                      <TableHead className="py-2.5 text-xs font-semibold uppercase tracking-wider">
                        Phone
                      </TableHead>
                      <TableHead className="py-2.5 text-xs font-semibold uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="py-2.5 pr-3 text-right text-xs font-semibold uppercase tracking-wider">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.student_id}
                        className="border-border hover:bg-muted/30"
                      >
                        <TableCell className="py-2.5 pl-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-xs text-foreground">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {student.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground">
                          {student.phone || "—"}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] rounded-full capitalize"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 pr-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground hover:text-destructive rounded-full"
                            title="Remove student from batch"
                            disabled={removeStudentMutation.isPending}
                            onClick={() => setStudentToRemove(student)}
                          >
                            <Trash2 className="size-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign Existing Student Dialog */}
      {batchId && (
        <AssignStudentDialog
          batchId={batchId}
          batchName={batch?.name || "Batch"}
          currentStudentIds={students.map((s) => s.student_id)}
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
        />
      )}

      {/* Custom Confirmation Dialog for Removing Student */}
      <Dialog
        open={!!studentToRemove}
        onOpenChange={(isOpen) => {
          if (!isOpen && !removeStudentMutation.isPending) {
            setStudentToRemove(null);
          }
        }}
      >
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader className="gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="font-heading text-lg font-bold">
              Remove Student from Cohort
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">
                {studentToRemove?.name}
              </strong>{" "}
              from batch{" "}
              <strong className="text-foreground">
                &quot;{batch?.name}&quot;
              </strong>
              ?
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">
                This will only remove their enrollment in this batch. The student&apos;s user account and other batch memberships will remain unaffected.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5 text-sm"
              onClick={() => setStudentToRemove(null)}
              disabled={removeStudentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full px-5 text-sm font-medium"
              onClick={handleConfirmRemove}
              disabled={removeStudentMutation.isPending}
            >
              {removeStudentMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Removing...
                </>
              ) : (
                "Remove from Batch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
