import { useEffect, useCallback } from 'react';
import { BrowseProfile } from '../types/career';

interface UseKeyboardNavigationProps {
  profiles: BrowseProfile[];
  currentProfile: BrowseProfile | null;
  isEnabled: boolean;
  onProfileChange: (profile: BrowseProfile) => void;
  onClose: () => void;
  onTogglePreview?: () => void;
}

export const useKeyboardNavigation = ({
  profiles,
  currentProfile,
  isEnabled,
  onProfileChange,
  onClose,
  onTogglePreview
}: UseKeyboardNavigationProps) => {
  
  const getCurrentIndex = useCallback(() => {
    if (!currentProfile) return -1;
    return profiles.findIndex(p => p.id === currentProfile.id);
  }, [profiles, currentProfile]);

  const navigateToProfile = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'next') {
      newIndex = currentIndex < profiles.length - 1 ? currentIndex + 1 : 0; // 순환
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : profiles.length - 1; // 순환
    }

    const newProfile = profiles[newIndex];
    if (newProfile) {
      onProfileChange(newProfile);
    }
  }, [profiles, getCurrentIndex, onProfileChange]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // 입력 필드에서는 키보드 네비게이션 비활성화
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    )) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'j': // Vim-style navigation
        event.preventDefault();
        navigateToProfile('next');
        break;
        
      case 'ArrowLeft':
      case 'k': // Vim-style navigation
        event.preventDefault();
        navigateToProfile('prev');
        break;
        
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
        
      case ' ': // Spacebar
        if (onTogglePreview) {
          event.preventDefault();
          onTogglePreview();
        }
        break;
        
      case 'Enter':
        // Enter는 현재 선택된 프로필을 상세보기로 열기
        event.preventDefault();
        if (currentProfile) {
          onProfileChange(currentProfile);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        if (profiles.length > 0) {
          onProfileChange(profiles[0]);
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (profiles.length > 0) {
          onProfileChange(profiles[profiles.length - 1]);
        }
        break;

      // 숫자 키로 빠른 이동 (1-9)
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        if (index < profiles.length) {
          onProfileChange(profiles[index]);
        }
        break;
    }
  }, [isEnabled, navigateToProfile, onClose, onTogglePreview, currentProfile, onProfileChange, profiles]);

  // 키보드 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isEnabled, handleKeyPress]);

  // 현재 프로필의 위치 정보 반환
  const getNavigationInfo = useCallback(() => {
    const currentIndex = getCurrentIndex();
    return {
      currentIndex,
      total: profiles.length,
      hasNext: currentIndex < profiles.length - 1,
      hasPrev: currentIndex > 0,
      isFirst: currentIndex === 0,
      isLast: currentIndex === profiles.length - 1
    };
  }, [getCurrentIndex, profiles.length]);

  return {
    navigateToProfile,
    getNavigationInfo,
    getCurrentIndex
  };
};