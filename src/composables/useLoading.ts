import { ref } from 'vue'

/**
 * useLoading - 비동기 작업의 로딩 상태를 관리하는 composable
 *
 * @example
 * const { isLoading, withLoading } = useLoading()
 *
 * await withLoading(async () => {
 *   const data = await fetchData()
 *   return data
 * })
 */
export function useLoading(initialValue = false) {
  const isLoading = ref(initialValue)

  /**
   * 비동기 함수를 실행하고 자동으로 로딩 상태를 관리
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    try {
      isLoading.value = true
      return await fn()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 수동으로 로딩 상태 설정
   */
  function setLoading(value: boolean) {
    isLoading.value = value
  }

  return {
    isLoading,
    withLoading,
    setLoading,
  }
}

/**
 * useMultipleLoading - 여러 개의 로딩 상태를 관리하는 composable
 *
 * @example
 * const { loadingStates, withLoading, isAnyLoading } = useMultipleLoading(['data', 'stats', 'records'])
 *
 * await withLoading('data', async () => {
 *   const data = await fetchData()
 * })
 */
export function useMultipleLoading<T extends string>(keys: T[]) {
  const loadingStates = ref<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  )

  async function withLoading<R>(key: T, fn: () => Promise<R>): Promise<R> {
    try {
      loadingStates.value[key] = true
      return await fn()
    } finally {
      loadingStates.value[key] = false
    }
  }

  function setLoading(key: T, value: boolean) {
    loadingStates.value[key] = value
  }

  /**
   * 하나라도 로딩 중인지 확인
   */
  function isAnyLoading() {
    return Object.values(loadingStates.value).some((value) => value === true)
  }

  /**
   * 모두 로딩 중인지 확인
   */
  function isAllLoading() {
    return Object.values(loadingStates.value).every((value) => value === true)
  }

  return {
    loadingStates,
    withLoading,
    setLoading,
    isAnyLoading,
    isAllLoading,
  }
}
