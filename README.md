# ERP System - Frontend

> 현대적인 Vue 3 + TypeScript 기반의 기업 자원 관리 시스템 프론트엔드

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [API 연동](#api-연동)
- [개발 가이드](#개발-가이드)

## 프로젝트 소개

이 프로젝트는 기업의 인사/총무 업무를 효율적으로 관리하기 위한 ERP 시스템의 프론트엔드 애플리케이션입니다. Vue 3의 Composition API와 TypeScript를 활용하여 타입 안정성과 유지보수성을 확보했으며, PrimeVue를 사용한 세련된 다크 테마 UI를 제공합니다.

### 주요 특징

- **모던 다크 테마**: 눈의 피로를 줄이는 세련된 다크 테마 UI
- **JWT 인증**: 안전한 토큰 기반 인증 시스템
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- **빠른 성능**: Vite 기반 빌드로 빠른 개발 및 프로덕션 성능
- **타입 안정성**: TypeScript strict mode로 런타임 에러 최소화
- **Toast 알림**: 사용자 친화적인 알림 시스템

## 주요 기능

### 일반 사용자 기능

#### 1. 근태 관리
- 출근/퇴근 체크인/체크아웃
- 실시간 근태 현황 확인
- 월별 근태 통계 (출석률, 지각/조퇴/결근 횟수)
- 근태 기록 조회 (기간별 필터링)
- 자동 지각/조퇴 감지 (09:00/18:00 기준)

#### 2. 연차 관리
- 연차 잔여 현황 실시간 확인
- 연차 신청 (시작일, 종료일, 사유)
- 자동 일수 계산 및 잔여 연차 검증
- 연차 신청 내역 조회 (상태별: 대기/승인/거절)

#### 3. 급여 관리
- 급여 명세서 입력
- 실수령액 자동 계산 (기본급 + 상여금 - 공제액)
- 급여 내역 조회 (월별)
- 통화 형식 포맷팅

#### 4. 대시보드
- 오늘의 근태 현황 (출근/퇴근 시간, 이번 달 출석률)
- 연차 잔여 현황
- 최근 급여 명세서
- 빠른 페이지 이동

### 관리자 전용 기능

#### 1. 근태 관리
- 전체 직원 근태 현황 조회 (날짜/기간별)
- 직원별 검색 및 필터링
- 근태 통계 요약 (정상/지각/조퇴/결근 집계)
- 근태 수동 입력 (누락된 기록 보정, 결근 처리)

#### 2. 연차 관리
- 전체 연차 신청 내역 조회
- 연차 승인/거절 처리
- 직원별/상태별 필터링
- 신청 일시 확인

#### 3. 사용자 관리
- 전체 직원 목록 조회
- 직원 정보 확인 (이름, 이메일, 입사일, 역할, 활성 상태)
- 역할별/상태별 필터링

## 기술 스택

### Core
- **Vue 3.5.22** - Progressive JavaScript Framework
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.1** - Next Generation Frontend Tooling
- **Vue Router 4.6** - Official Router for Vue.js
- **Pinia 3.0** - Intuitive State Management

### UI Framework
- **PrimeVue 4.4** - Rich UI Component Library
- **PrimeIcons 7.0** - Icon Library
- **Aura Theme** - Modern Dark Theme

### Utilities
- **Axios 1.13** - Promise-based HTTP Client
- **date-fns 4.1** - Modern JavaScript Date Utility

### Development Tools
- **ESLint 9.37** - Code Linting
- **Prettier 3.6** - Code Formatting
- **vue-tsc 3.1** - TypeScript Type Checking for Vue

## 시작하기

### 필수 요구사항

- **Node.js**: v20.19.0 이상 또는 v22.12.0 이상
- **npm**: Node.js와 함께 설치됨

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd erp_frontend

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 서버 시작 (Hot-reload)
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173`로 접속합니다.

### 빌드

```bash
# 타입 체크 + 프로덕션 빌드
npm run build

# 타입 체크만 실행
npm run type-check

# 빌드만 실행 (타입 체크 제외)
npm run build-only
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 프리뷰

```bash
# 프로덕션 빌드 미리보기
npm run preview
```

### 코드 품질

```bash
# ESLint 실행 (자동 수정)
npm run lint

# Prettier 포맷팅
npm run format
```

## 프로젝트 구조

```
erp_frontend/
├── src/
│   ├── assets/              # 정적 리소스 (CSS, 이미지 등)
│   │   └── main.css        # 전역 스타일
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── router/              # Vue Router 설정
│   │   └── index.ts        # 라우트 정의 및 가드
│   ├── services/            # API 서비스 레이어
│   │   ├── api.ts          # Axios 인스턴스 설정
│   │   ├── attendanceService.ts  # 근태 API
│   │   ├── leaveService.ts       # 연차 API
│   │   ├── salaryService.ts      # 급여 API
│   │   └── adminService.ts       # 관리자 API
│   ├── stores/              # Pinia 스토어
│   │   └── auth.ts         # 인증 상태 관리
│   ├── types/               # TypeScript 타입 정의
│   │   ├── attendance.ts   # 근태 타입
│   │   ├── leave.ts        # 연차 타입
│   │   ├── salary.ts       # 급여 타입
│   │   └── user.ts         # 사용자 타입
│   ├── views/               # 페이지 컴포넌트
│   │   ├── admin/          # 관리자 전용 페이지
│   │   │   ├── AdminAttendanceView.vue
│   │   │   ├── AdminLeaveRequestsView.vue
│   │   │   └── AdminUsersView.vue
│   │   ├── AttendanceView.vue    # 근태 관리
│   │   ├── DashboardView.vue     # 대시보드
│   │   ├── LeaveView.vue         # 연차 관리
│   │   ├── LoginView.vue         # 로그인
│   │   ├── MainLayout.vue        # 메인 레이아웃
│   │   ├── ProfileView.vue       # 프로필
│   │   └── SalaryView.vue        # 급여 관리
│   ├── App.vue              # 루트 컴포넌트
│   └── main.ts              # 애플리케이션 엔트리 포인트
├── public/                  # 정적 파일
├── dist/                    # 빌드 출력 (생성됨)
├── .gitignore
├── CLAUDE.md               # 프로젝트 가이드
├── README.md               # 이 파일
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## API 연동

### 백엔드 설정

기본 API URL: `http://127.0.0.1:8000`

백엔드 URL을 변경하려면 `src/services/api.ts` 파일을 수정합니다:

```typescript
const api = axios.create({
  baseURL: 'http://your-backend-url:port',
  timeout: 10000,
});
```

### 인증 흐름

1. **로그인**: POST `/auth/token` - JWT 토큰 발급
2. **토큰 저장**: localStorage + Pinia store
3. **자동 헤더 추가**: 모든 API 요청에 `Authorization: Bearer {token}` 자동 포함
4. **401 처리**: 자동 로그아웃 및 로그인 페이지로 리다이렉트

### 주요 API 엔드포인트

#### 인증
- `POST /auth/token` - 로그인
- `GET /users/me` - 현재 사용자 정보

#### 근태 관리
- `GET /attendance/today` - 오늘 근태 조회
- `POST /attendance/check-in` - 출근 체크인
- `PATCH /attendance/check-out` - 퇴근 체크아웃
- `GET /attendance/my-records` - 내 근태 기록
- `GET /attendance/my-stats` - 내 근태 통계

#### 연차 관리
- `GET /leave/balance` - 연차 잔여 현황
- `GET /leave/requests` - 내 연차 신청 내역
- `POST /leave/request` - 연차 신청

#### 급여 관리
- `GET /salary` - 급여 명세서 목록
- `POST /salary` - 급여 명세서 생성

#### 관리자 전용
- `GET /users/admin/all` - 전체 사용자 목록
- `GET /attendance/admin/all-records` - 전체 근태 기록
- `POST /attendance/admin/create/{user_id}` - 근태 수동 생성
- `GET /leave/admin/all-requests` - 전체 연차 신청
- `PATCH /leave/admin/approve/{request_id}` - 연차 승인
- `PATCH /leave/admin/reject/{request_id}` - 연차 거절

## 개발 가이드

### 라우트 가드

```typescript
// 인증이 필요한 페이지
meta: { requiresAuth: true }

// 게스트 전용 페이지 (로그인 페이지 등)
meta: { guestOnly: true }

// 관리자 전용 페이지
meta: { requiresAuth: true, requiresAdmin: true }
```

### 상태 관리 (Pinia)

```typescript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 인증 상태 확인
authStore.isAuthenticated

// 관리자 권한 확인
authStore.isAdmin

// 사용자 정보
authStore.user

// 로그인/로그아웃
await authStore.login(email, password)
authStore.logout()
```

### Toast 알림 사용

```typescript
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// 성공 메시지
toast.add({
  severity: 'success',
  summary: '성공',
  detail: '작업이 완료되었습니다.',
  life: 3000
});

// 에러 메시지
toast.add({
  severity: 'error',
  summary: '오류',
  detail: '작업에 실패했습니다.',
  life: 5000
});

// 경고 메시지
toast.add({
  severity: 'warn',
  summary: '경고',
  detail: '입력 값을 확인해주세요.',
  life: 3000
});
```

### 날짜 처리

```typescript
import { format, startOfMonth, endOfMonth } from 'date-fns';

// 날짜 포맷팅
const formattedDate = format(new Date(), 'yyyy-MM-dd');

// 이번 달 시작일/종료일
const start = startOfMonth(new Date());
const end = endOfMonth(new Date());
```

## 스타일 가이드

### 다크 테마 색상

```css
/* 주요 색상 */
--primary-color: #64ffda;        /* 청록색 (강조색) */
--bg-primary: #242938;           /* 주 배경색 */
--bg-secondary: #1a1d29;         /* 보조 배경색 */
--border-color: #2d3348;         /* 테두리색 */
--text-primary: #e1e4e8;         /* 주 텍스트색 */
--text-secondary: #a8b2d1;       /* 보조 텍스트색 */

/* 상태 색상 */
--success: #52c41a;              /* 성공 (정상 출근) */
--warning: #faad14;              /* 경고 (지각) */
--danger: #f5222d;               /* 위험 (결근) */
--info: #ff7a45;                 /* 정보 (조퇴) */
```

### 반응형 브레이크포인트

```css
/* 모바일 */
@media (max-width: 480px) { }

/* 모바일 ~ 태블릿 */
@media (max-width: 768px) { }

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 데스크톱 */
@media (min-width: 1025px) { }
```

## 보안

- JWT 토큰 기반 인증
- 모든 API 요청에 자동 토큰 포함
- 401 응답 시 자동 로그아웃
- 라우트 가드로 권한 제어
- TypeScript strict mode로 타입 안정성 확보

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

Built with Vue 3 + TypeScript + PrimeVue
