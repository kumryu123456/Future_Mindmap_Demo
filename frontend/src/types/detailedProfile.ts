// Detailed Profile Types for Enhanced Browse Feature
import { BrowseProfile, SocialLink } from './career';

export interface CareerTimelineItem {
  id: string;
  period: string; // "2023 ~ 현재"
  company: string;
  position: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface SkillCategories {
  languages: string[]; // Java, SQL, JavaScript
  backend: string[]; // Spring Boot, Node.js, Express
  database: string[]; // MySQL, PostgreSQL, Redis
  cloudDevOps: string[]; // AWS, Docker, Jenkins
  tools: string[]; // Git, Jira, Confluence, Notion
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  major: string;
  period: string;
  additionalInfo?: string[]; // 주요 과목, 학점 등
  description?: string;
}

export interface AboutMe {
  personalStory: string; // 개인적인 스토리와 동기
  currentFocus: string[]; // 현재 집중하고 있는 분야
  philosophy?: string; // 개발 철학이나 가치관
  careerGoals: string[]; // 커리어 목표
}

export interface CareerFlowNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
    status: 'completed' | 'current' | 'planned';
    period?: string;
    company?: string;
    skills?: string[];
    description?: string;
    achievements?: string[];
    technologies?: string[];
  };
  type: 'careerStep';
}

export interface CareerFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: 'source-top' | 'source-right' | 'source-bottom' | 'source-left';
  targetHandle?: 'target-top' | 'target-right' | 'target-bottom' | 'target-left';
  type?: 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
  markerEnd?: {
    type: 'arrowclosed';
    color: string;
  };
}

export interface CareerFlow {
  nodes: CareerFlowNode[];
  edges: CareerFlowEdge[];
}

export interface ContactInfo {
  socialLinks: SocialLink[];
  isMessageAvailable: boolean;
  preferredContactMethod?: 'message' | 'email' | 'linkedin';
  responseTime?: string; // "보통 1일 이내 답변"
}

// 메시지 관련 타입
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'career_question' | 'networking' | 'collaboration' | 'other';
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: Message;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// 메인 상세 프로필 인터페이스
export interface DetailedCareerProfile extends BrowseProfile {
  // 추가 기본 정보
  profileImage?: string;
  username: string; // @dev_egg 형식
  title: string; // "계란말이 개발자"
  tagline?: string; // 간단한 한줄 소개
  
  // 상세 정보 섹션들
  aboutMe: AboutMe;
  careerTimeline: CareerTimelineItem[];
  skillCategories: SkillCategories;
  certifications: Certification[];
  education: Education[];
  
  // 시각적 커리어 플로우
  careerFlow: CareerFlow;
  
  // 연락처 및 소셜
  contactInfo: ContactInfo;
  
  // 추가 메타데이터
  profileViews: number;
  profileCompleteness: number; // 0-100
  lastActive: string;
  isVerified: boolean; // 인증된 프로필 여부
  
  // 프라이버시 설정
  privacy: {
    showEmail: boolean;
    showPhoneNumber: boolean;
    allowMessages: boolean;
    showCareerTimeline: boolean;
    showSalaryInfo: boolean;
  };
}

// 검색 관련 타입들
export interface SearchFilters {
  query: string;
  tags: string[];
  experienceRange: [number, number];
  industries: string[];
  locations: string[];
  skills: string[];
  certifications: string[];
  sortBy: 'relevance' | 'experience' | 'followers' | 'recent' | 'popular';
  sortDirection: 'asc' | 'desc';
}

export interface SearchResult {
  profiles: DetailedCareerProfile[];
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
  appliedFilters: SearchFilters;
}

// API 관련 타입들
export interface ProfileSearchRequest {
  filters: Partial<SearchFilters>;
  pagination: {
    page: number;
    limit: number;
  };
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
  messageType: Message['messageType'];
  subject?: string;
}

export interface MessageResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
}

export default DetailedCareerProfile;