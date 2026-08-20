"use client";

import { AttendanceSummaryCards } from "@/components/attendance/AttendanceSummaryCards";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
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
import { AttendanceResponse, Batch } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AttendancePage() {
  const queryClient = useQueryClient();

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, "present" | "absent" | "late">
  >({});
  const [isDirty, setIsDirty] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // 1. Fetch all Batches
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<
    Batch[]
  >({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) throw new Error("Failed to load batches");
      return res.json();
    },
  });

  // Auto-select the first batch when batches load
  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(batches[0].batch_id);
    }
  }, [batches, selectedBatchId]);

  // 2. Fetch Attendance for Selected Batch & Date
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    isError: isAttendanceError,
    refetch: refetchAttendance,
  } = useQuery<AttendanceResponse>({
    queryKey: ["attendance", selectedBatchId, selectedDate],
    queryFn: async () => {
      if (!selectedBatchId) throw new Error("No batch selected");
      const res = await fetch(
        `${backendUrl}/api/attendance/${selectedBatchId}?date=${selectedDate}`
      );
      if (!res.ok) throw new Error("Failed to load attendance records");
      return res.json();
    },
    enabled: !!selectedBatchId && !!selectedDate,
  });

  // Initialize local attendance map when attendance data arrives
  useEffect(() => {
    if (attendanceData?.students) {
      const initialMap: Record<string, "present" | "absent" | "late"> = {};
      attendanceData.students.forEach((s) => {
        if (s.status) {
          initialMap[s.student_id] = s.status;
        }
      });
      setAttendanceMap(initialMap);
      setIsDirty(false);
    }
  }, [attendanceData]);

  // Handle single student status change
  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsDirty(true);
  };

  // Bulk actions
  const handleMarkAll = (status: "present" | "absent") => {
    if (!attendanceData?.students) return;
    const updatedMap: Record<string, "present" | "absent" | "late"> = {};
    attendanceData.students.forEach((s) => {
      updatedMap[s.student_id] = status;
    });
    setAttendanceMap(updatedMap);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    setAttendanceMap({});
    setIsDirty(true);
  };

  // Calculate live summary stats from local map
  const liveSummary = useMemo(() => {
    const students = attendanceData?.students || [];
    let present = 0;
    let absent = 0;
    let late = 0;
    let unmarked = 0;

    students.forEach((s) => {
      const status = attendanceMap[s.student_id];
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "late") late++;
      else unmarked++;
    });

    return {
      total: students.length,
      present,
      absent,
      late,
      unmarked,
    };
  }, [attendanceData, attendanceMap]);

  // 3. Save Attendance Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBatchId) return;

      const records = Object.entries(attendanceMap).map(
        ([student_id, status]) => ({
          student_id,
          status,
        })
      );

      const res = await fetch(`${backendUrl}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: selectedBatchId,
          date: selectedDate,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save attendance.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", selectedBatchId, selectedDate],
      });
      setIsDirty(false);
      toast.success("Attendance Saved", {
        description: `Recorded attendance for ${data.saved_count || 0} students on ${selectedDate}.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Save Failed", {
        description: error.message || "Could not record attendance.",
      });
    },
  });

  const students = attendanceData?.students || [];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck className="size-6 text-primary" />
            <span>Attendance Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and mark daily attendance for all student cohorts.
          </p>
        </div>

        {/* Save Attendance CTA */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending || students.length === 0}
          className="h-10 rounded-full px-6 text-sm font-medium shadow-none self-start sm:self-auto gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" data-icon="inline-start" />
              <span>Save Attendance</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Controls Bar: Batch Selector & Date Picker */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Select Batch */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Batch:
            </span>
            {isLoadingBatches ? (
              <Skeleton className="h-10 w-48 rounded-full" />
            ) : batches.length > 0 ? (
              <Select
                value={selectedBatchId}
                onValueChange={(val) => val && setSelectedBatchId(val)}
              >
                <SelectTrigger className="h-10 w-full sm:w-56 rounded-full px-4 text-sm bg-background/50">
                  <SelectValue placeholder="Select batch" />
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

          {/* Select Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Date:
            </span>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full sm:w-44 rounded-full px-4 text-sm bg-background/50"
              />
            </div>
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll("present")}
            disabled={students.length === 0}
            className="h-8 rounded-full px-3 text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Mark All Present</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll("absent")}
            disabled={students.length === 0}
            className="h-8 rounded-full px-3 text-xs gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          >
            <XCircle className="size-3.5" />
            <span>Mark All Absent</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={students.length === 0}
            className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* 3. Summary Statistics Cards */}
      <AttendanceSummaryCards
        total={liveSummary.total}
        present={liveSummary.present}
        absent={liveSummary.absent}
        late={liveSummary.late}
        unmarked={liveSummary.unmarked}
      />

      {/* 4. Attendance Table */}
      {isLoadingAttendance ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : isAttendanceError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load attendance records.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAttendance()}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <AttendanceTable
          students={students}
          attendanceMap={attendanceMap}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
