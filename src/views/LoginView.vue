<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import { useAuthStore } from '@/stores/auth';

  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Message from 'primevue/message';

  // Toast 사용
  const toast = useToast();
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const email = ref('');
  const password = ref('');
  
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  const handleLogin = async () => {
    if (isLoading.value) return; 
  
    isLoading.value = true;
    errorMessage.value = '';
  
    try {
      await authStore.login(email.value, password.value);
      toast.add({
        severity: 'success',
        summary: '로그인 성공',
        detail: '환영합니다!',
        life: 2000
      });
      router.push('/');
    } catch (error: any) {
      console.error('LoginView error:', error);
      const errorMsg = error.response?.data?.detail || '이메일 또는 비밀번호가 올바르지 않습니다.';
      errorMessage.value = errorMsg;
      toast.add({
        severity: 'error',
        summary: '로그인 실패',
        detail: errorMsg,
        life: 5000
      });
    } finally {
      isLoading.value = false;
    }
  };
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <i class="pi pi-box"></i>
        </div>
        <h2>ERP System</h2>
        <p class="subtitle">업무 효율을 위한 통합 관리 시스템</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">이메일</label>
          <span class="p-input-icon-left">
            <i class="pi pi-envelope" />
            <InputText id="email" type="email" v-model="email" placeholder="admin@example.com" required />
          </span>
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <span class="p-input-icon-left">
            <i class="pi pi-lock" />
            <Password 
              id="password" 
              v-model="password" 
              required 
              :feedback="false" 
              toggleMask 
              placeholder="••••••••"
              inputClass="w-full"
            />
          </span>
        </div>

        <Button type="submit" :loading="isLoading" label="로그인" class="login-button" />
        
        <div v-if="errorMessage" class="error-container">
          <Message severity="error" :closable="false">{{ errorMessage }}</Message>
        </div>
      </form>
      
      <div class="login-footer">
        <p>© 2024 ERP System. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
  
<style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--surface-0);
    background-image: radial-gradient(circle at 50% 0%, rgba(20, 184, 166, 0.15) 0%, transparent 50%);
    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-100);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-circle {
    width: 64px;
    height: 64px;
    background-color: rgba(20, 184, 166, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .logo-circle i {
    font-size: 2rem;
    color: var(--primary-500);
  }

  .login-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 8px;
  }

  .subtitle {
    color: var(--text-color-secondary);
    font-size: 0.95rem;
    margin: 0;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
    margin-left: 4px;
  }

  :deep(.p-inputtext) {
    width: 100%;
    background-color: var(--surface-0);
    border-color: var(--surface-200);
    padding-left: 2.5rem; /* 아이콘 공간 확보 */
  }

  :deep(.p-inputtext:hover) {
    border-color: var(--primary-400);
  }

  :deep(.p-inputtext:focus) {
    border-color: var(--primary-500);
    box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
  }

  /* 아이콘 스타일링 */
  .p-input-icon-left {
    position: relative;
    display: block;
    width: 100%;
  }

  .p-input-icon-left > i {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    margin-top: -0.5rem;
    color: var(--text-color-secondary);
    z-index: 1;
  }
  
  :deep(.p-password) {
    width: 100%;
  }
  
  :deep(.p-password-input) {
    width: 100%;
  }

  .login-button {
    margin-top: 8px;
    height: 48px;
    font-weight: 600;
    font-size: 1rem;
    background-color: var(--primary-600);
    border: none;
  }

  .login-button:hover {
    background-color: var(--primary-500);
  }

  .error-container {
    margin-top: 10px;
  }

  :deep(.p-message) {
    width: 100%;
  }

  .login-footer {
    margin-top: 32px;
    text-align: center;
    border-top: 1px solid var(--surface-100);
    padding-top: 20px;
  }

  .login-footer p {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    margin: 0;
  }
</style>