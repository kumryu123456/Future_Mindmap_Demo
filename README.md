# 🚀 커리어 플로우 생성기

개발자를 위한 개인화된 커리어 로드맵을 생성하는 AI 기반 웹 애플리케이션입니다.

## ✨ 주요 기능

- **AI 기반 커리어 분석**: 사용자의 현재 상황과 목표를 분석하여 맞춤형 경로 제시
- **인터랙티브 플로우 차트**: 시각적이고 직관적인 커리어 로드맵
- **실시간 스트리밍**: AI 응답을 실시간으로 받아보기
- **벡터 검색**: 관련 문서와 정보를 빠르게 검색하여 정확한 답변 제공

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **AI**: OpenAI GPT-4, AI SDK
- **Vector Database**: 벡터 검색을 위한 임베딩 시스템
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.0.0 이상
- pnpm 설치
- OpenAI API 키

### 설치 및 실행

1. **저장소 클론**

```bash
git clone <repository-url>
cd 2025_unithon
```

2. **의존성 설치**

```bash
pnpm install
```

3. **환경 변수 설정**
   `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **개발 서버 실행**

```bash
pnpm dev
```

5. **브라우저에서 확인**
   [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── chat/         # AI 채팅 API
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 타입 정의
└── types/                 # TypeScript 타입 정의
```

## 🔧 사용법

1. **메인 페이지 접속**: 브라우저에서 애플리케이션을 열기
2. **커리어 정보 입력**: 현재 상황, 목표, 관심사 등을 자유롭게 입력
3. **AI 분석 대기**: AI가 입력된 정보를 분석하여 개인화된 커리어 플로우 생성
4. **결과 확인**: 생성된 플로우 차트를 확인하고 각 단계별 상세 정보 확인

## 🌟 특징

- **개인화**: 사용자별 맞춤형 커리어 경로 제시
- **실현 가능성**: 현실적이고 실행 가능한 단계별 계획
- **시각화**: 직관적인 플로우 차트로 복잡한 정보를 쉽게 이해
- **실시간성**: 스트리밍을 통한 빠른 응답

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**2025 Unithon** 프로젝트로 제작되었습니다. 🎉
