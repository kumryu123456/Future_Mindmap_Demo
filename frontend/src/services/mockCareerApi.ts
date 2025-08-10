// Mock API for Backend Integration
import { UserProfile, CareerMap, SocialLink } from '../types/career';

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  avgSalary: string;
  growth: 'high' | 'medium' | 'low';
  skills: string[];
  certifications: string[];
  companies: string[];
  relatedLinks: { title: string; url: string }[];
}

export interface BrowseProfile {
  id: string;
  userProfile: UserProfile;
  careerMaps: CareerMap[];
  stats: {
    totalLikes: number;
    totalViews: number;
    completedGoals: number;
    followers: number;
  };
  isFollowed?: boolean;
  badges: string[];
}

export interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string; // CareerMap ID or User ID
  type: 'like' | 'comment' | 'share' | 'follow';
  data?: any;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  rating: number;
  isRead: boolean;
}

// Mock data
export const mockCareerPaths: Record<string, CareerPath> = {
  'ai-developer': {
    id: 'ai-developer',
    title: 'AI 개발자',
    description: '인공지능 기술을 활용하여 애플리케이션과 시스템을 개발하는 전문가',
    avgSalary: '8,000만원 ~ 1.5억원',
    growth: 'high',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    certifications: ['TensorFlow Developer', 'AWS Machine Learning', 'Google Cloud AI'],
    companies: ['네이버', '카카오', '쿠팡', 'SK텔레콤', '삼성전자'],
    relatedLinks: [
      { title: 'AI 개발자 로드맵', url: '#' },
      { title: '머신러닝 학습 자료', url: '#' },
      { title: '커리어 가이드', url: '#' }
    ]
  },
  'data-analyst': {
    id: 'data-analyst',
    title: '데이터 분석가',
    description: '데이터를 수집, 처리, 분석하여 비즈니스 인사이트를 도출하는 전문가',
    avgSalary: '5,000만원 ~ 1억원',
    growth: 'high',
    skills: ['SQL', 'Python', 'R', 'Tableau', 'Power BI'],
    certifications: ['Google Data Analytics', 'Microsoft Certified: Data Analyst'],
    companies: ['토스', '배달의민족', '당근마켓', '라인', '넥슨'],
    relatedLinks: [
      { title: '데이터 분석가 되기', url: '#' },
      { title: 'SQL 학습 가이드', url: '#' }
    ]
  }
};

