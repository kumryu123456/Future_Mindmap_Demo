import React, { useState, useEffect } from "react";
import { BrowseProfile, UserProfile, CareerMap } from "../types/career";
import { careerAPI } from "../services/mockCareerApi";
import { useProfileSearch } from "../hooks/useProfileSearch";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useTheme } from "@/components/theme-provider";
import DetailedProfile from "./DetailedProfile";
import AdvancedSearch from "./AdvancedSearch";
import ProfileNavigation from "./ProfileNavigation";
import { type AdvancedSearchFilters } from "../types/advancedSearch";
import Pagination from "./Pagination";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
// import CareerMapViewer from './CareerMapViewer';  // 임시 주석처리
import "./Browse.css";

interface BrowseProps {
  onProfileSelect?: (profile: BrowseProfile) => void;
}

type ViewMode = "grid" | "list" | "profile";
type ScrollMode = "pagination" | "infinite";
type SortMode = "popular" | "recent" | "followers";
type FilterTag =
  | "all"
  | "신입개발자"
  | "경력자"
  | "AI전문가"
  | "리더십"
  | "멘토";

const Browse: React.FC<BrowseProps> = ({ onProfileSelect }) => {
  const { theme } = useTheme();
  const [profiles, setProfiles] = useState<BrowseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortMode>("popular");
  const [selectedTags, setSelectedTags] = useState<FilterTag[]>(["all"]);
  const [selectedProfile, setSelectedProfile] = useState<BrowseProfile | null>(
    null,
  );
  const [selectedCareerMap, setSelectedCareerMap] = useState<CareerMap | null>(
    null,
  );
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<
    Partial<AdvancedSearchFilters>
  >({});
  const [scrollMode, setScrollMode] = useState<ScrollMode>("pagination");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalProfiles, setTotalProfiles] = useState(0);

  // 🎯 Phase 2: 네비게이션 개선 상태
  const [showNavigation, setShowNavigation] = useState(false);

  // 실시간 검색 훅 사용
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    filteredProfiles,
    searchStats,
    isSearching,
  } = useProfileSearch({ profiles });

  // 🎯 Phase 2: 소셜 인터랙션 상태 관리
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [animatingLikes, setAnimatingLikes] = useState<Set<string>>(new Set());
  const [animatingFollows, setAnimatingFollows] = useState<Set<string>>(
    new Set(),
  );

  const availableTags: FilterTag[] = [
    "all",
    "신입개발자",
    "경력자",
    "AI전문가",
    "리더십",
    "멘토",
  ];

  // 🎯 Phase 2: 로컬 스토리지에서 좋아요 상태 복원
  useEffect(() => {
    const savedLikes = localStorage.getItem("browse_liked_profiles");
    if (savedLikes) {
      try {
        const likedArray = JSON.parse(savedLikes);
        setLikedProfiles(new Set(likedArray));
      } catch (error) {
        console.error(
          "Failed to parse liked profiles from localStorage:",
          error,
        );
      }
    }
  }, []);

  // 좋아요 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(
      "browse_liked_profiles",
      JSON.stringify(Array.from(likedProfiles)),
    );
  }, [likedProfiles]);

  // 🎯 Phase 2: 네비게이션 토글 이벤트 리스너
  useEffect(() => {
    const handleToggleNavigation = () => {
      if (viewMode === "profile") {
        setShowNavigation(!showNavigation);
      }
    };

    window.addEventListener("toggleNavigation", handleToggleNavigation);
    return () =>
      window.removeEventListener("toggleNavigation", handleToggleNavigation);
  }, [viewMode, showNavigation]);

  // Mock fetch function for infinite scroll
  const fetchProfilesForInfiniteScroll = async (
    page: number,
    pageSize: number,
  ) => {
    const filters = {
      search: undefined,
      tags: selectedTags.includes("all") ? undefined : selectedTags,
      sortBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    const response = await careerAPI.getBrowseProfiles(filters);
    // careerAPI.getBrowseProfiles는 { data: BrowseProfile[], totalCount: number } 형태를 반환
    const hasMore = page * pageSize < response.totalCount;

    return {
      items: response.data, // data 속성에서 실제 배열을 추출
      totalItems: response.totalCount,
      hasMore,
    };
  };

  // Infinite scroll hook
  const infiniteScroll = useInfiniteScroll({
    fetchFunction: fetchProfilesForInfiniteScroll,
    pageSize: itemsPerPage,
    config: {
      enabled: scrollMode === "infinite",
    },
  });

  useEffect(() => {
    if (scrollMode === "pagination") {
      loadProfiles(currentPage);
    } else {
      infiniteScroll.reset();
    }
  }, [sortBy, selectedTags, scrollMode, currentPage, itemsPerPage]);

  const loadProfiles = async (
    page: number = 1,
    pageSize: number = itemsPerPage,
  ) => {
    setLoading(true);
    try {
      console.log("🔍 Loading profiles with filters:", {
        searchQuery,
        selectedTags,
        sortBy,
        page,
        pageSize,
      });

      const filters = {
        search: undefined, // 검색은 이제 프론트엔드에서 처리
        tags: selectedTags.includes("all") ? undefined : selectedTags,
        sortBy,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };

      const response = await careerAPI.getBrowseProfiles(filters);
      console.log("✅ Profiles loaded:", response.data.length);

      if (page === 1 || scrollMode === "pagination") {
        setProfiles(response.data);
      } else {
        // 무한스크롤: 기존 데이터에 추가
        setProfiles((prev) => [...prev, ...response.data]);
      }

      setTotalProfiles(response.totalCount);
    } catch (error) {
      console.error("❌ Failed to load profiles:", error);
      // Toast 알림 제거됨
      // toast.error('프로필을 불러오는데 실패했습니다.');

      // Fallback: 간단한 mock 데이터
      setProfiles([
        {
          id: "user1",
          userProfile: {
            id: "user1",
            username: "testuser",
            displayName: "김테스트",
            currentRole: "AI 개발자",
            experience: "2-5년",
            bio: "테스트 사용자입니다.",
            skills: ["Python", "React", "AI"],
            interests: ["AI"],
            careerMaps: [],
            socialLinks: [],
            createdAt: new Date().toISOString(),
            isPublic: true,
          },
          careerMaps: [],
          stats: {
            totalLikes: 10,
            totalViews: 100,
            completedGoals: 5,
            followers: 20,
          },
          isFollowed: false,
          badges: ["신입개발자"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: FilterTag) => {
    if (tag === "all") {
      setSelectedTags(["all"]);
    } else {
      const newTags = selectedTags.includes("all")
        ? [tag]
        : selectedTags.includes(tag)
          ? selectedTags.filter((t) => t !== tag)
          : [...selectedTags, tag];

      setSelectedTags(newTags.length === 0 ? ["all"] : newTags);
    }
  };

  // 🎯 Single source of truth: 모든 프로필 데이터를 중앙에서 관리
  const allProfilesData = React.useMemo(() => {
    // 무한스크롤 모드일 때는 infiniteScroll.items를, 페이지네이션일 때는 profiles를 사용
    const sourceProfiles =
      scrollMode === "infinite" ? infiniteScroll.items : profiles;
    return sourceProfiles;
  }, [scrollMode, infiniteScroll.items, profiles]);

  // 필터링과 검색을 결합한 최종 프로필 목록 - 단일 데이터 소스 사용
  const finalFilteredProfiles = React.useMemo(() => {
    // 검색을 allProfilesData에 직접 적용
    let result = [...allProfilesData];

    // 검색 필터 적용 (debouncedQuery 사용)
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter((profile) => {
        return (
          profile.userProfile.displayName.toLowerCase().includes(query) ||
          profile.userProfile.currentRole.toLowerCase().includes(query) ||
          profile.userProfile.bio?.toLowerCase().includes(query) ||
          profile.userProfile.company?.toLowerCase().includes(query) ||
          profile.userProfile.skills.some((skill) =>
            skill.toLowerCase().includes(query),
          ) ||
          profile.userProfile.interests.some((interest) =>
            interest.toLowerCase().includes(query),
          ) ||
          profile.badges.some((badge) => badge.toLowerCase().includes(query))
        );
      });
    }

    // 태그 필터 적용
    if (!selectedTags.includes("all")) {
      result = result.filter((profile) =>
        selectedTags.some((tag) => profile.badges.includes(tag)),
      );
    }

    // 정렬 적용
    result.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case "popular":
          aValue = a.stats.totalLikes;
          bValue = b.stats.totalLikes;
          break;
        case "followers":
          aValue = a.stats.followers;
          bValue = b.stats.followers;
          break;
        case "recent":
          // 임시로 ID 기반 정렬 (실제로는 createdAt 사용)
          aValue = parseInt(a.id.replace(/\D/g, "")) || 0;
          bValue = parseInt(b.id.replace(/\D/g, "")) || 0;
          break;
        default:
          return 0;
      }

      return bValue - aValue; // 내림차순
    });

    return result;
  }, [allProfilesData, debouncedQuery, selectedTags, sortBy]);

  // 🎯 Phase 2: 키보드 네비게이션 훅 (finalFilteredProfiles 정의 후에 위치)
  const keyboardNavigation = useKeyboardNavigation({
    profiles: finalFilteredProfiles,
    currentProfile: selectedProfile,
    isEnabled: viewMode === "profile" && !!selectedProfile,
    onProfileChange: (profile) => {
      setSelectedProfile(profile);
      onProfileSelect?.(profile);
    },
    onClose: () => {
      setSelectedProfile(null);
      setViewMode("grid");
    },
    onTogglePreview: () => setShowNavigation(!showNavigation),
  });

  // 🎯 Phase 2: 개선된 소셜 인터랙션 핸들러
  const handleSocialInteraction = async (
    type: "like" | "comment" | "follow",
    targetId: string,
    profileIndex?: number,
  ) => {
    try {
      // 애니메이션 시작
      if (type === "like") {
        setAnimatingLikes((prev) => new Set(prev).add(targetId));
      } else if (type === "follow") {
        setAnimatingFollows((prev) => new Set(prev).add(targetId));
      }

      await careerAPI.handleSocialInteraction({
        userId: "current_user",
        targetId,
        type,
        data: {},
      });

      // UI 즉시 업데이트 with 개선된 로직
      if (type === "like" && profileIndex !== undefined) {
        const isCurrentlyLiked = likedProfiles.has(targetId);

        // 좋아요 상태 토글
        setLikedProfiles((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.delete(targetId);
          } else {
            newSet.add(targetId);
          }
          return newSet;
        });

        // 🎯 Single source of truth: 두 데이터 소스 모두 업데이트
        const updateProfileStats = (profiles: BrowseProfile[]) =>
          profiles.map((profile, index) =>
            index === profileIndex
              ? {
                  ...profile,
                  stats: {
                    ...profile.stats,
                    totalLikes:
                      profile.stats.totalLikes + (isCurrentlyLiked ? -1 : 1),
                  },
                }
              : profile,
          );

        // 페이지네이션 모드 데이터 업데이트
        setProfiles(updateProfileStats);

        // 무한스크롤 모드 데이터도 업데이트 (hook에 updateItems 메서드가 있는 경우)
        if (scrollMode === "infinite" && infiniteScroll.updateItems) {
          infiniteScroll.updateItems(updateProfileStats(infiniteScroll.items));
        }

        // Toast 알림 제거됨
        // toast.success(isCurrentlyLiked ? '좋아요를 취소했습니다' : '좋아요를 눌렀습니다! ❤️');
      } else if (type === "follow" && profileIndex !== undefined) {
        // 🎯 Single source of truth: 두 데이터 소스 모두 업데이트
        const updateFollowStatus = (profiles: BrowseProfile[]) =>
          profiles.map((profile, index) =>
            index === profileIndex
              ? {
                  ...profile,
                  isFollowed: !profile.isFollowed,
                  stats: {
                    ...profile.stats,
                    followers:
                      profile.stats.followers + (profile.isFollowed ? -1 : 1),
                  },
                }
              : profile,
          );

        // 페이지네이션 모드 데이터 업데이트
        setProfiles(updateFollowStatus);

        // 무한스크롤 모드 데이터도 업데이트 (hook에 updateItems 메서드가 있는 경우)
        if (scrollMode === "infinite" && infiniteScroll.updateItems) {
          infiniteScroll.updateItems(updateFollowStatus(infiniteScroll.items));
        }

        const profile = profiles[profileIndex];
        // Toast 알림 제거됨
        // toast.success(
        //   profile?.isFollowed
        //     ? `${profile.userProfile.displayName}님 팔로우를 취소했습니다`
        //     : `${profile.userProfile.displayName}님을 팔로우했습니다! 👥`
        // );
      } else if (type === "comment") {
        // Toast 알림 제거됨
        // toast.info('댓글 기능은 곧 출시됩니다! 💬');
        console.log("댓글 기능 클릭");
      }
    } catch (error) {
      console.error("Social interaction error:", error);
      // Toast 알림 제거됨
      // toast.error('작업을 완료하지 못했습니다.');
    } finally {
      // 애니메이션 종료
      setTimeout(() => {
        if (type === "like") {
          setAnimatingLikes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(targetId);
            return newSet;
          });
        } else if (type === "follow") {
          setAnimatingFollows((prev) => {
            const newSet = new Set(prev);
            newSet.delete(targetId);
            return newSet;
          });
        }
      }, 600); // 애니메이션 지속 시간
    }
  };

  const handleProfileClick = (profile: BrowseProfile) => {
    setSelectedProfile(profile);
    setViewMode("profile");
    onProfileSelect?.(profile);
    // 네비게이션 패널 표시
    setShowNavigation(true);
  };

  const handleCareerMapView = (careerMap: CareerMap) => {
    setSelectedCareerMap(careerMap);
  };

  if (selectedCareerMap) {
    return (
      <div className="browse-career-viewer">
        <div className="viewer-header">
          <button
            className="back-button"
            onClick={() => setSelectedCareerMap(null)}
          >
            ← 뒤로가기
          </button>
          <h2>{selectedCareerMap.title}</h2>
        </div>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>커리어 맵 뷰어는 곧 구현될 예정입니다.</p>
          <button onClick={() => setSelectedCareerMap(null)}>닫기</button>
        </div>
        {/* 
        <CareerMapViewer 
          careerMap={selectedCareerMap}
          readOnly={true}
          onClose={() => setSelectedCareerMap(null)}
        />
        */}
      </div>
    );
  }

  if (viewMode === "profile" && selectedProfile) {
    return (
      <>
        <DetailedProfile
          profile={selectedProfile}
          onBack={() => {
            setSelectedProfile(null);
            setViewMode("grid");
            setShowNavigation(false);
          }}
          onMessage={(userId: string) => {
            console.log("Open message modal for user:", userId);
            // 메시지 모달은 DetailedProfile 컴포넌트 내부에서 처리됩니다
          }}
        />

        {/* 🎯 Phase 2: 프로필 네비게이션 패널 */}
        {showNavigation && (
          <ProfileNavigation
            currentProfile={selectedProfile}
            allProfiles={finalFilteredProfiles}
            onProfileChange={(profile) => {
              setSelectedProfile(profile);
              onProfileSelect?.(profile);
            }}
            onClose={() => setShowNavigation(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className={`browse-container ${theme}`}>
      {/* Header Controls */}
      <div className="browse-header">
        <div className="header-left">
          <h1>🔍 커리어 둘러보기</h1>
          <p>다양한 전문가들의 커리어 여정을 탐색해보세요</p>
        </div>

        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
            >
              ⊞
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>

          <div className="scroll-mode-toggle">
            <button
              className={scrollMode === "pagination" ? "active" : ""}
              onClick={() => setScrollMode("pagination")}
              title="페이지네이션"
            >
              📄
            </button>
            <button
              className={scrollMode === "infinite" ? "active" : ""}
              onClick={() => setScrollMode("infinite")}
              title="무한스크롤"
            >
              ♾️
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
            className="sort-select"
          >
            <option value="popular">인기순</option>
            <option value="recent">최신순</option>
            <option value="followers">팔로워순</option>
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="browse-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="이름, 직무, 스킬, 회사명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && <div className="search-loading">⏳</div>}
            <button
              className="search-button"
              onClick={() => setShowAdvancedSearch(true)}
              title="고급 검색"
            >
              🔍+
            </button>
          </div>

          {/* 검색 결과 통계 */}
          {/* 검색 및 필터 결과 통계 */}
          <div className="search-results-info">
            <span className="results-count">
              {finalFilteredProfiles.length}개의 결과
              {debouncedQuery && ` (검색: "${debouncedQuery}")`}
              {!selectedTags.includes("all") &&
                ` (필터: ${selectedTags.join(", ")})`}
            </span>
            {debouncedQuery && searchStats.searchFields.length > 0 && (
              <span className="search-fields">
                매칭 필드:{" "}
                {searchStats.searchFields
                  .map((field) => {
                    const fieldNames: { [key: string]: string } = {
                      name: "이름",
                      role: "직책",
                      bio: "소개",
                      company: "회사",
                      skills: "기술",
                      interests: "관심분야",
                      badges: "태그",
                    };
                    return fieldNames[field] || field;
                  })
                  .join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="tag-filters">
          {availableTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid/List */}
      {(
        scrollMode === "pagination"
          ? loading
          : infiniteScroll.loading && infiniteScroll.items.length === 0
      ) ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>프로필을 불러오는 중...</p>
        </div>
      ) : (
        <>
          <div className={`profiles-container ${viewMode}`}>
            {finalFilteredProfiles.map((profile, index) => (
              <div
                key={profile.id}
                className="profile-card"
                onClick={() => handleProfileClick(profile)}
              >
                <div className="card-header">
                  <div className="profile-avatar">
                    {profile.userProfile.avatar || "👤"}
                  </div>
                  <div className="profile-info">
                    <h3>{profile.userProfile.displayName}</h3>
                    <p className="role">{profile.userProfile.currentRole}</p>
                    <div className="work-info">
                      <span className="company">
                        🏢 {profile.userProfile.company || "구직중"}
                      </span>
                      <span className="location">
                        📍 {profile.userProfile.location || "서울"}
                      </span>
                    </div>
                    <p className="experience">
                      {profile.userProfile.experience} 경험
                    </p>
                  </div>
                  <button
                    className={`follow-btn ${
                      profile.isFollowed ? "following" : ""
                    } ${animatingFollows.has(profile.id) ? "animating" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSocialInteraction("follow", profile.id, index);
                    }}
                  >
                    {profile.isFollowed ? "✓" : "+"}
                  </button>
                </div>

                <p className="bio">{profile.userProfile.bio}</p>

                <div className="skills-preview">
                  {profile.userProfile.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                  {profile.userProfile.skills.length > 4 && (
                    <span className="more-skills">
                      +{profile.userProfile.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="badges-preview">
                  {profile.badges.slice(0, 2).map((badge) => (
                    <span key={badge} className="badge">
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-icon">❤️</span>
                    <span>{profile.stats.totalLikes}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span>{profile.stats.followers}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🎯</span>
                    <span>{profile.stats.completedGoals}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className={`action-btn like ${
                      likedProfiles.has(profile.id) ? "liked" : ""
                    } ${animatingLikes.has(profile.id) ? "animating" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSocialInteraction("like", profile.id, index);
                    }}
                  >
                    {likedProfiles.has(profile.id)
                      ? "❤️ 좋아요됨"
                      : "🤍 좋아요"}
                  </button>
                  <button
                    className="action-btn comment"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSocialInteraction("comment", profile.id, index);
                    }}
                  >
                    💬 댓글
                  </button>
                  <button
                    className="action-btn share"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/profile/${profile.id}`,
                      );
                      // Toast 알림 제거됨
                      // toast.success('프로필 링크가 복사되었습니다! 🔗');
                      console.log("프로필 링크 복사됨");
                    }}
                  >
                    🔗 공유
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Components */}
          {scrollMode === "infinite" && (
            <>
              {infiniteScroll.loading && infiniteScroll.items.length > 0 && (
                <div className="infinite-scroll-loading">
                  <div className="spinner"></div>더 많은 프로필을 불러오는 중...
                </div>
              )}

              {infiniteScroll.error && (
                <div className="infinite-scroll-error">
                  오류가 발생했습니다: {infiniteScroll.error}
                  <button onClick={() => infiniteScroll.loadMore()}>
                    다시 시도
                  </button>
                </div>
              )}

              {!infiniteScroll.hasMore && infiniteScroll.items.length > 0 && (
                <div className="infinite-scroll-end">
                  모든 프로필을 불러왔습니다 🎉
                </div>
              )}

              <div
                ref={infiniteScroll.observerRef}
                className="infinite-scroll-trigger"
              />
            </>
          )}

          {/* Pagination Component */}
          {scrollMode === "pagination" && finalFilteredProfiles.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalProfiles / itemsPerPage)}
              totalItems={totalProfiles}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
              showItemsPerPage={true}
              showStats={true}
            />
          )}
        </>
      )}

      {finalFilteredProfiles.length === 0 && !loading && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 키워드로 검색하거나 필터를 조정해보세요.</p>
          <button
            className="btn-secondary"
            onClick={() => setShowAdvancedSearch(true)}
            style={{ marginTop: "1rem" }}
          >
            🔍 고급 검색 열기
          </button>
        </div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={(filters) => {
          console.log("고급 검색 필터:", filters);
          setAdvancedFilters(filters);
          // TODO: 고급 검색 로직 구현
        }}
        currentFilters={advancedFilters}
      />
    </div>
  );
};

export default Browse;
