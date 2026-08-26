"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AssignmentItem,
  BatchItem,
  ExamItem,
  FeeStatusStudent,
  LeaderboardResponse,
  NoticeItem,
  StudentItem,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Medal,
  Trophy,
  WalletMinimal
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface StudentDashboardViewProps {
  currentStudent: StudentItem;
}

export function StudentDashboardView({
  currentStudent,
}: StudentDashboardViewProps) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Selected batch tab (defaults to student's first batch or 'all')
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    currentStudent.batches?.[0]?.batch_id ||
    currentStudent.batch_id ||
    "all"
  );

  // 1. Fetch Student's Fee Status & Payments
  const {
    data: feeData,
    isLoading: isFeeLoading,
    refetch: refetchFees,
  } = useQuery<FeeStatusStudent>({
    queryKey: ["studentFeeStatus", currentStudent.student_id],
    queryFn: async () => {
      const res = await fetch(
        `${backendUrl}/api/fees/students/${currentStudent.student_id}`
      );
      if (!res.ok) throw new Error("Failed to load fee status");
      return res.json();
    },
  });

  // 2. Fetch All Batches (to get full descriptions, teacher info)
  const { data: allBatches = [] } = useQuery<BatchItem[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Filter enrolled batches
  const enrolledBatches = useMemo(() => {
    const enrolledIds = new Set(
      (currentStudent.batches || [])
        .map((b: { batch_id: string; name?: string; }) => b.batch_id)
        .filter(Boolean)
    );
    if (currentStudent.batch_id) enrolledIds.add(currentStudent.batch_id);

    return allBatches.filter((b) => enrolledIds.has(b.batch_id));
  }, [allBatches, currentStudent]);

  // Determine active batch ID for queries
  const activeBatchId =
    selectedBatchId !== "all"
      ? selectedBatchId
      : enrolledBatches[0]?.batch_id || currentStudent.batch_id;

  // 3. Fetch Assignments for Active Batch
  const { data: assignments = [], isLoading: isAssignmentsLoading } = useQuery<
    AssignmentItem[]
  >({
    queryKey: ["assignments", activeBatchId],
    queryFn: async () => {
      if (!activeBatchId) return [];
      const res = await fetch(
        `${backendUrl}/api/assignments/batch/${activeBatchId}`
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeBatchId,
  });

  // 4. Fetch Exams for Active Batch
  const { data: exams = [], isLoading: isExamsLoading } = useQuery<ExamItem[]>({
    queryKey: ["exams", activeBatchId],
    queryFn: async () => {
      if (!activeBatchId) return [];
      const res = await fetch(`${backendUrl}/api/exams/batch/${activeBatchId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeBatchId,
  });

  // 5. Fetch Notices
  const { data: notices = [] } = useQuery<NoticeItem[]>({
    queryKey: ["notices", activeBatchId],
    queryFn: async () => {
      const url = activeBatchId
        ? `${backendUrl}/api/notices?batch_id=${activeBatchId}`
        : `${backendUrl}/api/notices`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // 6. Fetch Leaderboard for Active Batch
  const { data: leaderboardData } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", activeBatchId],
    queryFn: async () => {
      if (!activeBatchId) return null;
      const res = await fetch(
        `${backendUrl}/api/leaderboard/${activeBatchId}`
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!activeBatchId,
  });

  // Find current student's position in leaderboard
  const studentLeaderboardRank = useMemo(() => {
    if (!leaderboardData?.leaderboard) return null;
    return (
      leaderboardData.leaderboard.find(
        (s) => s.student_id === currentStudent.student_id
      ) || null
    );
  }, [leaderboardData, currentStudent.student_id]);

  // 7. Fetch Attendance for Active Batch
  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", activeBatchId],
    queryFn: async () => {
      if (!activeBatchId) return null;
      const res = await fetch(
        `${backendUrl}/api/attendance/batch/${activeBatchId}`
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!activeBatchId,
  });

  // Calculate student attendance status
  const currentAttendance = useMemo(() => {
    if (!attendanceData?.students) return null;
    const record = attendanceData.students.find(
      (s: { student_id: string; }) => s.student_id === currentStudent.student_id
    );
    return record?.status || "Unmarked";
  }, [attendanceData, currentStudent.student_id]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Greeting & Student Info Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Hello, {currentStudent.name} 👋
            </h1>
            <Badge
              variant="outline"
              className="rounded-full bg-primary/10 text-primary border-primary/20 text-xs px-2.5"
            >
              Student Portal
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentStudent.email} • Enrolled in{" "}
            {enrolledBatches.length > 0
              ? enrolledBatches.map((b) => b.name).join(", ")
              : currentStudent.batch_name || "Coaching Course"}
          </p>
        </div>

        {/* Batch Selection Tabs */}
        {enrolledBatches.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {enrolledBatches.map((b) => (
              <button
                key={b.batch_id}
                type="button"
                onClick={() => setSelectedBatchId(b.batch_id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${activeBatchId === b.batch_id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Key Metrics for Student */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Enrolled Batches */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Batches
            </CardTitle>
            <Layers className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-foreground">
              {enrolledBatches.length || (currentStudent.batch_name ? 1 : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {enrolledBatches.map((b) => b.name).join(", ") ||
                currentStudent.batch_name ||
                "General"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Academic Leaderboard Rank */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Batch Rank
            </CardTitle>
            <Trophy className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-foreground flex items-center gap-2">
              <span>
                {studentLeaderboardRank?.rank
                  ? `#${studentLeaderboardRank.rank}`
                  : "—"}
              </span>
              {studentLeaderboardRank?.rank === 1 && (
                <Medal className="size-5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {studentLeaderboardRank?.percentage !== undefined
                ? `${studentLeaderboardRank.percentage}% Avg (${studentLeaderboardRank.exams_attended} exams)`
                : "No exam records yet"}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Today's Attendance */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Attendance
            </CardTitle>
            <CalendarCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold capitalize text-foreground flex items-center gap-2">
              <span>{currentAttendance || "Marked"}</span>
              {currentAttendance === "present" && (
                <CheckCircle2 className="size-5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {attendanceData?.date
                ? new Date(attendanceData.date).toLocaleDateString()
                : "Current session"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Fee Status */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fee Status
            </CardTitle>
            <CreditCard className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-foreground">
              ৳{(feeData?.summary?.pending_amount ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {feeData?.summary?.pending_amount &&
                feeData.summary.pending_amount > 0
                ? "Pending monthly balance"
                : "All dues cleared ✅"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Operational Grid: Batch Information & Fee Status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enrolled Batches Details Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <span>My Enrolled Batches</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Course details, instructors, and tuition fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <Layers className="size-7 stroke-1" />
                <p className="text-xs font-medium">No batch assigned yet</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {enrolledBatches.map((batch) => (
                  <div
                    key={batch.batch_id}
                    className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">
                        {batch.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-muted font-mono text-[10px] rounded-full px-2"
                      >
                        ৳{Number(batch.fee).toLocaleString()}/mo
                      </Badge>
                    </div>
                    {batch.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {batch.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Teacher: {batch.teacher_name || "Instructor"}</span>
                      <span>
                        {batch.start_date
                          ? `Started ${new Date(
                            batch.start_date
                          ).toLocaleDateString()}`
                          : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Payment Breakdown & History Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <WalletMinimal className="size-4 text-primary" />
                <span>Tuition Fee Summary</span>
              </CardTitle>
              <Badge
                variant={
                  feeData?.summary?.pending_amount &&
                    feeData.summary.pending_amount > 0
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] px-2"
              >
                {feeData?.summary?.pending_amount &&
                  feeData.summary.pending_amount > 0
                  ? "Due Pending"
                  : "Paid"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Tuition payments and billing audit
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Expected Tuition</span>
              <span className="font-mono font-semibold text-foreground">
                ৳{(feeData?.summary?.total_expected ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ৳{(feeData?.summary?.total_paid ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Pending Due</span>
              <span className="font-mono font-bold text-destructive">
                ৳{(feeData?.summary?.pending_amount ?? 0).toLocaleString()}
              </span>
            </div>

            {/* Recent Payment Receipts */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Payment History
              </span>
              {feeData?.payments && feeData.payments.length > 0 ? (
                <div className="flex flex-col divide-y divide-border text-xs">
                  {feeData.payments.slice(0, 3).map((p: any) => (
                    <div
                      key={p.payment_id}
                      className="flex items-center justify-between py-1.5 first:pt-0"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {p.month}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      >
                        ৳{Number(p.amount).toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No payment records found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notices & Announcements Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <span>Notices & Announcements</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Latest notices from CoachOS & instructors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <Bell className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No announcements at this time
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {notices.slice(0, 4).map((n) => (
                  <div
                    key={n.notice_id}
                    className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                        {n.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-2 py-0 rounded-full text-muted-foreground"
                      >
                        {n.batch_name || "Announcement"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Upcoming Activities Grid: Exams & Assignments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Exams Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span>Upcoming Exams</span>
              </CardTitle>
              <Link
                href="/exams"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Tests and assessments for your batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <FileSpreadsheet className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No upcoming exams scheduled
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {exams.map((exam) => (
                  <div
                    key={exam.exam_id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-medium text-xs text-foreground truncate">
                        {exam.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-primary shrink-0" />
                        {exam.exam_date
                          ? new Date(exam.exam_date).toLocaleDateString()
                          : "TBA"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-muted font-mono font-medium text-[10px] rounded-full px-2.5 py-0.5"
                    >
                      {exam.total_marks} Marks
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coursework & Assignments Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Coursework Assignments</span>
              </CardTitle>
              <Link
                href="/assignments"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Assignments and submission deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <FileText className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No active assignments
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {assignments.map((a) => (
                  <div
                    key={a.assignment_id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-medium text-xs text-foreground truncate">
                        {a.title}
                      </span>
                      {a.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {a.description}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {a.deadline
                          ? `Due ${new Date(a.deadline).toLocaleDateString()}`
                          : "No deadline"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Batch Leaderboard Summary Table */}
      {leaderboardData && leaderboardData.leaderboard.length > 0 && (
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="size-4 text-amber-500" />
                  <span>Batch Academic Leaderboard</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Performance ranking in {leaderboardData.batch_name}
                </CardDescription>
              </div>
              <Link
                href="/leaderboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>Full Leaderboard</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-16 pl-4">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Exams</TableHead>
                    <TableHead className="text-right">Total Marks</TableHead>
                    <TableHead className="text-right pr-4">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.leaderboard.slice(0, 5).map((student) => {
                    const isMe =
                      student.student_id === currentStudent.student_id;
                    return (
                      <TableRow
                        key={student.student_id}
                        className={`border-border transition-colors ${isMe
                            ? "bg-primary/5 font-semibold text-foreground"
                            : "hover:bg-muted/30"
                          }`}
                      >
                        <TableCell className="pl-4">
                          <span
                            className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-mono font-bold ${student.rank === 1
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : student.rank === 2
                                  ? "bg-slate-400/20 text-slate-600 dark:text-slate-300"
                                  : student.rank === 3
                                    ? "bg-amber-700/20 text-amber-800 dark:text-amber-600"
                                    : "bg-muted text-muted-foreground"
                              }`}
                          >
                            #{student.rank}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {student.student_name}
                            </span>
                            {isMe && (
                              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[9px] px-1.5 py-0 h-4 border-0">
                                You
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">
                          {student.exams_attended}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-muted-foreground">
                          {student.total_marks} / {student.total_possible_marks}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[10px] px-2 ${student.percentage >= 80
                                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "border-border text-foreground"
                              }`}
                          >
                            {student.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
