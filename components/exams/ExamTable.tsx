"use client";

import React from "react";
import { Exam } from "@/types";
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
import {
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  ClipboardList,
} from "lucide-react";

interface ExamTableProps {
  exams: Exam[];
  onViewMarks: (exam: Exam) => void;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  isReadOnly?: boolean;
}

export function ExamTable({
  exams,
  onViewMarks,
  onEdit,
  onDelete,
  isReadOnly = false,
}: ExamTableProps) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <GraduationCap className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No exams found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No examinations scheduled for this batch. Create an exam to evaluate student performance and record marks.
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
              Exam Title
            </TableHead>
            <TableHead>
              Batch Cohort
            </TableHead>
            <TableHead>
              Exam Date
            </TableHead>
            <TableHead>
              Total Marks
            </TableHead>
            <TableHead>
              Marks & Results
            </TableHead>
            {!isReadOnly && (
              <TableHead className="text-right pr-4">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {exams.map((exam) => (
            <TableRow
              key={exam.exam_id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              {/* Exam Title */}
              <TableCell className="pl-4">
                <button
                  type="button"
                  onClick={() => onViewMarks(exam)}
                  className="flex items-center gap-3 text-left group focus:outline-none"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground leading-none group-hover:underline">
                      {exam.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Created: {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </button>
              </TableCell>

              {/* Batch */}
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="size-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {exam.batch_name || "Assigned Batch"}
                  </span>
                </div>
              </TableCell>

              {/* Exam Date */}
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>
                    {exam.exam_date
                      ? new Date(exam.exam_date).toLocaleDateString()
                      : "Not Scheduled"}
                  </span>
                </div>
              </TableCell>

              {/* Total Marks */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-muted font-mono font-medium px-2.5 py-0.5 text-xs gap-1"
                >
                  <Award className="size-3 text-primary" />
                  <span>{exam.total_marks} pts</span>
                </Badge>
              </TableCell>

              {/* Marks & Results CTA */}
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewMarks(exam)}
                  className="h-8 rounded-full px-3 text-xs font-medium gap-1.5 border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ClipboardList className="size-3.5" />
                  <span>{isReadOnly ? "View Results" : "Enter / View Marks"}</span>
                </Button>
              </TableCell>

              {/* Actions */}
              {!isReadOnly && (
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onEdit(exam)}
                        title="Edit exam details"
                      >
                        <Edit2 className="size-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(exam)}
                        title="Delete exam"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
