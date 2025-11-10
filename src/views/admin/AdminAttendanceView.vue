<script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  import { format } from 'date-fns';
  import { FilterMatchMode } from '@primevue/core/api';
  import {
    getAllAttendanceRecords,
    createAttendanceForUser
  } from '@/services/attendanceService';
  import { getAllUsers } from '@/services/adminService';
  import type { AdminAttendanceRecord, AttendanceStatus } from '@/types/attendance';
  import type { User } from '@/types/user';

  // Composables
  import { useLoading } from '@/composables/useLoading';
  import { useToastNotification } from '@/composables/useToastNotification';
  import { useStatusMapping } from '@/composables/useStatusMapping';
  import { useDateFiltering } from '@/composables/useDateFiltering';

  // PrimeVue 컴포넌트
  import Panel from 'primevue/panel';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Calendar from 'primevue/calendar';
  import Tag from 'primevue/tag';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Textarea from 'primevue/textarea';
  import InputMask from 'primevue/inputmask';

  // Custom Components
  import StatusTag from '@/components/StatusTag.vue';
  import StatCard from '@/components/StatCard.vue';

  // Composables 초기화
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isCreating, withLoading: withCreating } = useLoading();
  const { showWarning, showError, withErrorHandling } = useToastNotification();
  const { getAttendanceLabel, getAttendanceSeverity, getAttendanceOptions } = useStatusMapping();
  const {
    filterMode,
    selectedDate: singleDate,
    startDate,
    endDate,
    formattedDate,
    formattedStartDate,
    formattedEndDate,
    setFilterMode,
  } = useDateFiltering('single');

  // 상태
  const records = ref<AdminAttendanceRecord[]>([]);
  const users = ref<User[]>([]);

  // 필터 타입 (useDateFiltering의 filterMode와 동기화)
  const filterType = filterMode;

  // 테이블 필터
  const filters = ref({
    user_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user_email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
  });

  // 상태 옵션 (composable에서 가져오기)
  const statusOptions = getAttendanceOptions();

  // 새 기록 폼
  const newRecord = reactive<{
    user_id: number | null;
    work_date: Date | null;
    check_in: string;
    check_out: string;
    status: AttendanceStatus;
    notes: string;
  }>({
    user_id: null,
    work_date: null,
    check_in: '',
    check_out: '',
    status: 'present',
    notes: ''
  });

  // 사용자 목록 로드
  const loadUsers = async () => {
    await withErrorHandling(
      async () => {
        users.value = await getAllUsers();
      },
      undefined,
      '사용자 목록 로드 실패',
      { showSuccessToast: false }
    );
  };

  // 근태 기록 로드
  const loadRecords = async () => {
    await withLoading(async () => {
      if (filterType.value === 'single' && singleDate.value) {
        records.value = await getAllAttendanceRecords(formattedDate.value);
      } else if (filterType.value === 'range' && startDate.value && endDate.value) {
        records.value = await getAllAttendanceRecords(undefined, formattedStartDate.value, formattedEndDate.value);
      } else {
        showWarning('날짜 선택 필요', '조회할 날짜를 선택해주세요.');
        return;
      }
    });
  };

  // 근태 기록 생성
  const handleCreate = async () => {
    // 유효성 검사
    if (!newRecord.user_id || !newRecord.work_date) {
      showWarning('입력 확인', '필수 항목을 모두 입력해주세요.');
      return;
    }

    await withCreating(async () => {
      const result = await withErrorHandling(
        async () => {
          return await createAttendanceForUser(newRecord.user_id!, {
            work_date: format(newRecord.work_date!, 'yyyy-MM-dd'),
            check_in: newRecord.check_in,
            check_out: newRecord.check_out || null,
            status: newRecord.status,
            notes: newRecord.notes || null
          });
        },
        '근태 기록 생성 완료',
        '근태 기록 생성 실패'
      );

      if (result) {
        // 폼 초기화
        Object.assign(newRecord, {
          user_id: null,
          work_date: null,
          check_in: '',
          check_out: '',
          status: 'present',
          notes: ''
        });

        // 기록 새로고침
        await loadRecords();
      }
    });
  };

  // 상태별 개수
  const getStatusCount = (status: AttendanceStatus) => {
    return records.value.filter(r => r.status === status).length;
  };

  // 컴포넌트 마운트
  onMounted(async () => {
    await Promise.all([loadUsers(), loadRecords()]);
  });
