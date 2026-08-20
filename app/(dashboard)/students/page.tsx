"use client";

import { AddStudentSheet } from "@/components/students/AddStudentSheet";
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog";
import { EditStudentSheet } from "@/components/students/EditStudentSheet";
import { StudentTable } from "@/components/students/StudentTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Batch, Student } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch Students
  const {
    data: students = [],
    isLoading: isLoadingStudents,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/students`);
      if (!res.ok) {
        throw new Error("Failed to load students");
      }
      return res.json();
    },
  });

  // Fetch Batches for assignment
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) {
        throw new Error("Failed to load batches");
      }
      return res.json();
    },
  });

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const query = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query)) ||
        (s.batch_name && s.batch_name.toLowerCase().includes(query))
    );
  }, [students, search]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditOpen(true);
  };

  const handleDelete = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Student Roster
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage student enrollments, batch assignments, and contact profiles.
          </p>
        </div>

        {/* 3. Add Button */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-10 rounded-full px-5 text-sm font-medium shadow-none self-start sm:self-auto gap-2"
        >
          <Plus className="size-4" data-icon="inline-start" />
          <span>Add Student</span>
        </Button>
      </div>

      {/* 2. Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by student name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
          <Users className="size-4" />
          <span>
            Total: <strong className="text-foreground font-semibold">{filteredStudents.length}</strong> students
          </span>
        </div>
      </div>

      {/* 4. Data Table / Loading / Error */}
      {isLoadingStudents ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : isStudentsError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load student roster.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStudents()}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* 5. Add Student Sheet */}
      <AddStudentSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        batches={batches}
      />

      {/* 6. Edit Student Sheet */}
      <EditStudentSheet
        student={editingStudent}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        batches={batches}
      />

      {/* 7. Delete Confirmation Dialog */}
      <DeleteStudentDialog
        student={deletingStudent}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </div>
  );
}
