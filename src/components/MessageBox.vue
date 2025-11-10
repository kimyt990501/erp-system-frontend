<script setup lang="ts">
  /**
   * MessageBox - 정보, 경고, 에러 메시지를 표시하는 컴포넌트
   *
   * @example
   * <MessageBox severity="info" message="안내 메시지입니다." />
   * <MessageBox severity="warn" message="경고 메시지입니다." />
   * <MessageBox severity="error" message="에러 메시지입니다." />
   * <MessageBox severity="success" message="성공 메시지입니다." />
   */

  interface Props {
    /** 메시지 심각도 */
    severity?: 'info' | 'warn' | 'error' | 'success';
    /** 메시지 내용 */
    message?: string;
    /** 아이콘 표시 여부 */
    showIcon?: boolean;
    /** 닫기 버튼 표시 여부 */
    closable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    severity: 'info',
    showIcon: true,
    closable: false,
  });

  const emit = defineEmits<{
    close: [];
  }>();

  // Severity에 따른 아이콘 매핑
  const iconMap = {
    info: 'pi-info-circle',
    warn: 'pi-exclamation-triangle',
    error: 'pi-times-circle',
    success: 'pi-check-circle',
  };

  const icon = iconMap[props.severity];
</script>

<template>
  <div class="message-box" :class="`message-box--${severity}`">
    <i v-if="showIcon" class="message-icon pi" :class="icon"></i>
    <div class="message-content">
      <slot>{{ message }}</slot>
    </div>
    <button v-if="closable" class="message-close" @click="emit('close')">
      <i class="pi pi-times"></i>
    </button>
  </div>
</template>

<style scoped>
  .message-box {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 6px;
    border-left: 4px solid;
    font-size: 0.95rem;
    margin-bottom: 16px;
  }

  .message-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .message-content {
    flex: 1;
    line-height: 1.5;
  }

  .message-close {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s;
    color: inherit;
  }

  .message-close:hover {
    opacity: 1;
  }

  /* Info */
  .message-box--info {
    background-color: rgba(100, 255, 218, 0.1);
    border-left-color: #64ffda;
    color: #64ffda;
  }

  /* Warning */
  .message-box--warn {
    background-color: rgba(250, 173, 20, 0.1);
    border-left-color: #faad14;
    color: #faad14;
  }

  /* Error */
  .message-box--error {
    background-color: rgba(245, 34, 45, 0.1);
    border-left-color: #f5222d;
    color: #f5222d;
  }

  /* Success */
  .message-box--success {
    background-color: rgba(82, 196, 26, 0.1);
    border-left-color: #52c41a;
    color: #52c41a;
  }
</style>
