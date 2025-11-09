<template>
  <div class="admin-leave-requests">
    <Panel header="연차 승인 관리 (관리자)" class="requests-panel">
      <DataTable
        :value="requests"
        :loading="isLoading"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :paginator="true"
        :rows="10"
        filterDisplay="row"
        v-model:filters="filters"
      >
        <template #empty> 연차 신청 내역이 없습니다. </template>
        <template #loading> 내역을 불러오는 중입니다... </template>

        <Column field="user_name" header="신청자" :sortable="true" style="min-width: 120px;">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="이름 검색" />
          </template>
        </Column>
        <Column field="user_email" header="이메일" :sortable="true" style="min-width: 180px;"></Column>
        <Column field="start_date" header="시작일" :sortable="true" style="text-align: center; min-width: 110px;"></Column>
        <Column field="end_date" header="종료일" :sortable="true" style="text-align: center; min-width: 110px;"></Column>
        <Column field="days_used" header="일수" :sortable="true" style="text-align: center; min-width: 80px;"></Column>
        <Column field="reason" header="사유" style="min-width: 150px;"></Column>
        <Column field="status" header="상태" :sortable="true" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="상태 선택"
              class="p-column-filter"
              :showClear="true"
            />
          </template>
        </Column>
        <Column field="created_at" header="신청일시" :sortable="true" style="text-align: center; min-width: 160px;">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column header="작업" style="text-align: center; min-width: 180px;">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button
                v-if="slotProps.data.status === 'pending'"
                label="승인"
                icon="pi pi-check"
                class="p-button-success p-button-sm"
                @click="handleApprove(slotProps.data.id)"
                :loading="actionLoading === slotProps.data.id"
              />
              <Button
                v-if="slotProps.data.status === 'pending'"
                label="거절"
                icon="pi pi-times"
                class="p-button-danger p-button-sm"
                @click="handleReject(slotProps.data.id)"
                :loading="actionLoading === slotProps.data.id"
              />
              <span v-else class="status-text">{{ getStatusLabel(slotProps.data.status) }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '@/services/adminService';
import type { AdminLeaveRequest } from '@/types/leave';

// PrimeVue 컴포넌트 임포트
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

// 상태 정의
const requests = ref<AdminLeaveRequest[]>([]);
const isLoading = ref(true);
const actionLoading = ref<number | null>(null);

// 필터 설정
const filters = ref({
  user_name: { value: null, matchMode: 'contains' },
  status: { value: null, matchMode: 'equals' }
});

// 상태 옵션
const statusOptions = [
  { label: '대기', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' }
];

// 데이터 로드
const loadRequests = async () => {
  try {
    isLoading.value = true;
    requests.value = await getAllLeaveRequests();
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
  } finally {
    isLoading.value = false;
  }
};

// 마운트 시 데이터 로드
onMounted(loadRequests);

// 승인 처리
const handleApprove = async (requestId: number) => {
  try {
    actionLoading.value = requestId;
    await approveLeaveRequest(requestId);
    await loadRequests(); // 목록 새로고침
  } catch (error) {
    console.error('Failed to approve request:', error);
    alert('승인 처리에 실패했습니다.');
  } finally {
    actionLoading.value = null;
  }
};

// 거절 처리
const handleReject = async (requestId: number) => {
  try {
    actionLoading.value = requestId;
    await rejectLeaveRequest(requestId);
    await loadRequests(); // 목록 새로고침
  } catch (error) {
    console.error('Failed to reject request:', error);
    alert('거절 처리에 실패했습니다.');
  } finally {
    actionLoading.value = null;
  }
};

// Helper 함수
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return '승인';
    case 'pending': return '대기';
    case 'rejected': return '거절';
    default: return status;
  }
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.admin-leave-requests {
  width: 100%;
}

.requests-panel {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.status-text {
  color: #a8b2d1;
  font-weight: 500;
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
  font-size: 1.25rem;
  font-weight: 600;
}

:deep(.p-panel .p-panel-content) {
  background-color: #242938;
  color: #e1e4e8;
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

/* 페이지네이터 다크 테마 */
:deep(.p-paginator) {
  background-color: #242938;
  border-top: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: #a8b2d1;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: #64ffda;
  color: #1a1d29;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover) {
  background-color: rgba(100, 255, 218, 0.1);
  color: #64ffda;
}

/* 필터 입력 필드 다크 테마 */
:deep(.p-column-filter),
:deep(.p-inputtext) {
  background-color: #1a1d29;
  border: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-column-filter:enabled:hover),
:deep(.p-inputtext:enabled:hover) {
  border-color: #64ffda;
}

:deep(.p-column-filter:enabled:focus),
:deep(.p-inputtext:enabled:focus) {
  border-color: #64ffda;
  box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2);
}

/* Dropdown 다크 테마 */
:deep(.p-dropdown) {
  background-color: #1a1d29;
  border: 1px solid #2d3348;
  color: #e1e4e8;
}

:deep(.p-dropdown:hover) {
  border-color: #64ffda;
}

:deep(.p-dropdown-panel) {
  background-color: #242938;
  border: 1px solid #2d3348;
}

:deep(.p-dropdown-item) {
  color: #e1e4e8;
}

:deep(.p-dropdown-item:hover) {
  background-color: rgba(100, 255, 218, 0.1);
}

/* 버튼 스타일 조정 */
:deep(.p-button-sm) {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}
</style>
