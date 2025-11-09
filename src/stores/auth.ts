import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api"; // 1. 우리가 만든 Axios 인스턴스
import type { User } from "@/types/user"; // 2. 방금 정의한 User 타입

// 백엔드 /auth/token 응답 타입
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// 3. 스토어 정의 (이름: 'auth')
export const useAuthStore = defineStore("auth", () => {
  // 4. 상태 (State)
  // 로그인한 유저 정보 (null일 수 있음)
  const user = ref<User | null>(null);
  // JWT 액세스 토큰 (null일 수 있음)
  const token = ref<string | null>(localStorage.getItem("token")); // 5. 페이지 새로고침 대비

  // 6. 게터 (Getters) - computed 사용
  // 로그인 여부 확인
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  // 관리자 여부 확인
  const isAdmin = computed(() => user.value?.role === 'admin');

  // 7. 액션 (Actions) - 함수
  /**
   * 토큰을 저장하고 API 헤더를 설정합니다.
   */
  function setToken(accessToken: string) {
    token.value = accessToken;
    localStorage.setItem("token", accessToken); // 8. 로컬 스토리지에 저장
    // Axios 헤더에 인증 토큰 설정
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  /**
   * 토큰을 삭제하고 API 헤더를 제거합니다.
   */
  function removeToken() {
    token.value = null;
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }

  /**
   * 이메일/비밀번호로 로그인합니다.
   */
  async function login(email: string, password: string) {
    try {
      // 1. URLSearchParams 객체 생성
      const params = new URLSearchParams();
      params.append('username', email); // (필수!) 필드명 'username'
      params.append('password', password);

      // 2. (수정!) api.post에 세 번째 인자로 'headers'를 명시적으로 전달
      const response = await api.post<TokenResponse>(
        '/auth/token', 
        params, // 폼 데이터
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // (이하 로직 동일)
      const accessToken = response.data.access_token;
      setToken(accessToken);
      await fetchUser();

    } catch (error) {
      removeToken(); 
      console.error("Login failed:", error); // (이 로그가 401을 출력 중)
      throw error; 
    }
  }
  /**
   * 토큰을 사용하여 '/users/me'에서 사용자 정보를 가져옵니다.
   */
  async function fetchUser() {
    if (!token.value) return; // 토큰 없으면 중단

    // (setToken에서 이미 헤더를 설정했으므로 바로 호출 가능)
    try {
      const response = await api.get<User>("/users/me");
      user.value = response.data; // 12. 유저 정보 저장
    } catch (error) {
      removeToken(); // 유저 정보 가져오기 실패 시 (토큰 만료 등)
      console.error("Failed to fetch user:", error);
    }
  }

  /**
   * 로그아웃합니다.
   */
  function logout() {
    user.value = null;
    removeToken();
  }

  // 13. 스토어가 반환할 값들
  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
    setToken, // (외부에서 수동 설정이 필요할 수 있으므로)
  };
});