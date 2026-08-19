"use client";

import React from "react";
import { AttendanceStudentItem } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Users, Phone } from "lucide-react";

interface AttendanceTableProps {
  students: AttendanceStudentItem[];
  attendanceMap: Record<string, "present" | "absent" | "late">;
  onStatusChange: (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => void;
}

export function AttendanceTable({
  students,
  attendanceMap,
  onStatusChange,
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
          {students.map((student, idx) => {
            const currentStatus = attendanceMap[student.student_id];

            return (
              <TableRow
                key={student.student_id}
                className="border-border hover:bg-muted/30 transition-colors"
              >
                {/* Student Info */}
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                      {student.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground leading-none">
                        {student.student_name}
                      </span>
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

                {/* Attendance Buttons */}
                <TableCell className="text-right pr-4">
                  <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-muted/50 border border-border/60">
                    {/* Present Button */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onStatusChange(student.student_id, "present")}
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
                      onClick={() => onStatusChange(student.student_id, "absent")}
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
                      onClick={() => onStatusChange(student.student_id, "late")}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
