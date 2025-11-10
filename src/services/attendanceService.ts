import api from './api';
import type {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  AttendanceStats,
  AdminAttendanceRecord,
  AdminCreateAttendanceRequest
} from '@/types/attendance';

/**
 * 출근 체크인 (POST /attendance/check-in)
 */
export const checkIn = async (data: CheckInRequest): Promise<AttendanceRecord> => {
  try {
    const response = await api.post<AttendanceRecord>('/attendance/check-in', data);
    return response.data;
  } catch (error) {
    console.error('Failed to check in:', error);
    throw error;
  }
};

/**
 * 퇴근 체크아웃 (PATCH /attendance/check-out)
 */
export const checkOut = async (workDate: string, data: CheckOutRequest): Promise<AttendanceRecord> => {
  try {
    const response = await api.patch<AttendanceRecord>(`/attendance/check-out?work_date=${workDate}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to check out:', error);
    throw error;
  }
};

/**
 * 오늘 근태 조회 (GET /attendance/today)
 */
export const getTodayAttendance = async (): Promise<AttendanceRecord | null> => {
  try {
    const response = await api.get<AttendanceRecord>('/attendance/today');
    return response.data;
  } catch (error: any) {
    // 404인 경우 오늘 기록이 없는 것이므로 null 반환
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch today attendance:', error);
    throw error;
  }
};

/**
 * 내 근태 기록 조회 (GET /attendance/my-records)
 */
export const getMyAttendanceRecords = async (
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get<AttendanceRecord[]>('/attendance/my-records', { params });
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch my attendance records:', error);
    return [];
  }
};

/**
 * 내 근태 통계 조회 (GET /attendance/my-stats)
 */
export const getMyAttendanceStats = async (
  startDate?: string,
  endDate?: string
): Promise<AttendanceStats | null> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get<AttendanceStats>('/attendance/my-stats', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my attendance stats:', error);
    return null;
  }
};

/**
 * 관리자: 전체 근태 기록 조회 (GET /attendance/admin/all-records)
 */
export const getAllAttendanceRecords = async (
  workDate?: string,
  startDate?: string,
  endDate?: string
): Promise<AdminAttendanceRecord[]> => {
  try {
    const params: Record<string, string> = {};
    if (workDate) params.work_date = workDate;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any[]>('/attendance/admin/all-records', { params });
    const records = response.data || [];

    return records.map((record) => ({
      ...record,
      user_name: record.user.name,
      user_email: record.user.email
    }));
  } catch (error) {
    console.error('Failed to fetch all attendance records:', error);
    return [];
  }
};

/**
 * 관리자: 근태 수동 생성 (POST /attendance/admin/create/{user_id})
 */
export const createAttendanceForUser = async (
  userId: number,
  data: AdminCreateAttendanceRequest
): Promise<AttendanceRecord> => {
  try {
    const response = await api.post<AttendanceRecord>(`/attendance/admin/create/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create attendance for user:', error);
    throw error;
  }
};

/**
 * 관리자: 특정 사용자 통계 조회 (GET /attendance/admin/user/{user_id}/stats)
 */
export const getUserAttendanceStats = async (
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<AttendanceStats | null> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get<AttendanceStats>(`/attendance/admin/user/${userId}/stats`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user attendance stats:', error);
    return null;
  }
};