// API Functions
export const careerAPI = {
  // 커리어 정보 가져오기
  getCareerInfo: async (careerId: string): Promise<CareerPath> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCareerPaths[careerId] || mockCareerPaths['ai-developer']);
      }, 500);
    });
  },

  // 리뷰 목록 가져오기
  getReviews: async (careerId: string): Promise<Review[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            author: '영우진',
            avatar: '👨‍💻',
            date: '2024-01-15',
            content: '전공 지식이 없어도 충분히 도전할 수 있는 분야인 것 같아요.',
            rating: 5,
            isRead: false
          },
          {
            id: '2',
            author: '김정민',
            avatar: '👩‍🎓',
            date: '2024-01-14',
            content: '사업 구조 및 기술 스택에 대한 자세한 설명이 도움이 되었습니다.',
            rating: 4,
            isRead: false
          }
        ]);
      }, 300);
    });
  },

  // 채팅 세션 목록 가져오기
  getChatSessions: async (): Promise<ChatSession[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'AI 개발자 커리어',
            date: '2024-01-15',
            messages: [
              {
                id: '1',
                role: 'user',
                content: 'AI 개발자가 되려면 어떻게 해야 하나요?',
                timestamp: '2024-01-15 10:00'
              },
              {
                id: '2',
                role: 'assistant',
                content: 'AI 개발자가 되기 위해서는 Python, 머신러닝 기초부터 시작하시는 것을 추천합니다.',
                timestamp: '2024-01-15 10:01'
              }
            ]
          }
        ]);
      }, 400);
    });
  },

  // 마인드맵 저장
  saveMindmap: async (mindmapData: any): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('mindmap', JSON.stringify(mindmapData));
        resolve({ success: true });
      }, 200);
    });
  },

  // 마인드맵 불러오기
  loadMindmap: async (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('mindmap');
        resolve(data ? JSON.parse(data) : null);
      }, 200);
    });
  },

  // Browse 페이지 - 사용자 프로필 목록 가져오기
  getBrowseProfiles: async (filters?: {
    search?: string;
    tags?: string[];
    sortBy?: 'popular' | 'recent' | 'followers';
    limit?: number;
    offset?: number;
  }): Promise<{ data: BrowseProfile[]; totalCount: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const limit = filters?.limit || 12;
        const offset = filters?.offset || 0;
        const totalCount = 147; // Mock total count representing all available profiles
        
        // Generate paginated data based on offset
        const data = generateMockBrowseProfiles(limit, offset);
        resolve({ data, totalCount });
      }, 600);
    });
  },

  // 사용자 프로필 상세 정보 가져오기
  getUserProfile: async (userId: string): Promise<BrowseProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profiles = generateMockBrowseProfiles(1, 0);
        resolve({ ...profiles[0], id: userId });
      }, 400);
    });
  },

  // 소셜 인터랙션 처리
  handleSocialInteraction: async (interaction: Omit<SocialInteraction, 'id' | 'createdAt'>): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock storage in localStorage for development
        const key = `interaction_${interaction.type}_${interaction.targetId}`;
        const existing = localStorage.getItem(key);
        const count = existing ? parseInt(existing) : 0;
        localStorage.setItem(key, (count + 1).toString());
        resolve({ success: true });
      }, 300);
    });
  }
};

// 🧠 Ultra Thinking: 현실적인 페르소나 기반 데이터 생성
interface PersonaTemplate {
  name: string;
  role: string;
  experience: string;
  avatar: string;
  bio: string;
  skills: string[];
  company: string;
  location: string;
  badges: string[];
  stats: {
    likesRange: [number, number];
    followersRange: [number, number];
    viewsRange: [number, number];
    goalsRange: [number, number];
  };
}

