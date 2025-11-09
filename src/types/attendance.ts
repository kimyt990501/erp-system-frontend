// 근태 상태 타입
export type AttendanceStatus = 'present' | 'late' | 'early_leave' | 'absent';

// 근태 기록 (GET 응답)
export interface AttendanceRecord {
  id: number;
  user_id: number;
  work_date: string; // YYYY-MM-DD
  check_in: string | null; // HH:MM:SS
  check_out: string | null; // HH:MM:SS
  status: AttendanceStatus;
  notes: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// 체크인 요청 (POST /attendance/check-in)
export interface CheckInRequest {
  work_date: string; // YYYY-MM-DD
  check_in: string; // HH:MM:SS
  notes?: string | null;
}

// 체크아웃 요청 (PATCH /attendance/check-out)
export interface CheckOutRequest {
  check_out: string; // HH:MM:SS
}

// 근태 통계
export interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  early_leave_days: number;
  absent_days: number;
  attendance_rate: number; // 출석률 (%)
}

// 관리자용: 전체 근태 기록 (사용자 정보 포함)
export interface AdminAttendanceRecord extends AttendanceRecord {
  user_name: string;
  user_email: string;
}

// 관리자용: 근태 수동 생성 요청
export interface AdminCreateAttendanceRequest {
  work_date: string; // YYYY-MM-DD
  check_in: string; // HH:MM:SS
  check_out?: string | null; // HH:MM:SS
  status: AttendanceStatus;
  notes?: string | null;
}
