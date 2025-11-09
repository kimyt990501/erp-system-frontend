// GET /salary 응답 (스키마: SalaryStatementRead)
export interface SalaryStatement {
    id: number;
    user_id: number;
    pay_month: string; // "YYYY-MM"
    base_pay: number;
    bonus: number;
    deductions: number;
    net_pay: number;
    created_at: string; // ISO 8601 날짜 문자열
  }
  
  // POST /salary 요청 (스키마: SalaryStatementCreate)
  export interface SalaryStatementCreate {
    pay_month: string; // "YYYY-MM"
    base_pay: number;
    bonus: number;
    deductions: number;
    net_pay: number;
  }