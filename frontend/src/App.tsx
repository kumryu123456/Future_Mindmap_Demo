import "./App.css";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import { mockPlans, mockSessionData } from "./data/mockPlans";
import { useToast } from "./components/ui/ToastNotification";
import PlanCard from "./components/ui/PlanCard";
import Browse from "./components/Browse";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router";
import { Carrer } from "@/pages/Carrer/Career";

// 메인 App 컴포넌트 (ThemeProvider 래핑)
function App() {
  const [selectedPlan, setSelectedPlan] = useState(mockPlans[0]);
  const [currentSessionData, setCurrentSessionData] = useState(mockSessionData);
  const [activeView, setActiveView] = useState<
    "career" | "browse" | "dashboard"
  >("career");
  const toast = useToast();

  const handleViewChange = (view: typeof activeView) => {
    console.log("🔄 Attempting to change view from", activeView, "to", view);
    console.log("🔄 Before setState - activeView:", activeView);

    setActiveView(view);

    console.log("🔄 After setState call - should be:", view);

    // Force a re-render check
    setTimeout(() => {
      console.log("🔄 Delayed check - activeView is now:", view);
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
    console.log("🔴 Phase 4: App with Toast functionality rendering...", {
      plansCount: mockPlans.length,
      selectedPlan: selectedPlan?.name,
      activeView: activeView,
      toastAvailable: !!toast,
    });

    console.log("📱 Current active view:", activeView);
    console.log("📱 View conditions:", {
      isDashboard: activeView === "dashboard",
      isBrowse: activeView === "browse",
      isCareer: activeView === "career",
    });
  }, [activeView, selectedPlan?.name, toast]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className={`app`}>
          <Header />

          {/* Main Content Area - 뷰에 따라 다른 콘텐츠 표시 */}
          <div
            className={`main-content`}
            style={{
              padding:
                activeView === "career" || activeView === "browse"
                  ? "0"
                  : "2rem",
              minHeight: "calc(100vh - var(--header-height))",
              fontSize: "18px",
            }}
          >
            <Routes>
              <Route index element={<Carrer />} />

              <Route
                path="dashboard"
                element={
                  <div className={`dashboard-container`}>
                    <h1 className="dashboard-title">
                      📊 Dashboard - Plan 관리
                    </h1>

                    <div className={`dashboard-status`}>
                      <h3>📊 데이터 로드 상태:</h3>
                      <p>✅ Plans 로드됨: {mockPlans.length}개</p>
                      <p>✅ 선택된 Plan: {selectedPlan?.name}</p>
                      <p>
                        ✅ Session 데이터:{" "}
                        {currentSessionData.mindmapData.nodes.length}개 노드
                      </p>
                    </div>

                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                      <PlanCard
                        plan={selectedPlan}
                        config={{
                          viewMode: "standard",
                          showProgress: true,
                          showTeam: true,
                          showStatus: true,
                          interactive: true,
                        }}
                        onClick={(plan) => {
                          console.log("🔄 Plan clicked:", plan.name);
                          // Toast 알림 제거됨
                          // toast.info(`Plan selected: ${plan.name}`);
                        }}
                        onMilestoneClick={(milestone) => {
                          console.log("🎯 Milestone clicked:", milestone.name);
                          // Toast 알림 제거됨
                          // toast.success(`Milestone: ${milestone.name}`);
                        }}
                      />
                    </div>
                  </div>
                }
              />

              <Route
                path="browse"
                element={
                  <Browse
                    onProfileSelect={(profile) => {
                      console.log(
                        "🎯 Profile selected:",
                        profile.userProfile.displayName,
                      );
                      // Toast 알림 제거됨
                      // toast.info(`프로필 선택: ${profile.userProfile.displayName}`, { duration: 2000 });
                    }}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
