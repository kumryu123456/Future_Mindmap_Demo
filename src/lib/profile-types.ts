export interface Profile {
  id: string;
  name: string;
  username: string;
  title: string;
  avatar: string;
  quote: string;
  bio: string;
  reviewCount: number;
  mainAreas: string[];
  strengths: string[];
  socialLinks: {
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  careerTimeline: CareerItem[];
  skills: {
    languages: string[];
    backend: string[];
    database: string[];
    cloudDevOps: string[];
    etc: string[];
  };
  certifications: string[];
  education: EducationItem[];
  awards: string[];
  projects: ProjectItem[];
}

export interface CareerItem {
  period: string;
  company: string;
  role: string;
  description: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  subjects?: string[];
  project?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  year: string;
}

// Mock data
export const mockProfiles: Profile[] = [
  {
    id: "dev_egg",
    name: "계란말이 개발자",
    username: "dev_egg",
    title: "백엔드 개발자",
    avatar: "http://localhost:3845/assets/3eeed8ce0d3de8f83096bee9ccff4b9fcffe6d52.png",
    quote: "시험 합격은 시작일 뿐입니다. 자격증을 어떻게 실무에 녹여내느냐가 진짜 차이를 만듭니다.",
    bio: "5년간 다양한 규모의 프로젝트에서 서버 아키텍처를 설계하고 안정적인 서비스를 운영해왔습니다. 대규모 트래픽 환경에서의 성능 최적화와 데이터베이스 구조 설계에 강점을 가지고 있습니다. 새로운 기술을 실무에 접목시키는 과정을 즐기며, 팀과 함께 성장하는 개발자가 되기 위해 노력합니다.",
    reviewCount: 17,
    mainAreas: ["백엔드 개발", "데이터베이스", "클라우드 인프라"],
    strengths: ["기출문제 분석 능력", "최신 기술 스택과 연계한 학습법 제시"],
    socialLinks: {
      linkedin: "#",
      youtube: "#",
      instagram: "#",
      facebook: "#",
      website: "#"
    },
    careerTimeline: [
      {
        period: "2023 ~ 현재",
        company: "핀테크 스타트업",
        role: "백엔드 개발자",
        description: [
          "결제·인증 서비스 백엔드 전담",
          "AWS 기반 인프라 및 CI/CD 구축",
          "서비스 장애 대응 및 로그 분석 자동화"
        ]
      },
      {
        period: "2018 ~ 2021",
        company: "중견 SI 기업",
        role: "개발자",
        description: [
          "금융권 및 공공기관 시스템 개발",
          "대규모 DB 마이그레이션 프로젝트 수행",
          "Java/Spring 기반 REST API 개발"
        ]
      }
    ],
    skills: {
      languages: ["Java", "SQL", "JavaScript"],
      backend: ["Spring Boot", "Node.js", "Express"],
      database: ["MySQL", "PostgreSQL", "Redis"],
      cloudDevOps: ["AWS", "Docker", "Jenkins"],
      etc: ["Git", "Jira", "Confluence", "Notion"]
    },
    certifications: [
      "정보처리기사",
      "SQLD (SQL 개발자)",
      "AWS Solutions Architect – Associate"
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        school: "서울 소재 4년제",
        subjects: ["자료구조", "운영체제", "네트워크", "데이터베이스"],
        project: "Spring Boot + React 기반 협업 툴 (우수상 수상)"
      }
    ],
    awards: [
      "사내 해커톤 최우수상 – 클라우드 결제 시스템 최적화 (2024)",
      "졸업 프로젝트 우수상 – 팀 협업 툴 개발 (2017)"
    ],
    projects: [
      {
        title: "마이크로서비스 전환 프로젝트",
        description: "결제 속도 30% 개선",
        year: "2024"
      },
      {
        title: "금융 데이터 마이그레이션 툴",
        description: "자동화 스크립트로 작업 시간 70% 단축",
        year: "2021"
      },
      {
        title: "팀 협업 툴",
        description: "Spring Boot + React, 실사용 환경 배포",
        year: "2017"
      }
    ]
  },
  {
    id: "frontend_sarah",
    name: "사라 김",
    username: "frontend_sarah",
    title: "프론트엔드 개발자",
    avatar: "http://localhost:3845/assets/3eeed8ce0d3de8f83096bee9ccff4b9fcffe6d52.png",
    quote: "사용자 경험이 모든 것의 시작입니다. 아름답고 직관적인 인터페이스로 세상을 바꿔나가겠습니다.",
    bio: "4년간 다양한 웹 애플리케이션과 모바일 앱의 프론트엔드를 개발했습니다. React와 TypeScript를 주력으로 하며, 사용자 중심의 디자인과 성능 최적화에 특히 관심이 많습니다.",
    reviewCount: 23,
    mainAreas: ["프론트엔드 개발", "UI/UX", "모바일 개발"],
    strengths: ["React 최적화", "반응형 디자인", "사용자 경험 개선"],
    socialLinks: {
      linkedin: "#",
      instagram: "#",
      website: "#"
    },
    careerTimeline: [
      {
        period: "2022 ~ 현재",
        company: "테크 스타트업",
        role: "시니어 프론트엔드 개발자",
        description: [
          "React 기반 웹 애플리케이션 아키텍처 설계",
          "모바일 최적화 및 PWA 구현",
          "주니어 개발자 멘토링"
        ]
      },
      {
        period: "2020 ~ 2022",
        company: "디지털 에이전시",
        role: "프론트엔드 개발자",
        description: [
          "다양한 기업 웹사이트 및 랜딩페이지 개발",
          "Vue.js와 Nuxt.js 기반 프로젝트 진행",
          "디자인 시스템 구축 및 유지보수"
        ]
      }
    ],
    skills: {
      languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
      backend: ["React", "Vue.js", "Next.js", "Nuxt.js"],
      database: ["Firebase", "MongoDB"],
      cloudDevOps: ["Vercel", "Netlify", "AWS S3"],
      etc: ["Figma", "Storybook", "Jest", "Cypress"]
    },
    certifications: [
      "정보처리기사",
      "Google UX Design Certificate",
      "AWS Certified Cloud Practitioner"
    ],
    education: [
      {
        degree: "디자인학과 학사",
        school: "홍익대학교",
        project: "React Native 기반 소셜 네트워킹 앱 (졸업작품 전시)"
      }
    ],
    awards: [
      "사내 개발자 컨퍼런스 베스트 발표상 (2023)",
      "해커톤 우수상 - 접근성 개선 웹앱 (2022)"
    ],
    projects: [
      {
        title: "E-commerce 플랫폼 리뉴얼",
        description: "사용자 전환율 40% 향상",
        year: "2023"
      },
      {
        title: "디자인 시스템 구축",
        description: "개발 효율성 50% 개선",
        year: "2022"
      }
    ]
  },
  {
    id: "data_scientist_alex",
    name: "알렉스 박",
    username: "data_scientist_alex",
    title: "데이터 사이언티스트",
    avatar: "http://localhost:3845/assets/3eeed8ce0d3de8f83096bee9ccff4b9fcffe6d52.png",
    quote: "데이터는 거짓말하지 않습니다. 올바른 질문을 던지고 적절한 도구를 사용하면 놀라운 인사이트를 얻을 수 있습니다.",
    bio: "6년간 다양한 산업 분야에서 데이터 분석과 머신러닝 모델 개발을 담당했습니다. 특히 금융과 헬스케어 도메인에서의 예측 모델링과 추천 시스템 구축에 전문성을 가지고 있습니다.",
    reviewCount: 31,
    mainAreas: ["머신러닝", "데이터 분석", "통계 모델링"],
    strengths: ["예측 모델링", "빅데이터 처리", "비즈니스 인사이트 도출"],
    socialLinks: {
      linkedin: "#",
      website: "#"
    },
    careerTimeline: [
      {
        period: "2021 ~ 현재",
        company: "핀테크 유니콘 기업",
        role: "시니어 데이터 사이언티스트",
        description: [
          "신용평가 ML 모델 개발 및 운영",
          "실시간 이상거래 탐지 시스템 구축",
          "A/B 테스트 프레임워크 설계"
        ]
      },
      {
        period: "2018 ~ 2021",
        company: "헬스케어 스타트업",
        role: "데이터 사이언티스트",
        description: [
          "의료 데이터 분석 및 예측 모델 개발",
          "개인 맞춤형 건강 관리 추천 시스템",
          "데이터 파이프라인 구축 및 자동화"
        ]
      }
    ],
    skills: {
      languages: ["Python", "R", "SQL", "Scala"],
      backend: ["TensorFlow", "PyTorch", "Scikit-learn", "Pandas"],
      database: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
      cloudDevOps: ["AWS", "GCP", "Docker", "Kubernetes"],
      etc: ["Jupyter", "Apache Spark", "MLflow", "Tableau"]
    },
    certifications: [
      "빅데이터분석기사",
      "AWS Machine Learning Specialty",
      "Google Cloud Professional ML Engineer",
      "SAS Certified Predictive Modeler"
    ],
    education: [
      {
        degree: "통계학 석사",
        school: "연세대학교",
        subjects: ["고급 통계학", "기계학습", "베이지안 분석", "실험설계"],
        project: "딥러닝 기반 의료 영상 분석 연구 (SCIE 논문 게재)"
      },
      {
        degree: "수학과 학사",
        school: "서울대학교"
      }
    ],
    awards: [
      "사내 AI 챌린지 대상 - 고객 이탈 예측 모델 (2023)",
      "Kaggle Competition Silver Medal (2022)",
      "석사 논문 우수상 (2018)"
    ],
    projects: [
      {
        title: "실시간 사기거래 탐지 시스템",
        description: "정확도 95% 달성, 손실액 60% 감소",
        year: "2023"
      },
      {
        title: "개인화 건강 추천 엔진",
        description: "사용자 만족도 85% 향상",
        year: "2020"
      }
    ]
  }
];