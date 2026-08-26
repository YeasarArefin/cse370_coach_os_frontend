"use client";

import React from "react";
import { Batch } from "@/types";
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
import { Edit2, Trash2, Layers, Users, Calendar, UserCheck, Eye } from "lucide-react";

interface BatchTableProps {
  batches: Batch[];
  onView: (batch: Batch) => void;
  onEdit: (batch: Batch) => void;
  onDelete: (batch: Batch) => void;
}

export function BatchTable({
  batches,
  onView,
  onEdit,
  onDelete,
}: BatchTableProps) {
  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Layers className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No batches found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No batch cohorts match your query. Create a new batch to organize students.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 capitalize text-xs font-medium rounded-full px-2.5 py-0.5"
          >
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 capitalize text-xs font-medium rounded-full px-2.5 py-0.5"
          >
            Completed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground capitalize text-xs font-medium rounded-full px-2.5 py-0.5"
          >
            Inactive
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="pl-4">
              Batch Name
            </TableHead>
            <TableHead>
              Assigned Teacher
            </TableHead>
            <TableHead>
              Start Date
            </TableHead>
            <TableHead>
              Monthly Fee
            </TableHead>
            <TableHead>
              Enrolled Students
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
          {batches.map((batch) => (
            <TableRow
              key={batch.batch_id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              <TableCell className="pl-4">
                <button
                  type="button"
                  onClick={() => onView(batch)}
                  className="flex items-center gap-3 text-left group focus:outline-none"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Layers className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground leading-none group-hover:underline">
                      {batch.name}
                    </span>
                    {batch.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {batch.description}
                      </span>
                    )}
                  </div>
                </button>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserCheck className="size-3.5" />
                  <span className="font-medium text-foreground">
                    {batch.teacher_name || "Assigned Teacher"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>
                    {batch.start_date
                      ? new Date(batch.start_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground font-mono font-medium rounded-full px-2.5 py-0.5 text-xs"
                >
                  ৳{Number(batch.fee ?? 0).toLocaleString()}
                  <span className="text-[10px] text-muted-foreground font-sans ml-0.5">/mo</span>
                </Badge>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(batch)}
                  className="h-7 px-2.5 rounded-full text-xs font-normal hover:bg-primary/10 hover:text-primary gap-1.5"
                  title="View students in batch"
                >
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {batch.student_count ?? 0}
                  </span>
                  <span className="text-muted-foreground text-[11px]">students</span>
                </Button>
              </TableCell>

              <TableCell>
                {getStatusBadge(batch.status)}
              </TableCell>

              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => onView(batch)}
                    title="Open batch & view students"
                  >
                    <Eye className="size-3.5" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(batch)}
                    title="Edit batch"
                  >
                    <Edit2 className="size-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(batch)}
                    title="Delete batch"
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
