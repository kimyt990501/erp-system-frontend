<script setup lang="ts">
  import { computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  
  // PrimeVue 컴포넌트 임포트
  import Panel from 'primevue/panel';
  import Tag from 'primevue/tag';
  // import Button from 'primevue/button'; // (나중에 비밀번호 변경 시)
  
  // 1. authStore에서 사용자 정보 가져오기
  const authStore = useAuthStore();
  const user = computed(() => authStore.user);
</script>

<template>
  <Panel header="내 프로필" class="profile-panel">
    <div v-if="user" class="profile-details">
      <div class="profile-field">
        <label>이름</label>
        <span>{{ user.name }}</span>
      </div>
      <div class="profile-field">
        <label>이메일 (로그인 ID)</label>
        <span>{{ user.email }}</span>
      </div>
      <div class="profile-field">
        <label>입사일</label>
        <span>{{ user.hire_date }}</span>
      </div>
      <div class="profile-field">
        <label>계정 상태</label>
        <span>
          <Tag :severity="user.is_active ? 'success' : 'danger'">
            {{ user.is_active ? '활성' : '비활성' }}
          </Tag>
        </span>
      </div>

      </div>
    <div v-else>
      사용자 정보를 불러오는 중이거나 오류가 발생했습니다.
    </div>
  </Panel>
</template>
  
<style scoped>
  .profile-panel {
    max-width: 800px;
    margin: 0 auto; /* 페이지 중앙에 위치 */
  }
  
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* 필드 간 간격 */
  }
  
  .profile-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .profile-field label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #a8b2d1;
  }

  .profile-field span {
    font-size: 1.1rem;
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
</style>