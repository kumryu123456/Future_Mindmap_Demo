# Future Mindmap — RAG 기반 커리어 추천 시스템

2025.08 유니톤(Uni-D) 해커톤 참가작 | 백엔드 팀 리더

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 프로젝트 소개
h
사용자가 관심사와 역량을 입력하면 RAG(Retrieval Augmented Generation) 기반으로 맞춤형 커리어 로드맵을 마인드맵 형태로 시각화해주는 서비스입니다. 유니톤 해커톤에서 백엔드 팀장을 맡아 기획부터 배포까지 전 과정을 담당했습니다.

---

## 성과

| 지표 | 결과 |
|------|------|
| 검색 정확도 | 62% → 87% 향상 (RAG 도입 후) |
| 평균 응답시간 | 0.5초 이내 |
| API 엔드포인트 | 10개 Edge Function 구현 |
| 팀 구성 | 프론트엔드 3명 + 백엔드 2명 |

---

## 담당 역할

백엔드 아키텍처 전반을 설계하고 구현했습니다.

- Supabase Edge Functions 기반 서버리스 API 설계
- OpenAI Embeddings(ada-002) + FAISS로 벡터 유사도 검색 구현
- 한국어 형태소 분석, 감성 분석, UTF-8 인코딩 처리 모듈 개발
- 마인드맵 상태 저장·복원 API 설계 (save-session / load-session)
- 기획, 일정 관리, 코드 리뷰 총괄

---

## 아키텍처

```
[사용자 입력]
     |
[Frontend: React 19 + XYFlow + Zustand]
     |
[Supabase Edge Functions (Deno/TypeScript)]
 ├── /parse-input       한국어 NLP 처리
 ├── /generate-plan     OpenAI GPT 커리어 플랜 생성
 ├── /auto-expand       벡터 유사도 기반 노드 자동 확장
 ├── /rag-detail        RAG 상세 내용 보강
 └── /manage-embeddings 임베딩 배치 처리
     |
    [PostgreSQL + FAISS]
 ├── mindmap_nodes
 ├── embeddings
 └── user_sessions
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, XYFlow, Zustand, Vite |
| Backend | Supabase Edge Functions, Deno |
| Database | PostgreSQL, FAISS |
| AI/ML | OpenAI GPT, OpenAI Embeddings (ada-002) |
| Infra | Supabase Cloud, Vercel |

---

## 기술 선택 이유

**Supabase Edge Functions** — 해커톤이라 인프라 세팅에 시간을 쓸 수 없었습니다. 별도 서버 없이 DB와 API를 함께 관리할 수 있는 Supabase를 선택했고, Edge Function으로 지연 없이 서버리스 API를 빠르게 구성할 수 있었습니다.

**FAISS** — 벡터 DB를 별도로 띄우면 인프라 복잡도가 올라갑니다. FAISS 인메모리 벡터 검색으로 외부 서비스(Pinecone/Weaviate) 없이 p99 검색 50ms 이내를 달성했습니다. 해커톤 환경에서 빠른 시맨틱 검색 구현에 최적이었습니다.니다.

**OpenAI ada-002** — 한국어 임베딩 품질 테스트를 여러 모델로 해봤을 때 ada-002가 한국어 IT 용어에서 가장 안정적인 유사도를 보였습니다. 비용 대비 성능이 좋아 선택했습니다.

---

## 검색 정확도 62% → 87% 개선 과정

초기에는 단순 키워드 검색으로 시작했는데, 한국어 특성상 조사와 어미 변화 때문에 정확도가 낮았습니다. 세 가지 방향으로 개선했습니다.

1. 키워드 검색 → FAISS 기반 시맨틱 검색으로 전환
2. 한국어 형태소·감성 분석 전처리 추가로 임베딩 품질 향상
3. IT 용어 도메인 인식 모듈 추가

---

## 실행 방법

```bash
git clone https://github.com/kumryu123456/Future_Mindmap_Demo.git
cd Future_Mindmap_Demo
npm install

# 환경변수 설정 (frontend/.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

---

## 프로젝트 구조

```
Future_Mindmap_Demo/
├── frontend/
│   └── src/
│       ├── components/  마인드맵 UI 컴포넌트
│       ├── hooks/       Custom React Hooks
│       ├── services/    API 통신 레이어
│       └── store/       Zustand 상태 관리
├── backend/
│   └── supabase/
│       ├── functions/   Edge Function API (10개)
│       └── migrations/  DB 스키마
└── README.md
```

---

## 팀 구성

| 역할 | 담당자 |
|------|--------|
| 백엔드 팀장 | 김경민 — 아키텍처 설계, RAG 파이프라인, API 구현 |
| 백엔드 | 심민성 — DB 설계, 세션 관리 |
| 프론트엔드 | 3명 — React 마인드맵 UI |

---

## 회고

해커톤이라 시간이 촉박했는데, RAG 파이프라인 전체를 처음부터 구현해야 했습니다. 초반에 키워드 검색으로 빠르게 프로토타입을 만들고, 이후 pgvector 기반 시맨틱 검색으로 교체하는 방식으로 접근했습니다. 한국어 NLP 처리를 추가하면서 정확도가 크게 올라갔고, "데이터 품질이 AI 성능의 핵심"이라는 걸 직접 체감한 프로젝트였습니다.
