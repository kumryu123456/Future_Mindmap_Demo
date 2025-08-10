import React, { useState, useEffect } from 'react';
import { BrowseProfile } from '../types/career';
import { useTheme } from '../contexts/ThemeContext';
import './ProfileNavigation.css';

interface ProfileNavigationProps {
  currentProfile: BrowseProfile;
  allProfiles: BrowseProfile[];
  onProfileChange: (profile: BrowseProfile) => void;
  onClose: () => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  currentProfile,
  allProfiles,
  onProfileChange,
  onClose
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<BrowseProfile[]>([]);

  // 현재 프로필의 인덱스 찾기
  useEffect(() => {
    const index = allProfiles.findIndex(p => p.id === currentProfile.id);
    setCurrentIndex(index !== -1 ? index : 0);
  }, [currentProfile, allProfiles]);

  // 방문 기록 업데이트
  useEffect(() => {
    setHistory(prev => {
      const newHistory = prev.filter(id => id !== currentProfile.id);
      return [currentProfile.id, ...newHistory].slice(0, 10); // 최대 10개만 저장
    });
  }, [currentProfile.id]);

  // 추천 프로필 생성 (유사한 스킬, 경험 수준, 역할 기반)
  useEffect(() => {
    const getSimilarProfiles = () => {
      const current = currentProfile;
      return allProfiles
        .filter(profile => profile.id !== current.id)
        .map(profile => ({
          profile,
          score: calculateSimilarity(current, profile)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.profile);
    };

    setSuggestions(getSimilarProfiles());
  }, [currentProfile, allProfiles]);

  // 유사도 계산 함수
  const calculateSimilarity = (profile1: BrowseProfile, profile2: BrowseProfile): number => {
    let score = 0;

    // 스킬 유사도 (50점)
    const skills1 = new Set(profile1.userProfile.skills);
    const skills2 = new Set(profile2.userProfile.skills);
    const commonSkills = [...skills1].filter(skill => skills2.has(skill));
    const skillSimilarity = commonSkills.length / Math.max(skills1.size, skills2.size);
    score += skillSimilarity * 50;

    // 역할 유사도 (30점)
    if (profile1.userProfile.currentRole === profile2.userProfile.currentRole) {
      score += 30;
    } else if (profile1.userProfile.currentRole.includes('개발') && 
               profile2.userProfile.currentRole.includes('개발')) {
      score += 20;
    }

    // 경험 수준 유사도 (20점)
    if (profile1.userProfile.experience === profile2.userProfile.experience) {
      score += 20;
    } else {
      const exp1 = getExperienceLevel(profile1.userProfile.experience);
      const exp2 = getExperienceLevel(profile2.userProfile.experience);
      if (Math.abs(exp1 - exp2) <= 1) {
        score += 10;
      }
    }

    return score;
  };

  const getExperienceLevel = (experience: string): number => {
    if (experience.includes('신입')) return 0;
    if (experience.includes('1-3년') || experience.includes('1~3년')) return 1;
    if (experience.includes('3-5년') || experience.includes('3~5년')) return 2;
    if (experience.includes('5-10년') || experience.includes('5~10년')) return 3;
    if (experience.includes('10년+') || experience.includes('10년 이상')) return 4;
    return 2;
  };

  const navigateToProfile = (profile: BrowseProfile) => {
    onProfileChange(profile);
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      navigateToProfile(allProfiles[currentIndex - 1]);
    }
  };

  const navigateNext = () => {
    if (currentIndex < allProfiles.length - 1) {
      navigateToProfile(allProfiles[currentIndex + 1]);
    }
  };

  const getHistoryProfiles = () => {
    return history
      .slice(1) // 현재 프로필 제외
      .map(id => allProfiles.find(p => p.id === id))
      .filter(Boolean) as BrowseProfile[];
  };

  return (
    <div className={`profile-navigation ${theme}`}>
      {/* 상단 네비게이션 바 */}
      <div className="nav-bar">
        <div className="nav-controls">
          <button 
            className="nav-btn prev-btn"
            onClick={navigatePrevious}
            disabled={currentIndex === 0}
            title="이전 프로필"
          >
            ◀
          </button>
          
          <div className="nav-counter">
            {currentIndex + 1} / {allProfiles.length}
          </div>
          
          <button 
            className="nav-btn next-btn"
            onClick={navigateNext}
            disabled={currentIndex === allProfiles.length - 1}
            title="다음 프로필"
          >
            ▶
          </button>
        </div>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* 빠른 네비게이션 패널 */}
      <div className="nav-panel">
        {/* 방문 기록 */}
        {getHistoryProfiles().length > 0 && (
          <div className="nav-section">
            <h4 className="nav-section-title">
              🕒 최근 방문
            </h4>
            <div className="profile-list horizontal">
              {getHistoryProfiles().slice(0, 4).map((profile) => (
                <div
                  key={profile.id}
                  className="profile-item"
                  onClick={() => navigateToProfile(profile)}
                >
                  <div className="profile-avatar">
                    {profile.userProfile.avatar || '👤'}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{profile.userProfile.displayName}</div>
                    <div className="profile-role">{profile.userProfile.currentRole}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 추천 프로필 */}
        <div className="nav-section">
          <h4 className="nav-section-title">
            ✨ 유사한 프로필
          </h4>
          <div className="profile-list">
            {suggestions.slice(0, 4).map((profile) => (
              <div
                key={profile.id}
                className="profile-item"
                onClick={() => navigateToProfile(profile)}
              >
                <div className="profile-avatar">
                  {profile.userProfile.avatar || '👤'}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{profile.userProfile.displayName}</div>
                  <div className="profile-role">{profile.userProfile.currentRole}</div>
                  <div className="profile-skills">
                    {profile.userProfile.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="profile-stats">
                  <span className="stat">❤️ {profile.stats.totalLikes}</span>
                  <span className="stat">👥 {profile.stats.followers}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 키보드 단축키 힌트 */}
      <div className="keyboard-hints">
        <span className="hint">← → 네비게이션</span>
        <span className="hint">ESC 닫기</span>
      </div>
    </div>
  );
};

export default ProfileNavigation;