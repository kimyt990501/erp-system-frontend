<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { getMyLeaveBalance, getMyLeaveRequests, createLeaveRequest } from '@/services/leaveService'
import type { LeaveBalance, LeaveRequest, LeaveRequestCreate } from '@/types/leave'
import { format, differenceInCalendarDays } from 'date-fns'

// Composables
import { useLoading } from '@/composables/useLoading'
import { useToastNotification } from '@/composables/useToastNotification'
import { useStatusMapping } from '@/composables/useStatusMapping'

// PrimeVue 컴포넌트 임포트
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

// Custom Components
import StatusTag from '@/components/StatusTag.vue'
import MessageBox from '@/components/MessageBox.vue'
import FormGroup from '@/components/FormGroup.vue'

// Composables 초기화
const { isLoading: isLoadingBalance, withLoading: withLoadingBalance } = useLoading(true)
const { isLoading: isLoadingRequests, withLoading: withLoadingRequests } = useLoading(true)
const { isLoading: isSubmitting, withLoading: withSubmitting } = useLoading()
const { showSuccess, withErrorHandling } = useToastNotification()
const { getLeaveLabel, getLeaveSeverity } = useStatusMapping()

// 연차 현황 (Balance) 상태
const balance = ref<LeaveBalance | null>(null)
const balanceError = ref(false)

// 연차 신청 내역 (Requests) 상태
const requests = ref<LeaveRequest[]>([])

// 연차 신청 폼 상태
const newRequest = reactive<{ start_date: Date | null; end_date: Date | null; reason: string }>({
  start_date: null,
  end_date: null,
  reason: '',
})
const validationError = ref<string | null>(null)

// 신청 일수 계산
const calculatedDays = computed(() => {
  if (!newRequest.start_date || !newRequest.end_date) return 0
  const days = differenceInCalendarDays(newRequest.end_date, newRequest.start_date) + 1
  return days > 0 ? days : 0
})

// 제출 가능 여부
const canSubmit = computed(() => {
  return (
    newRequest.start_date &&
    newRequest.end_date &&
    calculatedDays.value > 0 &&
    !validationError.value
  )
})

// 유효성 검사
watch([() => newRequest.start_date, () => newRequest.end_date, balance], () => {
  validationError.value = null

  if (!newRequest.start_date || !newRequest.end_date) return

  // 1. 종료일이 시작일보다 빠른 경우
  if (newRequest.end_date < newRequest.start_date) {
    validationError.value = '종료일은 시작일 이후여야 합니다.'
    return
  }

  // 2. 신청 일수가 남은 연차보다 많은 경우
  if (balance.value && calculatedDays.value > balance.value.remaining_days) {
    validationError.value = `남은 연차(${balance.value.remaining_days}일)보다 많이 신청할 수 없습니다.`
    return
  }
})

// 데이터 로드 함수
const loadBalance = async () => {
  await withLoadingBalance(async () => {
    try {
      balance.value = await getMyLeaveBalance()
      balanceError.value = false
    } catch (error) {
      console.error('Failed to fetch leave balance:', error)
      balanceError.value = true
    }
  })
}

const loadRequests = async () => {
  await withLoadingRequests(async () => {
    const result = await getMyLeaveRequests()
    requests.value = result || []
  })
}

// 컴포넌트가 마운트(생성)될 때 API 호출
onMounted(async () => {
  await Promise.all([loadBalance(), loadRequests()])
})

// 폼 제출 핸들러
const handleSubmit = async () => {
  if (!canSubmit.value) return

  await withSubmitting(async () => {
    const dataToSubmit: LeaveRequestCreate = {
      start_date: format(newRequest.start_date!, 'yyyy-MM-dd'),
      end_date: format(newRequest.end_date!, 'yyyy-MM-dd'),
      days_used: calculatedDays.value,
      reason: newRequest.reason || null,
    }

    const result = await withErrorHandling(
      async () => await createLeaveRequest(dataToSubmit),
      '연차 신청 완료',
      '연차 신청 실패',
    )

    if (result) {
      // 성공 시: 폼 초기화 및 데이터 새로고침
      Object.assign(newRequest, {
        start_date: null,
        end_date: null,
        reason: '',
      })

      await Promise.all([loadBalance(), loadRequests()])
    }
  })
}
</script>

