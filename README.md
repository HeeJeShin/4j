# 4J - 행사장 수용인원 자동계산

AI 기반 행사장 수용인원 자동 계산 및 실시간 혼잡도 모니터링 서비스

**Demo:** https://4j-mgqp.vercel.app/

## 주요 기능

### 1. 수용인원 계산
- 행사장 유형별 수용인원 계산 (스탠딩/연회형/극장형/교실형)
- 도면 이미지 AI 분석 (부스 개수, 출입구, 면적 추정)
- 혼잡도 레벨별 인원 예측 (Level 1~5)
- 비상구 처리량 고려한 안전 인원 산출

### 2. 실시간 혼잡도 모니터링
- 현재 인원 실시간 표시 및 혼잡도 레벨 시각화
- 갱신 주기 선택 (1분 / 10분 / 1시간)
- Level 3 이상 시 경고 알림
- 카카오톡 알림 미리보기 (아이폰 목업)
- 인원 변동 히스토리 테이블

## 사용 흐름

```
메인 페이지 (/)
├── Step 1: 행사 정보 입력
├── Step 2: 도면 업로드 → AI 분석 (10초)
└── Step 3: 수용인원 결과 → "실시간 혼잡도 체크" 버튼

모니터링 페이지 (/monitor)
├── 혼잡도 게이지 및 레벨 표시
├── 모니터링 시작/중지
├── 카톡 알림 미리보기
└── 인원 변동 히스토리
```

## 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

## 환경변수 설정

`.env.local` 파일 생성:
```
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## 실행

```bash
pnpm dev
```

http://localhost:3000 접속

## 기술 스택

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Library:** Material UI
- **AI:** Google Gemini AI

## 계산 공식

### 행사장 유형별 1인당 면적
| 유형 | 면적 (㎡/인) |
|------|-------------|
| 스탠딩 | 0.5 |
| 연회형 | 1.5 |
| 극장형 | 0.8 |
| 교실형 | 2.0 |

### 혼잡도 레벨
| Level | 상태 | 기준 밀도 |
|-------|------|----------|
| 1 | 쾌적 | 30% |
| 2 | 여유 | 50% (권장) |
| 3 | 혼잡 | 70% (최대) |
| 4 | 매우혼잡 | 90% |
| 5 | 위험 | 110% |

## 폴더 구조

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # AI 도면 분석
│   │   └── calculate/route.ts  # 수용인원 계산
│   ├── monitor/
│   │   └── page.tsx            # 실시간 모니터링
│   ├── page.tsx                # 메인 (수용인원 계산)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── FileUpload.tsx
│   │   ├── CongestionLevel.tsx
│   │   ├── ProgressStepper.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── index.ts
│   └── steps/
│       ├── Step1EventInfo.tsx
│       ├── Step2Analysis.tsx
│       ├── Step3Results.tsx
│       └── index.ts
└── types/
    └── index.ts
```

## 라이선스

MIT
