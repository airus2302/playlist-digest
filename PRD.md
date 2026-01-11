# PRD — Playlist Digest (Web MVP, Remix)

> 한 줄: 유튜브 **재생목록(Playlist)**에 쌓인 영상을 “끝까지 시청”이 아니라 **요약 + 근거 + 1클릭 결정(보기/건너뛰기/날짜 지정)**으로 빠르게 정리하도록 돕는 서비스.

- 문서 버전: v1.0
- 기준일: 2026-01-12 (KST)
- 상태: MVP 개발 착수용 **확정 PRD**
- 기술 전제: **Remix(Web) + Worker(BullMQ) + Postgres + Redis**

---

## 1) 배경과 문제 정의

### 1.1 고객 문제
- 사용자는 유튜브 재생목록에 영상을 계속 저장하지만, **볼 시간이 없어 누적**된다.
- “언젠가 보겠지”가 쌓이면서:
  - 선택 비용(무엇을 볼지 고르는 비용)이 증가
  - 죄책감/스트레스가 증가
  - 결국 아무 것도 실행하지 않게 된다

### 1.2 우리가 푸는 문제
- “콘텐츠를 더 많이 보게 하는 것”이 아니라,
- **결정 비용을 줄여서 다음 행동을 확정**하게 만든다.

---

## 2) 제품 목표 / 성공 지표

### 2.1 목표(Outcome)
- 유저가 재생목록 영상을 **결정(WATCH / PASS / SCHEDULE)** 하도록 만든다.
- 요약 품질 자체보다 **결정 속도·결정률**이 핵심이다.

### 2.2 KPI (MVP 핵심 3개)
1) **Decision Rate (결정 완료율)**  
   - `결정된 영상 수 / 요약 완료(READY) 영상 수`
2) **Burn-down (정리 진행률)**  
   - `초기 재생목록 규모 입력값 대비 미결정 잔량 감소`
3) **Minutes Reclaimed (회복 시간)**  
   - `Σ(영상 길이 - 요약 소비시간)`  
   - MVP에서는 요약 소비시간을 **60초 고정값**으로 산정

### 2.3 보조 지표
- 요약 생성 성공률 / 평균 지연시간(p50/p95)
- transcript 확보율(PASTE vs UNOFFICIAL 시도 비율)
- Day1/Day7 retention
- 크레딧 소진 속도(주당/일당)

---

## 3) 타겟 고객 / 페르소나

### 3.1 타겟
- 유튜브 재생목록에 영상을 계속 추가하지만 실제로는 시간을 못 내는 성인
- 학습/업무/투자/취미 목적의 “저장형” 사용자

### 3.2 페르소나 예시
- **지식 수집형 직장인**: 저장은 많이 하지만, 퇴근 후 집중 시간이 적다.
- **학습형 프리랜서**: 학습 재생목록이 많아 “우선순위”가 필요하다.
- **의사결정형(투자/업무)**: 빠른 판단(필요/불필요)이 목적이다.

---

## 4) 제품 포지셔닝 / 차별점

- 단순 요약 서비스가 아니라 **결정 UX**가 제품의 핵심.
- 결과물을 “읽고 끝”이 아니라 **행동(보기/건너뛰기/스케줄)**로 연결한다.
- 유저별 프리셋 + 자동 카테고리로 시간이 갈수록 개인화된다.
- 모델은 **Local 기본 + Remote 백업**으로 비용/프라이버시/안정성을 분산한다.

---

## 5) 범위(Scope)

### 5.1 MVP 포함
- Google OAuth 로그인
- 온보딩(재생목록 규모 입력, 기본 언어/프리셋 설정)
- URL 단일/일괄 추가
- 영상 메타 수집(title/channel/duration/thumbnail)
- transcript: **붙여넣기(PASTE) 기반**
- 요약 생성(고정 JSON 스키마) + 근거 타임스탬프(가능 시)
- 프리셋 CRUD + 영상별 override 1줄
- 자동 카테고리 생성/관리(병합/이름변경)
- 결정 버튼 3개 + 대시보드 KPI 3개
- 크레딧 원장(요약 성공 시 -1, 실패 시 0)
- 어드민(유저/크레딧/잡/실패율)

