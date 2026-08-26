"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Exam, ExamResultsResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ExamMarksSheetProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isReadOnly?: boolean;
  highlightStudentId?: string | null;
}

export function ExamMarksSheet({
  exam,
  open,
  onOpenChange,
  isReadOnly = false,
  highlightStudentId = null,
}: ExamMarksSheetProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch results for this exam
  const {
    data: resultsData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ExamResultsResponse>({
    queryKey: ["results", exam?.exam_id],
    queryFn: async () => {
      if (!exam) throw new Error("No exam selected");
      const res = await fetch(`${backendUrl}/api/results/${exam.exam_id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch exam results");
      }
      return res.json();
    },
    enabled: open && !!exam?.exam_id,
  });

  // Sync marksMap when results data loads
  useEffect(() => {
    if (resultsData?.students) {
      const initialMap: Record<string, string> = {};
      resultsData.students.forEach((s) => {
        if (s.marks_obtained !== null && s.marks_obtained !== undefined) {
          initialMap[s.student_id] = String(s.marks_obtained);
        }
      });
      setMarksMap(initialMap);
      setIsDirty(false);
    }
  }, [resultsData]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
    setIsDirty(true);
  };

  const students = useMemo(
    () => resultsData?.students || [],
    [resultsData]
  );

  // Filter students by search
  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(query) ||
        s.student_email.toLowerCase().includes(query)
    );
  }, [students, search]);

  // Save all marks mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!exam) return;

      const records = Object.entries(marksMap)
        .filter(([_, val]) => val !== "" && !isNaN(Number(val)))
        .map(([student_id, val]) => ({
          student_id,
          marks_obtained: Number(val),
        }));

      const res = await fetch(`${backendUrl}/api/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save marks.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results", exam?.exam_id] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setIsDirty(false);
      toast.success("Marks Saved & Ranked", {
        description: `Exam marks updated and student rankings recalculated.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Save Failed", {
        description: error.message || "Could not save marks.",
      });
    },
  });

  const getRankBadge = (rank: number | null) => {
    if (!rank) {
      return (
        <span className="text-xs text-muted-foreground font-mono">—</span>
      );
    }

    if (rank === 1) {
      return (
        <Badge className="rounded-full bg-amber-500 text-white dark:text-black font-semibold text-xs px-2.5 py-0.5 gap-1 shadow-none">
          <Trophy className="size-3" />
          <span>#1</span>
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="rounded-full bg-slate-400 text-white dark:text-black font-semibold text-xs px-2.5 py-0.5 gap-1 shadow-none">
          <Award className="size-3" />
          <span>#2</span>
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="rounded-full bg-amber-700 text-white font-semibold text-xs px-2.5 py-0.5 gap-1 shadow-none">
          <Award className="size-3" />
          <span>#3</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="rounded-full font-mono text-xs text-muted-foreground px-2 py-0.5"
      >
        #{rank}
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-2xl md:max-w-4xl overflow-y-auto">
        {/* 1. Sheet Header with Exam Details */}
        <SheetHeader className="border-b border-border p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <SheetTitle className="font-heading text-lg font-bold">
                  {exam?.title || "Exam Results"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Layers className="size-3 text-primary" />
                    <span>{exam?.batch_name || "Batch"}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>
                      {exam?.exam_date
                        ? new Date(exam.exam_date).toLocaleDateString()
                        : "No date"}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Award className="size-3 text-primary" />
                    <span>Max: {exam?.total_marks || 100} pts</span>
                  </span>
                </SheetDescription>
              </div>
            </div>

            {!isReadOnly && (
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!isDirty || saveMutation.isPending || students.length === 0}
                className="h-9 rounded-full px-5 text-xs font-medium shadow-none gap-2 self-start sm:self-auto"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" data-icon="inline-start" />
                    <span>Save Marks</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 p-6">
          {/* 2. Summary Statistics Metric Strip */}
          {resultsData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrolled
                </span>
                <span className="font-heading text-lg font-bold text-foreground">
                  {resultsData.summary.total_students}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Marked
                </span>
                <span className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {resultsData.summary.marked_count}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending
                </span>
                <span className="font-heading text-lg font-bold text-muted-foreground">
                  {resultsData.summary.unmarked_count}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Average
                </span>
                <span className="font-heading text-lg font-bold text-foreground">
                  {resultsData.summary.average_marks !== null
                    ? `${resultsData.summary.average_marks} pts`
                    : "—"}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Top Score
                </span>
                <span className="font-heading text-lg font-bold text-primary">
                  {resultsData.summary.highest_marks !== null
                    ? `${resultsData.summary.highest_marks} pts`
                    : "—"}
                </span>
              </div>
            </div>
          )}

          {/* 3. Search & Filter Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search enrolled students by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
            />
          </div>

          {/* 4. Student Marks Table */}
          {isLoading ? (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-8 w-1/4 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
              <p className="text-sm font-medium text-destructive">
                Failed to load students and marks for this exam.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="rounded-full gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
              <Users className="size-8 text-muted-foreground mb-2 stroke-1" />
              <p className="text-sm font-medium text-foreground">
                No students enrolled in this batch
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Assign students to cohort &quot;{exam?.batch_name}&quot; in Batch Management to record exam marks.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-16 pl-4">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="w-36 text-center">Marks (Max: {exam?.total_marks})</TableHead>
                    <TableHead className="w-24 text-center">Score %</TableHead>
                    <TableHead className="w-24 text-right pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStudents.map((student) => {
                    const currentMarksStr = marksMap[student.student_id] ?? "";
                    const currentMarksNum = Number(currentMarksStr);
                    const isValidMark =
                      currentMarksStr !== "" &&
                      !isNaN(currentMarksNum) &&
                      currentMarksNum >= 0 &&
                      currentMarksNum <= (exam?.total_marks || 100);

                    const percentage =
                      isValidMark && exam?.total_marks
                        ? ((currentMarksNum / exam.total_marks) * 100).toFixed(1)
                        : null;

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
                        {/* Rank */}
                        <TableCell className="pl-4">
                          {getRankBadge(student.rank)}
                        </TableCell>

                        {/* Student Name & Email */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">
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
                        </TableCell>

                        {/* Marks */}
                        <TableCell className="text-center">
                          {isReadOnly ? (
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs px-2.5 py-0.5 bg-muted rounded-full"
                            >
                              {isValidMark
                                ? `${currentMarksNum} / ${exam?.total_marks}`
                                : "— Pending"}
                            </Badge>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              max={exam?.total_marks || 100}
                              step="0.5"
                              placeholder="—"
                              value={currentMarksStr}
                              onChange={(e) =>
                                handleMarkChange(student.student_id, e.target.value)
                              }
                              className={`h-9 w-24 mx-auto text-center font-mono text-sm rounded-full ${
                                currentMarksStr !== "" && !isValidMark
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }`}
                            />
                          )}
                        </TableCell>

                        {/* Percentage */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {percentage !== null ? `${percentage}%` : "—"}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-right pr-4">
                          {isValidMark ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0 text-[10px] font-medium"
                            >
                              <CheckCircle2 className="size-3 mr-1" />
                              Recorded
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-full text-[10px] text-muted-foreground px-2 py-0"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border p-4 sm:p-6 bg-muted/20">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {!isReadOnly && isDirty ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  • Unsaved changes in marks
                </span>
              ) : !isReadOnly ? (
                "All marks are up to date."
              ) : (
                "Performance evaluation report"
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-5 text-sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              {!isReadOnly && (
                <Button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={!isDirty || saveMutation.isPending || students.length === 0}
                  className="rounded-full px-6 text-sm font-medium"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                      Saving...
                    </>
                  ) : (
                    "Save Marks"
                  )}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
