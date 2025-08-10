import React, { useState, useEffect, useRef } from 'react';
import { BrowseProfile } from '../types/career';
import './ProfilePreview.css';

interface ProfilePreviewProps {
  profile: BrowseProfile;
  position: { x: number; y: number };
  onClose: () => void;
  onViewProfile: (profile: BrowseProfile) => void;
  onFollow: (profileId: string) => void;
  onLike: (profileId: string) => void;
  isFollowed: boolean;
  isLiked: boolean;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  profile,
  position,
  onClose,
  onViewProfile,
  onFollow,
  onLike,
  isFollowed,
  isLiked
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      return modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
    };

    // Set initial focus to the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // ESC key handler
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Focus trap: handle Tab key
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: move backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow(profile.id);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(profile.id);
  };

  const handleViewProfile = () => {
    onViewProfile(profile);
    onClose();
  };

  // 위치 조정 (화면 경계를 벗어나지 않도록, SSR 안전)
  const adjustedPosition = {
    x: typeof window !== 'undefined' 
      ? Math.max(0, Math.min(position.x, window.innerWidth - 320))
      : position.x,
    y: typeof window !== 'undefined'
      ? Math.max(0, Math.min(position.y, window.innerHeight - 400))
      : position.y
  };

  return (
    <>
      {/* 백드롭 */}
      <div className="preview-backdrop" onClick={onClose} />
      
      {/* 미리보기 카드 */}
      <div 
        ref={modalRef}
        className="profile-preview-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-name"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y
        }}
      >
        <div className="preview-header">
          <div className="preview-avatar">
            {profile.userProfile.avatar || '👤'}
          </div>
          <button 
            className="preview-close" 
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="preview-content">
          <div className="preview-basic-info">
            <h3 id="preview-name" className="preview-name">{profile.userProfile.displayName}</h3>
            <p className="preview-role">{profile.userProfile.currentRole}</p>
            <p className="preview-company">
              🏢 {profile.userProfile.company || '구직중'}
            </p>
            <p className="preview-location">
              📍 {profile.userProfile.location || '서울'}
            </p>
            <p className="preview-experience">
              {profile.userProfile.experience} 경험
            </p>
          </div>

          <div className="preview-bio">
            <p>{profile.userProfile.bio}</p>
          </div>

          <div className="preview-skills">
            <h4>주요 스킬</h4>
            <div className="skills-list">
              {profile.userProfile.skills.slice(0, 6).map(skill => (
                <span key={skill} className="preview-skill-tag">{skill}</span>
              ))}
              {profile.userProfile.skills.length > 6 && (
                <span className="preview-more-skills">
                  +{profile.userProfile.skills.length - 6}
                </span>
              )}
            </div>
          </div>

          <div className="preview-stats">
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{profile.stats.totalLikes}</span>
              <span className="stat-label">좋아요</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{profile.stats.followers}</span>
              <span className="stat-label">팔로워</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{profile.stats.completedGoals}</span>
              <span className="stat-label">목표</span>
            </div>
          </div>

          <div className="preview-badges">
            {profile.badges.map(badge => (
              <span key={badge} className="preview-badge">{badge}</span>
            ))}
          </div>
        </div>

        <div className="preview-actions">
          <button 
            className={`preview-action-btn preview-like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            title="좋아요"
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
          
          <button 
            className={`preview-action-btn preview-follow-btn ${isFollowed ? 'following' : ''}`}
            onClick={handleFollowClick}
            title={isFollowed ? '팔로우 취소' : '팔로우'}
          >
            {isFollowed ? '✓' : '+'}
          </button>
          
          <button 
            className="preview-action-btn preview-message-btn"
            title="메시지"
          >
            💬
          </button>
          
          <button 
            className="preview-action-btn preview-view-btn primary"
            onClick={handleViewProfile}
            title="프로필 보기"
          >
            👀 프로필 보기
          </button>
        </div>

        {/* 화살표 지시자 */}
        <div className="preview-arrow" />
      </div>
    </>
  );
};

export default ProfilePreview;