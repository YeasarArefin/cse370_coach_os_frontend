"use client";

import { AddBatchSheet } from "@/components/batches/AddBatchSheet";
import { BatchDetailSheet } from "@/components/batches/BatchDetailSheet";
import { BatchTable } from "@/components/batches/BatchTable";
import { DeleteBatchDialog } from "@/components/batches/DeleteBatchDialog";
import { EditBatchSheet } from "@/components/batches/EditBatchSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Layers, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function BatchesPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch Batches
  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    isError: isBatchesError,
    refetch: refetchBatches,
  } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) {
        throw new Error("Failed to load batches");
      }
      return res.json();
    },
  });

  // Filter batches by search term
  const filteredBatches = useMemo(() => {
    if (!search.trim()) return batches;
    const query = search.toLowerCase();
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        (b.description && b.description.toLowerCase().includes(query)) ||
        (b.teacher_name && b.teacher_name.toLowerCase().includes(query))
    );
  }, [batches, search]);

  const handleView = (batch: Batch) => {
    setViewingBatchId(batch.batch_id);
    setIsDetailOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsEditOpen(true);
  };

  const handleDelete = (batch: Batch) => {
    setDeletingBatch(batch);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Batch Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and organize teaching cohorts, assign curricula, and manage student enrollments.
          </p>
        </div>

        {/* 3. Add Button */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-10 rounded-full px-5 text-sm font-medium shadow-none self-start sm:self-auto gap-2"
        >
          <Plus className="size-4" data-icon="inline-start" />
          <span>Add Batch</span>
        </Button>
      </div>

      {/* 2. Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by batch name, description, or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
          <Layers className="size-4" />
          <span>
            Total: <strong className="text-foreground font-semibold">{filteredBatches.length}</strong> batches
          </span>
        </div>
      </div>

      {/* 4. Data Table / Loading / Error */}
      {isLoadingBatches ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : isBatchesError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load batch cohorts.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchBatches()}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <BatchTable
          batches={filteredBatches}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* 5. Add Batch Sheet */}
      <AddBatchSheet open={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* 6. Edit Batch Sheet */}
      <EditBatchSheet
        batch={editingBatch}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* 7. Delete Confirmation Dialog */}
      <DeleteBatchDialog
        batch={deletingBatch}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />

      {/* 8. Batch Details & Student Assignment Sheet */}
      <BatchDetailSheet
        batchId={viewingBatchId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
