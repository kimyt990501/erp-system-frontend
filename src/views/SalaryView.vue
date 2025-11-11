<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { getMySalaryStatements, createSalaryStatement, uploadSalaryPdf } from '@/services/salaryService'
import type { SalaryStatement, SalaryStatementCreate } from '@/types/salary'
import { format } from 'date-fns'

// Composables
import { useLoading } from '@/composables/useLoading'
import { useToastNotification } from '@/composables/useToastNotification'

// PrimeVue 컴포넌트 임포트
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Message from 'primevue/message'
import FileUpload from 'primevue/fileupload'
import Divider from 'primevue/divider'

// Custom Components
import FormGroup from '@/components/FormGroup.vue'

// Composables 초기화
const { isLoading, withLoading } = useLoading(true)
const { isLoading: isSubmitting, withLoading: withSubmitting } = useLoading()
const { isLoading: isUploading, withLoading: withUploading } = useLoading()
const { showWarning, showSuccess, showError, withErrorHandling } = useToastNotification()

// --- 테이블(목록) 관련 상태 ---
const statements = ref<SalaryStatement[]>([])

// --- 폼(입력) 관련 상태 ---
const submitError = ref<string | null>(null)
const newStatement = reactive<{
  pay_month: Date | null
  base_pay: number
  bonus: number
  deductions: number
  net_pay: number
}>({
  pay_month: null,
  base_pay: 0,
  bonus: 0,
  deductions: 0,
  net_pay: 0,
})

watch(
  () => [newStatement.base_pay, newStatement.bonus, newStatement.deductions],
  ([basePay, bonus, deductions]) => {
    // 각 값이 null/undefined일 경우 0을 사용
    const bp = basePay ?? 0
    const bo = bonus ?? 0
    const de = deductions ?? 0

    // 실수령액 자동 계산
    newStatement.net_pay = bp + bo - de
  },
)

// 데이터 로드 함수
const loadStatements = async () => {
  await withLoading(async () => {
    statements.value = await getMySalaryStatements()
  })
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(loadStatements)

// 폼 제출 핸들러
const handleSubmit = async () => {
  submitError.value = null

  // 유효성 검사
  if (!newStatement.pay_month) {
    showWarning('입력 확인', '지급 연월을 선택해주세요.')
    return
  }

  await withSubmitting(async () => {
    const dataToSubmit: SalaryStatementCreate = {
      pay_month: format(newStatement.pay_month!, 'yyyy-MM'),
      base_pay: newStatement.base_pay,
      bonus: newStatement.bonus,
      deductions: newStatement.deductions,
      net_pay: newStatement.net_pay,
    }

    const result = await withErrorHandling(
      async () => await createSalaryStatement(dataToSubmit),
      '급여 명세서 등록 완료',
      '급여 명세서 등록 실패',
    )

    if (result) {
      // 성공 시: 폼 초기화 및 테이블 새로고침
      Object.assign(newStatement, {
        pay_month: null,
        base_pay: 0,
        bonus: 0,
        deductions: 0,
        net_pay: 0,
      })
      await loadStatements()
    }
  })
}

// PDF 업로드 관련 상태
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// PDF 파일 선택 핸들러
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // PDF 파일 검증
  if (file.type !== 'application/pdf') {
    showError('파일 형식 오류', 'PDF 파일만 업로드 가능합니다.')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  selectedFile.value = file
}

// PDF 업로드 핸들러
const handlePdfUpload = async () => {
  if (!selectedFile.value) {
    showWarning('파일 선택', 'PDF 파일을 선택해주세요.')
    return
  }

  await withUploading(async () => {
    try {
      const result = await uploadSalaryPdf(selectedFile.value!)

      showSuccess('업로드 완료', result.message)

      // 파일 입력 초기화
      selectedFile.value = null
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }

      // 목록 새로고침
      await loadStatements()
    } catch (error: any) {
      // 백엔드 에러 메시지 추출
      let errorMessage = '급여명세서 업로드에 실패했습니다.'

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail

        // 백엔드 에러 메시지를 사용자 친화적으로 변환
        if (typeof detail === 'string') {
          if (detail.includes('PDF 파일만')) {
            errorMessage = 'PDF 파일만 업로드 가능합니다.'
          } else if (detail.includes('이미 등록')) {
            errorMessage = detail // 백엔드에서 이미 한글로 제공
          } else if (detail.includes('추출 실패')) {
            errorMessage = 'PDF에서 급여 정보를 읽을 수 없습니다. 파일을 확인해주세요.'
          } else {
            errorMessage = detail
          }
        }
      }

      showError('업로드 실패', errorMessage)

      // 파일 입력 초기화
      selectedFile.value = null
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  })
}

