"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-12">
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">
              CoachOS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground hover:text-foreground"
            render={<Link href="/" />}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </Button>

          <ThemeToggle />

          {isLoginPage ? (
            <Button
              size="sm"
              className="rounded-full px-4 text-xs font-medium"
              render={<Link href="/signup" />}
            >
              Register
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-border px-4 text-xs font-medium"
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 CoachOS Management System
      </footer>
    </div>
  );
}
