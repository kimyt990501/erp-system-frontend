<script setup lang="ts">
  import { RouterView, useRouter, RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';

  import Toolbar from 'primevue/toolbar';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogout = () => {
    // 1. Pinia 스토어의 상태를 초기화합니다.
    authStore.logout();
    // 2. 로그인 페이지로 강제 이동시킵니다.
    router.push({ name: 'login' });
  };
</script>

<template>
  <div class="layout-container">
    <!-- Toast 컴포넌트 (전역 알림) -->
    <Toast />

    <Toolbar class="main-toolbar">
      <template #start>
        <div class="toolbar-logo">
          <i class="pi pi-box" style="font-size: 1.5rem"></i>
          <h1>ERP System</h1>
        </div>
        <nav>
          <RouterLink to="/">
            <i class="pi pi-home"></i>
            <span>대시보드</span>
          </RouterLink>
          <RouterLink to="/attendance">
            <i class="pi pi-clock"></i>
            <span>근태 관리</span>
          </RouterLink>
          <RouterLink to="/leave">
            <i class="pi pi-calendar"></i>
            <span>연차 관리</span>
          </RouterLink>
          <RouterLink to="/salary">
            <i class="pi pi-wallet"></i>
            <span>급여 관리</span>
          </RouterLink>
          <!-- 관리자 전용 메뉴 -->
          <template v-if="authStore.isAdmin">
            <div class="nav-divider"></div>
            <RouterLink to="/admin/attendance">
              <i class="pi pi-verified"></i>
              <span>근태 현황</span>
            </RouterLink>
            <RouterLink to="/admin/leave-requests">
              <i class="pi pi-check-circle"></i>
              <span>연차 승인</span>
            </RouterLink>
            <RouterLink to="/admin/users">
              <i class="pi pi-users"></i>
              <span>사용자 관리</span>
            </RouterLink>
          </template>
        </nav>
      </template>

      <template #end>
        <div class="user-info" v-if="authStore.user">
          <RouterLink to="/profile" class="user-name-link">
            환영합니다, {{ authStore.user.name }} 님
          </RouterLink>
          <Button @click="handleLogout" label="로그아웃" icon="pi pi-sign-out" class="p-button-danger" />
        </div>
      </template>
    </Toolbar>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
  
<style scoped>
  /* (수정) 기존 스타일 변경 */
  .layout-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-toolbar {
    background-color: #242938 !important;
    border-bottom: 1px solid #2d3348;
  }

  :deep(.p-toolbar) {
    background: #242938;
    border: none;
    color: #e1e4e8;
  }

  .toolbar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toolbar-logo h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  /* (추가) 네비게이션 스타일 */
  nav {
    margin-left: 40px;
    display: flex;
    gap: 20px;
  }
  nav a {
    text-decoration: none;
    color: #a8b2d1;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  nav a i {
    font-size: 1.1rem;
  }

  nav a:hover {
    background-color: rgba(100, 255, 218, 0.1);
    color: #64ffda;
  }

  nav a.router-link-exact-active {
    background-color: rgba(100, 255, 218, 0.15);
    color: #64ffda;
    border-bottom: none;
  }

  /* 관리자 메뉴 구분선 */
  .nav-divider {
    width: 2px;
    height: 24px;
    background-color: #2d3348;
    margin: 0 10px;
  }

  /* 모바일: 햄버거 메뉴 대응 */
  @media (max-width: 768px) {
    .toolbar-logo h1 {
      font-size: 1.2rem;
    }

    nav {
      margin-left: 20px;
      gap: 12px;
    }

    nav a {
      font-size: 0.85rem;
      padding: 4px 8px;
    }

    nav a span {
      display: none; /* 모바일에서 텍스트 숨기고 아이콘만 표시 */
    }

    nav a i {
      font-size: 1.2rem;
    }

    .user-info {
      gap: 10px;
    }

    /* 사용자 이름 텍스트 숨기기 (아이콘만 표시) */
    .user-name-link {
      display: none;
    }
  }

  /* 매우 작은 모바일 화면 */
  @media (max-width: 480px) {
    .toolbar-logo {
      gap: 5px;
    }

    .toolbar-logo h1 {
      font-size: 1rem;
    }

    nav {
      margin-left: 10px;
      gap: 8px;
    }

    nav a {
      font-size: 0.75rem;
      padding: 3px 6px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .main-content {
    flex: 1;
    padding: 20px;

    /* --- (아래 3줄 추가) --- */
    /* 1. 콘텐츠 영역의 최대 너비를 1280px로 제한 */
    max-width: 1280px;
    /* 2. 좌우 여백을 auto로 주어 가운데 정렬 */
    margin: 0 auto;
    /* 3. 화면이 1280px보다 작을 때를 대비 */
    width: 100%;
  }

  /* 모바일: 패딩 줄이기 */
  @media (max-width: 768px) {
    .main-content {
      padding: 12px;
    }
  }

  @media (max-width: 480px) {
    .main-content {
      padding: 8px;
    }
  }

  .content-wrapper {
    max-width: 1280px; /* 콘텐츠 최대 너비 */
    width: 100%;
    margin: 20px auto;    /* 상하 여백 20px, 좌우 자동(중앙 정렬) */
    padding: 0 20px;     /* 좌우 내부 여백 */
    box-sizing: border-box; /* padding이 너비에 포함되도록 */
  }

  .user-name-link {
    color: #a8b2d1;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  .user-name-link:hover {
    color: #64ffda;
  }
</style>