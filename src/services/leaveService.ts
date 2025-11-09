import api from './api';
import type { LeaveBalance, LeaveRequest, LeaveRequestCreate } from '@/types/leave';

/**
 * 내 연차 현황을 조회합니다 (GET /leave/balance)
 */
export const getMyLeaveBalance = async (): Promise<LeaveBalance | null> => {
  try {
    const response = await api.get<LeaveBalance>('/leave/balance');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch leave balance:', error);
    // UI에서 이 null 값을 보고 에러 메시지를 표시할 수 있습니다.
    return null;
  }
};

/**
 * 내 연차 신청 목록을 조회합니다 (GET /leave/requests)
 */
export const getMyLeaveRequests = async (): Promise<LeaveRequest[] | null> => {
  try {
    const response = await api.get<LeaveRequest[]>('/leave/requests');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    return null;
  }
};

/**
 * 연차를 신청합니다 (POST /leave/requests)
 */
export const createLeaveRequest = async (data: LeaveRequestCreate): Promise<LeaveRequest> => {
  try {
    const response = await api.post<LeaveRequest>('/leave/request', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create leave request:', error);
    // Axios 에러인 경우, 백엔드에서 보낸 상세 에러 메시지를 확인할 수 있습니다.
    if (error.response && error.response.data) {
      console.error('Backend validation error:', error.response.data);
    }
    // 에러를 다시 throw하여 호출한 쪽(예: Vue 컴포넌트)에서 처리하도록 합니다.
    throw error;
  }
};