export interface StudentBatchRelation {
  batch_id: string;
  name: string;
  fee?: number;
}

export interface Student {
  student_id: string;
  user_id: string;
  name: string;
  email: string;
  batch_id: string | null;
  batch_name?: string;
  batches?: StudentBatchRelation[];
  total_fee?: number;
  admission_date: string | null;
  phone: string | null;
  address: string | null;
  status: "active" | "inactive";
  created_at?: string;
}

export interface Batch {
  batch_id: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  name: string;
  description: string | null;
  fee?: number;
  start_date: string | null;
  status: "active" | "completed" | "inactive";
  student_count?: number;
}

export interface AttendanceStudentItem {
  student_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  phone: string | null;
  attendance_id: string | null;
  status: "present" | "absent" | "late" | null;
}

export interface AttendanceResponse {
  batch_id: string;
  batch_name: string;
  date: string;
  summary: {
    total_students: number;
    present: number;
    absent: number;
    late: number;
    unmarked: number;
  };
  students: AttendanceStudentItem[];
}

export interface Notice {
  notice_id: string;
  batch_id: string | null;
  batch_name?: string | null;
  title: string;
  content: string;
  created_at?: string;
}

export interface Assignment {
  assignment_id: string;
  batch_id: string;
  batch_name?: string;
  title: string;
  description: string | null;
  deadline: string | null;
  created_at?: string;
}

export interface Exam {
  exam_id: string;
  batch_id: string;
  batch_name?: string;
  title: string;
  exam_date: string | null;
  total_marks: number;
  created_at?: string;
}

export interface ExamStudentResultItem {
  student_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  phone: string | null;
  result_id: string | null;
  marks_obtained: number | null;
  rank: number | null;
  is_marked: boolean;
}

export interface ExamResultsResponse {
  exam_id: string;
  batch_id: string;
  batch_name: string;
  title: string;
  exam_date: string | null;
  total_marks: number;
  summary: {
    total_students: number;
    marked_count: number;
    unmarked_count: number;
    average_marks: number | null;
    highest_marks: number | null;
    lowest_marks: number | null;
  };
  students: ExamStudentResultItem[];
  results: {
    result_id: string;
    exam_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    marks_obtained: number;
    rank: number;
    created_at?: string;
  }[];
}

export interface Payment {
  payment_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  amount: number;
  payment_date: string;
  month: string;
  status: "paid" | "pending" | "failed";
  created_at?: string;
}

export interface FeeStudentItem {
  student_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  phone: string | null;
  batches: (string | { batch_id: string; name: string; fee: number })[];
  batch_name: string;
  student_status: string;
  expected_fee: number;
  payment_id: string | null;
  amount: number | null;
  payment_date: string | null;
  month: string;
  status: "paid" | "unpaid";
}

export interface FeeStatusResponse {
  month: string;
  batch_id: string | null;
  summary: {
    total_students: number;
    paid_count: number;
    unpaid_count: number;
    total_expected: number;
    total_collected: number;
  };
  students: FeeStudentItem[];
  payments: Payment[];
}

export interface FeeStatusStudent {
  student: Student;
  summary: {
    total_expected: number;
    total_paid: number;
    pending_amount: number;
    is_fully_paid: boolean;
  };
  payments: Payment[];
}

export type StudentItem = Student;
export type BatchItem = Batch;
export type AssignmentItem = Assignment;
export type ExamItem = Exam;
export type NoticeItem = Notice;

export interface LeaderboardStudentItem {
  rank: number;
  student_id: string;
  student_name: string;
  student_email: string;
  phone: string | null;
  batches?: string[];
  batch_name?: string;
  exams_attended: number;
  total_exams_in_batch?: number;
  total_marks: number;
  total_possible_marks: number;
  average_marks: number;
  percentage: number;
  exam_breakdown?: {
    exam_id: string;
    exam_title: string;
    marks_obtained: number;
    total_marks: number;
  }[];
}

export interface LeaderboardResponse {
  batch_id: string;
  batch_name: string;
  total_students: number;
  total_exams: number;
  leaderboard: LeaderboardStudentItem[];
}

export interface FeeReminderItem {
  student_id: string;
  student_name: string;
  student_email: string;
  phone: string | null;
  admission_date: string | null;
  billing_day: number;
  due_date: string;
  is_overdue: boolean;
  days_overdue: number;
  month: string;
  expected_fee: number;
  batches: { batch_id?: string; name: string; fee: number }[];
  batch_names: string;
}

export interface FeeRemindersResponse {
  month: string;
  total_due_students: number;
  students: FeeReminderItem[];
}

export interface ReminderHistoryItem {
  reminder_id: string;
  student_id: string;
  month: string;
  amount: number;
  due_date: string | null;
  sent_at: string;
  status: "sent" | "failed" | string;
  student_name: string;
  student_email: string;
  phone: string | null;
  admission_date: string | null;
}

export interface DashboardResponse {
  summary: {
    total_students: number;
    total_batches: number;
    today_attendance: {
      date: string;
      total_marked: number;
      present_count: number;
      absent_count: number;
      late_count: number;
      attendance_percentage: number;
    };
    fee_status: {
      month: string;
      total_expected: number;
      total_collected: number;
      total_pending: number;
      unpaid_count: number;
      paid_count: number;
      collection_percentage: number;
    };
  };
  upcoming_assignments: {
    assignment_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    batch_id: string;
    batch_name: string;
  }[];
  upcoming_exams: {
    exam_id: string;
    title: string;
    exam_date: string | null;
    total_marks: number;
    batch_id: string;
    batch_name: string;
  }[];
  recent_notices: {
    notice_id: string;
    title: string;
    content: string;
    created_at: string;
    batch_id: string | null;
    batch_name: string;
  }[];
  recent_payments?: {
    payment_id: string;
    amount: number;
    payment_date: string;
    month: string;
    status: string;
    student_name: string;
    student_email: string;
  }[];
}



