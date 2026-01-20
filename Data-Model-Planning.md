# Data Model Planning Worksheet

## **소개**
- 개발에 앞서 애플리케이션의 **데이터 구조를 최대한 체계적으로 정의**하는 것이 이 과제의 목표입니다.
- 엔터티, 필드, 관계, 권한, 비즈니스 규칙 등을 사전에 정리하는 작업은 **데이터 모델링의 오류나 누락을 줄이고**, 이후 개발의 방향성을 명확히 하는 데 큰 도움이 됩니다.
- **어떤 엔터티(데이터 객체)** 들이 존재하며, **서로 어떤 관계와 규칙**을 가지고 있는지를 중심으로 워크시트를 작성해보세요.
- 작성이 어렵다면, 함께 제공되는 예시를 참고하셔도 좋습니다.

## 1. 시스템의 핵심 엔터티(Entities)는 무엇인가요? (3~5개)
*애플리케이션에서 관리할 핵심 객체(주로 데이터베이스 테이블이 될 대상)를 3~5개 나열하세요.*

- User: 서비스 사용자(로그인/설정/크레딧 보유)
- Video: 유튜브 영상 메타데이터(영상 자체)
- UserVideo: 사용자별 영상 항목(상태/결정/카테고리/프리셋 적용)
- 사용자 요약 지시사항 템플릿(프리셋)
- Summary: 요약 결과(고정 JSON 스키마) + 생성 메타데이터

---

## 2. 각 엔터티의 필드를 정의하세요:
*각 엔터티에 대해 주요 속성과 데이터 타입, 필요한 제약 조건 등을 정의하세요.*

**[User]**
- `id` (uuid, PK)
- `email` (text, unique, not null)
- `displayName` (text, null)
- `googleSub` (text, unique, not null) — Google OAuth subject
- `timezone` (text, not null, default 'Asia/Seoul')
- `localeMode` (text, not null) — enum: `original | ko | bilingual`
- `modelMode` (text, not null) — enum: `local | remote`
- `localEndpointUrlEnc` (text, null) — 사용자 로컬 LLM endpoint URL(암호화 저장)
- `localEndpointTokenEnc` (text, null) — optional token(암호화 저장)
- `remoteProvider` (text, null) — enum-like: `openai_compat | ...`
- `createdAt` (timestamptz, not null, default now())
- `updatedAt` (timestamptz, not null)

**[Video]**
- `id` (uuid, PK)
- `youtubeVideoId` (text, unique, not null)
- `title` (text, not null)
- `channelTitle` (text, not null)
- `durationSeconds` (int, not null, check >= 0)
- `publishedAt` (timestamptz, null)
- `thumbnailUrl` (text, null)
- `createdAt` (timestamptz, not null, default now())
- `updatedAt` (timestamptz, not null)

**[UserVideo]**
- `id` (uuid, PK)
- `userId` (uuid, FK -> User.id, not null, indexed)
- `videoId` (uuid, FK -> Video.id, not null, indexed)
- `status` (text, not null) — enum:  
  `IN_QUEUE | READY | DECIDED_WATCH | DECIDED_PASS | DECIDED_SCHEDULED | FAILED`
- `failReason` (text, null) — enum: `VIDEO_UNAVAILABLE | NO_TEXT | INVALID_SUMMARY | MODEL_TIMEOUT | ...`
- `addedAt` (timestamptz, not null, default now())
- `scheduledAt` (timestamptz, null) — status=DECIDED_SCHEDULED일 때 필수
- `decisionType` (text, null) — enum: `WATCH | PASS | SCHEDULE`
- `decidedAt` (timestamptz, null)
- `presetId` (uuid, FK -> Preset.id, null) — 적용 프리셋
- `overrideInstruction` (text, null) — “이번 영상만” 1줄
- `categoryLabel` (text, null) — 자동 생성 라벨(사용자 언어모드에 맞춤)
- `categoryId` (uuid, null) — (선택) 카테고리 엔터티를 별도 운영한다면 FK
- `createdAt` (timestamptz, not null, default now())
- `updatedAt` (timestamptz, not null)

> 제약:
- `unique(userId, videoId)` — 사용자별 같은 영상 중복 추가 방지
- `check( (status='DECIDED_SCHEDULED') = (scheduledAt is not null) )` 같은 검증 권장

**[Preset]**
- `id` (uuid, PK)
- `userId` (uuid, FK -> User.id, not null, indexed)
- `name` (text, not null)
- `optionsJson` (jsonb, not null) — focusFlags/exclusions/style/outputLanguageMode 등
- `extraInstructionText` (text, not null, default '')
- `isDefault` (bool, not null, default false)
- `createdAt` (timestamptz, not null, default now())
- `updatedAt` (timestamptz, not null)