</script>

<template>
  <div class="admin-attendance">
    <h2 class="page-title">전체 직원 근태 관리</h2>

    <!-- 조회 필터 -->
    <Panel header="조회 필터" class="filter-panel">
      <div class="filter-content">
        <div class="filter-group">
          <label>조회 기준</label>
          <div class="radio-group">
            <label>
              <input type="radio" value="single" v-model="filterType" />
              <span>특정 날짜</span>
            </label>
            <label>
              <input type="radio" value="range" v-model="filterType" />
              <span>기간</span>
            </label>
          </div>
        </div>

        <div v-if="filterType === 'single'" class="filter-group">
          <label>날짜</label>
          <Calendar
            v-model="singleDate"
            dateFormat="yy-mm-dd"
            placeholder="날짜 선택"
            :maxDate="new Date()"
          />
        </div>

        <div v-else class="filter-group-range">
          <div class="filter-group">
            <label>시작일</label>
            <Calendar
              v-model="startDate"
              dateFormat="yy-mm-dd"
              placeholder="시작일"
              :maxDate="endDate || new Date()"
            />
          </div>
          <div class="filter-group">
            <label>종료일</label>
            <Calendar
              v-model="endDate"
              dateFormat="yy-mm-dd"
              placeholder="종료일"
              :minDate="startDate"
              :maxDate="new Date()"
            />
          </div>
        </div>

        <Button
          label="조회"
          icon="pi pi-search"
          @click="loadRecords"
          :loading="isLoading"
          class="search-button"
        />
      </div>
    </Panel>

    <!-- 전체 근태 현황 -->
    <Panel header="전체 근태 현황" class="records-panel">
      <DataTable
        :value="records"
        :loading="isLoading"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :paginator="true"
        :rows="20"
        filterDisplay="row"
        v-model:filters="filters"
      >
        <template #empty> 근태 기록이 없습니다. </template>
        <template #loading> 기록을 불러오는 중입니다... </template>

        <Column field="user_name" header="이름" :sortable="true" style="min-width: 120px;">
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="이름 검색"
              class="p-column-filter"
            />
          </template>
        </Column>

        <Column field="user_email" header="이메일" :sortable="true" style="min-width: 200px;">
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="이메일 검색"
              class="p-column-filter"
            />
          </template>
        </Column>

        <Column field="work_date" header="날짜" :sortable="true" style="text-align: center; min-width: 120px;"></Column>

        <Column field="check_in" header="출근 시간" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            {{ slotProps.data.check_in || '-' }}
          </template>
        </Column>

        <Column field="check_out" header="퇴근 시간" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            {{ slotProps.data.check_out || '-' }}
          </template>
        </Column>

        <Column field="status" header="상태" :sortable="true" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            <StatusTag type="attendance" :value="slotProps.data.status" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="전체"
              class="p-column-filter"
              :showClear="true"
            />
          </template>
        </Column>

        <Column field="notes" header="비고" style="min-width: 150px;">
          <template #body="slotProps">
            {{ slotProps.data.notes || '-' }}
          </template>
        </Column>
      </DataTable>

      <!-- 통계 요약 -->
      <div v-if="records.length > 0" class="summary-stats">
        <div class="stat-card">
          <span class="stat-label">총 기록</span>
          <span class="stat-value">{{ records.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">정상 출근</span>
          <span class="stat-value present">{{ getStatusCount('present') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">지각</span>
          <span class="stat-value late">{{ getStatusCount('late') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">조퇴</span>
          <span class="stat-value early-leave">{{ getStatusCount('early_leave') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">결근</span>
          <span class="stat-value absent">{{ getStatusCount('absent') }}</span>
        </div>
      </div>
    </Panel>

    <!-- 근태 수동 입력 -->
    <Panel header="근태 수동 입력" class="create-panel">
      <form @submit.prevent="handleCreate" class="create-form">
        <div class="form-row">
          <div class="form-group">
            <label>직원 선택 <span class="required">*</span></label>
            <Dropdown
              v-model="newRecord.user_id"
              :options="users"
              optionLabel="name"
              optionValue="id"
              placeholder="직원을 선택하세요"
              :filter="true"
              filterPlaceholder="이름 또는 이메일 검색"
              required
            >
              <template #option="slotProps">
                <div>
                  <div><strong>{{ slotProps.option.name }}</strong></div>
                  <div style="font-size: 0.85rem; color: #a8b2d1;">{{ slotProps.option.email }}</div>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="form-group">
            <label>날짜 <span class="required">*</span></label>
            <Calendar
              v-model="newRecord.work_date"
              dateFormat="yy-mm-dd"
              placeholder="YYYY-MM-DD"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>출근 시간 <span class="required">*</span></label>
            <InputMask
              v-model="newRecord.check_in"
              mask="99:99:99"
              placeholder="HH:MM:SS"
              required
            />
          </div>

          <div class="form-group">
            <label>퇴근 시간</label>
            <InputMask
              v-model="newRecord.check_out"
              mask="99:99:99"
              placeholder="HH:MM:SS"
            />
          </div>

          <div class="form-group">
            <label>상태 <span class="required">*</span></label>
            <Dropdown
              v-model="newRecord.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="상태 선택"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>비고</label>
          <Textarea
            v-model="newRecord.notes"
            rows="2"
            placeholder="비고 사항 입력 (선택)"
          />
        </div>

        <Button
          type="submit"
          label="근태 기록 생성"
          icon="pi pi-plus"
          :loading="isCreating"
          class="p-button-success submit-button"
        />
      </form>
    </Panel>
  </div>
</template>

<style scoped>
.admin-attendance {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #64ffda;
  margin: 0 0 10px 0;
}

/* 필터 패널 */
.filter-content {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #a8b2d1;
  font-size: 0.9rem;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  cursor: pointer;
}

.filter-group-range {
  display: flex;
  gap: 15px;
}

.filter-content :deep(.p-calendar) {
  width: 150px;
}

.search-button {
  align-self: flex-end;
}

/* 통계 요약 */
.summary-stats {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background-color: #1a1d29;
  border-radius: 8px;
  border: 1px solid #2d3348;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #242938;
  border-radius: 6px;
  border: 1px solid #2d3348;
}

.stat-label {
  color: #a8b2d1;
  font-size: 0.85rem;
}

.stat-value {
  font-weight: 700;
  font-size: 1.3rem;
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

/* 생성 폼 */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #a8b2d1;
  font-size: 0.9rem;
}

.required {
  color: #ff6b6b;
}

.form-group :deep(.p-calendar),
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputtext),
.form-group :deep(.p-inputmask),
.form-group :deep(.p-textarea) {
  width: 100%;
}

.submit-button {
  max-width: 250px;
  align-self: flex-end;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-content :deep(.p-calendar) {
    width: 100%;
  }

  .search-button {
    align-self: stretch;
  }

  .submit-button {
    max-width: 100%;
  }
}

/* 다크 테마 스타일 */
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

:deep(.p-inputtext),
:deep(.p-inputmask),
:deep(.p-textarea),
:deep(.p-calendar-input),
:deep(.p-dropdown) {
  background-color: #1a1d29;
  border: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-inputtext:enabled:hover),
:deep(.p-inputmask:enabled:hover),
:deep(.p-textarea:enabled:hover),
:deep(.p-dropdown:hover) {
  border-color: #64ffda;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-inputmask:enabled:focus),
:deep(.p-textarea:enabled:focus),
:deep(.p-dropdown:focus) {
  border-color: #64ffda;
  box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2);
}

:deep(.p-column-filter) {
  font-size: 0.9rem;
}
</style>
