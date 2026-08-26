"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Batch, LeaderboardResponse, LeaderboardStudentItem, Student } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Crown,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";

// Rank Badge helper
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1.5 font-bold font-mono text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
        <Crown className="size-3.5 fill-amber-500 text-amber-500" />
        <span>#1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1.5 font-bold font-mono text-xs px-2.5 py-1 rounded-full bg-slate-400/15 text-slate-600 dark:text-slate-300 border border-slate-400/30">
        <Medal className="size-3.5 text-slate-500" />
        <span>#2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-1.5 font-bold font-mono text-xs px-2.5 py-1 rounded-full bg-amber-700/15 text-amber-800 dark:text-amber-600 border border-amber-700/30">
        <Award className="size-3.5 text-amber-700" />
        <span>#3</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center font-mono font-medium text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
      <span>#{rank}</span>
    </div>
  );
}

// Performance Score Badge
function PerformanceBadge({ percentage }: { percentage: number }) {
  if (percentage >= 80) {
    return (
      <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-semibold">
        {percentage}%
      </Badge>
    );
  }
  if (percentage >= 60) {
    return (
      <Badge className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-2.5 py-0.5 text-xs font-mono font-semibold">
        {percentage}%
      </Badge>
    );
  }
  if (percentage >= 40) {
    return (
      <Badge className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2.5 py-0.5 text-xs font-mono font-semibold">
        {percentage}%
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-full text-muted-foreground px-2.5 py-0.5 text-xs font-mono font-semibold"
    >
      {percentage}%
    </Badge>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const isStudent = (session?.user as { role?: string })?.role === "student";

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Selected batch: "all" or a specific batch_id
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [search, setSearch] = useState("");

  // 1. Fetch Students (to identify logged in student for row highlight)
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/students`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isStudent,
  });

  const loggedInStudent = useMemo(() => {
    if (!isStudent || !session?.user) return null;
    const userId = (session.user as { id?: string }).id;
    const email = session.user.email?.toLowerCase();
    return (
      students.find(
        (s) =>
          (userId && s.user_id === userId) ||
          (email && s.email.toLowerCase() === email)
      ) || null
    );
  }, [isStudent, session, students]);

  // 2. Fetch Batches list for selector
  const { data: allBatches = [] } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) throw new Error("Failed to load batches");
      return res.json();
    },
  });

  // Filter batches for students (their enrolled cohorts)
  const batches = useMemo(() => {
    if (!isStudent || !loggedInStudent) return allBatches;
    const studentBatchIds = new Set(
      (loggedInStudent.batches || []).map((b) => b.batch_id).filter(Boolean)
    );
    if (loggedInStudent.batch_id) studentBatchIds.add(loggedInStudent.batch_id);

    return allBatches.filter((b) => studentBatchIds.has(b.batch_id));
  }, [allBatches, isStudent, loggedInStudent]);

  // 3. Fetch Leaderboard Data
  const {
    data: leaderboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", selectedBatchId],
    queryFn: async () => {
      const endpoint =
        selectedBatchId === "all"
          ? `${backendUrl}/api/leaderboard`
          : `${backendUrl}/api/leaderboard/${selectedBatchId}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to load leaderboard data");
      return res.json();
    },
  });

  // Selected batch display label
  const selectedBatchName = useMemo(() => {
    if (selectedBatchId === "all") return "All Batches (Global)";
    const b = batches.find((b) => b.batch_id === selectedBatchId);
    return b ? b.name : "Select Batch";
  }, [batches, selectedBatchId]);

  const leaderboardList = useMemo(
    () => leaderboardData?.leaderboard ?? [],
    [leaderboardData]
  );

  // Filtered leaderboard by search term
  const filteredLeaderboard = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leaderboardList;
    return leaderboardList.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        (s.batch_name && s.batch_name.toLowerCase().includes(q))
    );
  }, [leaderboardList, search]);

  // Top 3 Podium Students
  const top1 = leaderboardList.find((s) => s.rank === 1 && s.exams_attended > 0);
  const top2 = leaderboardList.find((s) => s.rank === 2 && s.exams_attended > 0);
  const top3 = leaderboardList.find((s) => s.rank === 3 && s.exams_attended > 0);

  // Summary Metrics
  const totalStudents = leaderboardData?.total_students ?? 0;
  const totalExams = leaderboardData?.total_exams ?? 0;
  const topScore = top1 ? `${top1.percentage}%` : "—";
  const averagePercentage = useMemo(() => {
    const attended = leaderboardList.filter((s) => s.exams_attended > 0);
    if (attended.length === 0) return 0;
    const sum = attended.reduce((acc, s) => acc + s.percentage, 0);
    return Number((sum / attended.length).toFixed(1));
  }, [leaderboardList]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header & Batch Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Trophy className="size-6 text-primary" />
            <span>Academic Leaderboard</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Rank students across examination performance, average marks, and overall percentage.
          </p>
        </div>

        {/* Batch Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground shrink-0" />
          <Select
            value={selectedBatchId}
            onValueChange={(val) => setSelectedBatchId(val || "all")}
          >
            <SelectTrigger className="h-9 w-56 rounded-full px-4 text-xs font-medium border-border bg-card shadow-xs">
              <SelectValue placeholder="Select Batch">
                {selectedBatchName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                🌐 All Batches (Global)
              </SelectItem>
              {batches.map((b) => (
                <SelectItem key={b.batch_id} value={b.batch_id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="size-4" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground">
            {totalStudents}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Exams Held
            </span>
            <FileSpreadsheet className="size-4" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground">
            {totalExams}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Top Score
            </span>
            <Sparkles className="size-4 text-amber-500" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground text-amber-600 dark:text-amber-400">
            {topScore}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Batch Average
            </span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <span className="font-mono text-2xl font-bold text-foreground">
            {averagePercentage}%
          </span>
        </div>
      </div>

      {/* 3. Top 3 Podium Highlights */}
      {!isLoading && !isError && (top1 || top2 || top3) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1st Place — Center or Gold */}
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5 flex flex-col justify-between gap-4 shadow-xs relative overflow-hidden">
            <div className="absolute -right-3 -top-3 opacity-10">
              <Crown className="size-28 text-amber-500" />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold font-mono text-sm shadow-xs">
                #1
              </div>
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 rounded-full text-xs font-semibold gap-1">
                <Crown className="size-3 fill-amber-500" />
                Champion
              </Badge>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground truncate">
                {top1?.student_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {top1?.student_email}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-amber-500/20 pt-3 text-xs">
              <span className="text-muted-foreground">Average Marks:</span>
              <span className="font-mono font-bold text-sm text-foreground">
                {top1?.average_marks} / {top1?.percentage}%
              </span>
            </div>
          </div>

          {/* 2nd Place — Silver */}
          {top2 ? (
            <div className="rounded-xl border border-slate-400/40 bg-muted/30 p-5 flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-400 text-white font-bold font-mono text-sm shadow-xs">
                  #2
                </div>
                <Badge className="bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/30 rounded-full text-xs font-semibold gap-1">
                  <Medal className="size-3 text-slate-500" />
                  Runner Up
                </Badge>
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground truncate">
                  {top2.student_name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {top2.student_email}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Average Marks:</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {top2.average_marks} / {top2.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 flex items-center justify-center text-xs text-muted-foreground">
              2nd place awaiting examination records
            </div>
          )}

          {/* 3rd Place — Bronze */}
          {top3 ? (
            <div className="rounded-xl border border-amber-700/30 bg-muted/20 p-5 flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-700 text-white font-bold font-mono text-sm shadow-xs">
                  #3
                </div>
                <Badge className="bg-amber-700/15 text-amber-800 dark:text-amber-600 border-amber-700/30 rounded-full text-xs font-semibold gap-1">
                  <Award className="size-3 text-amber-700" />
                  3rd Position
                </Badge>
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground truncate">
                  {top3.student_name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {top3.student_email}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Average Marks:</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {top3.average_marks} / {top3.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 flex items-center justify-center text-xs text-muted-foreground">
              3rd place awaiting examination records
            </div>
          )}
        </div>
      )}

      {/* 4. Search Filter Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <span>Full Rankings — {selectedBatchName}</span>
        </span>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search student by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>
      </div>

      {/* 5. Main Rankings Table */}
      {isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load leaderboard data.
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
      ) : filteredLeaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Trophy className="size-10 text-muted-foreground stroke-1 mb-2" />
          <p className="text-sm font-medium text-foreground">
            No students or exam records found
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Create exams and record student marks in the Exams & Results module to generate leaderboard rankings.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-16 pl-4">Rank</TableHead>
                <TableHead>Student</TableHead>
                {selectedBatchId === "all" && <TableHead>Batch</TableHead>}
                <TableHead className="text-center">Exams Attended</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
                <TableHead className="text-right">Average Marks</TableHead>
                <TableHead className="text-right pr-4">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaderboard.map((item) => {
                const isMe = loggedInStudent?.student_id === item.student_id;

                return (
                  <TableRow
                    key={item.student_id}
                    className={`border-border transition-colors ${
                      isMe
                        ? "bg-primary/10 hover:bg-primary/15 font-semibold"
                        : item.rank === 1 && item.exams_attended > 0
                        ? "bg-amber-500/5 dark:bg-amber-500/10 font-medium hover:bg-muted/30"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Rank Column */}
                    <TableCell className="pl-4">
                      <RankBadge rank={item.rank} />
                    </TableCell>

                    {/* Student Column */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {item.student_name}
                          </span>
                          {isMe && (
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[9px] px-1.5 py-0 h-4 border-0">
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.student_email}
                        </span>
                      </div>
                    </TableCell>

                  {/* Batch Column (Global View) */}
                  {selectedBatchId === "all" && (
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Layers className="size-3 text-primary shrink-0" />
                        <span>{item.batch_name || "Unassigned"}</span>
                      </div>
                    </TableCell>
                  )}

                  {/* Exams Attended */}
                  <TableCell className="text-center">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
                      {item.exams_attended}
                      {item.total_exams_in_batch !== undefined && (
                        <span className="text-muted-foreground">
                          /{item.total_exams_in_batch}
                        </span>
                      )}
                    </span>
                  </TableCell>

                  {/* Total Score */}
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    <span className="text-sm font-semibold text-foreground">
                      {item.total_marks}
                    </span>
                    <span>/{item.total_possible_marks}</span>
                  </TableCell>

                  {/* Average Marks */}
                  <TableCell className="text-right font-mono text-sm font-bold text-foreground">
                    {item.average_marks}
                  </TableCell>

                  {/* Performance Percentage */}
                  <TableCell className="text-right pr-4">
                    <PerformanceBadge percentage={item.percentage} />
                  </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
