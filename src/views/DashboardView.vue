<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { format, startOfMonth, endOfMonth } from 'date-fns';
  import type { LeaveBalance } from '@/types/leave';
  import type { SalaryStatement } from '@/types/salary';
  import type { AttendanceRecord, AttendanceStats } from '@/types/attendance';
  import { getMyLeaveBalance } from '@/services/leaveService';
  import { getMyLatestSalaryStatement } from '@/services/salaryService';
  import { getTodayAttendance, getMyAttendanceStats } from '@/services/attendanceService';

  // PrimeVue 컴포넌트 임포트
  import Card from 'primevue/card';
  import Button from 'primevue/button';
  import Skeleton from 'primevue/skeleton';

  const router = useRouter();

  // --- 상태 정의 ---
  const balance = ref<LeaveBalance | null>(null);
  const isLoadingBalance = ref(true);

  const latestSalary = ref<SalaryStatement | null>(null);
  const isLoadingSalary = ref(true);

  const todayAttendance = ref<AttendanceRecord | null>(null);
  const monthlyStats = ref<AttendanceStats | null>(null);
  const isLoadingAttendance = ref(true);
  
  // --- 데이터 로드 ---
  onMounted(async () => {
  // 1. 근태 정보 로드
  try {
    isLoadingAttendance.value = true;
    todayAttendance.value = await getTodayAttendance();

    // 이번 달 통계
    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(today), 'yyyy-MM-dd');
    monthlyStats.value = await getMyAttendanceStats(startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    todayAttendance.value = null;
    monthlyStats.value = null;
  } finally {
    isLoadingAttendance.value = false;
  }

  // 2. 연차 현황 로드
  try {
    isLoadingBalance.value = true;
    balance.value = await getMyLeaveBalance();
  } catch (error) {
    console.error('Failed to fetch leave balance:', error);
    balance.value = null;
  } finally {
    isLoadingBalance.value = false;
  }

  // 3. 급여 내역 로드
  try {
    isLoadingSalary.value = true;
    latestSalary.value = await getMyLatestSalaryStatement();
  } catch (error) {
    console.error('Failed to fetch salary statements:', error);
    latestSalary.value = null;
  } finally {
    isLoadingSalary.value = false;
  }
});
  
  // --- 헬퍼 함수 ---
  
  // (Helper) 라우터 이동 함수
  const goTo = (path: string) => {
    router.push(path);
  };
  
  // (Helper) 숫자 포맷팅
  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return '0 원';
    return value.toLocaleString('ko-KR') + ' 원';
  };
</script>


<template>
  <div class="dashboard-grid">
    <!-- 근태 카드 -->
    <div class="erp-card">
      <div class="card-header">
        <div class="card-title">
          <div class="icon-wrapper attendance-icon">
            <i class="pi pi-clock"></i>
          </div>
          <span>오늘의 근태</span>
        </div>
        <Button icon="pi pi-arrow-right" text rounded @click="goTo('/attendance')" />
      </div>
      
      <div class="card-body">
        <div v-if="isLoadingAttendance" class="loading-state">
          <Skeleton height="2rem" class="mb-2"></Skeleton>
          <Skeleton height="2rem" class="mb-2"></Skeleton>
        </div>
        <div v-else class="attendance-content">
          <div class="time-row">
            <span class="label">출근</span>
            <span :class="['value', todayAttendance?.check_in ? 'recorded' : '']">
              {{ todayAttendance?.check_in || '--:--' }}
            </span>
          </div>
          <div class="time-row">
            <span class="label">퇴근</span>
            <span :class="['value', todayAttendance?.check_out ? 'recorded' : '']">
              {{ todayAttendance?.check_out || '--:--' }}
            </span>
          </div>
          
          <div v-if="monthlyStats" class="stats-footer">
            <div class="stat-pill">
              <span>이번 달 출석률</span>
              <strong>{{ monthlyStats.attendance_rate.toFixed(1) }}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 연차 카드 -->
    <div class="erp-card">
      <div class="card-header">
        <div class="card-title">
          <div class="icon-wrapper leave-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <span>내 연차 현황</span>
        </div>
        <Button icon="pi pi-arrow-right" text rounded @click="goTo('/leave')" />
      </div>
      
      <div class="card-body center-content">
        <div v-if="isLoadingBalance" class="loading-state">
          <Skeleton height="3rem" class="mb-2"></Skeleton>
          <Skeleton height="1rem" width="60%"></Skeleton>
        </div>
        <div v-else-if="balance" class="balance-content">
          <div class="big-number">{{ balance.remaining_days }}<span class="unit">일</span></div>
          <div class="sub-text">남음</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: (balance.total_used / balance.total_granted * 100) + '%' }"></div>
          </div>
          <small class="detail-text">총 {{ balance.total_granted }}일 중 {{ balance.total_used }}일 사용</small>
        </div>
        <div v-else class="error-text">정보 없음</div>
      </div>
    </div>

    <!-- 급여 카드 -->
    <div class="erp-card">
      <div class="card-header">
        <div class="card-title">
          <div class="icon-wrapper salary-icon">
            <i class="pi pi-wallet"></i>
          </div>
          <span>최근 급여</span>
        </div>
        <Button icon="pi pi-arrow-right" text rounded @click="goTo('/salary')" />
      </div>
      
      <div class="card-body center-content">
        <div v-if="isLoadingSalary" class="loading-state">
          <Skeleton height="1rem" width="40%" class="mb-2"></Skeleton>
          <Skeleton height="2.5rem"></Skeleton>
        </div>
        <div v-else-if="latestSalary" class="salary-content">
          <div class="month-badge">{{ latestSalary.pay_month }} 지급분</div>
          <div class="salary-amount">{{ formatCurrency(latestSalary.net_pay) }}</div>
          <div class="salary-detail">
            <span>기본급</span>
            <span>{{ formatCurrency(latestSalary.base_pay) }}</span>
          </div>
        </div>
        <div v-else class="info-text">내역 없음</div>
      </div>
    </div>

    </div>
</template>

<style scoped>
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  /* ERP Card Style */
  .erp-card {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-100);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .erp-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: var(--primary-500);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-wrapper i {
    font-size: 1.2rem;
  }

  .attendance-icon {
    background-color: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  .leave-icon {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  .salary-icon {
    background-color: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .center-content {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* Attendance Styles */
  .time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--surface-0);
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--surface-100);
  }

  .time-row .label {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
  }

  .time-row .value {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text-color-secondary);
  }

  .time-row .value.recorded {
    color: var(--primary-500);
  }

  .stats-footer {
    margin-top: auto;
    padding-top: 12px;
  }

  .stat-pill {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--surface-0);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .stat-pill strong {
    color: var(--primary-500);
  }

  /* Leave Balance Styles */
  .big-number {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1;
  }

  .unit {
    font-size: 1.2rem;
    margin-left: 4px;
    color: var(--text-color-secondary);
  }

  .sub-text {
    color: var(--text-color-secondary);
    margin-bottom: 16px;
  }

  .progress-bar-bg {
    width: 100%;
    height: 8px;
    background-color: var(--surface-100);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: var(--primary-500);
    border-radius: 4px;
  }

  .detail-text {
    color: var(--text-color-secondary);
  }

  /* Salary Styles */
  .month-badge {
    background-color: var(--surface-100);
    color: var(--text-color-secondary);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    margin-bottom: 12px;
  }

  .salary-amount {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 16px;
  }

  .salary-detail {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    background-color: var(--surface-0);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .loading-state {
    width: 100%;
  }

  .mb-2 { margin-bottom: 0.5rem; }
</style>