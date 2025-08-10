import './App.css'
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import { mockPlans, mockSessionData } from './data/mockPlans'
import { useToast } from './components/ui/ToastNotification'
import PlanCard from './components/ui/PlanCard'
import MindmapCanvas from './components/MindmapCanvas'
import CareerListView from './components/CareerListView'
import AICareerCanvas from './components/AICareerCanvas'
import Browse from './components/Browse'
import SimpleBrowse from './components/SimpleBrowse'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

// Simplified SessionManager for testing
const TestSessionManager = () => {
  const toast = useToast();
  
  return (
    <div style={{
      padding: '2rem',
      border: '2px solid #10b981',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h3>🔧 Session Manager 테스트</h3>
      <p>간단한 Session Manager 컴포넌트 테스트</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={() => console.log('Session save clicked')}
          style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#10b981', color: 'white' }}
        >
          Save Session
        </button>
        <button 
          onClick={() => console.log('Load sessions clicked')}
          style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white' }}
        >
          Load Sessions
        </button>
      </div>
    </div>
  );
};

// App 내부 컴포넌트 (테마 적용)
function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState(mockPlans[0]);
  const [currentSessionData, setCurrentSessionData] = useState(mockSessionData);
  const [activeView, setActiveView] = useState<'career' | 'browse' | 'dashboard'>('career');
  const toast = useToast();
  const { theme } = useTheme();
  
  const handleViewChange = (view: typeof activeView) => {
    console.log('🔄 Attempting to change view from', activeView, 'to', view);
    console.log('🔄 Before setState - activeView:', activeView);
    
    setActiveView(view);
    
    console.log('🔄 After setState call - should be:', view);
    
    // Force a re-render check
    setTimeout(() => {
      console.log('🔄 Delayed check - activeView is now:', view);
    }, 100);
    
    // Toast 알림 제거됨
    // const viewNames = {
    //   dashboard: '📊 대시보드',
    //   browse: '🔍 둘러보기', 
    //   career: '🎯 AI커리어설계'
    // };
    // toast.info(`Switched to ${viewNames[view]}`, { duration: 1500 });
  };
  
  // 디버깅 로그를 useEffect로 이동하여 무한 렌더링 방지
  useEffect(() => {
    console.log('🔴 Phase 4: App with Toast functionality rendering...', { 
      plansCount: mockPlans.length, 
      selectedPlan: selectedPlan?.name,
      activeView: activeView,
      toastAvailable: !!toast
    });

    console.log('📱 Current active view:', activeView);
    console.log('📱 View conditions:', {
      isDashboard: activeView === 'dashboard',
      isBrowse: activeView === 'browse', 
      isCareer: activeView === 'career'
    });
  }, [activeView, selectedPlan?.name, toast]);
  
  return (
    <div className={`app ${theme}`}>
      <Header 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
    
    {/* Main Content Area - 뷰에 따라 다른 콘텐츠 표시 */}
    <div className={`main-content ${theme}`} style={{
      padding: (activeView === 'career' || activeView === 'browse') ? '0' : '2rem',
      minHeight: 'calc(100vh - var(--header-height))',
      fontSize: '18px'
    }}>
      
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className={`dashboard-container ${theme}`}>
            {console.log('📊 Rendering Dashboard view')}
            <h1 className="dashboard-title">
              📊 Dashboard - Plan 관리
            </h1>
            
            <div className={`dashboard-status ${theme}`}>
              <h3>📊 데이터 로드 상태:</h3>
              <p>✅ Plans 로드됨: {mockPlans.length}개</p>
              <p>✅ 선택된 Plan: {selectedPlan?.name}</p>
              <p>✅ Session 데이터: {currentSessionData.mindmapData.nodes.length}개 노드</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <PlanCard
                plan={selectedPlan}
                config={{
                  viewMode: 'standard',
                  showProgress: true,
                  showTeam: true,
                  showStatus: true,
                  interactive: true
                }}
                onClick={(plan) => {
                  console.log('🔄 Plan clicked:', plan.name);
                  // Toast 알림 제거됨
                  // toast.info(`Plan selected: ${plan.name}`);
                }}
                onMilestoneClick={(milestone) => {
                  console.log('🎯 Milestone clicked:', milestone.name);
                  // Toast 알림 제거됨
                  // toast.success(`Milestone: ${milestone.name}`);
                }}
              />
            </div>
          </div>
        )}

        {/* Browse View */}
        {activeView === 'browse' && (
          <Browse 
            onProfileSelect={(profile) => {
              console.log('🎯 Profile selected:', profile.userProfile.displayName);
              // Toast 알림 제거됨
              // toast.info(`프로필 선택: ${profile.userProfile.displayName}`, { duration: 2000 });
            }}
          />
        )}

        {/* Career Design View - 전체 화면 마인드맵 */}
        {activeView === 'career' && (
          <div style={{ 
            width: '100%',
            height: 'calc(100vh - 80px)', /* Header 높이만 제외 */
            position: 'relative',
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}>
            <AICareerCanvas />
          </div>
        )}
        
    </div>
    </div>
  );
}

// 메인 App 컴포넌트 (ThemeProvider 래핑)
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;