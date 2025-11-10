<script setup lang="ts">
  /**
   * FormGroup - 폼 필드를 위한 레이아웃 컴포넌트
   * 라벨과 입력 요소를 일관된 스타일로 감싸줍니다.
   *
   * @example
   * <FormGroup label="이름" for="name" required>
   *   <InputText id="name" v-model="name" />
   * </FormGroup>
   */

  interface Props {
    /** 라벨 텍스트 */
    label: string;
    /** input 요소의 id (for 속성 연결용) */
    for?: string;
    /** 필수 항목 표시 여부 */
    required?: boolean;
    /** 에러 메시지 */
    error?: string;
    /** 도움말 텍스트 */
    hint?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
  });
</script>

<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label :for="props.for" class="form-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="form-input">
      <slot />
    </div>
    <small v-if="error" class="error-message">
      <i class="pi pi-exclamation-circle"></i>
      {{ error }}
    </small>
    <small v-else-if="hint" class="hint-message">
      <i class="pi pi-info-circle"></i>
      {{ hint }}
    </small>
  </div>
</template>

<style scoped>
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #a8b2d1;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .required-mark {
    color: #f5222d;
    font-weight: 700;
  }

  .form-input {
    display: flex;
    flex-direction: column;
  }

  .error-message {
    color: #f5222d;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: -4px;
  }

  .hint-message {
    color: #64ffda;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: -4px;
  }

  .form-group.has-error :deep(.p-inputtext),
  .form-group.has-error :deep(.p-dropdown),
  .form-group.has-error :deep(.p-calendar-input) {
    border-color: #f5222d;
  }

  .form-group.has-error :deep(.p-inputtext:focus),
  .form-group.has-error :deep(.p-dropdown:focus),
  .form-group.has-error :deep(.p-calendar-input:focus) {
    box-shadow: 0 0 0 0.2rem rgba(245, 34, 45, 0.2);
  }
</style>