// 파일 선택 취소
const handleClearFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// (Helper) 숫자 포맷팅
const formatCurrency = (value: number) => {
  return value.toLocaleString('ko-KR') + ' 원'
}
</script>

<template>
  <div class="salary-management">
    <Panel header="급여 명세서 입력" class="salary-form-panel">
      <!-- PDF 업로드 섹션 -->
      <div class="pdf-upload-section">
        <h3 class="section-title">
          <i class="pi pi-file-pdf"></i>
          PDF 업로드
        </h3>
        <div class="upload-area">
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf"
            @change="handleFileSelect"
            class="file-input"
            id="pdf-file-input"
          />
          <label for="pdf-file-input" class="file-label">
            <i class="pi pi-cloud-upload"></i>
            <span v-if="!selectedFile">PDF 파일 선택</span>
            <span v-else class="file-name">{{ selectedFile.name }}</span>
          </label>

          <div v-if="selectedFile" class="file-actions">
            <Button
              label="업로드"
              icon="pi pi-upload"
              @click="handlePdfUpload"
              :loading="isUploading"
              class="p-button-success"
            />
            <Button
              label="취소"
              icon="pi pi-times"
              @click="handleClearFile"
              :disabled="isUploading"
              class="p-button-secondary"
            />
          </div>
        </div>
        <p class="upload-hint">
          <i class="pi pi-info-circle"></i>
          PDF에서 급여 정보를 자동으로 추출하여 등록합니다.
        </p>
      </div>

      <Divider />

      <!-- 수동 입력 폼 -->
      <h3 class="section-title">
        <i class="pi pi-pencil"></i>
        직접 입력
      </h3>
      <form @submit.prevent="handleSubmit" class="salary-form">
        <div class="form-group">
          <label for="pay_month">지급 연월</label>
          <Calendar
            id="pay_month"
            v-model="newStatement.pay_month"
            view="month"
            dateFormat="yy-mm"
            placeholder="YYYY-MM"
            required
          />
        </div>
        <div class="form-group">
          <label for="base_pay">기본급</label>
          <InputNumber
            id="base_pay"
            v-model="newStatement.base_pay"
            mode="decimal"
            :useGrouping="false"
            required
          />
        </div>
        <div class="form-group">
          <label for="bonus">상여금</label>
          <InputNumber
            id="bonus"
            v-model="newStatement.bonus"
            mode="decimal"
            :useGrouping="false"
          />
        </div>
        <div class="form-group">
          <label for="deductions">공제액 (세금 등)</label>
          <InputNumber
            id="deductions"
            v-model="newStatement.deductions"
            mode="decimal"
            :useGrouping="false"
          />
        </div>
        <div class="form-group">
          <label for="net_pay">실수령액</label>
          <InputNumber
            id="net_pay"
            v-model="newStatement.net_pay"
            mode="decimal"
            :useGrouping="false"
            required
            readonly
          />
        </div>

        <Button
          type="submit"
          label="입력 완료"
          icon="pi pi-check"
          :loading="isSubmitting"
          class="p-button-primary"
        />
        <Message v-if="submitError" severity="error" :closable="false">
          {{ submitError }}
        </Message>
      </form>
    </Panel>

    <Panel header="급여 내역" class="salary-list-panel">
      <DataTable
        :value="statements"
        :loading="isLoading"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        class="salary-list"
      >
        <template #empty> 입력된 급여 내역이 없습니다. </template>
        <template #loading> 내역을 불러오는 중입니다... </template>

        <Column
          field="pay_month"
          header="지급 연월"
          :sortable="true"
          style="text-align: center"
        ></Column>
        <Column field="base_pay" header="기본급" class="amount-column">
          <template #body="slotProps">{{ formatCurrency(slotProps.data.base_pay) }}</template>
        </Column>
        <Column field="bonus" header="상여금" class="amount-column">
          <template #body="slotProps">{{ formatCurrency(slotProps.data.bonus) }}</template>
        </Column>
        <Column field="deductions" header="공제액" class="amount-column">
          <template #body="slotProps">{{ formatCurrency(slotProps.data.deductions) }}</template>
        </Column>
        <Column field="net_pay" header="실수령액" :sortable="true" class="amount-column">
          <template #body="slotProps">
            <strong class="net-pay-highlight">{{ formatCurrency(slotProps.data.net_pay) }}</strong>
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<style scoped>
.salary-management {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

/* 왼쪽 입력 폼 */
.salary-form-panel {
  flex: 0 0 450px; /* 450px 고정 너비 (PDF 업로드 공간 포함) */
}

/* 섹션 제목 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64ffda;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
  margin-top: 0;
}

/* PDF 업로드 섹션 */
.pdf-upload-section {
  margin-bottom: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1d29 0%, #242938 100%);
  border: 2px dashed #2d3348;
  border-radius: 8px;
  color: #a8b2d1;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-label:hover {
  border-color: #64ffda;
  background: linear-gradient(135deg, #242938 0%, #2d3348 100%);
  color: #64ffda;
}

.file-label i {
  font-size: 1.5rem;
}

.file-name {
  color: #64ffda;
  font-weight: 600;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.file-actions :deep(.p-button) {
  flex: 1;
}

.upload-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #a8b2d1;
  margin: 8px 0 0 0;
  padding: 8px;
  background-color: rgba(100, 255, 218, 0.05);
  border-radius: 4px;
}

.upload-hint i {
  color: #64ffda;
}

/* 오른쪽 목록 테이블 */
.salary-list-panel {
  flex: 1; /* 남은 공간 모두 차지 */
}

/* 모바일: 세로 배치 */
@media (max-width: 768px) {
  .salary-management {
    flex-direction: column;
  }

  .salary-form-panel {
    flex: 1 1 100%; /* 전체 너비 사용 */
    width: 100%;
  }

  .salary-list-panel {
    flex: 1 1 100%;
    width: 100%;
  }

  .file-label {
    padding: 15px;
    font-size: 0.9rem;
  }

  .file-actions {
    flex-direction: column;
  }

  .file-actions :deep(.p-button) {
    width: 100%;
  }
}

/* 태블릿: 좁은 화면 대응 */
@media (min-width: 769px) and (max-width: 1024px) {
  .salary-form-panel {
    flex: 0 0 380px; /* 너비 줄임 */
  }
}

/* 폼 그룹 스타일 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.form-group label {
  font-weight: 500;
}
:deep(.p-inputnumber),
:deep(.p-calendar) {
  width: 100%;
}
:deep(.p-button) {
  width: 100%;
  margin-top: 10px;
}
:deep(.p-message) {
  margin-top: 15px;
  width: 100%;
}

/* 금액 컬럼 우측 정렬 */
:deep(.amount-column) {
  text-align: right;
}

/* 실수령액 강조 */
.net-pay-highlight {
  color: #64ffda;
  font-size: 1.05rem;
  font-weight: 700;
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

/* 폼 입력 필드 다크 테마 */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-calendar-input) {
  background-color: #1a1d29;
  border: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-inputtext:enabled:hover),
:deep(.p-inputnumber-input:enabled:hover) {
  border-color: #64ffda;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-inputnumber-input:enabled:focus) {
  border-color: #64ffda;
  box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2);
}

.form-group label {
  color: #a8b2d1;
}

.salary-form {
  margin-top: 20px;
}

.salary-list {
  margin-top: 20px;
}
</style>
