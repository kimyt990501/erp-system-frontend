import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

/**
 * 날짜 필터 모드
 */
export type DateFilterMode = 'single' | 'range'

/**
 * useDateFiltering - 날짜 필터링 로직을 관리하는 composable
 *
 * @example
 * const { selectedDate, startDate, endDate, filterMode, formattedDate } = useDateFiltering()
 *
 * // Single date mode
 * selectedDate.value = new Date()
 * console.log(formattedDate.value) // '2024-01-15'
 *
 * // Range mode
 * filterMode.value = 'range'
 * startDate.value = new Date('2024-01-01')
 * endDate.value = new Date('2024-01-31')
 */
export function useDateFiltering(initialMode: DateFilterMode = 'single') {
  const filterMode = ref<DateFilterMode>(initialMode)
  const selectedDate = ref<Date>(new Date())
  const startDate = ref<Date>(startOfMonth(new Date()))
  const endDate = ref<Date>(endOfMonth(new Date()))

  /**
   * Single date를 YYYY-MM-DD 형식으로 포맷
   */
  const formattedDate = computed(() => {
    return format(selectedDate.value, 'yyyy-MM-dd')
  })

  /**
   * Start date를 YYYY-MM-DD 형식으로 포맷
   */
  const formattedStartDate = computed(() => {
    return format(startDate.value, 'yyyy-MM-dd')
  })

  /**
   * End date를 YYYY-MM-DD 형식으로 포맷
   */
  const formattedEndDate = computed(() => {
    return format(endDate.value, 'yyyy-MM-dd')
  })

  /**
   * 현재 모드가 single인지 확인
   */
  const isSingleMode = computed(() => filterMode.value === 'single')

  /**
   * 현재 모드가 range인지 확인
   */
  const isRangeMode = computed(() => filterMode.value === 'range')

  /**
   * Single date로 설정
   */
  function setSelectedDate(date: Date) {
    selectedDate.value = date
  }

  /**
   * Date range 설정
   */
  function setDateRange(start: Date, end: Date) {
    startDate.value = start
    endDate.value = end
  }

  /**
   * 이번 달로 설정
   */
  function setCurrentMonth() {
    const now = new Date()
    startDate.value = startOfMonth(now)
    endDate.value = endOfMonth(now)
    selectedDate.value = now
  }

  /**
   * 오늘로 설정
   */
  function setToday() {
    selectedDate.value = new Date()
  }

  /**
   * Filter mode 변경
   */
  function setFilterMode(mode: DateFilterMode) {
    filterMode.value = mode
  }

  /**
   * Single mode와 range mode 전환
   */
  function toggleFilterMode() {
    filterMode.value = filterMode.value === 'single' ? 'range' : 'single'
  }

  /**
   * 현재 필터 모드에 맞는 날짜 파라미터 반환
   * API 호출 시 사용
   */
  const dateParams = computed(() => {
    if (filterMode.value === 'single') {
      return {
        date: formattedDate.value,
      }
    } else {
      return {
        start_date: formattedStartDate.value,
        end_date: formattedEndDate.value,
      }
    }
  })

  /**
   * 날짜 문자열을 Date 객체로 파싱
   */
  function parseDateString(dateString: string): Date {
    return parseISO(dateString)
  }

  /**
   * Date 객체를 지정된 형식으로 포맷
   */
  function formatDate(date: Date, formatString = 'yyyy-MM-dd'): string {
    return format(date, formatString)
  }

  /**
   * 날짜 문자열을 다른 형식으로 변환
   */
  function reformatDateString(
    dateString: string,
    outputFormat = 'yyyy-MM-dd',
    inputFormat?: string
  ): string {
    const date = inputFormat ? parseISO(dateString) : parseDateString(dateString)
    return format(date, outputFormat)
  }

  return {
    // State
    filterMode,
    selectedDate,
    startDate,
    endDate,

    // Computed
    formattedDate,
    formattedStartDate,
    formattedEndDate,
    isSingleMode,
    isRangeMode,
    dateParams,

    // Methods
    setSelectedDate,
    setDateRange,
    setCurrentMonth,
    setToday,
    setFilterMode,
    toggleFilterMode,
    parseDateString,
    formatDate,
    reformatDateString,
  }
}

/**
 * useMonthNavigation - 월 단위 네비게이션을 관리하는 composable
 *
 * @example
 * const { currentMonth, formattedMonth, previousMonth, nextMonth } = useMonthNavigation()
 *
 * nextMonth() // 다음 달로 이동
 * previousMonth() // 이전 달로 이동
 */
export function useMonthNavigation(initialMonth?: Date) {
  const currentMonth = ref<Date>(initialMonth || new Date())

  const formattedMonth = computed(() => {
    return format(currentMonth.value, 'yyyy-MM')
  })

  const monthStartDate = computed(() => {
    return startOfMonth(currentMonth.value)
  })

  const monthEndDate = computed(() => {
    return endOfMonth(currentMonth.value)
  })

  const formattedMonthStartDate = computed(() => {
    return format(monthStartDate.value, 'yyyy-MM-dd')
  })

  const formattedMonthEndDate = computed(() => {
    return format(monthEndDate.value, 'yyyy-MM-dd')
  })

  function previousMonth() {
    const current = currentMonth.value
    currentMonth.value = new Date(current.getFullYear(), current.getMonth() - 1, 1)
  }

  function nextMonth() {
    const current = currentMonth.value
    currentMonth.value = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }

  function setMonth(year: number, month: number) {
    currentMonth.value = new Date(year, month - 1, 1)
  }

  function setCurrentMonth() {
    currentMonth.value = new Date()
  }

  return {
    currentMonth,
    formattedMonth,
    monthStartDate,
    monthEndDate,
    formattedMonthStartDate,
    formattedMonthEndDate,
    previousMonth,
    nextMonth,
    setMonth,
    setCurrentMonth,
  }
}
