import React, { useState } from "react";
import type { DetailedCareerProfile } from "../types/detailedProfile";
import { useTheme } from "@/components/theme-provider";
import MessageModal from "./ui/MessageModal";
import InteractiveCareerFlow from "./InteractiveCareerFlow";
import "./DetailedProfile.css";
import type { BrowseProfile } from "@/services/mockCareerApi";

interface DetailedProfileProps {
  profile: BrowseProfile;
  onBack: () => void;
  onMessage: (userId: string) => void;
}

// Mock data generator - 나중에 API로 대체
const generateDetailedProfile = (
  profile: BrowseProfile,
): DetailedCareerProfile => {
  return {
    ...profile,
    profileImage: undefined, // 기본 이모지 사용
    username: `@${profile.userProfile.username || "dev_user"}`,
    title: profile.userProfile.displayName.includes("개발자")
      ? `${profile.userProfile.displayName}`
      : `${profile.userProfile.currentRole}`,
    tagline: `${profile.userProfile.experience} 경력의 ${profile.userProfile.currentRole}`,

    // About Me
    aboutMe: {
      personalStory: `${profile.userProfile.bio}\n\n저는 항상 기술을 통해 사람들의 삶을 더 나은 방향으로 변화시키고자 합니다. ${profile.userProfile.currentRole}로서 다양한 프로젝트를 경험하며 성장해왔으며, 특히 사용자 중심의 솔루션 개발에 관심이 많습니다.`,
      currentFocus: profile.userProfile.interests,
      philosophy:
        "완벽한 코드보다는 사용자에게 가치를 전달하는 코드를 추구합니다.",
      careerGoals: ["기술 리더십 향상", "팀 성장 기여", "혁신적인 제품 개발"],
    },

    // Career Timeline
    careerTimeline: [
      {
        id: "1",
        period: "2023 ~ 현재",
        company: profile.userProfile.company || "현재 회사",
        position: profile.userProfile.currentRole,
        description: `현재 ${profile.userProfile.currentRole}로 근무하며 다양한 프로젝트를 리딩하고 있습니다.`,
        achievements: [
          "주요 프로젝트 성공적 완료",
          "팀 생산성 30% 향상",
          "신기술 도입 및 적용",
        ],
        technologies: profile.userProfile.skills.slice(0, 4),
      },
      {
        id: "2",
        period: "2018 ~ 2021",
        company: "이전 회사",
        position: "중급 개발자",
        description: "다양한 기술 스택을 경험하며 전문성을 쌓았습니다.",
        achievements: [
          "RESTful API 설계 및 구현",
          "레거시 시스템 마이그레이션",
          "코드 품질 개선 활동",
        ],
        technologies: ["Java", "Spring", "MySQL", "AWS"],
      },
    ],

    // Skills 분류
    skillCategories: {
      languages: profile.userProfile.skills.filter((skill) =>
        [
          "Java",
          "JavaScript",
          "Python",
          "TypeScript",
          "SQL",
          "Go",
          "Kotlin",
        ].includes(skill),
      ),
      backend: profile.userProfile.skills.filter((skill) =>
        ["Spring Boot", "Node.js", "Express", "Django", "FastAPI"].includes(
          skill,
        ),
      ),
      database: ["MySQL", "PostgreSQL", "Redis", "MongoDB"].filter(
        (skill) =>
          profile.userProfile.skills.includes(skill) || Math.random() > 0.5,
      ),
      cloudDevOps: ["AWS", "Docker", "Jenkins", "Kubernetes", "CI/CD"].filter(
        (skill) =>
          profile.userProfile.skills.includes(skill) || Math.random() > 0.7,
      ),
      tools: ["Git", "Jira", "Confluence", "Notion", "Figma"].filter(
        () => Math.random() > 0.6,
      ),
    },

    // Certifications
    certifications: [
      {
        id: "1",
        name: "정보처리기사",
        issuer: "한국산업인력공단",
        date: "2022-06",
      },
      {
        id: "2",
        name: "AWS Solutions Architect - Associate",
        issuer: "Amazon Web Services",
        date: "2023-03",
      },
    ],

    // Education
    education: [
      {
        id: "1",
        degree: "B.S. in Computer Science",
        school: "서울 소재 대학교",
        major: "Computer Science",
        period: "2014 ~ 2018",
        additionalInfo: [
          "주요 과목: 자료구조, 운영체제, 데이터베이스, 네트워크",
          "졸업 프로젝트: 웹 기반 협업 도구 개발",
        ],
      },
    ],

    // Career Flow (React Flow 데이터) - 향상된 정보 포함
    careerFlow: {
      nodes: [
        {
          id: "entry",
          position: { x: 100, y: 80 },
          data: {
            label: "주니어 개발자",
            level: "entry" as const,
            status: "completed" as const,
            period: "2018.03 - 2019.02",
            company: "Tech Startup",
            description:
              "스타트업에서 첫 개발 경력을 시작하며 웹 개발의 기초를 다졌습니다.",
            achievements: [
              "첫 상용 프로젝트 성공적 런칭",
              "React 기반 프론트엔드 개발",
              "팀 협업 프로세스 개선",
            ],
            technologies: ["React", "JavaScript", "CSS", "Git"],
            skills: ["문제 해결", "빠른 학습", "팀워크"],
          },
          type: "careerStep",
        },
        {
          id: "junior",
          position: { x: 100, y: 280 },
          data: {
            label: "중급 개발자",
            level: "junior" as const,
            status: "completed" as const,
            period: "2019.03 - 2021.06",
            company: "IT Company",
            description:
              "다양한 프로젝트를 경험하며 풀스택 개발 역량을 키웠습니다.",
            achievements: [
              "B2B SaaS 플랫폼 개발 참여",
              "RESTful API 설계 및 구현",
              "성능 최적화로 로딩 속도 50% 개선",
            ],
            technologies: ["Node.js", "TypeScript", "PostgreSQL", "Docker"],
            skills: ["API 설계", "데이터베이스", "성능 최적화"],
          },
          type: "careerStep",
        },
        {
          id: "mid",
          position: { x: 100, y: 480 },
          data: {
            label: "시니어 개발자",
            level: "mid" as const,
            status: "completed" as const,
            period: "2021.07 - 2023.12",
            company: "Tech Corp",
            description:
              "팀 리딩과 아키텍처 설계를 담당하며 기술 리더십을 발휘했습니다.",
            achievements: [
              "마이크로서비스 아키텍처 도입",
              "개발팀 5명 리딩 및 멘토링",
              "CI/CD 파이프라인 구축",
            ],
            technologies: ["Kubernetes", "AWS", "GraphQL", "Redis"],
            skills: ["아키텍처 설계", "팀 리딩", "멘토링"],
          },
          type: "careerStep",
        },
        {
          id: "current",
          position: { x: 100, y: 680 },
          data: {
            label: profile.userProfile.currentRole,
            level: "senior" as const,
            status: "current" as const,
            period: "2024.01 - 현재",
            company: profile.userProfile.company || "현재 회사",
            description:
              "현재 포지션에서 혁신적인 프로젝트를 이끌며 조직의 기술 혁신을 주도하고 있습니다.",
            achievements: [
              "AI 기반 자동화 시스템 구축",
              "개발 생산성 40% 향상",
              "기술 블로그 운영 및 지식 공유",
            ],
            technologies: profile.userProfile.skills.slice(0, 5),
            skills: ["전략적 사고", "혁신", "리더십"],
          },
          type: "careerStep",
        },
      ],
      edges: [
        {
          id: "e1",
          source: "entry",
          target: "junior",
          sourceHandle: "source-bottom",
          targetHandle: "target-top",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#ef4444", strokeWidth: 2 },
        },
        {
          id: "e2",
          source: "junior",
          target: "mid",
          sourceHandle: "source-bottom",
          targetHandle: "target-top",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#ef4444", strokeWidth: 2 },
        },
        {
          id: "e3",
          source: "mid",
          target: "current",
          sourceHandle: "source-bottom",
          targetHandle: "target-top",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#ef4444", strokeWidth: 2 },
        },
      ],
    },

    // Contact Info
    contactInfo: {
      socialLinks: profile.userProfile.socialLinks || [],
      isMessageAvailable: true,
      preferredContactMethod: "message",
      responseTime: "보통 1일 이내 답변",
    },

    // Additional metadata
    profileViews: Math.floor(Math.random() * 500) + 100,
    profileCompleteness: 85,
    lastActive: "2시간 전",
    isVerified: Math.random() > 0.5,

    privacy: {
      showEmail: false,
      showPhoneNumber: false,
      allowMessages: true,
      showCareerTimeline: true,
      showSalaryInfo: false,
    },
  };
};