<template>
  <div class="leave-management">
    <div class="left-column">
      <!-- 연차 현황 -->
      <Panel header="내 연차 현황" class="leave-balance-panel">
        <div v-if="isLoadingBalance" class="balance-details">
          <div>
            <Skeleton height="1rem" width="70%" class="mb-2"></Skeleton>
            <Skeleton height="1.5rem" width="50%"></Skeleton>
          </div>
          <div>
            <Skeleton height="1rem" width="70%" class="mb-2"></Skeleton>
            <Skeleton height="1.5rem" width="50%"></Skeleton>
          </div>
          <div>
            <Skeleton height="1rem" width="70%" class="mb-2"></Skeleton>
            <Skeleton height="1.5rem" width="50%"></Skeleton>
          </div>
        </div>
        <div v-else-if="balanceError" class="error-message">
          연차 현황을 불러오는 데 실패했습니다.
        </div>
        <div v-else-if="balance" class="balance-details">
          <div>
            <strong>총 부여된 연차</strong>
            <span>{{ balance.total_granted }} 일</span>
          </div>
          <div>
            <strong>총 사용한 연차</strong>
            <span>{{ balance.total_used }} 일</span>
          </div>
          <div class="remaining">
            <strong>남은 연차</strong>
            <span>{{ balance.remaining_days }} 일</span>
          </div>
        </div>
      </Panel>

      <!-- 연차 신청 폼 -->
      <Panel header="연차 신청" class="leave-request-form-panel">
        <form @submit.prevent="handleSubmit" class="leave-request-form">
          <div class="form-group">
            <label for="start_date">시작일 <span class="required">*</span></label>
            <Calendar
              id="start_date"
              v-model="newRequest.start_date"
              dateFormat="yy-mm-dd"
              placeholder="시작일 선택"
              :minDate="new Date()"
              required
            />
          </div>
          <div class="form-group">
            <label for="end_date">종료일 <span class="required">*</span></label>
            <Calendar
              id="end_date"
              v-model="newRequest.end_date"
              dateFormat="yy-mm-dd"
              placeholder="종료일 선택"
              :minDate="newRequest.start_date || new Date()"
              required
            />
          </div>
          <div class="form-group">
            <label for="reason">사유</label>
            <Textarea
              id="reason"
              v-model="newRequest.reason"
              rows="3"
              placeholder="연차 사유를 입력하세요 (선택)"
            />
          </div>

          <MessageBox v-if="calculatedDays > 0" severity="info">
            신청 일수: <strong>{{ calculatedDays }}일</strong>
          </MessageBox>

          <MessageBox v-if="validationError" severity="warn" :message="validationError" />

          <Button
            type="submit"
            label="연차 신청하기"
            icon="pi pi-send"
            :loading="isSubmitting"
            class="p-button-primary submit-button"
            :disabled="!canSubmit"
          />
        </form>
      </Panel>
    </div>

    <!-- 연차 신청 내역 -->
    <Panel header="연차 신청 내역" class="leave-requests-panel">
      <DataTable
        :value="requests"
        :loading="isLoadingRequests"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        class="leave-requests-table"
      >
        <template #empty> 연차 신청 내역이 없습니다. </template>
        <template #loading> 내역을 불러오는 중입니다... </template>

        <Column field="start_date" header="시작일" :sortable="true"></Column>
        <Column field="end_date" header="종료일" :sortable="true"></Column>
        <Column field="days_used" header="사용 일수" style="text-align: center"></Column>
        <Column field="reason" header="사유"></Column>
        <Column field="status" header="상태" :sortable="true" style="text-align: center">
          <template #body="slotProps">
            <StatusTag type="leave" :value="slotProps.data.status" />
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<style scoped>
.leave-management {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

/* 왼쪽 컬럼 (연차 현황 + 신청 폼) */
.left-column {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 연차 현황 패널 */
.leave-balance-panel {
  width: 100%;
}

/* 연차 신청 폼 패널 */
.leave-request-form-panel {
  width: 100%;
}

/* 연차 신청 내역 패널 (오른쪽) */
.leave-requests-panel {
  flex: 1;
}

/* 모바일: 세로 배치 */
@media (max-width: 768px) {
  .leave-management {
    flex-direction: column;
  }

  .left-column {
    flex: 1 1 100%;
    width: 100%;
  }

  .leave-balance-panel,
  .leave-request-form-panel {
    flex: 1 1 100%;
    width: 100%;
  }

  .leave-requests-panel {
    flex: 1 1 100%;
    width: 100%;
  }
}

/* 태블릿: 좁은 화면 대응 */
@media (min-width: 769px) and (max-width: 1024px) {
  .left-column {
    flex: 0 0 320px;
  }
}

/* --- 연차 현황 스타일 --- */
.leave-balance-panel .balance-details {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-top: 1rem;
}
.balance-details div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.balance-details .remaining strong,
.balance-details .remaining span {
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
}

/* --- 연차 신청 폼 스타일 --- */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  color: #a8b2d1;
  font-size: 0.9rem;
}

.required {
  color: #ff6b6b;
}

:deep(.p-calendar),
:deep(.p-inputtextarea) {
  width: 100%;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(100, 255, 218, 0.1);
  border-left: 3px solid #64ffda;
  color: #64ffda;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.info-message i {
  font-size: 1.2rem;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(255, 107, 107, 0.1);
  border-left: 3px solid #ff6b6b;
  color: #ff6b6b;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.validation-error i {
  font-size: 1.2rem;
}

.submit-button {
  width: 100%;
  margin-top: 0.5rem;
}

/* 패널 다크 테마 */
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

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #ff6b6b;
}

/* 테이블 전체 스타일 */
:deep(.p-datatable) {
  background-color: #242938;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3348;
}

/* 테이블 헤더 스타일 */
:deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(180deg, #2d3348 0%, #242938 100%);
  font-weight: 600;
  color: #a8b2d1;
  border-bottom: 2px solid #64ffda;
  padding: 12px 16px;
}

/* Striped rows - 다크 테마 */
:deep(.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #1f2230;
}

/* 기본 행 배경 */
:deep(.p-datatable-tbody > tr) {
  background-color: #242938;
  border-bottom: 1px solid #2d3348;
  color: #e1e4e8;
}

/* 호버 효과 - 청록색 강조 */
:deep(.p-datatable-tbody > tr:hover) {
  background-color: rgba(100, 255, 218, 0.1) !important;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* 테이블 텍스트 색상 */
:deep(.p-datatable-tbody > tr > td) {
  color: #e1e4e8;
}

/* Skeleton 다크 테마 */
:deep(.p-skeleton) {
  background-color: #2d3348;
}

:deep(.p-skeleton::after) {
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
}

/* Calendar 다크 테마 */
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

/* Textarea 다크 테마 */
:deep(.p-inputtextarea) {
  background-color: #1a1d29;
  border: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-inputtextarea:enabled:hover) {
  border-color: #64ffda;
}

:deep(.p-inputtextarea:enabled:focus) {
  border-color: #64ffda;
  box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2);
}

.leave-request-form {
  margin-top: 1rem;
}

.leave-requests-table {
  margin-top: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
