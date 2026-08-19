"use client";

import React from "react";
import { Student } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, User, Phone, Calendar } from "lucide-react";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <User className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No students found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No student records match your query. Add a new student to populate the roster.
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
              Student
            </TableHead>
            <TableHead>
              Batch
            </TableHead>
            <TableHead>
              Contact
            </TableHead>
            <TableHead>
              Admission Date
            </TableHead>
            <TableHead>
              Status
            </TableHead>
            <TableHead className="text-right pr-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => (
            <TableRow
              key={student.student_id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground leading-none">
                      {student.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.email}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-border/60">
                  {student.batch_name || "Unassigned"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3.5" />
                  <span>{student.phone || "—"}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>
                    {student.admission_date
                      ? new Date(student.admission_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={student.status === "active" ? "secondary" : "outline"}
                  className={`capitalize text-xs font-medium rounded-full px-2.5 py-0.5 ${
                    student.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {student.status}
                </Badge>
              </TableCell>

              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(student)}
                    title="Edit student"
                  >
                    <Edit2 className="size-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(student)}
                    title="Delete student"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
