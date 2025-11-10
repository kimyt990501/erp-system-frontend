<script setup lang="ts">
  import { computed } from 'vue';
  import Tag from 'primevue/tag';
  import { useStatusMapping } from '@/composables/useStatusMapping';
  import type { AttendanceStatus } from '@/types/attendance';

  /**
   * StatusTag - 상태를 표시하는 재사용 가능한 태그 컴포넌트
   *
   * @example
   * <StatusTag type="attendance" :value="'present'" />
   * <StatusTag type="leave" :value="'approved'" />
   * <StatusTag type="user" :value="true" />
   */

  interface Props {
    /** 상태 타입: 근태, 연차, 사용자 */
    type: 'attendance' | 'leave' | 'user';
    /** 상태 값 */
    value: AttendanceStatus | 'pending' | 'approved' | 'rejected' | boolean;
    /** 아이콘 표시 여부 */
    showIcon?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showIcon: false,
  });

  const {
    getAttendanceLabel,
    getAttendanceSeverity,
    getAttendanceIcon,
    getLeaveLabel,
    getLeaveSeverity,
    getLeaveIcon,
    getUserStatusLabel,
    getUserStatusSeverity,
    getUserStatusIcon,
  } = useStatusMapping();

  // 타입에 따라 적절한 라벨 반환
  const label = computed(() => {
    if (props.type === 'attendance') {
      return getAttendanceLabel(props.value as AttendanceStatus);
    } else if (props.type === 'leave') {
      return getLeaveLabel(props.value as 'pending' | 'approved' | 'rejected');
    } else {
      return getUserStatusLabel(props.value as boolean);
    }
  });

  // 타입에 따라 적절한 severity 반환
  const severity = computed(() => {
    if (props.type === 'attendance') {
      return getAttendanceSeverity(props.value as AttendanceStatus);
    } else if (props.type === 'leave') {
      return getLeaveSeverity(props.value as 'pending' | 'approved' | 'rejected');
    } else {
      return getUserStatusSeverity(props.value as boolean);
    }
  });

  // 타입에 따라 적절한 아이콘 반환
  const icon = computed(() => {
    if (!props.showIcon) return undefined;

    if (props.type === 'attendance') {
      return getAttendanceIcon(props.value as AttendanceStatus);
    } else if (props.type === 'leave') {
      return getLeaveIcon(props.value as 'pending' | 'approved' | 'rejected');
    } else {
      return getUserStatusIcon(props.value as boolean);
    }
  });
</script>

<template>
  <Tag :value="label" :severity="severity" :icon="icon" />
</template>