const DetailedProfile: React.FC<DetailedProfileProps> = ({
  profile,
  onBack,
}) => {
  const { theme } = useTheme();
  const [detailedProfile] = useState(() => generateDetailedProfile(profile));
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(profile.isFollowed);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Toast 알림 제거됨
    // toast.success(isLiked ? '좋아요를 취소했습니다' : '좋아요! ❤️');
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    // Toast 알림 제거됨
    // toast.success(isFollowed ? '팔로우를 취소했습니다' : '팔로우하기 시작했습니다! 👥');
  };

  const handleMessage = () => {
    setShowMessageModal(true);
  };

  const handleSendMessage = async (
    recipientId: string,
    message: string,
    subject?: string,
  ) => {
    try {
      // TODO: API 호출로 메시지 전송
      console.log("Sending message:", { recipientId, message, subject });

      // 임시로 성공으로 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Toast 알림 제거됨
      // toast.success('메시지가 성공적으로 전송되었습니다! 📤');
      console.log("메시지 전송 성공");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Toast 알림 제거됨
      // toast.error('메시지 전송에 실패했습니다.');
      console.error("Message send failed:", error);
      throw error;
    }
  };

  return (
    <div className={`detailed-profile-container ${theme}`}>
      {/* Header */}
      <div className="detailed-profile-header">
        <button className="back-button" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="profile-actions">
          <button
            className="action-btn navigation-btn"
            onClick={() => {
              // 네비게이션 패널 토글 이벤트 발생
              const event = new CustomEvent("toggleNavigation");
              window.dispatchEvent(event);
            }}
            title="네비게이션 패널 열기 (스페이스바)"
          >
            🧭 네비게이션
          </button>
          <button className="action-btn share-btn">🔗 공유</button>
          <button className="action-btn report-btn">⚠️ 신고</button>
        </div>
      </div>

      <div className="profile-main-content">
        {/* Left Panel - Detailed Information */}
        <div className="profile-left-panel">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-image-section">
                <div className="profile-image">
                  {detailedProfile.profileImage ? (
                    <img src={detailedProfile.profileImage} alt="프로필" />
                  ) : (
                    "📦"
                  )}
                </div>
                <button
                  className={`like-button ${isLiked ? "liked" : ""}`}
                  onClick={handleLike}
                >
                  {isLiked ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="profile-basic-info">
                <h1 className="profile-name">{detailedProfile.title}</h1>
                <p className="profile-username">{detailedProfile.username}</p>
                <p className="profile-tagline">{detailedProfile.tagline}</p>

                <div className="profile-action-buttons">
                  <button className="action-link">🔗</button>
                  <button className="action-share">📤</button>
                  <button
                    className={`action-follow ${isFollowed ? "following" : ""}`}
                    onClick={handleFollow}
                  >
                    {isFollowed ? "팔로잉" : "팔로우"}
                  </button>
                  <button className="action-message" onClick={handleMessage}>
                    💬 메시지
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="info-section">
            <h3>👤 About Me</h3>
            <div className="about-content">
              <p>{detailedProfile.aboutMe.personalStory}</p>
              {detailedProfile.aboutMe.philosophy && (
                <p>
                  <strong>개발 철학:</strong>{" "}
                  {detailedProfile.aboutMe.philosophy}
                </p>
              )}
              {detailedProfile.aboutMe.careerGoals.length > 0 && (
                <div>
                  <strong>목표:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                    {detailedProfile.aboutMe.careerGoals.map((goal, index) => (
                      <li
                        key={index}
                        style={{ marginBottom: "0.25rem", color: "#4b5563" }}
                      >
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Career Timeline Section */}
          <div className="info-section">
            <h3>📈 Career Timeline</h3>
            <div className="timeline-list">
              {detailedProfile.careerTimeline.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-header">
                    <div>
                      <h4 className="timeline-company">{item.company}</h4>
                      <p className="timeline-position">{item.position}</p>
                    </div>
                    <span className="timeline-period">{item.period}</span>
                  </div>
                  <p className="timeline-description">{item.description}</p>

                  {item.achievements && item.achievements.length > 0 && (
                    <div className="timeline-achievements">
                      <h5>주요 성과</h5>
                      <ul className="achievements-list">
                        {item.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.technologies && item.technologies.length > 0 && (
                    <div className="timeline-technologies">
                      {item.technologies.map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="info-section">
            <h3>🛠️ Skills</h3>
            <div className="skills-categories">
              {detailedProfile.skillCategories.languages.length > 0 && (
                <div className="skill-category">
                  <h4 className="skill-category-title">
                    Programming Languages
                  </h4>
                  <div className="skill-items">
                    {detailedProfile.skillCategories.languages.map(
                      (skill, index) => (
                        <span key={index} className="skill-item primary">
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {detailedProfile.skillCategories.backend.length > 0 && (
                <div className="skill-category">
                  <h4 className="skill-category-title">Backend & Frameworks</h4>
                  <div className="skill-items">
                    {detailedProfile.skillCategories.backend.map(
                      (skill, index) => (
                        <span key={index} className="skill-item">
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {detailedProfile.skillCategories.database.length > 0 && (
                <div className="skill-category">
                  <h4 className="skill-category-title">Database & Storage</h4>
                  <div className="skill-items">
                    {detailedProfile.skillCategories.database.map(
                      (skill, index) => (
                        <span key={index} className="skill-item">
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {detailedProfile.skillCategories.cloudDevOps.length > 0 && (
                <div className="skill-category">
                  <h4 className="skill-category-title">Cloud & DevOps</h4>
                  <div className="skill-items">
                    {detailedProfile.skillCategories.cloudDevOps.map(
                      (skill, index) => (
                        <span key={index} className="skill-item">
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {detailedProfile.skillCategories.tools.length > 0 && (
                <div className="skill-category">
                  <h4 className="skill-category-title">Tools & Others</h4>
                  <div className="skill-items">
                    {detailedProfile.skillCategories.tools.map(
                      (skill, index) => (
                        <span key={index} className="skill-item">
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="info-section">
            <h3>🏆 Certifications</h3>
            <div className="certifications-list">
              {detailedProfile.certifications.map((cert) => (
                <div key={cert.id} className="certification-item">
                  <h4 className="certification-name">{cert.name}</h4>
                  <p className="certification-issuer">{cert.issuer}</p>
                  <p className="certification-date">{cert.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="info-section">
            <h3>🎓 Education</h3>
            <div className="education-list">
              {detailedProfile.education.map((edu) => (
                <div key={edu.id} className="education-item">
                  <h4 className="education-degree">{edu.degree}</h4>
                  <p className="education-school">{edu.school}</p>
                  <p className="education-period">{edu.period}</p>
                  {edu.additionalInfo && edu.additionalInfo.length > 0 && (
                    <ul className="education-info">
                      {edu.additionalInfo.map((info, index) => (
                        <li key={index}>{info}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Interactive Career Flow Chart */}
        <div className="profile-right-panel">
          <InteractiveCareerFlow
            careerFlow={detailedProfile.careerFlow}
            title={`${detailedProfile.userProfile.displayName}의 커리어 여정`}
            readOnly={false}
            height={600}
            onNodeClick={(nodeId) => {
              console.log("Node clicked:", nodeId);
            }}
            onEdgeUpdate={(edge) => {
              console.log("Edge updated:", edge);
            }}
          />
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipientName={detailedProfile.userProfile.displayName}
        recipientId={detailedProfile.id}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default DetailedProfile;
