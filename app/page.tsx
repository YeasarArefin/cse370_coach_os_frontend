import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            CoachOS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="rounded-full px-4 text-sm font-medium"
            render={<Link href="/login" />}
          >
            Sign In
          </Button>
          <Button
            className="rounded-full px-5 text-sm font-medium"
            render={<Link href="/signup" />}
          >
            Register as Teacher
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            CoachOS System
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            The simplest way to run your CoachOS.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Manage batches, track daily attendance, grade exams, and monitor
            fee dues all from one clean, explainable dashboard.
          </p>

          {/* Call to actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              className="h-11 rounded-full px-7 text-sm font-medium shadow-xs"
              render={<Link href="/signup" />}
            >
              <span>Get Started as Teacher</span>
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-border px-7 text-sm font-medium"
              render={<Link href="/login" />}
            >
              <span>Teacher Login</span>
            </Button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Batch-centric architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Real MySQL database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mx-auto mt-20 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-foreground/20">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <Layers className="size-5" />
            </div>
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              Batch Management
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create subject cohorts, organize schedules, and enroll students seamlessly.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-foreground/20">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <CalendarCheck className="size-5" />
            </div>
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              Attendance Records
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mark student attendance per batch date with instant absent/late logs.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-foreground/20">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              Exams & Results
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create exams, record marks obtained, and auto-calculate student ranks.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-foreground/20">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <CreditCard className="size-5" />
            </div>
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              Fee Tracking
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Keep track of monthly fee payments and monitor pending student balances.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>© 2026 CoachOS Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground underline-offset-4 hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground underline-offset-4 hover:underline">
              Register as Teacher
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
