<template>
    <div class="dashboard-grid">
      <!-- 근태 카드 -->
      <Card class="info-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-clock"></i>
            <span>오늘의 근태</span>
          </div>
        </template>
        <template #content>
          <div v-if="isLoadingAttendance" class="attendance-content">
            <Skeleton height="2rem" class="mb-2"></Skeleton>
            <Skeleton height="2rem" class="mb-2"></Skeleton>
            <Skeleton height="1.5rem" width="60%" class="mx-auto"></Skeleton>
          </div>
          <div v-else class="attendance-content">
            <div class="attendance-time-row">
              <span class="time-label">출근</span>
              <span :class="['time-value', todayAttendance?.check_in ? 'recorded' : 'not-recorded']">
                {{ todayAttendance?.check_in || '--:--' }}
              </span>
            </div>
            <div class="attendance-time-row">
              <span class="time-label">퇴근</span>
              <span :class="['time-value', todayAttendance?.check_out ? 'recorded' : 'not-recorded']">
                {{ todayAttendance?.check_out || '--:--' }}
              </span>
            </div>
            <div v-if="monthlyStats" class="attendance-stats">
              <small>이번 달 출석률: <strong>{{ monthlyStats.attendance_rate.toFixed(1) }}%</strong></small>
            </div>
          </div>
        </template>
        <template #footer>
          <Button
            label="근태 관리"
            icon="pi pi-arrow-right"
            class="p-button-outlined"
            @click="goTo('/attendance')"
          />
        </template>
      </Card>

      <!-- 연차 카드 -->
      <Card class="info-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-calendar"></i>
            <span>내 연차 현황</span>
          </div>
        </template>
        <template #content>
          <div v-if="isLoadingBalance" class="balance-content">
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="1.5rem" width="60%" class="mx-auto mb-2"></Skeleton>
            <Skeleton height="1rem" width="80%" class="mx-auto"></Skeleton>
          </div>
          <div v-else-if="balance" class="balance-content">
            <div class="balance-days">{{ balance.remaining_days }}</div>
            <div class="balance-unit">일 남음</div>
            <small>(총 {{ balance.total_granted }}일 중 {{ balance.total_used }}일 사용)</small>
          </div>
          <div v-else class="error-text">연차 정보를 불러오지 못했습니다.</div>
        </template>
        <template #footer>
          <Button
            label="연차 신청/내역 보기"
            icon="pi pi-arrow-right"
            class="p-button-outlined"
            @click="goTo('/leave')"
          />
        </template>
      </Card>

      <!-- 급여 카드 -->
      <Card class="info-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-wallet"></i>
            <span>최근 급여 명세서</span>
          </div>
        </template>
        <template #content>
          <div v-if="isLoadingSalary" class="salary-content">
            <Skeleton height="1.5rem" width="50%" class="mx-auto mb-2"></Skeleton>
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="1rem" width="60%" class="mx-auto"></Skeleton>
          </div>
          <div v-else-if="latestSalary" class="salary-content">
            <div class="salary-month">{{ latestSalary.pay_month }} 지급</div>
            <div class="salary-netpay">{{ formatCurrency(latestSalary.net_pay) }}</div>
            <small>(기본급 {{ formatCurrency(latestSalary.base_pay) }})</small>
          </div>
          <div v-else class="info-text">입력된 급여 내역이 없습니다.</div>
        </template>
        <template #footer>
          <Button
            label="급여 입력/내역 보기"
            icon="pi pi-arrow-right"
            class="p-button-outlined"
            @click="goTo('/salary')"
          />
        </template>
      </Card>

      </div>
  </template>
  
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
  
  <style scoped>
  .dashboard-grid {
    display: grid;
    /* 반응형: 최소 300px, 자동으로 열 개수 조정 */
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  /* 모바일: 1열 레이아웃 */
  @media (max-width: 640px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  /* 태블릿: 2열 레이아웃 */
  @media (min-width: 641px) and (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .info-card {
    /* 카드가 그리드 셀을 꽉 채우도록 */
    height: 100%;
  }
  
  .card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.25rem;
  }
  
  :deep(.p-card-content) {
    padding-top: 0;
    padding-bottom: 0;
  }
  
  .balance-content, .salary-content {
    text-align: center;
    padding: 10px 0;
  }

  .attendance-content {
    padding: 10px 0;
  }

  .attendance-time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    margin-bottom: 8px;
    background-color: #1a1d29;
    border-radius: 6px;
    border: 1px solid #2d3348;
  }

  .time-label {
    color: #a8b2d1;
    font-weight: 500;
  }

  .time-value {
    font-size: 1.3rem;
    font-weight: 700;
  }

  .time-value.recorded {
    color: #64ffda;
  }

  .time-value.not-recorded {
    color: #6c757d;
  }

  .attendance-stats {
    text-align: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #2d3348;
  }

  .attendance-stats strong {
    color: #64ffda;
    font-size: 1.1rem;
  }

  .balance-days, .salary-netpay {
    font-size: 2.5rem;
    font-weight: 600;
    color: #64ffda;
    margin: 10px 0;
    text-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
  }
  
  .salary-month {
    font-size: 1rem;
    font-weight: 500;
    color: var(--p-text-color-secondary);
  }
  
  .info-text, .error-text {
    text-align: center;
    padding: 20px;
    color: var(--p-text-color-secondary);
  }
  
  :deep(.p-card-footer) {
    text-align: center;
  }
  :deep(.p-button-outlined) {
    width: 90%;
  }

  /* 카드 다크 테마 */
  :deep(.p-card) {
    background-color: #242938;
    border: 1px solid #2d3348;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    color: #e1e4e8;
  }

  :deep(.p-card .p-card-title) {
    color: #a8b2d1;
  }

  :deep(.p-card .p-card-content) {
    color: #e1e4e8;
  }

  :deep(.p-card .p-card-footer) {
    border-top: 1px solid #2d3348;
  }

  /* Skeleton 다크 테마 */
  :deep(.p-skeleton) {
    background-color: #2d3348;
  }

  :deep(.p-skeleton::after) {
    background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  </style>