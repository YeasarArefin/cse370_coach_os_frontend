export interface StudentBatchRelation {
  batch_id: string;
  name: string;
}

export interface Student {
  student_id: string;
  user_id: string;
  name: string;
  email: string;
  batch_id: string | null;
  batch_name?: string;
  batches?: StudentBatchRelation[];
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
