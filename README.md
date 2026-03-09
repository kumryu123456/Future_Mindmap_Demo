# 🗺️ Future Mindmap — RAG 기반 커리어 추천 시스템

> **2025.08 유니톤(Uni-D) 해커톤 참가작** | 백엔드 팀 리더

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 📌 프로젝트 개요

사용자가 자신의 관심사와 역량을 입력하면, **RAG(Retrieval Augmented Generation)** 기반으로 맞춤형 커리어 로드맵을 마인드맵 형태로 시각화해주는 시스템입니다.

유니온(Uni-D) 해커톤에서 팀장을 맡아 기획부터 배포까지 전 과정을 리드하였습니다.

---

## 🏆 주요 성과

| 지표 | 결과 |
|------|------|
| 검색 정확도 | 62% → **87%** 향상 (RAG 도입 후) |
| 평균 응답시간 | **0.5초 이내** |
| API 엔드포인트 | 10개 Edge Function 구현 |
| 팀 구성 | 프론트 2명 + 백엔드 2명 (팀장 역할) |

---

## 🎯 내가 기여한 부분

- **백엔드 아키텍처 설계**: Supabase Edge Functions 기반 서버리스 API 설계 및 구현
- **RAG 파이프라인 구축**: OpenAI Embeddings(ada-002) + pgvector로 벡터 유사도 검색 구현
- **한국어 NLP 처리**: 형태소 분석, 감성 분석, UTF-8 인코딩 처리 모듈 개발
- **세션 관리 시스템**: 마인드맵 상태 저장·복원 API 설계 (save-session / load-session)
- **팀 리딩**: 기획·일정 관리·코드 리뷰 총괄

---

## 🏗️ 시스템 아키텍처

```
[사용자 입력]
    │
    ▼
[Frontend: React 19 + XYFlow + Zustand]
    │
    ▼
[Backend: Supabase Edge Functions (Deno/TypeScript)]
    ├── /parse-input      ← 한국어 NLP 처리
    ├── /generate-plan    ← OpenAI GPT 커리어 플랜 생성
    ├── /auto-expand      ← 벡터 유사도 기반 노드 자동 확장
    ├── /rag-detail       ← RAG 상세 내용 보강
    └── /manage-embeddings ← 임베딩 배치 처리
    │
    ▼
[PostgreSQL + pgvector]
    ├── mindmap_nodes
    ├── embeddings (벡터 검색)
    └── user_sessions
```

---

## ⚙️ 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, XYFlow, Zustand, Vite |
| Backend | Supabase Edge Functions, Deno |
| Database | PostgreSQL, pgvector |
| AI/ML | OpenAI GPT, OpenAI Embeddings (ada-002) |
| Infra | Supabase Cloud, Vercel |

---

## 🔍 핵심 기술 상세

### RAG(Retrieval Augmented Generation) 파이프라인

1. 사용자 입력 → 한국어 전처리 (형태소 분석)
2. OpenAI ada-002로 텍스트 임베딩 생성
3. pgvector로 관련 커리어 데이터 유사도 검색
4. GPT에게 검색 결과 + 원본 질의 함께 전달
5. 마인드맵 노드 구조로 응답 파싱 후 시각화

### 검색 정확도 62% → 87% 달성 방법

- 단순 키워드 검색에서 벡터 임베딩 기반 시맨틱 검색으로 전환
- 한국어 특화 전처리(형태소·감성 분석) 추가로 임베딩 품질 향상
- 기술 도메인 인식 모듈로 IT 용어 정확도 개선

---

## 🚀 로컬 실행 방법

```bash
# 1. 레포 클론
git clone https://github.com/kumryu123456/Future_Mindmap_Demo.git
cd Future_Mindmap_Demo

# 2. 패키지 설치
npm install

# 3. 환경변수 설정 (frontend/.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# 4. 백엔드 + 프론트엔드 동시 실행
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

---

## 📁 프로젝트 구조

```
Future_Mindmap_Demo/
├── frontend/           # React 19 + XYFlow 프론트엔드
│   └── src/
│       ├── components/ # 마인드맵 UI 컴포넌트
│       ├── hooks/      # Custom React Hooks
│       ├── services/   # API 통신 레이어
│       └── store/      # Zustand 상태 관리
├── backend/
│   └── supabase/
│       ├── functions/  # 10개 Edge Function API
│       └── migrations/ # DB 스키마
└── README.md
```

---

## 🤝 팀 구성

| 역할 | 담당 |
|------|------|
| 백엔드 팀장 | 김경민 (본인) — 아키텍처 설계, RAG 파이프라인, API 구현 |
| 백엔드 | 심민성 — DB 설계, 세션 관리 |
| 프론트엔드 | 팀원 2명 — React 마인드맵 UI |

---

## 📝 회고

> 해커톤 특성상 짧은 시간 안에 RAG 파이프라인 전체를 구현해야 했습니다.  
> 초기에는 단순 키워드 검색으로 시작했지만, 한국어 특수성(조사·어미 변화)으로 정확도가 낮았습니다.  
> pgvector 기반 시맨틱 검색으로 전환하면서 62% → 87%로 큰 폭의 개선을 달성했고,  
> **"데이터 품질이 AI 성능의 핵심"** 이라는 교훈을 얻었습니다.
