<script setup lang="ts">
  /**
   * StatCard - 통계 정보를 표시하는 카드 컴포넌트
   *
   * @example
   * <StatCard label="총 근무일" value="20일" />
   * <StatCard label="출석률" value="95%" variant="highlight" />
   * <StatCard label="정상 출근" value="18일" color="success" />
   */

  interface Props {
    /** 라벨 텍스트 */
    label: string;
    /** 값 */
    value: string | number;
    /** 카드 변형 */
    variant?: 'default' | 'highlight';
    /** 색상 (값에 적용) */
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    /** 아이콘 */
    icon?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    color: 'default',
  });
</script>

<template>
  <div class="stat-card" :class="`stat-card--${variant}`">
    <div class="stat-header">
      <i v-if="icon" class="stat-icon pi" :class="icon"></i>
      <span class="stat-label">{{ label }}</span>
    </div>
    <div class="stat-value" :class="`stat-value--${color}`">
      {{ value }}
    </div>
  </div>
</template>

<style scoped>
  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background-color: #1a1d29;
    border-radius: 8px;
    border: 1px solid #2d3348;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    border-color: #64ffda;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(100, 255, 218, 0.1);
  }

  .stat-card--highlight {
    background-color: rgba(100, 255, 218, 0.1);
    border-color: #64ffda;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-icon {
    font-size: 1.1rem;
    color: #64ffda;
  }

  .stat-label {
    color: #a8b2d1;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .stat-value {
    font-weight: 700;
    font-size: 1.5rem;
    color: #e1e4e8;
  }

  .stat-card--highlight .stat-value {
    color: #64ffda;
    font-size: 1.8rem;
  }

  /* Color variants */
  .stat-value--success {
    color: #52c41a;
  }

  .stat-value--warning {
    color: #faad14;
  }

  .stat-value--danger {
    color: #f5222d;
  }

  .stat-value--info {
    color: #ff7a45;
  }
</style>
