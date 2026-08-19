"use client";

import React from "react";
import { Users, CheckCircle2, XCircle, Clock, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceSummaryCardsProps {
  total: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
}

export function AttendanceSummaryCards({
  total,
  present,
  absent,
  late,
  unmarked,
}: AttendanceSummaryCardsProps) {
  const attendanceRate =
    total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Total Students */}
      <Card className="rounded-xl border border-border bg-card shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Enrolled
            </span>
            <span className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {total}
            </span>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* Present */}
      <Card className="rounded-xl border border-border bg-card shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold tracking-wider">
              Present
            </span>
            <span className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {present}
            </span>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card className="rounded-xl border border-border bg-card shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-rose-600 dark:text-rose-400 uppercase font-semibold tracking-wider">
              Absent
            </span>
            <span className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {absent}
            </span>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* Late */}
      <Card className="rounded-xl border border-border bg-card shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold tracking-wider">
              Late
            </span>
            <span className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {late}
            </span>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* Rate */}
      <Card className="rounded-xl border border-border bg-card shadow-none col-span-2 sm:col-span-1 lg:col-span-1">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Presence Rate
            </span>
            <span className="font-heading text-2xl font-bold text-foreground mt-0.5">
              {attendanceRate}%
            </span>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Percent className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
