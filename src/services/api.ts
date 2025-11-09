import axios, { type InternalAxiosRequestConfig } from "axios";

// 1. Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
});

// 2. 요청 인터셉터 (Request Interceptor)
//    TypeScript로 config의 타입을 명시합니다.
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // (수정) Pinia 대신 localStorage에서 토큰을 직접 읽음
      const token = localStorage.getItem("token");
      if (token) {
        // (수정) config.headers.Authorization으로 타입 보장
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// 응답 인터셉터 (Response Interceptor)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("401 Unauthorized. Clearing token.");
      // (수정) 인증 실패 시 로컬 스토리지 토큰 제거
      localStorage.removeItem("token");
      // (선택) 로그인 페이지로 강제 이동
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. 생성한 Axios 인스턴스를 export
export default api;