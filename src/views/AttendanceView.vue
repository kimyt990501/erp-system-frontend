<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { format, startOfMonth, endOfMonth } from 'date-fns';
  import {
    getTodayAttendance,
    checkIn,
    checkOut,
    getMyAttendanceRecords,
    getMyAttendanceStats
  } from '@/services/attendanceService';
  import type { AttendanceRecord, AttendanceStats } from '@/types/attendance';

  // PrimeVue 컴포넌트
  import Panel from 'primevue/panel';
  import Button from 'primevue/button';
  import Tag from 'primevue/tag';
  import Skeleton from 'primevue/skeleton';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Calendar from 'primevue/calendar';

  const toast = useToast();

  // 오늘 날짜
  const today = new Date();

  // 오늘 근태 상태
  const todayRecord = ref<AttendanceRecord | null>(null);
  const isLoadingToday = ref(true);
  const isCheckingIn = ref(false);
  const isCheckingOut = ref(false);

  // 통계 상태
  const stats = ref<AttendanceStats | null>(null);
  const isLoadingStats = ref(true);

  // 기록 상태
  const records = ref<AttendanceRecord[]>([]);
  const isLoadingRecords = ref(true);

  // 필터 날짜
  const filterStartDate = ref<Date>(startOfMonth(today));
  const filterEndDate = ref<Date>(endOfMonth(today));

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    return `${format(date, 'yyyy년 MM월 dd일')} (${dayOfWeek})`;
  };

  // 현재 시간 가져오기 (HH:MM:SS)
  const getCurrentTime = () => {
    return format(new Date(), 'HH:mm:ss');
  };

  // 오늘 근태 로드
  const loadTodayAttendance = async () => {
    try {
      isLoadingToday.value = true;
      todayRecord.value = await getTodayAttendance();
    } catch (error) {
      console.error('Failed to load today attendance:', error);
    } finally {
      isLoadingToday.value = false;
    }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      isLoadingStats.value = true;
      const start = format(filterStartDate.value, 'yyyy-MM-dd');
      const end = format(filterEndDate.value, 'yyyy-MM-dd');
      stats.value = await getMyAttendanceStats(start, end);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      isLoadingStats.value = false;
    }
  };

  // 기록 로드
  const loadRecords = async () => {
    try {
      isLoadingRecords.value = true;
      const start = format(filterStartDate.value, 'yyyy-MM-dd');
      const end = format(filterEndDate.value, 'yyyy-MM-dd');
      records.value = await getMyAttendanceRecords(start, end);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      isLoadingRecords.value = false;
    }
  };

  // 출근 체크인
  const handleCheckIn = async () => {
    try {
      isCheckingIn.value = true;
      const workDate = format(today, 'yyyy-MM-dd');
      const checkInTime = getCurrentTime();

      todayRecord.value = await checkIn({
        work_date: workDate,
        check_in: checkInTime
      });

      toast.add({
        severity: 'success',
        summary: '출근 체크인 완료',
        detail: `${checkInTime}에 출근하셨습니다.`,
        life: 3000
      });

      // 통계와 기록 새로고침
      await loadStats();
      await loadRecords();
    } catch (error: any) {
      console.error('Failed to check in:', error);
      toast.add({
        severity: 'error',
        summary: '출근 체크인 실패',
        detail: error.response?.data?.detail || '출근 체크인에 실패했습니다.',
        life: 5000
      });
    } finally {
      isCheckingIn.value = false;
    }
  };

  // 퇴근 체크아웃
  const handleCheckOut = async () => {
    try {
      isCheckingOut.value = true;
      const workDate = format(today, 'yyyy-MM-dd');
      const checkOutTime = getCurrentTime();

      todayRecord.value = await checkOut(workDate, {
        check_out: checkOutTime
      });

      toast.add({
        severity: 'success',
        summary: '퇴근 체크아웃 완료',
        detail: `${checkOutTime}에 퇴근하셨습니다. 수고하셨습니다!`,
        life: 3000
      });

      // 통계와 기록 새로고침
      await loadStats();
      await loadRecords();
    } catch (error: any) {
      console.error('Failed to check out:', error);
      toast.add({
        severity: 'error',
        summary: '퇴근 체크아웃 실패',
        detail: error.response?.data?.detail || '퇴근 체크아웃에 실패했습니다.',
        life: 5000
      });
    } finally {
      isCheckingOut.value = false;
    }
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return '정상';
      case 'late': return '지각';
      case 'early_leave': return '조퇴';
      case 'absent': return '결근';
      default: return status;
    }
  };

  // 상태 색상
  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'early_leave': return 'warn';
      case 'absent': return 'danger';
      default: return 'info';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  onMounted(async () => {
    await loadTodayAttendance();
    await loadStats();
    await loadRecords();
  });
