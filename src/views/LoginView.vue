<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import { useAuthStore } from '@/stores/auth';

  // (중요!) 컴포넌트 임포트 확인
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Panel from 'primevue/panel';
  import Message from 'primevue/message';

  // Toast 사용
  const toast = useToast();
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  // (중요!) ref 변수 선언 확인
  const email = ref('');
  const password = ref('');
  
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  const handleLogin = async () => {
    if (isLoading.value) return; 
  
    isLoading.value = true;
    errorMessage.value = '';
  
    // (디버깅) 이 시점에서 email.value와 password.value가 비어있는 것입니다.
    console.log('로그인 시도 데이터:', { 
      email: email.value, 
      password: password.value 
    });
  
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
  <div class="login-page-wrapper">
    
    <div class="login-header">
      <i class="pi pi-shield login-icon"></i>
      <h2>ERP System</h2>
    </div>

    <Panel header="로그인" class="login-panel">
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">이메일:</label>
          <InputText id="email" type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">비밀번호:</label>
          <Password id="password" v-model="password" required :feedback="false" toggleMask />
        </div>

        <Button type="submit" :loading="isLoading" class="p-button-primary" label="로그인" />
        <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>
      </form>
    </Panel>
  </div>
</template>
  
<style scoped>
  /* (수정) 3. 기존 스타일을 아래 코드로 덮어쓰거나 수정 */
  
  .login-page-wrapper {
    display: flex;
    /* (수정) 컨테이너를 수직(column)으로 쌓도록 변경 */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #666666ff 0%, #1a1a20ff 100%);
  }
  
  /* (추가) 4. 로고와 제목을 담는 헤더 스타일 */
  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem; /* 패널과의 간격 */
    color: #ffffff; /* 흰색 글자 */
  }
  
  .login-icon {
    font-size: 4rem; /* 아이콘 크기 키움 */
    margin-bottom: 1rem;
    color: var(--p-primary-color, #42b883); /* PrimeVue 테마의 기본 색상 */
  }
  
  .login-header h2 {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }
  
  /* (수정) 패널 스타일: margin-top 제거 (wrapper가 정렬하므로) */
  .login-panel {
    width: 100%;
    max-width: 450px;
    /* margin-top: -100px; <-- 이 줄 삭제 */
  }
  
  /* (유지) 폼 내부 스타일 */
  .login-form .form-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group :deep(.p-inputtext),
  .form-group :deep(.p-password) {
    width: 100%;
  }
  
  :deep(.p-button) {
    width: 100%;
  }
  
  :deep(.p-message) {
    margin-top: 15px;
    width: 100%;
  }
</style>