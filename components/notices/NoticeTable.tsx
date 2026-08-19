"use client";

import React from "react";
import { Notice } from "@/types";
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
import { Trash2, Bell, Globe, Layers, Calendar } from "lucide-react";

interface NoticeTableProps {
  notices: Notice[];
  onDelete: (notice: Notice) => void;
}

export function NoticeTable({
  notices,
  onDelete,
}: NoticeTableProps) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Bell className="size-6 stroke-1" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          No notices found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No announcements match your search. Create a new notice to inform students.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="pl-4 w-2/5">
              Notice Details
            </TableHead>
            <TableHead>
              Target Audience
            </TableHead>
            <TableHead>
              Published Date
            </TableHead>
            <TableHead className="text-right pr-4">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {notices.map((notice) => {
            const isGlobal = !notice.batch_id;

            return (
              <TableRow
                key={notice.notice_id}
                className="border-border hover:bg-muted/30 transition-colors"
              >
                {/* Title & Content */}
                <TableCell className="pl-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs mt-0.5">
                      <Bell className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-foreground">
                        {notice.title}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Target Audience Scope */}
                <TableCell>
                  {isGlobal ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-medium rounded-full gap-1 px-2.5 py-0.5"
                    >
                      <Globe className="size-3" />
                      <span>Global (All Students)</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium rounded-full gap-1 px-2.5 py-0.5"
                    >
                      <Layers className="size-3" />
                      <span>{notice.batch_name || "Cohort Specific"}</span>
                    </Badge>
                  )}
                </TableCell>

                {/* Date */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>
                      {notice.created_at
                        ? new Date(notice.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(notice)}
                      title="Delete notice"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete</span>
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
