import { useState, useEffect, useMemo } from 'react';
import { BrowseProfile } from '../types/career';
import { DetailedCareerProfile, SearchFilters } from '../types/detailedProfile';

interface UseProfileSearchProps {
  profiles: BrowseProfile[];
  debounceMs?: number;
}

interface UseProfileSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  filteredProfiles: BrowseProfile[];
  searchStats: {
    totalResults: number;
    searchTerm: string;
    searchFields: string[];
  };
  isSearching: boolean;
}

export const useProfileSearch = ({ 
  profiles, 
  debounceMs = 300 
}: UseProfileSearchProps): UseProfileSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce 처리
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, debounceMs]);

  // 검색 로직
  const { filteredProfiles, searchStats } = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return {
        filteredProfiles: profiles,
        searchStats: {
          totalResults: profiles.length,
          searchTerm: '',
          searchFields: []
        }
      };
    }

    const searchTerm = debouncedQuery.toLowerCase().trim();
    const searchedFields: string[] = [];

    const filtered = profiles.filter(profile => {
      const searchableFields = {
        name: profile.userProfile.displayName.toLowerCase(),
        role: profile.userProfile.currentRole.toLowerCase(),
        bio: profile.userProfile.bio.toLowerCase(),
        company: profile.userProfile.company?.toLowerCase() || '',
        skills: (profile.userProfile.skills ?? []).map(skill => skill.toLowerCase()).join(' '),
        interests: (profile.userProfile.interests ?? []).map(interest => interest.toLowerCase()).join(' '),
        badges: (profile.badges ?? []).map(badge => badge.toLowerCase()).join(' '),
      };

      let matched = false;
      const fieldMatches: string[] = [];

      // 각 필드에서 검색어 확인
      Object.entries(searchableFields).forEach(([fieldName, fieldValue]) => {
        if (fieldValue.includes(searchTerm)) {
          matched = true;
          fieldMatches.push(fieldName);
        }
      });

      // 매치된 필드들을 전체 통계에 추가
      if (matched) {
        fieldMatches.forEach(field => {
          if (!searchedFields.includes(field)) {
            searchedFields.push(field);
          }
        });
      }

      return matched;
    });

    return {
      filteredProfiles: filtered,
      searchStats: {
        totalResults: filtered.length,
        searchTerm: debouncedQuery,
        searchFields: searchedFields
      }
    };
  }, [profiles, debouncedQuery]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    filteredProfiles,
    searchStats,
    isSearching
  };
};

// 고급 검색 훅 (추후 확장 가능)
export const useAdvancedProfileSearch = (profiles: DetailedCareerProfile[]) => {
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    query: '',
    tags: [],
    sortBy: 'relevance',
    sortDirection: 'desc'
  });

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      tags: [],
      sortBy: 'relevance',
      sortDirection: 'desc'
    });
  };

  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // 텍스트 검색
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      result = result.filter(profile =>
        profile.userProfile.displayName.toLowerCase().includes(searchTerm) ||
        profile.userProfile.currentRole.toLowerCase().includes(searchTerm) ||
        profile.userProfile.bio.toLowerCase().includes(searchTerm) ||
        profile.aboutMe.personalStory.toLowerCase().includes(searchTerm) ||
        (profile.userProfile.skills ?? []).some(skill => 
          skill.toLowerCase().includes(searchTerm)
        )
      );
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(profile =>
        filters.tags!.every(tag => profile.badges.includes(tag))
      );
    }

    // 정렬
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'experience':
            // 경력년수로 정렬 (임시로 통계의 completedGoals 사용)
            aValue = a.stats.completedGoals;
            bValue = b.stats.completedGoals;
            break;
          case 'followers':
            aValue = a.stats.followers;
            bValue = b.stats.followers;
            break;
          case 'popular':
            aValue = a.stats.totalLikes;
            bValue = b.stats.totalLikes;
            break;
          case 'recent':
            // 임시로 ID 기반 정렬 (실제로는 createdAt 사용)
            aValue = a.id;
            bValue = b.id;
            break;
          default:
            return 0;
        }

        if (filters.sortDirection === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    return result;
  }, [profiles, filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredProfiles,
    resultsCount: filteredProfiles.length
  };
};

export default useProfileSearch;