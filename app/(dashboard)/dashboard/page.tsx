import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import {
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  Layers,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {session?.user?.name || "Teacher"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {session?.user?.email} • Coaching Center Management Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border border-border  bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Batches</CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-0.5">No active batches yet</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Students</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-0.5">No students enrolled yet</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance</CardTitle>
            <CalendarCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-foreground">—</div>
            <p className="text-xs text-muted-foreground mt-0.5">No records today</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Fees</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-0.5">All dues clear</p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="rounded-xl border border-border bg-card shadow-none lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold text-foreground">Batches Overview</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Your active coaching cohorts will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
              <Layers className="size-8 stroke-1 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No batches created yet</p>
              <p className="text-xs text-muted-foreground">Create your first batch to start adding students.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold text-foreground">Quick Navigation</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Direct shortcuts to key operations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-full border-border hover:bg-muted text-sm font-medium px-4 shadow-none"
              render={<Link href="/batches" />}
            >
              <span>Manage Batches</span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-full border-border hover:bg-muted text-sm font-medium px-4 shadow-none"
              render={<Link href="/students" />}
            >
              <span>Student Roster</span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-full border-border hover:bg-muted text-sm font-medium px-4 shadow-none"
              render={<Link href="/attendance" />}
            >
              <span>Take Attendance</span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-full border-border hover:bg-muted text-sm font-medium px-4 shadow-none"
              render={<Link href="/fees" />}
            >
              <span>Fee Payments</span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
