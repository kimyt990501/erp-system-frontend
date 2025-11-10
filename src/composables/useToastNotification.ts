import { useToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/toast'

/**
 * useToastNotification - Toast 알림을 쉽게 사용하기 위한 composable
 *
 * @example
 * const { showSuccess, showError, withErrorHandling } = useToastNotification()
 *
 * showSuccess('작업 완료', '성공적으로 저장되었습니다.')
 *
 * await withErrorHandling(
 *   async () => await saveData(),
 *   '데이터 저장 성공',
 *   '데이터를 저장하지 못했습니다.'
 * )
 */
export function useToastNotification() {
  const toast = useToast()

  /**
   * 성공 메시지 표시
   */
  function showSuccess(summary: string, detail?: string, life = 3000) {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life,
    })
  }

  /**
   * 에러 메시지 표시
   */
  function showError(summary: string, detail?: string, life = 5000) {
    toast.add({
      severity: 'error',
      summary,
      detail,
      life,
    })
  }

  /**
   * 경고 메시지 표시
   */
  function showWarning(summary: string, detail?: string, life = 4000) {
    toast.add({
      severity: 'warn',
      summary,
      detail,
      life,
    })
  }

  /**
   * 정보 메시지 표시
   */
  function showInfo(summary: string, detail?: string, life = 3000) {
    toast.add({
      severity: 'info',
      summary,
      detail,
      life,
    })
  }

  /**
   * 커스텀 Toast 메시지 표시
   */
  function showToast(options: ToastMessageOptions) {
    toast.add(options)
  }

  /**
   * 비동기 작업을 실행하고 자동으로 성공/에러 Toast를 표시
   *
   * @param fn - 실행할 비동기 함수
   * @param successMessage - 성공 시 표시할 메시지 (summary만 또는 { summary, detail })
   * @param errorMessage - 에러 시 표시할 메시지 (summary만 또는 { summary, detail })
   * @param options - 추가 옵션 { showSuccessToast: boolean, showErrorToast: boolean }
   * @returns 비동기 함수의 결과값 또는 에러 발생 시 undefined
   */
  async function withErrorHandling<T>(
    fn: () => Promise<T>,
    successMessage?: string | { summary: string; detail?: string },
    errorMessage?: string | { summary: string; detail?: string },
    options: { showSuccessToast?: boolean; showErrorToast?: boolean } = {}
  ): Promise<T | undefined> {
    const { showSuccessToast = true, showErrorToast = true } = options

    try {
      const result = await fn()

      if (showSuccessToast && successMessage) {
        if (typeof successMessage === 'string') {
          showSuccess(successMessage)
        } else {
          showSuccess(successMessage.summary, successMessage.detail)
        }
      }

      return result
    } catch (error: any) {
      console.error('Error in withErrorHandling:', error)

      if (showErrorToast) {
        const errorDetail = error.response?.data?.detail || error.message

        if (errorMessage) {
          if (typeof errorMessage === 'string') {
            showError(errorMessage, errorDetail)
          } else {
            showError(errorMessage.summary, errorMessage.detail || errorDetail)
          }
        } else {
          showError('작업 실패', errorDetail || '작업을 수행하지 못했습니다.')
        }
      }

      return undefined
    }
  }

  /**
   * 여러 비동기 작업을 순차적으로 실행하고 각각 Toast 표시
   */
  async function withSequentialErrorHandling<T>(
    operations: Array<{
      fn: () => Promise<T>
      successMessage?: string | { summary: string; detail?: string }
      errorMessage?: string | { summary: string; detail?: string }
    }>
  ): Promise<T[]> {
    const results: T[] = []

    for (const operation of operations) {
      const result = await withErrorHandling(
        operation.fn,
        operation.successMessage,
        operation.errorMessage
      )
      if (result !== undefined) {
        results.push(result)
      }
    }

    return results
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    withErrorHandling,
    withSequentialErrorHandling,
  }
}
