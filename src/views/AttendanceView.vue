<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getMyAttendanceRecords,
  getMyAttendanceStats,
} from '@/services/attendanceService'
import type { AttendanceRecord, AttendanceStats } from '@/types/attendance'

// Composables
import { useLoading } from '@/composables/useLoading'
import { useToastNotification } from '@/composables/useToastNotification'
import { useStatusMapping } from '@/composables/useStatusMapping'
import { useDateFiltering } from '@/composables/useDateFiltering'

// PrimeVue 컴포넌트
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'

// Custom Components
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'

// Composables 초기화
const { isLoading: isLoadingToday, withLoading: withLoadingToday } = useLoading(true)
const { isLoading: isLoadingStats, withLoading: withLoadingStats } = useLoading(true)
const { isLoading: isLoadingRecords, withLoading: withLoadingRecords } = useLoading(true)
const { isLoading: isCheckingIn, withLoading: withCheckingIn } = useLoading()
const { isLoading: isCheckingOut, withLoading: withCheckingOut } = useLoading()

const { showSuccess, showError, withErrorHandling } = useToastNotification()
const { getAttendanceLabel, getAttendanceSeverity } = useStatusMapping()
const {
  startDate: filterStartDate,
  endDate: filterEndDate,
  formattedStartDate,
  formattedEndDate,
} = useDateFiltering('range')

// 오늘 날짜
const today = new Date()

// 오늘 근태 상태
const todayRecord = ref<AttendanceRecord | null>(null)

// 통계 상태
const stats = ref<AttendanceStats | null>(null)

// 기록 상태
const records = ref<AttendanceRecord[]>([])

// 날짜 포맷팅
const formatDate = (date: Date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dayOfWeek = days[date.getDay()]
  return `${format(date, 'yyyy년 MM월 dd일')} (${dayOfWeek})`
}

// 현재 시간 가져오기 (HH:MM:SS)
const getCurrentTime = () => {
  return format(new Date(), 'HH:mm:ss')
}

// 오늘 근태 로드
const loadTodayAttendance = async () => {
  await withLoadingToday(async () => {
    todayRecord.value = await getTodayAttendance()
  })
}

// 통계 로드
const loadStats = async () => {
  await withLoadingStats(async () => {
    stats.value = await getMyAttendanceStats(formattedStartDate.value, formattedEndDate.value)
  })
}

// 기록 로드
const loadRecords = async () => {
  await withLoadingRecords(async () => {
    records.value = await getMyAttendanceRecords(formattedStartDate.value, formattedEndDate.value)
  })
}

// 출근 체크인
const handleCheckIn = async () => {
  await withCheckingIn(async () => {
    const workDate = format(today, 'yyyy-MM-dd')
    const checkInTime = getCurrentTime()

    const result = await withErrorHandling(
      async () => {
        return await checkIn({
          work_date: workDate,
          check_in: checkInTime,
        })
      },
      {
        summary: '출근 체크인 완료',
        detail: `${checkInTime}에 출근하셨습니다.`,
      },
      '출근 체크인 실패',
    )

    if (result) {
      todayRecord.value = result
      // 통계와 기록 새로고침
      await Promise.all([loadStats(), loadRecords()])
    }
  })
}

// 퇴근 체크아웃
const handleCheckOut = async () => {
  await withCheckingOut(async () => {
    const workDate = format(today, 'yyyy-MM-dd')
    const checkOutTime = getCurrentTime()

    const result = await withErrorHandling(
      async () => {
        return await checkOut(workDate, {
          check_out: checkOutTime,
        })
      },
      {
        summary: '퇴근 체크아웃 완료',
        detail: `${checkOutTime}에 퇴근하셨습니다. 수고하셨습니다!`,
      },
      '퇴근 체크아웃 실패',
    )

    if (result) {
      todayRecord.value = result
      // 통계와 기록 새로고침
      await Promise.all([loadStats(), loadRecords()])
    }
  })
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await Promise.all([loadTodayAttendance(), loadStats(), loadRecords()])
})
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
          <StatCard label="총 근무일" :value="`${stats.total_days}일`" />
          <StatCard label="정상 출근" :value="`${stats.present_days}일`" color="success" />
          <StatCard label="지각" :value="`${stats.late_days}일`" color="warning" />
          <StatCard label="조퇴" :value="`${stats.early_leave_days}일`" color="info" />
          <StatCard label="결근" :value="`${stats.absent_days}일`" color="danger" />
          <StatCard
            label="출석률"
            :value="`${stats.attendance_rate.toFixed(1)}%`"
            variant="highlight"
            icon="pi-chart-line"
          />
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
          class="records-table"
        >
          <template #empty> 근태 기록이 없습니다. </template>
          <template #loading> 기록을 불러오는 중입니다... </template>

          <Column
            field="work_date"
            header="날짜"
            :sortable="true"
            style="text-align: center"
          ></Column>
          <Column field="check_in" header="출근 시간" style="text-align: center">
            <template #body="slotProps">
              {{ slotProps.data.check_in || '-' }}
            </template>
          </Column>
          <Column field="check_out" header="퇴근 시간" style="text-align: center">
            <template #body="slotProps">
              {{ slotProps.data.check_out || '-' }}
            </template>
          </Column>
          <Column field="status" header="상태" :sortable="true" style="text-align: center">
            <template #body="slotProps">
              <StatusTag type="attendance" :value="slotProps.data.status" />
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
  margin-top: 10px;
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
  padding-top: 12px;
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

.records-table {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
