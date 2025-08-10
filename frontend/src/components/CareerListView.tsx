import React, { useState, useEffect } from 'react';
import { CareerMap, FilterOptions } from '../types/career';
import { careerApi, mockData } from '../services/careerApi';
import './CareerListView.css';

interface CareerListViewProps {
  onCareerSelect?: (career: CareerMap) => void;
}

const CareerListView: React.FC<CareerListViewProps> = ({ onCareerSelect }) => {
  const [careerMaps, setCareerMaps] = useState<CareerMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'similar'>('popular');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Data loading with development flag
  useEffect(() => {
    const loadCareerMaps = async () => {
      setLoading(true);
      try {
        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          // Development mode: use mock data
          const mockCareerMaps = mockData.generateMockCareerList(12);
          
          // Add some variety to mock data
          const enhancedMockData = mockCareerMaps.map((career, index) => ({
            ...career,
            likes: Math.floor(Math.random() * 100) + 1,
            tags: ['초보자', '중급자', '고급자'][index % 3] === '초보자' ? ['초보자', '기초'] : 
                  ['초보자', '중급자', '고급자'][index % 3] === '중급자' ? ['중급자', '실무'] :
                  ['고급자', '전문가'],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          }));

          setCareerMaps(enhancedMockData);
        } else {
          // Production mode: use real API
          // TODO: Replace with actual API call when backend is ready
          // const response = await careerApi.getCareerMaps();
          // setCareerMaps(response.data);
          
          // Temporary fallback for production without API
          setCareerMaps([]);
        }
      } catch (error) {
        console.error('Failed to load career maps:', error);
        
        // Fallback only in development
        const isDevelopment = import.meta.env.DEV;
        if (isDevelopment) {
          setCareerMaps(mockData.generateMockCareerList(6));
        } else {
          setCareerMaps([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCareerMaps();
  }, []);

  // Filter and sort career maps
  const filteredAndSortedCareerMaps = React.useMemo(() => {
    let filtered = careerMaps.filter(career => {
      const matchesSearch = searchQuery === '' || 
        career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => career.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'similar':
          // For now, just use likes as similarity score
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return filtered;
  }, [careerMaps, searchQuery, selectedTags, sortBy]);

  // Get unique tags for filter options
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    careerMaps.forEach(career => {
      career.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [careerMaps]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  if (loading) {
    return (
      <div className="career-list-loading">
        <div className="loading-spinner"></div>
        <p>커리어 로드맵을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="career-list-view">
      {/* Search and Filter Controls */}
      <div className="career-list-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="관심있는 커리어나 키워드를 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">
              🔍
            </button>
          </div>
        </div>

        <div className="filter-section">
          <div className="sort-controls">
            <label>정렬:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="sort-select"
            >
              <option value="popular">인기순</option>
              <option value="recent">최신순</option>
              <option value="similar">추천순</option>
            </select>
          </div>

          <div className="tag-filters">
            <label>태그:</label>
            <div className="tag-options">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Career Cards Grid */}
      <div className="career-grid">
        {filteredAndSortedCareerMaps.map(career => (
          <div 
            key={career.id} 
            className="career-card"
            onClick={() => onCareerSelect?.(career)}
          >
            <div className="career-card-header">
              <h3 className="career-title">{career.title}</h3>
              <div className="career-likes">
                <span className="heart-icon">❤️</span>
                <span className="likes-count">{career.likes}</span>
              </div>
            </div>

            <p className="career-description">{career.description}</p>

            <div className="career-stats">
              <div className="stat-item">
                <span className="stat-label">노드</span>
                <span className="stat-value">{career.nodes.length}개</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">단계</span>
                <span className="stat-value">{Math.max(...career.nodes.map(n => n.level)) + 1}단계</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">생성</span>
                <span className="stat-value">{formatTimeAgo(career.createdAt)}</span>
              </div>
            </div>

            <div className="career-tags">
              {career.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <div className="career-preview">
              <div className="node-preview">
                {career.nodes.slice(0, 3).map(node => (
                  <div 
                    key={node.id} 
                    className={`preview-node ${node.type}`}
                    style={{ backgroundColor: node.color }}
                  >
                    {node.title}
                  </div>
                ))}
                {career.nodes.length > 3 && (
                  <div className="preview-more">
                    +{career.nodes.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedCareerMaps.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 키워드로 검색해보시거나 필터를 조정해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default CareerListView;