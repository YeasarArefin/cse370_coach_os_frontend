"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReminderHistoryItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  History,
  Mail,
  RefreshCw,
  Search,
  Send,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

function ReminderStatusBadge({ status }: { status: string }) {
  if (status === "sent") {
    return (
      <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
        <CheckCircle2 className="size-3" />
        Delivered
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge
        variant="destructive"
        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none"
      >
        <AlertCircle className="size-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-full text-muted-foreground px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none"
    >
      <Clock className="size-3" />
      {status}
    </Badge>
  );
}

export default function RemindersPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Fetch reminder history records
  const {
    data: history = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ReminderHistoryItem[]>({
    queryKey: ["reminderHistory"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/fees/reminders/history`);
      if (!res.ok) throw new Error("Failed to load reminder history");
      return res.json();
    },
  });

  // Extract distinct billing months for filter
  const months = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      if (h.month) set.add(h.month);
    });
    return Array.from(set);
  }, [history]);

  // Filter history records by search and month
  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase().trim();
    return history.filter((item) => {
      const matchMonth =
        selectedMonth === "all" || item.month === selectedMonth;
      if (!matchMonth) return false;

      if (!q) return true;
      return (
        item.student_name.toLowerCase().includes(q) ||
        item.student_email.toLowerCase().includes(q) ||
        item.month.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q))
      );
    });
  }, [history, search, selectedMonth]);

  // Summary Metrics
  const totalSent = history.length;
  const successfulSent = history.filter((h) => h.status === "sent").length;
  const totalAmountReminded = history.reduce(
    (acc, h) => acc + Number(h.amount || 0),
    0
  );
  const uniqueStudents = new Set(history.map((h) => h.student_id)).size;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BellRing className="size-6 text-primary" />
            <span>Fee Reminder History</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete audit trail of all automated and manual tuition fee reminder notifications dispatched to students.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-full gap-1.5 self-start sm:self-auto h-9 text-xs"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* 2. Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Reminders Sent
            </span>
            <Mail className="size-4" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground">
            {totalSent}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Students Reminded
            </span>
            <Users className="size-4" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground">
            {uniqueStudents}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Fee Amount
            </span>
            <Coins className="size-4 text-primary" />
          </div>
          <span className="font-mono text-2xl font-bold text-primary">
            ৳{totalAmountReminded.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Delivery Success
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalSent > 0
              ? `${Math.round((successfulSent / totalSent) * 100)}%`
              : "100%"}
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Month Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedMonth("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              selectedMonth === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All Months ({history.length})
          </button>
          {months.map((m) => {
            const count = history.filter((h) => h.month === m).length;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                  selectedMonth === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search student or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>
      </div>

      {/* 4. Main History Table */}
      {isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load reminder history logs.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <History className="size-10 text-muted-foreground stroke-1 mb-2" />
          <p className="text-sm font-medium text-foreground">
            No fee reminder history found
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            When automated periodic reminders or manual fee reminder emails are dispatched, records will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Billing Month</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Payment Due Date</TableHead>
                <TableHead>Reminded Amount</TableHead>
                <TableHead>Dispatched At</TableHead>
                <TableHead className="text-right pr-4">Delivery Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow
                  key={item.reminder_id}
                  className="border-border hover:bg-muted/30 transition-colors"
                >
                  {/* Student Info */}
                  <TableCell className="pl-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground">
                        {item.student_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.student_email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Billing Month */}
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span>{item.month}</span>
                    </div>
                  </TableCell>

                  {/* Admission Date */}
                  <TableCell className="text-xs text-muted-foreground">
                    {item.admission_date
                      ? new Date(item.admission_date).toLocaleDateString()
                      : "—"}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.due_date || "—"}
                    </span>
                  </TableCell>

                  {/* Reminded Amount */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-muted font-mono font-medium text-xs rounded-full px-2.5 py-0.5"
                    >
                      ৳{Number(item.amount).toLocaleString()}
                    </Badge>
                  </TableCell>

                  {/* Dispatched At */}
                  <TableCell className="text-xs text-muted-foreground">
                    {item.sent_at
                      ? new Date(item.sent_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </TableCell>

                  {/* Delivery Status */}
                  <TableCell className="text-right pr-4">
                    <ReminderStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
