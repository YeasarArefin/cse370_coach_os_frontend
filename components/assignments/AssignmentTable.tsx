"use client";

import React from "react";
import { Assignment } from "@/types";
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
import { Edit2, Trash2, FileText, Calendar, Clock, Layers } from "lucide-react";

interface AssignmentTableProps {
  assignments: Assignment[];
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
  isReadOnly?: boolean;
}

export function AssignmentTable({
  assignments,
  onEdit,
  onDelete,
  isReadOnly = false,
}: AssignmentTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <FileText className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No assignments found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No assignments have been published for this batch. Create an assignment to assign homework, projects, or tasks.
        </p>
      </div>
    );
  }

  // Calculate deadline status
  const getDeadlineBadge = (deadlineStr: string | null) => {
    if (!deadlineStr) {
      return (
        <span className="text-xs text-muted-foreground">No deadline</span>
      );
    }

    const deadline = new Date(deadlineStr);
    const today = new Date();
    // Normalize to date only comparison
    deadline.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{new Date(deadlineStr).toLocaleDateString()}</span>
          </div>
          <Badge
            variant="destructive"
            className="rounded-full px-2 py-0 text-[10px] font-medium"
          >
            Overdue
          </Badge>
        </div>
      );
    }

    if (diffDays === 0 || diffDays === 1) {
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5" />
            <span>{new Date(deadlineStr).toLocaleDateString()}</span>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2 py-0 text-[10px] font-medium"
          >
            Due Soon
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>{new Date(deadlineStr).toLocaleDateString()}</span>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0 text-[10px] font-medium"
        >
          {diffDays} days left
        </Badge>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="pl-4">
              Assignment
            </TableHead>
            <TableHead>
              Batch
            </TableHead>
            <TableHead>
              Deadline
            </TableHead>
            <TableHead>
              Published Date
            </TableHead>
            {!isReadOnly && (
              <TableHead className="text-right pr-4">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {assignments.map((assignment) => (
            <TableRow
              key={assignment.assignment_id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              {/* Title & Description */}
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground leading-none">
                      {assignment.title}
                    </span>
                    {assignment.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-md mt-0.5">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Batch */}
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="size-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {assignment.batch_name || "Assigned Batch"}
                  </span>
                </div>
              </TableCell>

              {/* Deadline */}
              <TableCell>
                {getDeadlineBadge(assignment.deadline)}
              </TableCell>

              {/* Created At */}
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {assignment.created_at
                    ? new Date(assignment.created_at).toLocaleDateString()
                    : "—"}
                </span>
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
                        onClick={() => onEdit(assignment)}
                        title="Edit assignment"
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
                        onClick={() => onDelete(assignment)}
                        title="Delete assignment"
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