### 5.2 MVP 제외(명시)
- 유튜브 재생목록 자동 동기화
- 결제/구독/충전 결제 연동
- 모바일 앱(웹 반응형만)
- 팀/공유 기능
- 고급 추천/자동 우선순위 알고리즘(v1 이후)

---

## 6) 핵심 사용자 플로우

### 6.1 첫 가치 체감(60초 플로우)
1) 로그인(Google)
2) 온보딩에서 “재생목록 규모(대략)” 입력 (선택)
3) URL 1개 추가
4) 요약 카드 생성(READY)
5) 결정 버튼 1회 클릭 → 대시보드 반영

### 6.2 반복 사용 플로우
- `/videos`에서 READY 목록을 빠르게 훑고 결정
- 실패(NO_TEXT) 카드는 클릭 시 `/videos/:id/transcript`로 이동
- SCHEDULE은 날짜 도래 시 상단 노출(“오늘 결정할 영상”)

---

## 7) 기능 요구사항(Functional Requirements)

### 7.1 인증/계정
- Google OAuth 로그인
- 사용자 기본 설정:
  - 언어 모드: `original | ko | bilingual`
  - 모델 모드: `local` 기본, `remote`는 백업

### 7.2 영상 추가
- 단일 URL 추가
- 여러 URL 일괄 추가(줄바꿈)
- URL에서 `youtubeVideoId` 파싱
- 중복 방지: 사용자 기준 같은 videoId는 1개만

### 7.3 메타 수집
- title / channelTitle / durationSeconds / thumbnailUrl / publishedAt 저장
- 메타 조회 실패(비공개/삭제 등) 시 `FAILED(VIDEO_UNAVAILABLE)` 처리

### 7.4 transcript 입력(PASTE)
- UI: `/videos/:id/transcript`
- 붙여넣기 텍스트 저장 후 요약 재시도 enqueue
- 너무 긴 텍스트는 서버에서 chunk 처리

> 옵션(기본 OFF): 비공식 transcript 수집은 정책 리스크로 격리  
- `ENABLE_UNOFFICIAL_TRANSCRIPT=false` 기본  
- MVP 기본 경로는 PASTE만으로도 가치가 전달되게 UX를 최적화한다.

### 7.5 요약 생성
- 요약 결과는 **고정 JSON 스키마**를 반드시 만족해야 저장:
```json
{
  "bullets": ["", "", "", "", ""],
  "evidence": [{ "tSec": 0, "label": "" }],
  "decisionHint": "",
  "categoryLabel": "",
  "outputLanguage": "original|ko|bilingual"
}
```
- 스키마 불일치 시 자동 재시도 **최대 3회**
- 요약 성공 시:
  - `UserVideo.status = READY`
  - `Summary` 저장
  - 크레딧 -1(원장 기록)

### 7.6 프리셋/오버라이드
- 프리셋 구성:
  - 체크박스 옵션(근거/액션/숫자 강조/스폰서 제외 등)
  - 자유 텍스트 지시사항
  - 출력 언어 모드
- 영상별 override:
  - “이번 영상만” 1줄
  - preset + override는 모델 입력에 결합

### 7.7 자동 카테고리
- 요약 생성 시 `categoryLabel` 생성
- 사용자 카테고리 테이블에 없으면 자동 생성
- 카테고리 관리:
  - 이름 변경
  - 병합(선택 → 병합)
  - 필터링(`/videos`)

### 7.8 결정(Next Action)
- 버튼 3개:
  - **보기(WATCH)**
  - **건너뛰기(PASS)**
  - **날짜 지정(SCHEDULE)**
- 결정 시:
  - status: `DECIDED_WATCH|DECIDED_PASS|DECIDED_SCHEDULED`
  - decidedAt 기록
  - schedule일 경우 scheduledAt 필수(과거 금지)

### 7.9 대시보드
- KPI 3개 + 최근 7일 추이
- “오늘 결정할 영상” 섹션:
  - READY 우선
  - scheduledAt <= today인 항목 상단 배치

