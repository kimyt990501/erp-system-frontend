import api from './api';
import type { User } from '@/types/user';
import type { AdminLeaveRequest } from '@/types/leave';

/**
 * 관리자 전용 API 서비스
 */

// ===== 사용자 관리 =====

/**
 * 전체 사용자 목록 조회 (관리자 전용)
 * GET /users/admin/all
 */
export async function getAllUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users/admin/all');
  return response.data;
}

// ===== 연차 승인 관리 =====

/**
 * 전체 연차 신청 내역 조회 (관리자 전용)
 * GET /leave/admin/all-requests
 */
export async function getAllLeaveRequests(): Promise<AdminLeaveRequest[]> {
  const response = await api.get<AdminLeaveRequest[]>('/leave/admin/all-requests');
  return response.data;
}

/**
 * 연차 신청 승인 (관리자 전용)
 * PATCH /leave/admin/approve/{request_id}
 */
export async function approveLeaveRequest(requestId: number): Promise<AdminLeaveRequest> {
  const response = await api.patch<AdminLeaveRequest>(`/leave/admin/approve/${requestId}`);
  return response.data;
}

/**
 * 연차 신청 거절 (관리자 전용)
 * PATCH /leave/admin/reject/{request_id}
 */
export async function rejectLeaveRequest(requestId: number): Promise<AdminLeaveRequest> {
  const response = await api.patch<AdminLeaveRequest>(`/leave/admin/reject/${requestId}`);
  return response.data;
}
