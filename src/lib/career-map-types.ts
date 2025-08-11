export interface CareerMap {
  id: string;
  title: string;
  targetRole: string;
  createdAt: Date;
  updatedAt: Date;
  info: {
    certification: {
      name: string;
      difficulty: string;
      eligibility: string;
      examStructure: string;
      schedule: string;
      recommendedBooks: {
        title: string;
        description: string;
        category: "written" | "practical";
      }[];
      recommendedCourses: {
        title: string;
        description: string;
        platform: string;
      }[];
    };
    roadmapSteps: {
      id: string;
      title: string;
      type: "current" | "intermediate" | "final";
      position: { x: number; y: number };
    }[];
  };
  reviews: {
    id: string;
    author: string;
    rating: number;
    content: string;
    createdAt: Date;
    helpful: number;
  }[];
}

// Mock data for career maps
export const mockCareerMaps: CareerMap[] = [
  {
    id: "data-scientist-map",
    title: "데이터 사이언티스트 커리어 맵",
    targetRole: "데이터 사이언티스트",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    info: {
      certification: {
        name: "빅데이터분석기사",
        difficulty: "중급",
        eligibility: "관련 학과 4년제 졸업(예정) 또는 동일 분야 실무 경력 4년 이상",
        examStructure: "필기(객관식 100문항) / 실기(서술형 + 작업형)",
        schedule: "연 3회 (한국산업인력공단)",
        recommendedBooks: [
          {
            title: "2025 시나공 빅데이터분석기사 필기",
            description: "기출문제 다수 수록, 초보자 친화",
            category: "written"
          },
          {
            title: "이기적 빅데이터분석기사 필기",
            description: "핵심 이론 요약 + CBT 기출",
            category: "written"
          },
          {
            title: "빅데이터분석기사 실기 완벽대비",
            description: "작업형 실습 예제 포함",
            category: "practical"
          },
          {
            title: "한 권으로 끝내는 빅데이터분석기사 실기",
            description: "기출 분석 + 실습 파일 제공",
            category: "practical"
          }
        ],
        recommendedCourses: [
          {
            title: "인프런 – 빅데이터분석기사 필기/실기 완전정복",
            description: "필기 이론부터 실기 작업형 실습까지 커버",
            platform: "인프런"
          },
          {
            title: "패스트캠퍼스 – 비전공자를 위한 빅데이터분석기사 단기합격",
            description: "실무 예제 중심, 초보자 맞춤형",
            platform: "패스트캠퍼스"
          }
        ]
      },
      roadmapSteps: [
        { id: "current", title: "계란말이\n개발자", type: "current", position: { x: 300, y: 800 } },
        { id: "pm-platform", title: "PM 플랫폼", type: "intermediate", position: { x: 100, y: 650 } },
        { id: "growth-hack", title: "급속 성장", type: "intermediate", position: { x: 300, y: 650 } },
        { id: "data-expertise", title: "당근 자격증", type: "intermediate", position: { x: 500, y: 650 } },
        { id: "machine-learning", title: "머신러닝 분야\n핵심 인재", type: "intermediate", position: { x: 100, y: 500 } },
        { id: "data-infra", title: "지우개 분야\n부트팀프", type: "intermediate", position: { x: 300, y: 500 } },
        { id: "skill-growth", title: "실력 점검 평가", type: "intermediate", position: { x: 500, y: 500 } },
        { id: "data-processing", title: "데이터 분석\n프로젝트", type: "intermediate", position: { x: 100, y: 350 } },
        { id: "programming", title: "프로그래밍 자격증", type: "intermediate", position: { x: 300, y: 350 } },
        { id: "web-dev", title: "사과 부트캠프", type: "intermediate", position: { x: 500, y: 350 } },
        { id: "final", title: "데이터 분석가", type: "final", position: { x: 300, y: 200 } }
      ]
    },
    reviews: [
      {
        id: "review-1",
        author: "김데이터",
        rating: 5,
        content: "정말 체계적으로 잘 정리된 로드맵입니다. 비전공자였는데 3개월만에 합격할 수 있었어요!",
        createdAt: new Date("2024-01-18"),
        helpful: 24
      },
      {
        id: "review-2", 
        author: "박분석가",
        rating: 4,
        content: "실기 부분이 특히 도움이 되었습니다. 작업형 문제 연습할 수 있는 자료가 많아서 좋았어요.",
        createdAt: new Date("2024-01-19"),
        helpful: 18
      }
    ]
  },
  {
    id: "info-processing-engineer-map",
    title: "정보처리기사 커리어 맵", 
    targetRole: "백엔드 개발자",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    info: {
      certification: {
        name: "정보처리기사",
        difficulty: "중급",
        eligibility: "관련 학과 4년제 졸업(예정) 또는 동일 분야 실무 경력 4년 이상", 
        examStructure: "필기(객관식 100문항) / 실기(서술형 + 작업형)",
        schedule: "연 3회 (한국산업인력공단)",
        recommendedBooks: [
          {
            title: "2025 시나공 정보처리기사 필기",
            description: "기출문제 다수 수록, 초보자 친화",
            category: "written"
          },
          {
            title: "이기적 정보처리기사 필기", 
            description: "핵심 이론 요약 + CBT 기출",
            category: "written"
          },
          {
            title: "정보처리기사 실기 완벽대비",
            description: "작업형 실습 예제 포함",
            category: "practical"
          },
          {
            title: "한 권으로 끝내는 정보처리기사 실기",
            description: "기출 분석 + 실습 파일 제공", 
            category: "practical"
          }
        ],
        recommendedCourses: [
          {
            title: "인프런 – 정보처리기사 필기/실기 완전정복",
            description: "필기 이론부터 실기 작업형 실습까지 커버",
            platform: "인프런"
          },
          {
            title: "패스트캠퍼스 – 비전공자를 위한 정보처리기사 단기합격", 
            description: "실무 예제 중심, 초보자 맞춤형",
            platform: "패스트캠퍼스"
          }
        ]
      },
      roadmapSteps: [
        { id: "current", title: "계란말이\n개발자", type: "current", position: { x: 300, y: 800 } },
        { id: "backend-basic", title: "백엔드 기초", type: "intermediate", position: { x: 200, y: 650 } },
        { id: "database", title: "데이터베이스", type: "intermediate", position: { x: 400, y: 650 } },
        { id: "spring", title: "Spring 프레임워크", type: "intermediate", position: { x: 200, y: 500 } },
        { id: "api", title: "REST API", type: "intermediate", position: { x: 400, y: 500 } },
        { id: "final", title: "백엔드 개발자", type: "final", position: { x: 300, y: 350 } }
      ]
    },
    reviews: [
      {
        id: "review-3",
        author: "이개발자", 
        rating: 5,
        content: "기사 자격증 취득 후 백엔드 개발자로 성공적으로 이직했습니다. 로드맵이 정말 도움되었어요!",
        createdAt: new Date("2024-01-12"),
        helpful: 31
      }
    ]
  }
];