</script>

<template>
  <div class="attendance-management">
    <!-- 오늘의 출퇴근 -->
    <Panel header="오늘의 출퇴근" class="today-panel">
      <div v-if="isLoadingToday" class="loading-state">
        <Skeleton height="4rem" class="mb-2"></Skeleton>
        <Skeleton height="2rem"></Skeleton>
      </div>
      <div v-else class="today-content">
        <div class="today-date">
          <i class="pi pi-calendar"></i>
          <span>{{ formatDate(today) }}</span>
        </div>

        <div class="check-status">
          <div class="status-item">
            <strong>출근</strong>
            <span :class="['time', todayRecord?.check_in ? 'recorded' : 'not-recorded']">
              {{ todayRecord?.check_in || '--:--' }}
            </span>
            <Tag v-if="todayRecord?.status === 'late'" severity="warning" value="지각"></Tag>
          </div>
          <div class="status-divider"></div>
          <div class="status-item">
            <strong>퇴근</strong>
            <span :class="['time', todayRecord?.check_out ? 'recorded' : 'not-recorded']">
              {{ todayRecord?.check_out || '--:--' }}
            </span>
            <Tag v-if="todayRecord?.status === 'early_leave'" severity="warn" value="조퇴"></Tag>
          </div>
        </div>

        <div class="action-buttons">
          <Button
            label="출근 체크인"
            icon="pi pi-sign-in"
            class="p-button-success"
            :disabled="!!todayRecord?.check_in"
            @click="handleCheckIn"
            :loading="isCheckingIn"
          />
          <Button
            label="퇴근 체크아웃"
            icon="pi pi-sign-out"
            class="p-button-info"
            :disabled="!todayRecord?.check_in || !!todayRecord?.check_out"
            @click="handleCheckOut"
            :loading="isCheckingOut"
          />
        </div>

        <div v-if="todayRecord?.notes" class="notes-section">
          <i class="pi pi-info-circle"></i>
          <span>{{ todayRecord.notes }}</span>
        </div>
      </div>
    </Panel>

    <div class="bottom-section">
      <!-- 이번 달 통계 -->
      <Panel header="이번 달 근태 통계" class="stats-panel">
        <div v-if="isLoadingStats" class="loading-state">
          <Skeleton height="2rem" class="mb-2"></Skeleton>
          <Skeleton height="2rem" class="mb-2"></Skeleton>
          <Skeleton height="2rem"></Skeleton>
        </div>
        <div v-else-if="stats" class="stats-content">
          <div class="stat-item">
            <span class="stat-label">총 근무일</span>
            <span class="stat-value">{{ stats.total_days }}일</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">정상 출근</span>
            <span class="stat-value present">{{ stats.present_days }}일</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">지각</span>
            <span class="stat-value late">{{ stats.late_days }}일</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">조퇴</span>
            <span class="stat-value early-leave">{{ stats.early_leave_days }}일</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">결근</span>
            <span class="stat-value absent">{{ stats.absent_days }}일</span>
          </div>
          <div class="stat-item highlight">
            <span class="stat-label">출석률</span>
            <span class="stat-value">{{ stats.attendance_rate.toFixed(1) }}%</span>
          </div>
        </div>
      </Panel>

      <!-- 근태 기록 -->
      <Panel header="근태 기록" class="records-panel">
        <template #header>
          <div class="panel-header-content">
            <span>근태 기록</span>
            <div class="date-filter">
              <Calendar
                v-model="filterStartDate"
                dateFormat="yy-mm-dd"
                placeholder="시작일"
                :maxDate="filterEndDate || new Date()"
              />
              <span>~</span>
              <Calendar
                v-model="filterEndDate"
                dateFormat="yy-mm-dd"
                placeholder="종료일"
                :minDate="filterStartDate"
                :maxDate="new Date()"
              />
              <Button
                icon="pi pi-search"
                label="조회"
                @click="loadRecords"
                :loading="isLoadingRecords"
              />
            </div>
          </div>
        </template>

        <DataTable
          :value="records"
          :loading="isLoadingRecords"
          stripedRows
          showGridlines
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
        >
          <template #empty> 근태 기록이 없습니다. </template>
          <template #loading> 기록을 불러오는 중입니다... </template>

          <Column field="work_date" header="날짜" :sortable="true" style="text-align: center;"></Column>
          <Column field="check_in" header="출근 시간" style="text-align: center;">
            <template #body="slotProps">
              {{ slotProps.data.check_in || '-' }}
            </template>
          </Column>
          <Column field="check_out" header="퇴근 시간" style="text-align: center;">
            <template #body="slotProps">
              {{ slotProps.data.check_out || '-' }}
            </template>
          </Column>
          <Column field="status" header="상태" :sortable="true" style="text-align: center;">
            <template #body="slotProps">
              <Tag
                :value="getStatusLabel(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          <Column field="notes" header="비고">
            <template #body="slotProps">
              {{ slotProps.data.notes || '-' }}
            </template>
          </Column>
        </DataTable>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
  .attendance-management {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .today-panel {
    width: 100%;
  }

  .bottom-section {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .stats-panel {
    flex: 0 0 400px;
  }

  .records-panel {
    flex: 1;
  }

  @media (max-width: 768px) {
    .bottom-section {
      flex-direction: column;
    }

    .stats-panel {
      flex: 1 1 100%;
      width: 100%;
    }
  }

  /* 오늘의 출퇴근 */
  .today-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .today-date {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #64ffda;
  }

  .today-date i {
    font-size: 1.3rem;
  }

  .check-status {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px;
    background-color: #1a1d29;
    border-radius: 8px;
    border: 1px solid #2d3348;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .status-item strong {
    color: #a8b2d1;
    font-size: 0.9rem;
  }

  .status-item .time {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .time.recorded {
    color: #64ffda;
  }

  .time.not-recorded {
    color: #6c757d;
  }

  .status-divider {
    width: 2px;
    height: 60px;
    background-color: #2d3348;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .action-buttons :deep(.p-button) {
    flex: 1;
    max-width: 200px;
  }

  .notes-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: rgba(100, 255, 218, 0.1);
    border-left: 3px solid #64ffda;
    border-radius: 4px;
    color: #a8b2d1;
  }

  /* 통계 */
  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #1a1d29;
    border-radius: 6px;
    border: 1px solid #2d3348;
  }

  .stat-item.highlight {
    background-color: rgba(100, 255, 218, 0.1);
    border-color: #64ffda;
  }

  .stat-label {
    color: #a8b2d1;
    font-size: 0.95rem;
  }

  .stat-value {
    font-weight: 700;
    font-size: 1.1rem;
    color: #e1e4e8;
  }

  .stat-value.present {
    color: #52c41a;
  }

  .stat-value.late {
    color: #faad14;
  }

  .stat-value.early-leave {
    color: #ff7a45;
  }

  .stat-value.absent {
    color: #f5222d;
  }

  .stat-item.highlight .stat-value {
    color: #64ffda;
    font-size: 1.3rem;
  }

  /* 기록 패널 헤더 */
  .panel-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 20px;
  }

  .date-filter {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .date-filter :deep(.p-calendar) {
    width: 140px;
  }

  @media (max-width: 768px) {
    .panel-header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .date-filter {
      width: 100%;
      flex-wrap: wrap;
    }

    .date-filter :deep(.p-calendar) {
      flex: 1;
      min-width: 120px;
    }
  }

  /* 다크 테마 스타일 (기존 패턴 적용) */
  :deep(.p-panel) {
    background-color: #242938;
    border: 1px solid #2d3348;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    color: #e1e4e8;
  }

  :deep(.p-panel .p-panel-header) {
    background-color: #2d3348;
    border-bottom: 1px solid #64ffda;
    color: #a8b2d1;
  }

  :deep(.p-panel .p-panel-content) {
    background-color: #242938;
    color: #e1e4e8;
  }

  :deep(.p-datatable) {
    background-color: #242938;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    border: 1px solid #2d3348;
  }

  :deep(.p-datatable-thead > tr > th) {
    background: linear-gradient(180deg, #2d3348 0%, #242938 100%);
    font-weight: 600;
    color: #a8b2d1;
    border-bottom: 2px solid #64ffda;
    padding: 12px 16px;
  }

  :deep(.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #1f2230;
  }

  :deep(.p-datatable-tbody > tr) {
    background-color: #242938;
    border-bottom: 1px solid #2d3348;
    color: #e1e4e8;
  }

  :deep(.p-datatable-tbody > tr:hover) {
    background-color: rgba(100, 255, 218, 0.1) !important;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  :deep(.p-datatable-tbody > tr > td) {
    color: #e1e4e8;
  }

  :deep(.p-skeleton) {
    background-color: #2d3348;
  }

  :deep(.p-skeleton::after) {
    background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
  }

  :deep(.p-calendar-input),
  :deep(.p-inputtext) {
    background-color: #1a1d29;
    border: 1px solid #2d3348;
    color: #e1e4e8;
  }

  :deep(.p-calendar-input:enabled:hover),
  :deep(.p-inputtext:enabled:hover) {
    border-color: #64ffda;
  }

  :deep(.p-calendar-input:enabled:focus),
  :deep(.p-inputtext:enabled:focus) {
    border-color: #64ffda;
    box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2);
  }

  .loading-state {
    padding: 10px;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }
</style>
