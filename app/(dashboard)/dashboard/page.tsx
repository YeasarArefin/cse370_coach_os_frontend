"use client";

import { StudentDashboardView } from "@/components/dashboard/StudentDashboardView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardResponse, StudentItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Trophy,
  User,
  Users,
  WalletMinimal
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Teacher preview mode state
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);

  // 1. Fetch Students Roster (used for student matching & teacher student view preview)
  const { data: students = [], isLoading: isStudentsLoading } = useQuery<
    StudentItem[]
  >({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/students`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Identify logged in student profile
  const loggedInStudent = useMemo(() => {
    if (!session?.user) return null;
    const userId = (session.user as { id?: string; }).id;
    const email = session.user.email?.toLowerCase();

    return (
      students.find(
        (s) =>
          (userId && s.user_id === userId) ||
          (email && s.email.toLowerCase() === email)
      ) || null
    );
  }, [students, session]);

  // Selected student for student dashboard view (logged-in student OR teacher preview)
  const activeStudentForView = useMemo(() => {
    if (previewStudentId) {
      return students.find((s) => s.student_id === previewStudentId) || null;
    }
    return loggedInStudent;
  }, [previewStudentId, loggedInStudent, students]);

  const isStudentRole =
    (session?.user as { role?: string; })?.role === "student" ||
    (loggedInStudent && !previewStudentId && (session?.user as { role?: string; })?.role !== "teacher");

  // 2. Fetch live Management Dashboard Summary Data (for Teacher/Owner)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError,
    refetch,
  } = useQuery<DashboardResponse>({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
    enabled: !isStudentRole,
  });

  // If user is a logged-in student, render the dedicated Student Dashboard
  if (isStudentRole && activeStudentForView) {
    return <StudentDashboardView currentStudent={activeStudentForView} />;
  }

  // If teacher is previewing a student's dashboard
  if (previewStudentId && activeStudentForView) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <User className="size-4" />
            <span>
              Previewing Student Dashboard for:{" "}
              <strong>{activeStudentForView.name}</strong> ({activeStudentForView.email})
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewStudentId(null)}
            className="rounded-full text-xs h-7 px-3 bg-background border-primary/30"
          >
            Exit Student Preview
          </Button>
        </div>
        <StudentDashboardView currentStudent={activeStudentForView} />
      </div>
    );
  }

  const summary = dashboardData?.summary;
  const attendance = summary?.today_attendance;
  const fees = summary?.fee_status;
  const upcomingAssignments = dashboardData?.upcoming_assignments ?? [];
  const upcomingExams = dashboardData?.upcoming_exams ?? [];
  const recentNotices = dashboardData?.recent_notices ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Greeting & Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Welcome back, {session?.user?.name || "Teacher"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {session?.user?.email} • CoachOS Management Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Student View Preview dropdown for Teachers */}
          {students.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden md:inline">
                Preview Student:
              </span>
              <select
                aria-label="Preview student dashboard"
                className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                value={previewStudentId || ""}
                onChange={(e) => setPreviewStudentId(e.target.value || null)}
              >
                <option value="">Switch to Student View...</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} ({s.batch_name || "Enrolled"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-full gap-1.5 h-9 text-xs border-border shadow-xs"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      {isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-10 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load dashboard summary metrics.
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
      ) : isDashboardLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
            >
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Students */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold text-foreground">
                {summary?.total_students ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active enrolled learners
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Active Batches */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Batches
              </CardTitle>
              <Layers className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold text-foreground">
                {summary?.total_batches ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active course cohorts
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
              <div className="font-mono text-2xl font-bold text-foreground">
                {attendance?.total_marked && attendance.total_marked > 0
                  ? `${attendance.attendance_percentage}%`
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {attendance?.total_marked && attendance.total_marked > 0
                  ? `${attendance.present_count} present, ${attendance.absent_count} absent`
                  : "No attendance taken today"}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Pending Fees */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Fees
              </CardTitle>
              <CreditCard className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold text-foreground">
                ৳{(fees?.total_pending ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fees?.unpaid_count ?? 0} student(s) unpaid for {fees?.month}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Main Operational Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Attendance Detail Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <CalendarCheck className="size-4 text-primary" />
                <span>Today&apos;s Attendance</span>
              </CardTitle>
              <Link
                href="/attendance"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>Take Attendance</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Daily classroom presence tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {attendance && attendance.total_marked > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="text-muted-foreground">Present</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {attendance.present_count}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="text-muted-foreground">Late</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {attendance.late_count}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="text-muted-foreground">Absent</span>
                  <span className="font-mono font-bold text-destructive">
                    {attendance.absent_count}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-semibold text-foreground">
                    Total Students Marked
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {attendance.total_marked}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
                <Calendar className="size-8 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No attendance records for today
                </p>
                <Link href="/attendance">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-8 px-3 gap-1.5 border-border hover:bg-muted mt-1 shadow-none"
                  >
                    <Plus className="size-3.5" />
                    <span>Record Attendance</span>
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Management Breakdown Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <WalletMinimal className="size-4 text-primary" />
                <span>Monthly Fee Status</span>
              </CardTitle>
              <Link
                href="/fees"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>View Fees</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Billing cycle for {fees?.month || "Current Month"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Expected Revenue</span>
              <span className="font-mono font-semibold text-foreground">
                ৳{(fees?.total_expected ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Collected Amount</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ৳{(fees?.total_collected ?? 0).toLocaleString()} (
                {fees?.collection_percentage ?? 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted-foreground">Pending Balance</span>
              <span className="font-mono font-bold text-destructive">
                ৳{(fees?.total_pending ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-muted-foreground">Payment Rate</span>
              <span className="font-semibold text-foreground">
                {fees?.paid_count ?? 0} Paid / {fees?.unpaid_count ?? 0} Unpaid
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Shortcuts Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Quick Shortcuts
            </CardTitle>
            <CardDescription className="text-xs">
              Direct access to coaching workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="h-9 w-full justify-between rounded-full border-border hover:bg-muted text-xs font-medium px-4 shadow-none"
              render={<Link href="/students" />}
            >
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-primary" />
                <span>Student Roster</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="h-9 w-full justify-between rounded-full border-border hover:bg-muted text-xs font-medium px-4 shadow-none"
              render={<Link href="/exams" />}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="size-3.5 text-primary" />
                <span>Exams & Marks Entry</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="h-9 w-full justify-between rounded-full border-border hover:bg-muted text-xs font-medium px-4 shadow-none"
              render={<Link href="/leaderboard" />}
            >
              <div className="flex items-center gap-2">
                <Trophy className="size-3.5 text-primary" />
                <span>Academic Leaderboard</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="h-9 w-full justify-between rounded-full border-border hover:bg-muted text-xs font-medium px-4 shadow-none"
              render={<Link href="/reminders" />}
            >
              <div className="flex items-center gap-2">
                <Bell className="size-3.5 text-primary" />
                <span>Fee Reminder Logs</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 4. Upcoming Activities & Announcements Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <span>All Exams</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Scheduled tests & examinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <FileSpreadsheet className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No upcoming exams scheduled
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.exam_id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-medium text-xs text-foreground truncate">
                        {exam.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Layers className="size-3 text-primary shrink-0" />
                        {exam.batch_name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="secondary"
                        className="bg-muted font-mono font-medium text-[10px] rounded-full px-2 py-0.5"
                      >
                        {exam.total_marks} Marks
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {exam.exam_date
                          ? new Date(exam.exam_date).toLocaleDateString()
                          : "No date"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Upcoming Assignments</span>
              </CardTitle>
              <Link
                href="/assignments"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>All Assignments</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Active coursework deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <FileText className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No pending assignments
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {upcomingAssignments.map((a) => (
                  <div
                    key={a.assignment_id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-medium text-xs text-foreground truncate">
                        {a.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Layers className="size-3 text-primary shrink-0" />
                        {a.batch_name}
                      </span>
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

        {/* Recent Notices Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <span>Recent Notices</span>
              </CardTitle>
              <Link
                href="/notices"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 font-medium transition-colors"
              >
                <span>All Notices</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Broadcast announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <Bell className="size-7 stroke-1 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  No announcements published
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {recentNotices.slice(0, 4).map((n) => (
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
                        {n.batch_name}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