### 7.10 크레딧
- 크레딧 원장(ledger)로 추적
- 차감 규칙:
  - 요약 저장 성공 시 -1
  - NO_TEXT/실패는 차감 없음
- MVP 결제는 제외(어드민 지급/회수)

### 7.11 어드민(Admin)
- 유저 검색/상세
- 크레딧 지급/차감(원장 기록)
- 잡 모니터:
  - 실패 사유 Top N
  - 평균 처리 시간(p50/p95)
  - provider 비율(LOCAL/REMOTE)
  - transcript sourceType 비율(PASTE/UNOFFICIAL)
- 운영 토글:
  - ENABLE_UNOFFICIAL_TRANSCRIPT
  - REMOTE_BACKUP_ENABLED

---

## 8) 비기능 요구사항(Non-functional Requirements)

### 8.1 성능
- 요약 생성 p50 < 30s, p95 < 120s (환경/모델에 따라 변동 가능)
- `/videos` 리스트 조회 p95 < 500ms

### 8.2 신뢰성
- 워커 장애 시에도 웹은 정상 동작(큐 적재)
- 요약 작업은 idempotent(중복 enqueue 방지 키)
- 실패는 명확한 `failReason`로 사용자에게 안내

### 8.3 보안/프라이버시
- Local endpoint URL/token은 **암호화 저장**
- 사용자 데이터는 `userId`로 엄격히 스코핑
- 로그에 transcript 원문을 기본적으로 남기지 않음(옵션/마스킹 정책)

### 8.4 데이터 보관 정책
- MVP: transcript/summary **영구 저장**
- 추후: 모델 평가/개선(내부) 목적 사용 옵션 마련

---

## 9) 정보 설계(IA) / 페이지 맵

- `/` Home (Public)
- `/login` Login (Public)
- `/onboarding` Onboarding (User)
- `/videos` Videos List (User)
- `/videos/add` Add Videos (User)
- `/videos/:id` Video Detail (User)
- `/videos/:id/transcript` Paste Transcript (User)
- `/dashboard` Dashboard (User)
- `/settings` Settings (User)
- `/settings/presets` Presets (User)
- `/settings/categories` Categories (User)
- `/admin` Admin Home (Admin)
- `/admin/users/:id` Admin User (Admin)

---

## 10) 기술/아키텍처 개요(요약)

- Web: Remix (UI routes + Resource routes)
- Worker: BullMQ (meta → transcript → summary 파이프라인)
- DB: Postgres
- Cache/Queue: Redis
- 모델:
  - Local 기본(provider: 사용자 endpoint)
  - Remote 백업(옵션)

---

## 11) 릴리즈 플랜(권장)

### v0.1 (MVP)
- URL 추가 → PASTE transcript → 요약 → 결정 → KPI
- 프리셋/카테고리/어드민 최소 세트

### v0.2
- URL 일괄 추가 UX 개선
- 스케줄 알림(이메일/푸시/슬랙 중 1개)
- 카테고리 병합 추천(자동 제안)

### v1.0
- 확장 프로그램(원클릭 URL 추가)
- 결제/구독/충전 결제 연동
- 더 강한 개인화(우선순위/추천)

---

## 12) 오픈 이슈 / 추후 결정 사항(보류)

- Remote 백업 사용 조건(Timeout만 vs InvalidSummary 포함)
- Summary 버저닝(overwrite vs version table)
- 이벤트 스키마(원가 추정: 토큰/latency) 범위

---

## 13) 완료 정의(Definition of Done)
- 첫 사용자 플로우(로그인→URL추가→요약→결정→대시보드)가 끊김 없이 동작
- 실패 케이스(NO_TEXT/VIDEO_UNAVAILABLE/INVALID_SUMMARY)가 UI에서 명확히 안내
- 크레딧 차감이 “요약 성공”에만 발생
- Admin에서 유저/크레딧/잡/실패율을 확인 가능
- 최소 로그/메트릭으로 문제 재현 가능(p95/실패사유)
