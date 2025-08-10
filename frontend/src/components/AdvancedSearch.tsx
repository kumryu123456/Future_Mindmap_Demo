import React, { useState, useEffect } from 'react';
import { AdvancedSearchFilters, SearchPreset } from '../types/advancedSearch';
import './AdvancedSearch.css';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: AdvancedSearchFilters) => void;
  currentFilters: Partial<AdvancedSearchFilters>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  currentFilters
}) => {
  const [filters, setFilters] = useState<Partial<AdvancedSearchFilters>>({
    query: '',
    experienceLevel: [],
    salaryRange: { currency: 'KRW' },
    locations: [],
    workType: [],
    skillCategories: {},
    companySize: [],
    industries: [],
    sortBy: 'relevance',
    sortDirection: 'desc',
    lastActiveWithin: 'any',
    hasRecentPosts: false,
    isMessageAvailable: false,
    ...currentFilters
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'career' | 'location' | 'skills' | 'company'>('basic');
  const [presets, setPresets] = useState<SearchPreset[]>([]);

  // Sync filters with currentFilters prop changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...currentFilters,
      // Ensure nested objects are properly merged
      salaryRange: {
        currency: 'KRW',
        ...(prev.salaryRange || {}),
        ...(currentFilters.salaryRange || {})
      },
      skillCategories: {
        ...(prev.skillCategories || {}),
        ...(currentFilters.skillCategories || {})
      }
    }));
  }, [currentFilters]);

  // 기본 옵션들
  const experienceLevels = ['신입', '1-3년', '3-5년', '5-10년', '10년+'];
  const locations = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '원격근무'];
  const workTypes = ['정규직', '계약직', '프리랜서', '인턴', '원격근무'];
  const companySizes = ['스타트업', '중소기업', '대기업', '외국계'];
  const industries = ['IT서비스', '게임', '핀테크', '이커머스', '헬스케어', '에듀테크', '제조업', '금융', '컨설팅'];
  
  const skillOptions = {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'Swift', 'Kotlin'],
    frameworks: ['React', 'Vue', 'Angular', 'Next.js', 'Express', 'Spring', 'Django', 'FastAPI'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch', 'DynamoDB'],
    cloud: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions'],
    tools: ['Git', 'Jira', 'Figma', 'Slack', 'Notion', 'Postman', 'VS Code']
  };

  useEffect(() => {
    // 저장된 프리셋 로드
    const savedPresets = localStorage.getItem('search_presets');
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }
  }, []);

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSkillCategoryChange = (category: keyof AdvancedSearchFilters['skillCategories'], skills: string[]) => {
    setFilters(prev => ({
      ...prev,
      skillCategories: {
        ...prev.skillCategories,
        [category]: skills
      }
    }));
  };

  const toggleArrayValue = (key: keyof AdvancedSearchFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const handleSearch = () => {
    onSearch(filters as AdvancedSearchFilters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      experienceLevel: [],
      salaryRange: { currency: 'KRW' },
      locations: [],
      workType: [],
      skillCategories: {},
      companySize: [],
      industries: [],
      sortBy: 'relevance',
      sortDirection: 'desc',
      lastActiveWithin: 'any',
      hasRecentPosts: false,
      isMessageAvailable: false
    });
  };

  const saveAsPreset = () => {
    const presetName = prompt('프리셋 이름을 입력하세요:');
    if (presetName) {
      const newPreset: SearchPreset = {
        id: Date.now().toString(),
        name: presetName,
        filters,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      localStorage.setItem('search_presets', JSON.stringify(updatedPresets));
    }
  };

  const loadPreset = (preset: SearchPreset) => {
    setFilters(preset.filters);
    // 사용 횟수 증가
    const updatedPresets = presets.map(p => 
      p.id === preset.id ? { ...p, usageCount: p.usageCount + 1 } : p
    );
    setPresets(updatedPresets);
    localStorage.setItem('search_presets', JSON.stringify(updatedPresets));
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-search-overlay" onClick={onClose}>
      <div className="advanced-search-modal" onClick={e => e.stopPropagation()}>
        <div className="advanced-search-header">
          <h2>🔍 고급 검색</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="advanced-search-content">
          {/* 탭 네비게이션 */}
          <div className="search-tabs">
            <button 
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              기본 검색
            </button>
            <button 
              className={`tab ${activeTab === 'career' ? 'active' : ''}`}
              onClick={() => setActiveTab('career')}
            >
              경력 & 급여
            </button>
            <button 
              className={`tab ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              위치 & 근무형태
            </button>
            <button 
              className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              기술 스택
            </button>
            <button 
              className={`tab ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              회사 & 업계
            </button>
          </div>

          <div className="search-tab-content">
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <div className="form-group">
                  <label>검색어</label>
                  <input
                    type="text"
                    value={filters.query || ''}
                    onChange={e => handleFilterChange('query', e.target.value)}
                    placeholder="이름, 직무, 스킬, 회사명 등을 검색하세요"
                  />
                </div>

                <div className="form-group">
                  <label>정렬 기준</label>
                  <div className="form-row">
                    <select
                      value={filters.sortBy || 'relevance'}
                      onChange={e => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="relevance">관련성</option>
                      <option value="recent">최신순</option>
                      <option value="popular">인기순</option>
                      <option value="followers">팔로워순</option>
                      <option value="experience">경력순</option>
                    </select>
                    <select
                      value={filters.sortDirection || 'desc'}
                      onChange={e => handleFilterChange('sortDirection', e.target.value)}
                    >
                      <option value="desc">내림차순</option>
                      <option value="asc">올림차순</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>활동성</label>
                  <select
                    value={filters.lastActiveWithin || 'any'}
                    onChange={e => handleFilterChange('lastActiveWithin', e.target.value)}
                  >
                    <option value="any">전체</option>
                    <option value="week">1주일 이내</option>
                    <option value="month">1개월 이내</option>
                    <option value="3months">3개월 이내</option>
                    <option value="year">1년 이내</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.isMessageAvailable || false}
                      onChange={e => handleFilterChange('isMessageAvailable', e.target.checked)}
                    />
                    메시지 가능한 사용자만
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'career' && (
              <div className="tab-panel">
                <div className="form-group">
                  <label>경력 수준</label>
                  <div className="checkbox-grid">
                    {experienceLevels.map(level => (
                      <label key={level} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={(filters.experienceLevel || []).includes(level as any)}
                          onChange={() => toggleArrayValue('experienceLevel', level)}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>연봉 범위 (만원)</label>
                  <div className="salary-range">
                    <input
                      type="number"
                      placeholder="최소 연봉"
                      value={filters.salaryRange?.min || ''}
                      onChange={e => handleFilterChange('salaryRange', {
                        ...filters.salaryRange,
                        min: parseInt(e.target.value) || undefined
                      })}
                    />
                    <span>~</span>
                    <input
                      type="number"
                      placeholder="최대 연봉"
                      value={filters.salaryRange?.max || ''}
                      onChange={e => handleFilterChange('salaryRange', {
                        ...filters.salaryRange,
                        max: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>최소 소셜 지표</label>
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="최소 팔로워"
                      value={filters.minFollowers || ''}
                      onChange={e => handleFilterChange('minFollowers', parseInt(e.target.value) || undefined)}
                    />
                    <input
                      type="number"
                      placeholder="최소 좋아요"
                      value={filters.minLikes || ''}
                      onChange={e => handleFilterChange('minLikes', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="tab-panel">
                <div className="form-group">
                  <label>근무 지역</label>
                  <div className="checkbox-grid">
                    {locations.map(location => (
                      <label key={location} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={(filters.locations || []).includes(location)}
                          onChange={() => toggleArrayValue('locations', location)}
                        />
                        {location}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>근무 형태</label>
                  <div className="checkbox-grid">
                    {workTypes.map(type => (
                      <label key={type} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={(filters.workType || []).includes(type as any)}
                          onChange={() => toggleArrayValue('workType', type)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="tab-panel">
                {Object.entries(skillOptions).map(([category, skills]) => (
                  <div key={category} className="form-group">
                    <label>{category === 'languages' ? '언어' : 
                            category === 'frameworks' ? '프레임워크' :
                            category === 'databases' ? '데이터베이스' :
                            category === 'cloud' ? '클라우드/DevOps' : '도구'}</label>
                    <div className="skill-tags">
                      {skills.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          className={`skill-tag ${
                            (filters.skillCategories?.[category as keyof typeof skillOptions] || []).includes(skill) ? 'selected' : ''
                          }`}
                          onClick={() => {
                            const currentSkills = filters.skillCategories?.[category as keyof typeof skillOptions] || [];
                            const newSkills = currentSkills.includes(skill)
                              ? currentSkills.filter(s => s !== skill)
                              : [...currentSkills, skill];
                            handleSkillCategoryChange(category as keyof typeof skillOptions, newSkills);
                          }}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'company' && (
              <div className="tab-panel">
                <div className="form-group">
                  <label>회사 규모</label>
                  <div className="checkbox-grid">
                    {companySizes.map(size => (
                      <label key={size} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={(filters.companySize || []).includes(size as any)}
                          onChange={() => toggleArrayValue('companySize', size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>업계</label>
                  <div className="checkbox-grid">
                    {industries.map(industry => (
                      <label key={industry} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={(filters.industries || []).includes(industry)}
                          onChange={() => toggleArrayValue('industries', industry)}
                        />
                        {industry}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 프리셋 관리 */}
          {presets.length > 0 && (
            <div className="search-presets">
              <h4>저장된 검색 조건</h4>
              <div className="preset-list">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    className="preset-item"
                    onClick={() => loadPreset(preset)}
                  >
                    {preset.name} ({preset.usageCount}회 사용)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="advanced-search-footer">
          <div className="footer-left">
            <button className="btn-secondary" onClick={resetFilters}>
              초기화
            </button>
            <button className="btn-secondary" onClick={saveAsPreset}>
              프리셋 저장
            </button>
          </div>
          <div className="footer-right">
            <button className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button className="btn-primary" onClick={handleSearch}>
              검색하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;