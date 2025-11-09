// GET /leave/balance 응답 (스키마: LeaveBalanceRead)
export interface LeaveBalance {
    total_granted: number;
    total_used: number;
    remaining_days: number;
  }
  
  // GET /leave/requests 응답 (스키마: LeaveRequestRead)
  export interface LeaveRequest {
    id: number;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    days_used: number;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected'; // (필요시 백엔드와 상태값 일치)
  }

  // POST /leave/requests 요청 (스키마: LeaveRequestCreate)
  export interface LeaveRequestCreate {
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    days_used: number; // 신청 일수
    reason?: string | null;
  }

  // 관리자용: 전체 연차 신청 내역 (사용자 정보 포함)
  export interface AdminLeaveRequest {
    id: number;
    user_id: number;
    user_name: string; // 사용자 이름
    user_email: string; // 사용자 이메일
    start_date: string;
    end_date: string;
    days_used: number;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string; // 신청 일시
  }