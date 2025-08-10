// Advanced Search Types
import { BrowseProfile } from './career';

export interface AdvancedSearchFilters {
  // 기본 검색
  query: string;
  
  // 경력 관련
  experienceLevel: ('신입' | '1-3년' | '3-5년' | '5-10년' | '10년+')[];
  salaryRange: {
    min?: number;
    max?: number;
    currency: 'KRW' | 'USD';
  };
  
  // 위치 관련
  locations: string[]; // ['서울', '경기', '부산', '원격근무']
  workType: ('정규직' | '계약직' | '프리랜서' | '인턴' | '원격근무')[];
  
  // 기술 스택
  skillCategories: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    cloud?: string[];
    tools?: string[];
  };
  
  // 회사 관련
  companySize: ('스타트업' | '중소기업' | '대기업' | '외국계')[];
  industries: string[]; // ['IT', '핀테크', '게임', '이커머스', etc.]
  
  // 소셜 지표
  minFollowers?: number;
  minLikes?: number;
  minExperience?: number;
  
  // 활동성
  lastActiveWithin: 'week' | 'month' | '3months' | 'year' | 'any';
  hasRecentPosts: boolean;
  isMessageAvailable: boolean;
  
  // 정렬 옵션
  sortBy: 'relevance' | 'recent' | 'popular' | 'followers' | 'experience' | 'salary';
  sortDirection: 'desc' | 'asc';
  
  // 고급 옵션
  excludedProfiles?: string[]; // 이미 본 프로필 제외
  preferredTags?: string[]; // 우선 표시할 태그
}

export interface SearchPreset {
  id: string;
  name: string;
  filters: Partial<AdvancedSearchFilters>;
  isDefault?: boolean;
  createdAt: string;
  usageCount: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: AdvancedSearchFilters;
  resultCount: number;
  timestamp: string;
}

export interface SearchSuggestion {
  type: 'skill' | 'company' | 'location' | 'role';
  value: string;
  count: number; // 해당 조건에 맞는 프로필 수
  category?: string;
}

// 검색 결과 개선
export interface EnhancedSearchResult {
  profiles: BrowseProfile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTime: number; // ms
  suggestions: SearchSuggestion[];
  facets: {
    [key: string]: Array<{
      value: string;
      count: number;
      selected: boolean;
    }>;
  };
}

// 스마트 추천
export interface ProfileRecommendation {
  profile: BrowseProfile;
  score: number; // 0-100
  reasons: Array<{
    type: 'skill_match' | 'experience_match' | 'location_match' | 'interest_match';
    description: string;
    weight: number;
  }>;
}