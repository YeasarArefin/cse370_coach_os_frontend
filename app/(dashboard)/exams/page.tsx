"use client";

import { AddExamSheet } from "@/components/exams/AddExamSheet";
import { DeleteExamDialog } from "@/components/exams/DeleteExamDialog";
import { EditExamSheet } from "@/components/exams/EditExamSheet";
import { ExamMarksSheet } from "@/components/exams/ExamMarksSheet";
import { ExamTable } from "@/components/exams/ExamTable";
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
import { Batch, Exam, Student } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Layers, Plus, RefreshCw, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export default function ExamsPage() {
  const { data: session } = useSession();
  const isStudent = (session?.user as { role?: string })?.role === "student";

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [marksExam, setMarksExam] = useState<Exam | null>(null);
  const [isMarksOpen, setIsMarksOpen] = useState(false);

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

  // 2. Fetch all Batches for the filter
  const {
    data: allBatches = [],
    isLoading: isLoadingBatches,
  } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) throw new Error("Failed to load batches");
      return res.json();
    },
  });

  // Filter batches for students
  const batches = useMemo(() => {
    if (!isStudent || !loggedInStudent) return allBatches;
    const studentBatchIds = new Set(
      (loggedInStudent.batches || []).map((b) => b.batch_id).filter(Boolean)
    );
    if (loggedInStudent.batch_id) studentBatchIds.add(loggedInStudent.batch_id);

    return allBatches.filter((b) => studentBatchIds.has(b.batch_id));
  }, [allBatches, isStudent, loggedInStudent]);

  // Auto-select the first batch when batches load
  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(batches[0].batch_id);
    }
  }, [batches, selectedBatchId]);

  // 2. Fetch Exams for the selected batch
  const {
    data: exams = [],
    isLoading: isLoadingExams,
    isError,
    refetch,
  } = useQuery<Exam[]>({
    queryKey: ["exams", selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return [];
      const res = await fetch(`${backendUrl}/api/exams/${selectedBatchId}`);
      if (!res.ok) {
        throw new Error("Failed to load exams");
      }
      return res.json();
    },
    enabled: !!selectedBatchId,
  });

  // Filter exams by search query
  const filteredExams = useMemo(() => {
    return exams.filter((item) => {
      const query = search.toLowerCase().trim();
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        (item.batch_name && item.batch_name.toLowerCase().includes(query))
      );
    });
  }, [exams, search]);

  const handleViewMarks = (exam: Exam) => {
    setMarksExam(exam);
    setIsMarksOpen(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setIsEditOpen(true);
  };

  const handleDelete = (exam: Exam) => {
    setDeletingExam(exam);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GraduationCap className="size-6 text-primary" />
            <span>Exams & Results</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule examinations, record student marks, and generate performance rankings per cohort.
          </p>
        </div>

        {/* Create Exam CTA (Teachers only) */}
        {!isStudent && (
          <Button
            onClick={() => setIsAddOpen(true)}
            disabled={batches.length === 0}
            className="h-10 rounded-full px-5 text-sm font-medium shadow-none self-start sm:self-auto gap-2"
          >
            <Plus className="size-4" data-icon="inline-start" />
            <span>Create Exam</span>
          </Button>
        )}
      </div>

      {/* 2. Controls Bar: Batch Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search exams by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>

        {/* Batch Filter Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" />
            <span>Batch:</span>
          </span>
          {isLoadingBatches ? (
            <Skeleton className="h-10 w-48 rounded-full" />
          ) : batches.length > 0 ? (
            <Select
              value={selectedBatchId}
              onValueChange={(val) => val && setSelectedBatchId(val)}
            >
              <SelectTrigger className="h-10 w-52 sm:w-60 rounded-full px-4 text-sm bg-card shadow-none">
                <SelectValue placeholder="Select batch cohort">
                  {batches.find((b) => b.batch_id === selectedBatchId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.batch_id} value={b.batch_id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground">No batches</span>
          )}
        </div>
      </div>

      {/* 3. Data Table / Loading / Error */}
      {isLoadingExams || (isLoadingBatches && batches.length > 0) ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load exams for this batch.
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
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <Layers className="size-6 stroke-1" />
          </div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            No batches available
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Please create a batch first in Batch Management before creating exams.
          </p>
        </div>
      ) : (
        <ExamTable
          exams={filteredExams}
          onViewMarks={handleViewMarks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isReadOnly={isStudent}
        />
      )}

      {/* 4. Add Exam Sheet (Teachers only) */}
      {!isStudent && (
        <AddExamSheet
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          batches={batches}
          defaultBatchId={selectedBatchId}
        />
      )}

      {/* 5. Edit Exam Sheet (Teachers only) */}
      {!isStudent && (
        <EditExamSheet
          exam={editingExam}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          batches={batches}
        />
      )}

      {/* 6. Delete Confirmation Dialog (Teachers only) */}
      {!isStudent && (
        <DeleteExamDialog
          exam={deletingExam}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      )}

      {/* 7. Exam Details & Marks Entry Sheet */}
      <ExamMarksSheet
        exam={marksExam}
        open={isMarksOpen}
        onOpenChange={setIsMarksOpen}
        isReadOnly={isStudent}
        highlightStudentId={loggedInStudent?.student_id}
      />
    </div>
  );
}
