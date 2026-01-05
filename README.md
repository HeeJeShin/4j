# 4J - 행사장 수용인원 자동계산

AI 기반 행사장 수용인원 자동 계산 서비스

## 기능

- 행사장 유형별 수용인원 계산 (스탠딩/연회형/극장형)
- 도면 이미지 AI 분석 (부스 개수, 출입구, 면적 추정)
- 혼잡도 레벨별 인원 예측 (1~5 레벨)
- 비상구 처리량 고려한 안전 인원 산출

## 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

## 환경변수 설정

`.env.local` 파일에 Google AI API 키 입력:
```
GOOGLE_AI_API_KEY=your_api_key
```

## 실행

```bash
pnpm dev
```

http://localhost:3000 접속

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini AI

## 계산 공식

### 행사장 유형별 1인당 면적
- 스탠딩: 0.5㎡
- 연회형: 1.3~1.9㎡
- 극장형: 0.65~1.0㎡

### 혼잡도 레벨
1. 안전 (30% 밀도)
2. 여유 (50% 밀도) - 권장
3. 혼잡 (70% 밀도) - 최대
4. 위험 (90% 밀도)
5. 매우 위험 (110% 밀도)

## 폴더 구조

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts  # AI 도면 분석
│   │   └── calculate/route.ts # 수용인원 계산
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── FileUpload.tsx
│   │   ├── CongestionLevel.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   └── layout/
│       ├── Header.tsx
│       └── index.ts
└── types/
    └── index.ts
```