// 직군별 realistic 페르소나 템플릿 (실제 커리어 패턴 반영)
const personaTemplates: PersonaTemplate[] = [
  // AI/ML 전문가들 (고경력, 높은 인기)
  {
    name: '김민재', role: 'AI/ML Engineer', experience: '5-10년', avatar: '🤖',
    bio: 'LLM과 Computer Vision으로 혁신적인 AI 솔루션을 개발합니다. 네이버 AI랩 출신 🧠',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Transformers', 'MLOps', 'Kubernetes'],
    company: '토스', location: '서울', badges: ['AI전문가', '멘토', '리더십'],
    stats: { likesRange: [80, 150], followersRange: [200, 500], viewsRange: [800, 1500], goalsRange: [8, 15] }
  },
  {
    name: '박서연', role: 'Data Scientist', experience: '3-5년', avatar: '📊',
    bio: 'e-커머스 데이터로 사용자 행동을 예측하고 비즈니스 인사이트를 발굴합니다 📈',
    skills: ['Python', 'SQL', 'Tableau', 'Pandas', 'Scikit-learn', 'A/B Testing'],
    company: '쿠팡', location: '서울', badges: ['데이터전문가', '비즈니스센스'],
    stats: { likesRange: [40, 80], followersRange: [100, 300], viewsRange: [400, 800], goalsRange: [5, 10] }
  },

  // Frontend 개발자들 (다양한 경력 레벨)
  {
    name: '이준호', role: 'Senior Frontend Dev', experience: '7-10년', avatar: '⚛️',
    bio: '사용자 중심의 웹 경험을 설계하고 구현합니다. React 생태계 컨트리뷰터 🚀',
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Webpack', 'Testing Library'],
    company: '당근마켓', location: '서울', badges: ['프론트엔드전문가', '오픈소스기여자', '멘토'],
    stats: { likesRange: [60, 120], followersRange: [150, 400], viewsRange: [600, 1200], goalsRange: [7, 12] }
  },
  {
    name: '최유진', role: 'Frontend Developer', experience: '2-3년', avatar: '💻',
    bio: '디자인과 개발의 경계에서 아름다운 UI를 만들어갑니다 ✨ 성장하는 주니어',
    skills: ['React', 'JavaScript', 'CSS3', 'Figma', 'Storybook', 'Jest'],
    company: '뱅크샐러드', location: '서울', badges: ['신입개발자', '성장형'],
    stats: { likesRange: [20, 50], followersRange: [50, 150], viewsRange: [200, 500], goalsRange: [3, 8] }
  },

  // Backend 개발자들
  {
    name: '정현우', role: 'Backend Engineer', experience: '5-8년', avatar: '⚙️',
    bio: '대용량 트래픽을 견디는 안정적인 서버를 설계합니다. MSA 아키텍처 전문가 🏗️',
    skills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'Docker', 'AWS'],
    company: '라인', location: '성남', badges: ['백엔드전문가', '아키텍처', '리더십'],
    stats: { likesRange: [50, 100], followersRange: [120, 350], viewsRange: [500, 1000], goalsRange: [6, 11] }
  },
  {
    name: '한소희', role: 'Node.js Developer', experience: '3-4년', avatar: '🟢',
    bio: 'JavaScript 풀스택 개발자로 빠른 프로토타이핑과 MVP 개발을 즐깁니다 ⚡',
    skills: ['Node.js', 'Express', 'MongoDB', 'React', 'TypeScript', 'AWS Lambda'],
    company: '카카오페이', location: '성남', badges: ['풀스택', '스타트업경험'],
    stats: { likesRange: [30, 70], followersRange: [80, 200], viewsRange: [300, 600], goalsRange: [4, 9] }
  },

  // UX/UI 디자이너들
  {
    name: '김다은', role: 'Product Designer', experience: '4-6년', avatar: '🎨',
    bio: '사용자 리서치 기반으로 직관적인 서비스를 디자인합니다. 접근성 옹호자 ♿',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design System', 'Accessibility'],
    company: '토스', location: '서울', badges: ['UX전문가', '접근성', '사용자중심'],
    stats: { likesRange: [45, 90], followersRange: [100, 280], viewsRange: [400, 750], goalsRange: [5, 10] }
  },

  // DevOps & Infrastructure
  {
    name: '박지훈', role: 'DevOps Engineer', experience: '6-9년', avatar: '🔧',
    bio: '개발팀의 생산성을 높이는 인프라와 파이프라인을 구축합니다. 클라우드 아키텍트 ☁️',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'Prometheus', 'Grafana'],
    company: 'NHN', location: '성남', badges: ['데브옵스전문가', '클라우드', '자동화'],
    stats: { likesRange: [35, 75], followersRange: [90, 250], viewsRange: [350, 700], goalsRange: [4, 8] }
  },

  // Mobile 개발자들
  {
    name: '오민석', role: 'iOS Developer', experience: '4-5년', avatar: '📱',
    bio: 'SwiftUI로 네이티브 앱의 새로운 가능성을 탐구합니다. 앱스토어 1위 앱 개발 경험 🏆',
    skills: ['Swift', 'SwiftUI', 'UIKit', 'CoreData', 'Combine', 'XCTest'],
    company: '배달의민족', location: '서울', badges: ['iOS전문가', '앱스토어1위'],
    stats: { likesRange: [40, 85], followersRange: [110, 300], viewsRange: [450, 850], goalsRange: [5, 9] }
  },

  // QA & Testing
  {
    name: '윤서연', role: 'QA Engineer', experience: '3-4년', avatar: '🔍',
    bio: '테스트 자동화로 제품 품질을 책임집니다. 버그 헌터의 자부심! 🐛',
    skills: ['Selenium', 'Cypress', 'Postman', 'JMeter', 'Python', 'TestRail'],
    company: '우아한형제들', location: '서울', badges: ['QA전문가', '자동화', '품질보증'],
    stats: { likesRange: [25, 60], followersRange: [60, 180], viewsRange: [250, 550], goalsRange: [3, 7] }
  },

  // 주니어 개발자들 (다양한 전공)
  {
    name: '이채원', role: 'Junior Developer', experience: '1-2년', avatar: '🌱',
    bio: '컴공 졸업 후 첫 회사에서 열심히 배우고 있습니다. 매일 성장하는 것이 목표! 📚',
    skills: ['Java', 'Spring', 'MySQL', 'Git', 'IntelliJ'],
    company: 'LG CNS', location: '서울', badges: ['신입개발자', '컴공출신'],
    stats: { likesRange: [15, 40], followersRange: [30, 100], viewsRange: [150, 350], goalsRange: [2, 5] }
  },

  {
    name: '강태현', role: 'Bootcamp Graduate', experience: '0-1년', avatar: '🚀',
    bio: '비전공자에서 개발자로 전환! 코딩 부트캠프 수료 후 첫 취업을 준비중입니다 💪',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML/CSS'],
    company: '구직중', location: '부산', badges: ['신입개발자', '비전공자', '부트캠프'],
    stats: { likesRange: [10, 30], followersRange: [20, 80], viewsRange: [100, 250], goalsRange: [1, 4] }
  }
];

