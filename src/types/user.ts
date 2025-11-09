export interface User {
    id: number;
    email: string;
    name: string;
    hire_date: string; // (날짜도 JSON에서는 string으로 넘어옵니다)
    is_active: boolean;
    role: 'user' | 'admin'; // 사용자 권한
  }