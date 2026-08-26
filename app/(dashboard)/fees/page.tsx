"use client";

import { DeletePaymentDialog } from "@/components/fees/DeletePaymentDialog";
import { EditPaymentSheet } from "@/components/fees/EditPaymentSheet";
import { PaymentInvoiceDialog } from "@/components/fees/PaymentInvoiceDialog";
import { RecordPaymentSheet } from "@/components/fees/RecordPaymentSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FeeReminderItem,
  FeeRemindersResponse,
  FeeStatusResponse,
  FeeStudentItem,
  Payment,
  Student,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  BanknoteArrowUp,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Edit2,
  FileText,
  History,
  Layers,
  Mail,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
  WalletMinimal,
} from "lucide-react";
import { useMemo, useState } from "react";

// ---------- helpers ----------
const CURRENT_MONTH = new Date().toLocaleString("en-US", {
  month: "long",
  year: "numeric",
});

function StatusBadge({ status }: { status: "paid" | "unpaid" | string }) {
  if (status === "paid") {
    return (
      <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
        <CheckCircle2 className="size-3" />
        Paid
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
        <Clock className="size-3" />
        Pending
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-full text-muted-foreground px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none"
    >
      <AlertCircle className="size-3" />
      Unpaid
    </Badge>
  );
}

// ---------- main page ----------
export default function FeesPage() {
  const { data: session } = useSession();
  const isStudent = (session?.user as { role?: string })?.role === "student";

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // ---- view state ----
  const [activeTab, setActiveTab] = useState<
    "unpaid" | "reminders" | "paid" | "history"
  >("unpaid");
  const [reminderFilter, setReminderFilter] = useState<
    "all" | "overdue" | "upcoming"
  >("all");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [search, setSearch] = useState("");

  // ---- reminder state ----
  const [isSendingBulkReminders, setIsSendingBulkReminders] = useState(false);
  const [sendingStudentId, setSendingStudentId] = useState<string | null>(null);
  const [sentStudentIds, setSentStudentIds] = useState<Set<string>>(new Set());
  const [reminderMessage, setReminderMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  // ---- student search / picker ----
  const [studentSearch, setStudentSearch] = useState("");
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // ---- invoice state ----
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null);
  const [invoiceBatchName, setInvoiceBatchName] = useState<string | undefined>(
    undefined
  );
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // ---- edit / delete state ----
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ---- fetch all students (for picker & admission dates) ----
  const { data: allStudents = [] } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/students`);
      if (!res.ok) throw new Error("Failed to load students");
      return res.json();
    },
  });

  const studentAdmissionMap = useMemo(() => {
    const map = new Map<string, string | null>();
    allStudents.forEach((s) => {
      map.set(s.student_id, s.admission_date || null);
    });
    return map;
  }, [allStudents]);

  const loggedInStudent = useMemo(() => {
    if (!isStudent || !session?.user) return null;
    const userId = (session.user as { id?: string }).id;
    const email = session.user.email?.toLowerCase();
    return (
      allStudents.find(
        (s) =>
          (userId && s.user_id === userId) ||
          (email && s.email.toLowerCase() === email)
      ) || null
    );
  }, [isStudent, session, allStudents]);

  // ---- fee status for selected month ----
  const {
    data: feeData,
    isLoading: isFeeLoading,
    isError: isFeeError,
    refetch: refetchFees,
  } = useQuery<FeeStatusResponse>({
    queryKey: ["fees", month],
    queryFn: async () => {
      const res = await fetch(
        `${backendUrl}/api/fees/status?month=${encodeURIComponent(month)}`
      );
      if (!res.ok) throw new Error("Failed to load fee status");
      return res.json();
    },
    enabled: !!month,
  });

  // ---- fee reminders for selected month ----
  const {
    data: remindersData,
    isLoading: isRemindersLoading,
    refetch: refetchReminders,
  } = useQuery<FeeRemindersResponse>({
    queryKey: ["feeReminders", month],
    queryFn: async () => {
      const res = await fetch(
        `${backendUrl}/api/fees/reminders/due?month=${encodeURIComponent(month)}`
      );
      if (!res.ok) throw new Error("Failed to load fee reminders");
      return res.json();
    },
    enabled: !!month,
  });

  // ---- recent payments ----
  const {
    data: recentPayments = [],
    isLoading: isRecentLoading,
    refetch: refetchRecent,
  } = useQuery<Payment[]>({
    queryKey: ["recentPayments"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/fees/recent?limit=30`);
      if (!res.ok) throw new Error("Failed to load recent payments");
      return res.json();
    },
  });

  // ---- derived lists ----
  const unpaidStudents: FeeStudentItem[] = useMemo(
    () => (feeData?.students ?? []).filter((s) => s.status === "unpaid"),
    [feeData]
  );

  const paidStudents: FeeStudentItem[] = useMemo(
    () => (feeData?.students ?? []).filter((s) => s.status === "paid"),
    [feeData]
  );

  const allReminders: FeeReminderItem[] = useMemo(
    () => remindersData?.students ?? [],
    [remindersData]
  );

  const overdueReminders = useMemo(
    () => allReminders.filter((s) => s.is_overdue),
    [allReminders]
  );

  const upcomingReminders = useMemo(
    () => allReminders.filter((s) => !s.is_overdue),
    [allReminders]
  );

  // Filter reminders list by sub-filter and search
  const filteredReminders = useMemo(() => {
    let list = allReminders;
    if (reminderFilter === "overdue") list = overdueReminders;
    if (reminderFilter === "upcoming") list = upcomingReminders;

    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.batch_names.toLowerCase().includes(q)
    );
  }, [allReminders, overdueReminders, upcomingReminders, reminderFilter, search]);

  // ---- student picker filtered by search ----
  const filteredPicker = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return allStudents.slice(0, 8);
    return allStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allStudents, studentSearch]);

  // ---- table row filter by search ----
  const filteredUnpaid = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return unpaidStudents;
    return unpaidStudents.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.batch_name.toLowerCase().includes(q)
    );
  }, [unpaidStudents, search]);

  const filteredPaid = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return paidStudents;
    return paidStudents.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.batch_name.toLowerCase().includes(q)
    );
  }, [paidStudents, search]);

  const filteredRecent = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return recentPayments;
    return recentPayments.filter(
      (p) =>
        (p.student_name ?? "").toLowerCase().includes(q) ||
        (p.student_email ?? "").toLowerCase().includes(q) ||
        p.month.toLowerCase().includes(q)
    );
  }, [recentPayments, search]);

  // ---- pick student then open record sheet ----
  const handlePickStudent = (student: Student) => {
    setPickedStudent(student);
    setStudentSearch("");
    setIsRecordOpen(true);
  };

  // Convert a FeeStudentItem to Student to open RecordPaymentSheet
  const handleRecordForStudentItem = (s: FeeStudentItem | FeeReminderItem) => {
    const matchingStudent = allStudents.find(
      (st) => st.student_id === s.student_id
    );
    if (matchingStudent) {
      setPickedStudent(matchingStudent);
    } else {
      setPickedStudent({
        student_id: s.student_id,
        user_id: "",
        name: s.student_name,
        email: s.student_email,
        batch_id: null,
        batch_name: "batch_name" in s ? s.batch_name : s.batch_names,
        total_fee: s.expected_fee,
        admission_date: null,
        phone: s.phone,
        address: null,
        status: "active",
      });
    }
    setIsRecordOpen(true);
  };

  const handleViewInvoice = (payment: Payment, batchName?: string) => {
    setInvoicePayment(payment);
    setInvoiceBatchName(batchName);
    setIsInvoiceOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setIsEditOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setDeletingPayment(payment);
    setIsDeleteOpen(true);
  };

  // Trigger sending fee reminder emails to ALL due students
  const handleSendBulkReminders = async () => {
    setIsSendingBulkReminders(true);
    setReminderMessage(null);
    try {
      const res = await fetch(`${backendUrl}/api/fees/reminders/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reminders");

      // Mark all current due students as sent in local state
      const sentIds = new Set(sentStudentIds);
      allReminders.forEach((r) => sentIds.add(r.student_id));
      setSentStudentIds(sentIds);

      setReminderMessage({
        text: `✅ ${data.message || `Reminders sent to ${data.sent_count} students`}`,
      });
      setTimeout(() => setReminderMessage(null), 6000);
    } catch (err: any) {
      setReminderMessage({
        text: `❌ ${err.message || "Failed to send fee reminders"}`,
        isError: true,
      });
      setTimeout(() => setReminderMessage(null), 6000);
    } finally {
      setIsSendingBulkReminders(false);
    }
  };

  // Trigger sending fee reminder email to a SINGLE student
  const handleSendSingleReminder = async (studentId: string) => {
    setSendingStudentId(studentId);
    setReminderMessage(null);
    try {
      const res = await fetch(`${backendUrl}/api/fees/reminders/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_ids: [studentId], month }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reminder");

      setSentStudentIds((prev) => new Set(prev).add(studentId));
      setReminderMessage({
        text: `✅ Reminder email sent successfully!`,
      });
      setTimeout(() => setReminderMessage(null), 5000);
    } catch (err: any) {
      setReminderMessage({
        text: `❌ ${err.message || "Failed to send reminder email"}`,
        isError: true,
      });
      setTimeout(() => setReminderMessage(null), 5000);
    } finally {
      setSendingStudentId(null);
    }
  };

  // Build a Payment object from a FeeStudentItem's payment info for edit/delete/invoice
  const buildPaymentFromStudent = (s: FeeStudentItem): Payment => ({
    payment_id: s.payment_id!,
    student_id: s.student_id,
    student_name: s.student_name,
    student_email: s.student_email,
    amount: s.amount!,
    payment_date: s.payment_date!,
    month: s.month,
    status: "paid",
  });

  const summary = feeData?.summary;

  // ---- tabs ----
  const TABS = [
    {
      key: "unpaid",
      label: "Unpaid",
      icon: AlertCircle,
      count: summary?.unpaid_count ?? 0,
    },
    {
      key: "reminders",
      label: "Fee Reminders",
      icon: Bell,
      count: allReminders.length,
    },
    {
      key: "paid",
      label: "Paid",
      icon: BadgeCheck,
      count: summary?.paid_count ?? 0,
    },
    {
      key: "history",
      label: "History",
      icon: History,
      count: recentPayments.length,
    },
  ] as const;

  // Student-facing fee portal view
  if (isStudent) {
    const myFeeStatus = feeData?.students?.find(
      (s) => s.student_id === loggedInStudent?.student_id
    ) || null;

    const myPayments = recentPayments.filter(
      (p) => p.student_id === loggedInStudent?.student_id
    );

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <WalletMinimal className="size-6 text-primary" />
              <span>My Tuition Fees & Receipts</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              View your monthly tuition balance, payment receipts, and download official payment invoices.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Calendar className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Billing Month:
            </span>
            <Input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g. August 2026"
              className="h-9 w-44 rounded-full px-4 text-sm shadow-none border-border bg-card"
            />
          </div>
        </div>

        {/* Student Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Monthly Expected Fee</span>
            <span className="text-2xl font-bold font-mono text-foreground">
              ৳{Number(myFeeStatus?.expected_fee ?? loggedInStudent?.total_fee ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {myFeeStatus?.batch_name || loggedInStudent?.batch_name || "Enrolled Cohort"}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Payment Status ({month})</span>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={myFeeStatus?.status ?? "unpaid"} />
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {myFeeStatus?.status === "paid" ? `Paid on ${myFeeStatus.payment_date ? new Date(myFeeStatus.payment_date).toLocaleDateString() : "record"}` : "Due for this cycle"}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Amount Paid This Month</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ৳{Number(myFeeStatus?.amount ?? (myFeeStatus?.status === "paid" ? myFeeStatus.expected_fee : 0)).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Monthly tuition remittance
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Admission Date</span>
            <span className="text-sm font-semibold text-foreground mt-1">
              {loggedInStudent?.admission_date
                ? new Date(loggedInStudent.admission_date).toLocaleDateString()
                : "Active Student"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ID: {loggedInStudent?.student_id || "—"}
            </span>
          </div>
        </div>

        {/* Payment History & Invoices Table */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">
                Payment Receipts & Invoices
              </h2>
            </div>
          </div>

          {isRecentLoading ? (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-8 w-1/4 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : myPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Receipt className="size-8 text-muted-foreground mb-2 stroke-1" />
              <h3 className="font-heading text-base font-semibold text-foreground">
                No payment receipts found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Your payment receipts and downloadable invoices will appear here once recorded by the administration.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="pl-4">Billing Month</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-4">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.map((p) => (
                    <TableRow key={p.payment_id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-primary" />
                          <span className="font-medium text-sm text-foreground">{p.month}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-sm text-foreground">
                          ৳{Number(p.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1">
                          <CheckCircle2 className="size-3" />
                          Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(p, loggedInStudent?.batch_name || undefined)}
                          className="h-8 rounded-full px-3 text-xs font-medium gap-1.5 border-border hover:bg-primary hover:text-primary-foreground"
                        >
                          <FileText className="size-3.5" />
                          <span>View Invoice</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Invoice Dialog */}
        <PaymentInvoiceDialog
          payment={invoicePayment}
          batchName={invoiceBatchName}
          open={isInvoiceOpen}
          onOpenChange={setIsInvoiceOpen}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1 — Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <WalletMinimal className="size-6 text-primary" />
            <span>Fee Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-calculate monthly batch fees, track upcoming & overdue payments, and dispatch admission-based fee reminders.
          </p>
        </div>
      </div>

      {/* 2 — Student Picker + Record Button */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          <span className="text-sm font-semibold">Record a Payment</span>
          <span className="text-xs text-muted-foreground">
            — search student to auto-calculate batch fees
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search student by name or email to record payment..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="h-10 rounded-full border-border bg-background pl-10 pr-4 text-sm shadow-none w-full"
          />
        </div>

        {/* Dropdown suggestions */}
        {studentSearch.trim().length > 0 && (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
            {filteredPicker.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">
                No students found
              </div>
            ) : (
              filteredPicker.map((student) => (
                <button
                  key={student.student_id}
                  type="button"
                  onClick={() => handlePickStudent(student)}
                  className="flex items-center justify-between px-4 py-3 text-left hover:bg-muted/70 transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground group-hover:underline">
                        {student.name}
                      </span>
                      {student.batch_name && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Layers className="size-3 text-primary" />
                          {student.batch_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {student.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-foreground">
                        ৳{Number(student.total_fee ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        monthly fee
                      </span>
                    </div>
                    <span className="rounded-full text-xs font-medium px-3 py-1 bg-primary text-primary-foreground transition-opacity group-hover:opacity-90">
                      Record
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3 — Month Selector + Reminders Trigger + Summary Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Month:
              </span>
              <Input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. August 2026"
                className="h-9 w-44 rounded-full px-4 text-sm shadow-none border-border"
              />
            </div>

            {/* Send Reminders Bulk Trigger */}
            <Button
              variant="outline"
              size="sm"
              disabled={isSendingBulkReminders || allReminders.length === 0}
              onClick={handleSendBulkReminders}
              className="h-9 rounded-full px-3.5 text-xs font-medium gap-1.5 border-border bg-card hover:bg-muted text-foreground transition-colors shadow-xs"
              title="Send automated fee reminder emails to all due students for this month"
            >
              {isSendingBulkReminders ? (
                <RefreshCw className="size-3.5 animate-spin text-primary" />
              ) : (
                <BellRing className="size-3.5 text-primary" />
              )}
              <span>
                {isSendingBulkReminders
                  ? "Dispatching..."
                  : `Send All Reminders (${allReminders.length})`}
              </span>
            </Button>
          </div>

          {/* Summary Strip */}
          {summary && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                <Users className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {summary.total_students}
                </span>
                <span className="text-muted-foreground">students</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                <Coins className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  ৳{(summary.total_expected ?? 0).toLocaleString()}
                </span>
                <span className="text-muted-foreground">expected</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {summary.paid_count}
                </span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70">
                  paid
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                <AlertCircle className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {summary.unpaid_count}
                </span>
                <span className="text-muted-foreground">unpaid</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
                <BanknoteArrowUp className="size-3.5 text-primary" />
                <span className="font-semibold text-primary">
                  ৳{summary.total_collected.toLocaleString()}
                </span>
                <span className="text-primary/70">collected</span>
              </div>
            </div>
          )}
        </div>

        {/* Reminder Status Alert */}
        {reminderMessage && (
          <div
            className={`rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-2 border ${
              reminderMessage.isError
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <span>{reminderMessage.text}</span>
          </div>
        )}
      </div>

      {/* 4 — Tabs + Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex gap-1 rounded-full border border-border bg-muted p-1 self-start flex-wrap">
          {TABS.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Table search */}
        <div className="relative sm:ml-auto w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-full border-border bg-card pl-10 pr-4 text-sm focus-visible:bg-background shadow-none w-full"
          />
        </div>
      </div>

      {/* 5 — Table Area */}
      {isFeeError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Failed to load fee data.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchFees();
              refetchRecent();
              refetchReminders();
            }}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      ) : isFeeLoading || isRecentLoading || isRemindersLoading ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : (
        <>
          {/* ---- Unpaid Tab ---- */}
          {activeTab === "unpaid" && (
            <FeeTable
              rows={filteredUnpaid.map((s) => {
                const admDate = studentAdmissionMap.get(s.student_id);
                let dueDay = 1;
                if (admDate) {
                  const d = new Date(admDate);
                  if (!isNaN(d.getTime())) dueDay = d.getDate();
                }
                const dueDateStr = `${month.split(" ")[0]} ${dueDay}`;

                return {
                  student_id: s.student_id,
                  student_name: s.student_name,
                  student_email: s.student_email,
                  batch_name: s.batch_name,
                  month: s.month,
                  due_date: dueDateStr,
                  expected_fee: s.expected_fee,
                  amount: null,
                  payment_date: null,
                  status: "unpaid" as const,
                  payment_id: null,
                };
              })}
              emptyMessage="All students have paid for this month."
              emptyIcon={
                <CheckCircle2 className="size-8 text-emerald-500 stroke-1 mb-2" />
              }
              showActions={false}
              showRecordAction={true}
              onRecord={(row) => {
                const s = unpaidStudents.find(
                  (st) => st.student_id === row.student_id
                );
                if (s) handleRecordForStudentItem(s);
              }}
              onViewInvoice={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}

          {/* ---- Fee Reminders Tab (Upcoming & Overdue) ---- */}
          {activeTab === "reminders" && (
            <div className="flex flex-col gap-4">
              {/* Sub-filter pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReminderFilter("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      reminderFilter === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    All Due ({allReminders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderFilter("overdue")}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors gap-1.5 flex items-center ${
                      reminderFilter === "overdue"
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <AlertTriangle className="size-3 text-destructive" />
                    <span>Overdue ({overdueReminders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderFilter("upcoming")}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors gap-1.5 flex items-center ${
                      reminderFilter === "upcoming"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Clock className="size-3 text-blue-500" />
                    <span>Upcoming ({upcomingReminders.length})</span>
                  </button>
                </div>

                <span className="text-xs text-muted-foreground">
                  * Due dates are computed based on each student&apos;s admission day.
                </span>
              </div>

              {filteredReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
                  <CheckCircle2 className="size-8 text-emerald-500 stroke-1 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No students matching this reminder filter.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All students are up to date or already paid for {month}.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="pl-4">Student</TableHead>
                        <TableHead>Enrolled Batch(es)</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Payment Due Date</TableHead>
                        <TableHead>Expected Fee</TableHead>
                        <TableHead>Reminder Status</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReminders.map((student) => {
                        const isSent = sentStudentIds.has(student.student_id);
                        const isSending =
                          sendingStudentId === student.student_id;

                        return (
                          <TableRow
                            key={student.student_id}
                            className="border-border hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="pl-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-sm text-foreground">
                                  {student.student_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {student.student_email}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Layers className="size-3 text-primary shrink-0" />
                                <span>{student.batch_names}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {student.admission_date
                                ? new Date(
                                    student.admission_date
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-foreground">
                                  {student.due_date}
                                </span>
                                {student.is_overdue ? (
                                  <span className="text-[10px] text-destructive font-medium">
                                    {student.days_overdue > 0
                                      ? `${student.days_overdue} days overdue`
                                      : "Due today"}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                    Upcoming in cycle
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-muted font-mono font-medium text-xs rounded-full px-2.5 py-0.5"
                              >
                                ৳{Number(student.expected_fee).toLocaleString()}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {isSent ? (
                                <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
                                  <CheckCircle2 className="size-3" />
                                  Email Dispatched
                                </Badge>
                              ) : student.is_overdue ? (
                                <Badge className="rounded-full bg-destructive/10 text-destructive border-destructive/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
                                  <AlertTriangle className="size-3" />
                                  Overdue
                                </Badge>
                              ) : (
                                <Badge className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold gap-1 shadow-none">
                                  <Clock className="size-3" />
                                  Upcoming
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isSending || isSent}
                                  onClick={() =>
                                    handleSendSingleReminder(student.student_id)
                                  }
                                  className={`h-8 rounded-full px-3 text-xs font-medium gap-1.5 border-border transition-colors ${
                                    isSent
                                      ? "bg-muted text-muted-foreground"
                                      : "bg-background hover:bg-muted text-foreground"
                                  }`}
                                  title="Send email reminder to this student"
                                >
                                  {isSending ? (
                                    <RefreshCw className="size-3.5 animate-spin text-primary" />
                                  ) : isSent ? (
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                  ) : (
                                    <Mail className="size-3.5 text-primary" />
                                  )}
                                  <span>
                                    {isSending
                                      ? "Sending..."
                                      : isSent
                                      ? "Sent"
                                      : "Send Email"}
                                  </span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRecordForStudentItem(student)
                                  }
                                  className="h-8 rounded-full px-3 text-xs font-medium gap-1.5 border-border bg-background hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <CreditCard className="size-3.5" />
                                  <span>Record</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ---- Paid Tab ---- */}
          {activeTab === "paid" && (
            <FeeTable
              rows={filteredPaid.map((s) => ({
                student_id: s.student_id,
                student_name: s.student_name,
                student_email: s.student_email,
                batch_name: s.batch_name,
                month: s.month,
                due_date: null,
                expected_fee: s.expected_fee,
                amount: s.amount,
                payment_date: s.payment_date,
                status: "paid" as const,
                payment_id: s.payment_id,
              }))}
              emptyMessage="No payments recorded for this month yet."
              emptyIcon={
                <WalletMinimal className="size-8 text-muted-foreground stroke-1 mb-2" />
              }
              showActions={true}
              showRecordAction={false}
              onRecord={() => {}}
              onViewInvoice={(row) => {
                const student = feeData?.students.find(
                  (s) => s.student_id === row.student_id
                );
                if (student && student.payment_id) {
                  handleViewInvoice(
                    buildPaymentFromStudent(student),
                    row.batch_name
                  );
                }
              }}
              onEdit={(row) => {
                const student = feeData?.students.find(
                  (s) => s.student_id === row.student_id
                );
                if (student && student.payment_id) {
                  handleEdit(buildPaymentFromStudent(student));
                }
              }}
              onDelete={(row) => {
                const student = feeData?.students.find(
                  (s) => s.student_id === row.student_id
                );
                if (student && student.payment_id) {
                  handleDelete(buildPaymentFromStudent(student));
                }
              }}
            />
          )}

          {/* ---- History Tab ---- */}
          {activeTab === "history" && (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {filteredRecent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <History className="size-8 text-muted-foreground stroke-1 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No payment history yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payments recorded will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="pl-4">Student</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecent.map((p) => (
                      <TableRow
                        key={p.payment_id}
                        className="border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm text-foreground">
                              {p.student_name || "—"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.student_email || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.month}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium text-foreground">
                          ৳{Number(p.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 transition-colors"
                              onClick={() => handleViewInvoice(p)}
                              title="View and print invoice receipt"
                            >
                              <Receipt className="size-3.5" />
                              <span>Invoice</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              onClick={() => handleEdit(p)}
                              title="Edit payment"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDelete(p)}
                              title="Delete payment"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </>
      )}

      {/* 6 — Modals */}
      <RecordPaymentSheet
        student={pickedStudent}
        open={isRecordOpen}
        onOpenChange={setIsRecordOpen}
        defaultMonth={month}
      />

      <PaymentInvoiceDialog
        payment={invoicePayment}
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        batchName={invoiceBatchName}
      />

      <EditPaymentSheet
        payment={editingPayment}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeletePaymentDialog
        payment={deletingPayment}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </div>
  );
}

// ---------- reusable table for unpaid/paid rows ----------
interface FeeTableRow {
  student_id: string;
  student_name: string;
  student_email: string;
  batch_name: string;
  month: string;
  due_date?: string | null;
  expected_fee: number;
  amount: number | null;
  payment_date: string | null;
  status: "paid" | "unpaid";
  payment_id: string | null;
}

interface FeeTableProps {
  rows: FeeTableRow[];
  emptyMessage: string;
  emptyIcon: React.ReactNode;
  showActions: boolean;
  showRecordAction?: boolean;
  onRecord: (row: FeeTableRow) => void;
  onViewInvoice: (row: FeeTableRow) => void;
  onEdit: (row: FeeTableRow) => void;
  onDelete: (row: FeeTableRow) => void;
}

function FeeTable({
  rows,
  emptyMessage,
  emptyIcon,
  showActions,
  showRecordAction,
  onRecord,
  onViewInvoice,
  onEdit,
  onDelete,
}: FeeTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        {emptyIcon}
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="pl-4">Student</TableHead>
            <TableHead>Enrolled Batch(es)</TableHead>
            <TableHead>Fee Month</TableHead>
            {rows[0]?.status === "unpaid" && <TableHead>Due Date (Cycle)</TableHead>}
            <TableHead>Expected Fee</TableHead>
            {rows[0]?.status === "paid" && (
              <>
                <TableHead>Paid On</TableHead>
                <TableHead>Amount Paid</TableHead>
              </>
            )}
            <TableHead>Status</TableHead>
            {(showActions || showRecordAction) && (
              <TableHead className="text-right pr-4">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.student_id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              <TableCell className="pl-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm text-foreground">
                    {row.student_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.student_email}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Layers className="size-3 text-primary shrink-0" />
                  <span>{row.batch_name}</span>
                </div>
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                {row.month}
              </TableCell>

              {row.status === "unpaid" && (
                <TableCell className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {row.due_date || "1st of month"}
                  </span>
                </TableCell>
              )}

              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-muted font-mono font-medium text-xs rounded-full px-2.5 py-0.5"
                >
                  ৳{Number(row.expected_fee ?? 0).toLocaleString()}
                </Badge>
              </TableCell>

              {row.status === "paid" && (
                <>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.payment_date
                      ? new Date(row.payment_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.amount !== null
                      ? `৳${Number(row.amount).toLocaleString()}`
                      : "—"}
                  </TableCell>
                </>
              )}

              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>

              {showRecordAction && (
                <TableCell className="text-right pr-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecord(row)}
                    className="h-8 rounded-full px-3 text-xs font-medium gap-1.5 border-border bg-background hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <CreditCard className="size-3.5" />
                    <span>Record Fee</span>
                  </Button>
                </TableCell>
              )}

              {showActions && (
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 transition-colors"
                      onClick={() => onViewInvoice(row)}
                      title="View and download invoice"
                    >
                      <Receipt className="size-3.5" />
                      <span>Invoice</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => onEdit(row)}
                      title="Edit payment"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => onDelete(row)}
                      title="Delete payment"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