// Mock 데이터 생성 함수들
const generateMockBrowseProfiles = (count: number, offset: number = 0): BrowseProfile[] => {
  // 요청된 개수만큼 템플릿을 반복해서 사용 (offset 고려)
  const selectedTemplates = Array.from({ length: count }, (_, index) => 
    personaTemplates[(index + offset) % personaTemplates.length]
  );

  return selectedTemplates.map((template, index) => {
    const userId = `user_${index + offset + 1}`;
    
    // 통계 값들을 range 내에서 랜덤 생성
    const stats = {
      totalLikes: Math.floor(Math.random() * 
        (template.stats.likesRange[1] - template.stats.likesRange[0] + 1)) + 
        template.stats.likesRange[0],
      totalViews: Math.floor(Math.random() * 
        (template.stats.viewsRange[1] - template.stats.viewsRange[0] + 1)) + 
        template.stats.viewsRange[0],
      completedGoals: Math.floor(Math.random() * 
        (template.stats.goalsRange[1] - template.stats.goalsRange[0] + 1)) + 
        template.stats.goalsRange[0],
      followers: Math.floor(Math.random() * 
        (template.stats.followersRange[1] - template.stats.followersRange[0] + 1)) + 
        template.stats.followersRange[0]
    };
    
    const userProfile: UserProfile = {
      id: userId,
      username: template.name.replace(' ', '').toLowerCase(),
      displayName: template.name,
      avatar: template.avatar,
      bio: template.bio,
      currentRole: template.role,
      company: template.company,
      location: template.location,
      experience: template.experience,
      skills: template.skills,
      interests: template.skills.slice(0, 3), // 스킬의 일부를 관심사로 사용
      careerMaps: [`map_${userId}_1`, `map_${userId}_2`],
      socialLinks: [
        {
          platform: 'linkedin',
          url: `https://linkedin.com/in/${template.name.replace(' ', '').toLowerCase()}`,
          label: 'LinkedIn 프로필'
        },
        {
          platform: 'github',
          url: `https://github.com/${template.name.replace(' ', '').toLowerCase()}`,
          label: 'GitHub 저장소'
        }
      ] as SocialLink[],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: true
    };

    return {
      id: userId,
      userProfile,
      careerMaps: [], // 실제로는 해당 사용자의 커리어맵들
      stats,
      isFollowed: Math.random() > 0.8, // 20% 확률로 팔로우됨
      badges: template.badges
    };
  });
};