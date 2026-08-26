import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceStudentItem } from "@/types";
import { Check, Clock, Phone, Users, X } from "lucide-react";
import React from "react";

interface AttendanceTableProps {
  students: AttendanceStudentItem[];
  attendanceMap: Record<string, "present" | "absent" | "late">;
  onStatusChange?: (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => void;
  isReadOnly?: boolean;
  highlightStudentId?: string | null;
}

export function AttendanceTable({
  students,
  attendanceMap,
  onStatusChange,
  isReadOnly = false,
  highlightStudentId = null,
}: AttendanceTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Users className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No students in this batch
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          There are no students enrolled in the selected batch cohort. Assign students to this batch to mark attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="pl-4">
              Student Info
            </TableHead>
            <TableHead>
              Contact
            </TableHead>
            <TableHead className="text-right pr-4">
              Attendance Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => {
            const currentStatus = attendanceMap[student.student_id];
            const isMe = highlightStudentId === student.student_id;

            return (
              <TableRow
                key={student.student_id}
                className={`border-border transition-colors ${
                  isMe
                    ? "bg-primary/5 font-semibold text-foreground"
                    : "hover:bg-muted/30"
                }`}
              >
                {/* Student Info */}
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                      {student.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground leading-none">
                          {student.student_name}
                        </span>
                        {isMe && (
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[9px] px-1.5 py-0 h-4 border-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {student.student_email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Contact */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3.5" />
                    <span>{student.phone || "—"}</span>
                  </div>
                </TableCell>

                {/* Attendance Status */}
                <TableCell className="text-right pr-4">
                  {isReadOnly ? (
                    currentStatus === "present" ? (
                      <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-0.5 text-xs font-semibold gap-1 shadow-none">
                        <Check className="size-3" />
                        Present
                      </Badge>
                    ) : currentStatus === "late" ? (
                      <Badge className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-0.5 text-xs font-semibold gap-1 shadow-none">
                        <Clock className="size-3" />
                        Late
                      </Badge>
                    ) : currentStatus === "absent" ? (
                      <Badge
                        variant="destructive"
                        className="rounded-full px-3 py-0.5 text-xs font-semibold gap-1 shadow-none"
                      >
                        <X className="size-3" />
                        Absent
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full text-muted-foreground px-3 py-0.5 text-xs font-medium shadow-none"
                      >
                        Unmarked
                      </Badge>
                    )
                  ) : (
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-muted/50 border border-border/60">
                      {/* Present Button */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          onStatusChange &&
                          onStatusChange(student.student_id, "present")
                        }
                        className={`h-7 px-3 text-xs font-medium rounded-full transition-all gap-1 shadow-none ${
                          currentStatus === "present"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Check className="size-3.5" />
                        <span>Present</span>
                      </Button>

                      {/* Absent Button */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          onStatusChange &&
                          onStatusChange(student.student_id, "absent")
                        }
                        className={`h-7 px-3 text-xs font-medium rounded-full transition-all gap-1 shadow-none ${
                          currentStatus === "absent"
                            ? "bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <X className="size-3.5" />
                        <span>Absent</span>
                      </Button>

                      {/* Late Button */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          onStatusChange &&
                          onStatusChange(student.student_id, "late")
                        }
                        className={`h-7 px-3 text-xs font-medium rounded-full transition-all gap-1 shadow-none ${
                          currentStatus === "late"
                            ? "bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Clock className="size-3.5" />
                        <span>Late</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
