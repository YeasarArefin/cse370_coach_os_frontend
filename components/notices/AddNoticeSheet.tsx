"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Batch } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Mail } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AddNoticeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoticeSheet({ open, onOpenChange }: AddNoticeSheetProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<string>("global"); // "global" or batch_id

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch batches for target selection
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/batches`);
      if (!res.ok) throw new Error("Failed to load batches");
      return res.json();
    },
    enabled: open,
  });

  const selectedBatch = batches.find((b) => b.batch_id === scope);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${backendUrl}/api/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          batch_id: scope === "global" ? null : scope,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to publish notice.");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice Published", {
        description: `Announcement published and email notifications dispatched to ${data.notified_count || 0} students.`,
      });
      // Reset form
      setTitle("");
      setContent("");
      setScope("global");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Publishing Failed", {
        description: error.message || "Could not publish notice.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Validation Error", { description: "Please enter a notice title." });
      return;
    }
    if (!content.trim()) {
      toast.error("Validation Error", { description: "Please enter notice content." });
      return;
    }

    createMutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-border p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="size-5" />
            </div>
            <div>
              <SheetTitle className="font-heading text-lg font-bold">
                Publish New Notice
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Broadcast announcements globally to all students or target specific batch cohorts.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between p-6 gap-6">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notice Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Schedule Change, Exam Notice, Campus Holiday..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10 rounded-full px-4 text-sm"
              />
            </div>

            {/* Target Audience Scope */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Audience Scope <span className="text-destructive">*</span>
              </label>
              <Select value={scope} onValueChange={(val) => val && setScope(val)}>
                <SelectTrigger className="h-10 w-full rounded-full px-4 text-sm">
                  <SelectValue placeholder="Select target scope...">
                    {scope === "global" ? "Global (All Registered Students)" : selectedBatch?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">
                    Global (All Registered Students)
                  </SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.batch_id} value={batch.batch_id}>
                      Batch: {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notice Message / Details <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Write full announcement details, instructions, dates, or guidelines here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
                className="rounded-xl px-4 py-3 text-sm resize-none"
              />
            </div>

            {/* Email Notification Information Banner */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3 text-xs text-muted-foreground">
              <Mail className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">
                  Automated Email Notification
                </span>
                <span>
                  Publishing this notice will automatically dispatch an email notification to all students in the selected audience.
                </span>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5 text-sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 text-sm font-medium"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Publishing...
                </>
              ) : (
                "Publish Notice"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
