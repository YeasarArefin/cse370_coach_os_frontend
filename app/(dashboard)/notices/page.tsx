"use client";

import { AddNoticeSheet } from "@/components/notices/AddNoticeSheet";
import { DeleteNoticeDialog } from "@/components/notices/DeleteNoticeDialog";
import { NoticeTable } from "@/components/notices/NoticeTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Notice, Student } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Bell, Globe, Layers, Plus, RefreshCw, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

export default function NoticesPage() {
  const { data: session } = useSession();
  const isStudent = (session?.user as { role?: string })?.role === "student";

  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "batch">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // 1. Fetch Students (to find enrolled batches for student role)
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

  // Fetch all notices
  const {
    data: allNotices = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/notices`);
      if (!res.ok) {
        throw new Error("Failed to load notices");
      }
      return res.json();
    },
  });

  // Filter notices for student's enrolled cohorts + global notices
  const notices = useMemo(() => {
    if (!isStudent || !loggedInStudent) return allNotices;
    const studentBatchIds = new Set(
      (loggedInStudent.batches || []).map((b) => b.batch_id).filter(Boolean)
    );
    if (loggedInStudent.batch_id) studentBatchIds.add(loggedInStudent.batch_id);

    return allNotices.filter((n) => !n.batch_id || studentBatchIds.has(n.batch_id));
  }, [allNotices, isStudent, loggedInStudent]);

  // Filter notices by search and scope tabs
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // 1. Search filter
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query) ||
        (notice.batch_name && notice.batch_name.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Scope filter
      if (scopeFilter === "global") {
        return !notice.batch_id;
      }
      if (scopeFilter === "batch") {
        return !!notice.batch_id;
      }
      return true;
    });
  }, [notices, search, scopeFilter]);

  const handleDelete = (notice: Notice) => {
    setDeletingNotice(notice);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="size-6 text-primary" />
            <span>Notice Board</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {isStudent
              ? "View global announcements and updates for your enrolled batches."
              : "Broadcast announcements globally or publish cohort-specific notices with automated email notifications."}
          </p>
        </div>

        {/* 3. Add Button (Teachers only) */}
        {!isStudent && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 rounded-full px-5 text-sm font-medium shadow-none self-start sm:self-auto gap-2"
          >
            <Plus className="size-4" data-icon="inline-start" />
            <span>Publish Notice</span>
          </Button>
        )}
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search notices by title, content, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>

        {/* Scope Filter Tabs */}
        <div className="inline-flex items-center p-1 rounded-full bg-muted/60 border border-border/80 self-start md:self-auto gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setScopeFilter("all")}
            className={`h-7 px-3 text-xs font-medium rounded-full transition-all ${scopeFilter === "all"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All ({notices.length})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setScopeFilter("global")}
            className={`h-7 px-3 text-xs font-medium rounded-full transition-all gap-1.5 ${scopeFilter === "global"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Globe className="size-3 text-blue-500" />
            <span>Global Only</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setScopeFilter("batch")}
            className={`h-7 px-3 text-xs font-medium rounded-full transition-all gap-1.5 ${scopeFilter === "batch"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Layers className="size-3 text-emerald-500" />
            <span>Batch Specific</span>
          </Button>
        </div>
      </div>

      {/* 4. Data Table / Loading / Error */}
      {isLoading ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load notice announcements.
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
      ) : (
        <NoticeTable
          notices={filteredNotices}
          onDelete={handleDelete}
          isReadOnly={isStudent}
        />
      )}

      {/* 5. Add Notice Sheet (Teachers only) */}
      {!isStudent && (
        <AddNoticeSheet open={isAddOpen} onOpenChange={setIsAddOpen} />
      )}

      {/* 6. Delete Confirmation Dialog (Teachers only) */}
      {!isStudent && (
        <DeleteNoticeDialog
          notice={deletingNotice}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      )}
    </div>
  );
}
