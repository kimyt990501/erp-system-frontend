import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 1. (변경) 기존 HomeView, AboutView 대신 사용할 컴포넌트 임포트
import MainLayout from '../views/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import LeaveView from '../views/LeaveView.vue';
import SalaryView from '../views/SalaryView.vue';
import ProfileView from '../views/ProfileView.vue';
import AttendanceView from '../views/AttendanceView.vue';
// 관리자 전용 뷰
import AdminLeaveRequestsView from '../views/admin/AdminLeaveRequestsView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import AdminAttendanceView from '../views/admin/AdminAttendanceView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 2. (변경) 로그인 시 보게 될 중첩 라우트
    {
      path: '/',
      component: MainLayout, // 껍데기가 될 레이아웃
      meta: { requiresAuth: true },
      children: [
        {
          path: '', // '/' 경로의 기본 자식
          name: 'dashboard',
          component: DashboardView, // MainLayout 안의 <RouterView>에 표시됨
        },
        {
          path: 'leave', // -> /leave
          name: 'leave-management',
          component: LeaveView,
        },
        {
          path: 'salary', // -> /salary
          name: 'salary-management',
          component: SalaryView,
        },
        {
          path: 'profile', // -> /profile
          name: 'profile',
          component: ProfileView,
        },
        {
          path: 'attendance', // -> /attendance
          name: 'attendance',
          component: AttendanceView,
        },
        // 관리자 전용 라우트
        {
          path: 'admin/leave-requests', // -> /admin/leave-requests
          name: 'admin-leave-requests',
          component: AdminLeaveRequestsView,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/users', // -> /admin/users
          name: 'admin-users',
          component: AdminUsersView,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/attendance', // -> /admin/attendance
          name: 'admin-attendance',
          component: AdminAttendanceView,
          meta: { requiresAuth: true, requiresAdmin: true },
        }
      ],
    },
    // 3. (유지) 로그아웃 시 접근할 로그인 라우트
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
  ],
});

// (라우트 가드: router.beforeEach 부분은 수정 없이 그대로 둡니다)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // (수정) Pinia가 로드되기 전에 authStore를 사용할 수 없으므로,
  // localStorage에서 토큰을 직접 확인하는 것이 더 안전합니다.
  const tokenExists = !!localStorage.getItem("token");

  // (수정) fetchUser는 authStore.user가 없을 때만 호출
  if (tokenExists && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      await authStore.logout(); // (logout이 상태만 초기화하도록 함)
    }
  }

  // 이제 isAuthenticated 게터를 신뢰할 수 있음
  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' }); // (수정) 'home' 대신 'dashboard'로 이동
  } else if (to.meta.requiresAdmin && !isAdmin) {
    // 관리자 권한이 필요한데 관리자가 아닌 경우
    next({ name: 'dashboard' }); // 대시보드로 리다이렉트
  } else {
    next();
  }
});

export default router;