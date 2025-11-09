import api from './api';
import type { SalaryStatement, SalaryStatementCreate } from '@/types/salary';

/**
 * 내 급여 명세서 목록을 조회합니다 (GET /salary)
 */
export const getMySalaryStatements = async (): Promise<SalaryStatement[]> => {
    const response = await api.get<SalaryStatement[]>('/salary');
    
    // (핵심!)
    // response.data가 undefined나 null일 경우,
    // 빈 배열 []을 반환하도록 보장합니다.
    return response.data || []; 
  };

  export const getMyLatestSalaryStatement = async (): Promise<SalaryStatement | null> => {
    try {
      const statements = await getMySalaryStatements(); // 'SalaryStatement[]' 보장됨
      
      if (statements && statements.length > 0) {
        // (수정!)
        // 'statements[0]'가 'undefined'일 경우(TypeScript의 엄격한 검사)
        // '??' 연산자를 사용해 'null'을 반환합니다.
        return statements[0] ?? null; 
      }
      return null; // 빈 배열이면 null 반환
  
    } catch (error) {
      console.error('Error fetching latest salary statement:', error);
      return null; // 에러 시에도 null 반환
    }
  };

/**
 * 새 급여 명세서를 입력합니다 (POST /salary)
 */
export const createSalaryStatement = async (
  newData: SalaryStatementCreate
): Promise<SalaryStatement> => {
  const response = await api.post<SalaryStatement>('/salary', newData);
  return response.data;
};