> 제약:
- 사용자당 `isDefault=true`는 최대 1개(부분 unique index 권장)

**[Summary]**
- `id` (uuid, PK)
- `userVideoId` (uuid, FK -> UserVideo.id, unique, not null)
- `outputLanguageMode` (text, not null) — `original | ko | bilingual`
- `modelProvider` (text, not null) — `LOCAL | REMOTE`
- `promptVersion` (text, not null, default 'v1')
- `summaryJson` (jsonb, not null) — 고정 스키마(핵심5/근거/결정힌트/카테고리)
- `tokenEstimate` (int, null) — 원가 추정용(옵션)
- `latencyMs` (int, null) — 성능 측정용(옵션)
- `createdAt` (timestamptz, not null, default now())

---

## 3. 어떤 관계들이 존재하나요?
*각 엔터티 간의 관계를 정의하세요 (예: 일대다, 다대다 등). 가능하다면 ERD(엔터티 관계도)를 그려보세요.*

- **User (1) — (N) Preset**  
  한 사용자는 여러 프리셋을 가짐.
- **Video (1) — (N) UserVideo**  
  동일 영상이 여러 사용자에게 추가될 수 있음.
- **User (1) — (N) UserVideo**  
  사용자는 여러 영상을 자신의 목록에 추가함.
- **UserVideo (1) — (1) Summary**  
  한 사용자 영상 항목에는 요약 결과가 최대 1개(최신 1개)로 유지(재요약은 overwrite 또는 버전 테이블 확장).
- **Preset (1) — (N) UserVideo (optional)**  
  각 UserVideo는 특정 프리셋을 적용할 수 있음(없으면 기본 프리셋/시스템 기본값 사용).

---

## 4. 어떤 CRUD 작업이 필요한가요?
*각 엔터티에 대해 Create, Read, Update, Delete 중 어떤 작업이 필요한지, 그리고 누가 수행할 수 있는지를 정의하세요.*

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| User | (System) Google OAuth 로그인 시 생성 | User/Admin | User(설정), Admin(관리) | Admin(탈퇴 처리), User(자기 삭제 요청) |
| Video | (System) URL 추가 시 메타 수집 후 생성 | User/Admin | System(메타 갱신), Admin | Admin(정리), System(soft delete) |
| UserVideo | User(링크 추가) | User/Admin | User(결정/스케줄/카테고리/프리셋), System(status 갱신) | User(목록에서 제거: soft delete), Admin |
| Preset | User | User/Admin | User | User |
| Summary | System(요약 성공 시) | User/Admin | System(재요약 overwrite 또는 버저닝), Admin(재처리) | Admin(삭제), User(삭제 요청) |

> 권한 용어 예시:
- **User**: 로그인 사용자
- **Admin**: 운영자(크레딧 지급/로그/잡 모니터링 포함)
- **System**: 워커/백엔드 잡

---

## 5. 어떤 규칙이나 제약이 존재하나요?
*비즈니스 규칙, 입력값 유효성 검증, 데이터 무결성 제약 조건 등을 작성하세요.*

- **중복 방지**: `unique(userId, videoId)`로 같은 영상 중복 추가 금지.
- **상태 전이 규칙**:
  - `IN_QUEUE → READY`는 **Summary 생성 성공**에서만 가능.
  - `FAILED(NO_TEXT)`는 transcript가 없을 때만, paste 저장 후 재시도 가능.
- **결정 규칙**:
  - `DECIDED_SCHEDULED`일 때는 `scheduledAt` 필수(과거 날짜 금지).
  - `decisionType`과 `status`는 일관되게 유지(예: `decisionType=PASS`면 status는 `DECIDED_PASS`).
- **요약 스키마 강제**:
  - Summary 저장 전 `summaryJson`이 고정 스키마를 만족해야 함.
  - 불일치 시 최대 3회 재시도 후 `FAILED(INVALID_SUMMARY)`.
- **크레딧 차감 규칙**:
  - 요약 저장 성공 시에만 -1.
  - 실패/NO_TEXT는 차감 없음.
- **프리셋 기본값 제약**:
  - 사용자당 기본 프리셋 1개만 허용(부분 unique index).
- **보안/프라이버시**:
  - Local endpoint URL/token은 암호화 저장.
  - 사용자 데이터는 `userId`로 엄격히 스코핑.
- **영구 보관 정책(MVP)**:
  - transcript/summary는 기본 영구 저장(추후 모델 평가/개선에 활용).