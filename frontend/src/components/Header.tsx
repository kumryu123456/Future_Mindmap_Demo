import React from 'react';
import './Header.css';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeView: 'career' | 'browse' | 'dashboard';
  onViewChange: (view: 'career' | 'browse' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`header ${theme}`}>
      <div className="header-content">
        {/* 로고 및 브랜드 */}
        <div className="header-brand">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Career Pilot</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="header-nav">
          <button 
            className={`nav-button ${activeView === 'career' ? 'active' : ''}`}
            onClick={() => onViewChange('career')}
          >
            AI커리어설계
          </button>
          <button 
            className={`nav-button ${activeView === 'browse' ? 'active' : ''}`}
            onClick={() => onViewChange('browse')}
          >
            둘러보기
          </button>
          <button 
            className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            대시보드
          </button>
        </nav>

        {/* 테마 토글 및 로그인/회원가입 버튼 */}
        <div className="header-right">
          <button 
            className="theme-toggle-header" 
            title="테마 변경"
            onClick={toggleTheme}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="header-auth">
            <button className="auth-button login">로그인</button>
            <button className="auth-button signup">회원가입</button>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;