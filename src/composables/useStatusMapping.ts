import type { AttendanceStatus } from '@/types/attendance'

/**
 * 상태 매핑 타입
 */
export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type UserStatus = 'active' | 'inactive'

/**
 * PrimeVue Tag severity 타입
 */
export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'

/**
 * 상태 매핑 설정
 */
interface StatusConfig<T extends string> {
  label: string
  severity: TagSeverity
  icon?: string
  color?: string
}

/**
 * 근태 상태 매핑
 */
const ATTENDANCE_STATUS_MAP: Record<AttendanceStatus, StatusConfig<AttendanceStatus>> = {
  present: {
    label: '정상',
    severity: 'success',
    icon: 'pi-check-circle',
    color: '#52c41a',
  },
  late: {
    label: '지각',
    severity: 'warn',
    icon: 'pi-exclamation-triangle',
    color: '#faad14',
  },
  early_leave: {
    label: '조퇴',
    severity: 'info',
    icon: 'pi-sign-out',
    color: '#ff7a45',
  },
  absent: {
    label: '결근',
    severity: 'danger',
    icon: 'pi-times-circle',
    color: '#f5222d',
  },
}

/**
 * 연차 상태 매핑
 */
const LEAVE_STATUS_MAP: Record<LeaveStatus, StatusConfig<LeaveStatus>> = {
  pending: {
    label: '대기',
    severity: 'warn',
    icon: 'pi-clock',
    color: '#faad14',
  },
  approved: {
    label: '승인',
    severity: 'success',
    icon: 'pi-check',
    color: '#52c41a',
  },
  rejected: {
    label: '거절',
    severity: 'danger',
    icon: 'pi-times',
    color: '#f5222d',
  },
}

/**
 * 사용자 활성 상태 매핑
 */
const USER_STATUS_MAP: Record<UserStatus, StatusConfig<UserStatus>> = {
  active: {
    label: '활성',
    severity: 'success',
    icon: 'pi-check',
    color: '#52c41a',
  },
  inactive: {
    label: '비활성',
    severity: 'secondary',
    icon: 'pi-ban',
    color: '#8c8c8c',
  },
}

/**
 * useStatusMapping - 상태 값을 라벨과 색상으로 매핑하는 composable
 *
 * @example
 * const { getAttendanceLabel, getAttendanceSeverity } = useStatusMapping()
 *
 * const label = getAttendanceLabel('present') // '정상'
 * const severity = getAttendanceSeverity('late') // 'warn'
 */
export function useStatusMapping() {
  /**
   * 근태 상태 라벨 가져오기
   */
  function getAttendanceLabel(status: AttendanceStatus): string {
    return ATTENDANCE_STATUS_MAP[status]?.label || status
  }

  /**
   * 근태 상태 severity 가져오기
   */
  function getAttendanceSeverity(status: AttendanceStatus): TagSeverity {
    return ATTENDANCE_STATUS_MAP[status]?.severity || 'secondary'
  }

  /**
   * 근태 상태 아이콘 가져오기
   */
  function getAttendanceIcon(status: AttendanceStatus): string {
    return ATTENDANCE_STATUS_MAP[status]?.icon || 'pi-question'
  }

  /**
   * 근태 상태 색상 가져오기
   */
  function getAttendanceColor(status: AttendanceStatus): string {
    return ATTENDANCE_STATUS_MAP[status]?.color || '#8c8c8c'
  }

  /**
   * 근태 상태 전체 설정 가져오기
   */
  function getAttendanceConfig(status: AttendanceStatus): StatusConfig<AttendanceStatus> {
    return ATTENDANCE_STATUS_MAP[status] || {
      label: status,
      severity: 'secondary',
    }
  }

  /**
   * 연차 상태 라벨 가져오기
   */
  function getLeaveLabel(status: LeaveStatus): string {
    return LEAVE_STATUS_MAP[status]?.label || status
  }

  /**
   * 연차 상태 severity 가져오기
   */
  function getLeaveSeverity(status: LeaveStatus): TagSeverity {
    return LEAVE_STATUS_MAP[status]?.severity || 'secondary'
  }

  /**
   * 연차 상태 아이콘 가져오기
   */
  function getLeaveIcon(status: LeaveStatus): string {
    return LEAVE_STATUS_MAP[status]?.icon || 'pi-question'
  }

  /**
   * 연차 상태 색상 가져오기
   */
  function getLeaveColor(status: LeaveStatus): string {
    return LEAVE_STATUS_MAP[status]?.color || '#8c8c8c'
  }

  /**
   * 연차 상태 전체 설정 가져오기
   */
  function getLeaveConfig(status: LeaveStatus): StatusConfig<LeaveStatus> {
    return LEAVE_STATUS_MAP[status] || {
      label: status,
      severity: 'secondary',
    }
  }

  /**
   * 사용자 상태 라벨 가져오기
   */
  function getUserStatusLabel(isActive: boolean): string {
    const status: UserStatus = isActive ? 'active' : 'inactive'
    return USER_STATUS_MAP[status]?.label || status
  }

  /**
   * 사용자 상태 severity 가져오기
   */
  function getUserStatusSeverity(isActive: boolean): TagSeverity {
    const status: UserStatus = isActive ? 'active' : 'inactive'
    return USER_STATUS_MAP[status]?.severity || 'secondary'
  }

  /**
   * 사용자 상태 아이콘 가져오기
   */
  function getUserStatusIcon(isActive: boolean): string {
    const status: UserStatus = isActive ? 'active' : 'inactive'
    return USER_STATUS_MAP[status]?.icon || 'pi-question'
  }

  /**
   * 모든 근태 상태 옵션 가져오기 (Dropdown 등에 사용)
   */
  function getAttendanceOptions() {
    return Object.entries(ATTENDANCE_STATUS_MAP).map(([value, config]) => ({
      label: config.label,
      value: value as AttendanceStatus,
    }))
  }

  /**
   * 모든 연차 상태 옵션 가져오기 (Dropdown 등에 사용)
   */
  function getLeaveOptions() {
    return Object.entries(LEAVE_STATUS_MAP).map(([value, config]) => ({
      label: config.label,
      value: value as LeaveStatus,
    }))
  }

  return {
    // Attendance
    getAttendanceLabel,
    getAttendanceSeverity,
    getAttendanceIcon,
    getAttendanceColor,
    getAttendanceConfig,
    getAttendanceOptions,

    // Leave
    getLeaveLabel,
    getLeaveSeverity,
    getLeaveIcon,
    getLeaveColor,
    getLeaveConfig,
    getLeaveOptions,

    // User
    getUserStatusLabel,
    getUserStatusSeverity,
    getUserStatusIcon,
  }
}
