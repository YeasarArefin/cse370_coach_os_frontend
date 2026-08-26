import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  Home,
  Layers,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <BookOpen className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-semibold text-sm text-foreground group-hover:underline">
              CoachOS
            </span>
            <span className="text-[11px] text-muted-foreground">Management</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            render={<Link href="/login" />}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center md:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
          {/* Big Prominent 404 Number */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-heading text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-foreground select-none leading-none">
              404
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs mt-2">
              <span className="flex size-2 rounded-full bg-rose-500" />
              Page Not Found
            </div>
          </div>

          {/* Large Headline & Message */}
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Lost in the corridors?
            </h1>
            <p className="max-w-md text-base sm:text-lg text-muted-foreground leading-relaxed mx-auto">
              The page you are looking for doesn&apos;t exist, has been relocated, or the URL might be mistyped.
            </p>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="h-10 rounded-full px-6 text-sm font-medium shadow-xs gap-2"
              render={<Link href="/dashboard" />}
            >
              <LayoutDashboard className="size-4" />
              <span>Go to Dashboard</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-10 rounded-full border-border px-6 text-sm font-medium gap-2"
              render={<Link href="/" />}
            >
              <Home className="size-4 text-muted-foreground" />
              <span>Back to Home</span>
            </Button>
          </div>

          {/* Quick Helpful Links Grid */}
          <div className="mt-8 w-full border-t border-border pt-8 text-left">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center mb-4">
              Quick Shortcuts
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Link
                href="/batches"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-foreground/30 hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Layers className="size-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Batches</span>
              </Link>

              <Link
                href="/students"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-foreground/30 hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Users className="size-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Students</span>
              </Link>

              <Link
                href="/attendance"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-foreground/30 hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <CalendarCheck className="size-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Attendance</span>
              </Link>

              <Link
                href="/notices"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-foreground/30 hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Bell className="size-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Notices</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 CoachOS Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
