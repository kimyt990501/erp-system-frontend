<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { getAllUsers } from '@/services/adminService';
  import type { User } from '@/types/user';

  // Composables
  import { useLoading } from '@/composables/useLoading';
  import { useStatusMapping } from '@/composables/useStatusMapping';

  // PrimeVue 컴포넌트 임포트
  import Panel from 'primevue/panel';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Tag from 'primevue/tag';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';

  // Custom Components
  import StatusTag from '@/components/StatusTag.vue';

  // Composables 초기화
  const { isLoading, withLoading } = useLoading(true);
  const { getUserStatusLabel, getUserStatusSeverity } = useStatusMapping();

  // 상태 정의
  const users = ref<User[]>([]);

  // 필터 설정
  const filters = ref({
    name: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    role: { value: null, matchMode: 'equals' },
    is_active: { value: null, matchMode: 'equals' }
  });

  // 권한 옵션
  const roleOptions = [
    { label: '일반', value: 'user' },
    { label: '관리자', value: 'admin' }
  ];

  // 상태 옵션
  const activeOptions = [
    { label: '활성', value: true },
    { label: '비활성', value: false }
  ];

  // 데이터 로드
  const loadUsers = async () => {
    await withLoading(async () => {
      users.value = await getAllUsers();
    });
  };

  // 마운트 시 데이터 로드
  onMounted(loadUsers);

  // Helper 함수
  const getRoleLabel = (role: string) => {
    return role === 'admin' ? '관리자' : '일반';
  };

  const getRoleSeverity = (role: string) => {
    return role === 'admin' ? 'info' : 'secondary';
  };
</script>

<template>
  <div class="admin-users">
    <Panel header="사용자 관리 (관리자)" class="users-panel">
      <DataTable
        :value="users"
        :loading="isLoading"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :paginator="true"
        :rows="10"
        filterDisplay="row"
        v-model:filters="filters"
      >
        <template #empty> 사용자 목록이 없습니다. </template>
        <template #loading> 사용자 목록을 불러오는 중입니다... </template>

        <Column field="id" header="ID" :sortable="true" style="text-align: center; min-width: 80px;"></Column>
        <Column field="name" header="이름" :sortable="true" style="min-width: 120px;">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="이름 검색" />
          </template>
        </Column>
        <Column field="email" header="이메일" :sortable="true" style="min-width: 200px;">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="이메일 검색" />
          </template>
        </Column>
        <Column field="hire_date" header="입사일" :sortable="true" style="text-align: center; min-width: 120px;"></Column>
        <Column field="role" header="권한" :sortable="true" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            <Tag :value="getRoleLabel(slotProps.data.role)" :severity="getRoleSeverity(slotProps.data.role)" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="권한 선택"
              class="p-column-filter"
              :showClear="true"
            />
          </template>
        </Column>
        <Column field="is_active" header="상태" :sortable="true" style="text-align: center; min-width: 100px;">
          <template #body="slotProps">
            <StatusTag type="user" :value="slotProps.data.is_active" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="activeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="상태 선택"
              class="p-column-filter"
              :showClear="true"
            />
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<style scoped>
.admin-users {
  width: 100%;
}

.users-panel {
  width: 100%;
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
</style>
