import { NodeData } from "@/nodes/type";

export interface CareerMap {
  id: string;
  title: string;
  targetRole: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: NodeData[];
}

// Mock data for career maps
export const mockCareerMaps: CareerMap[] = [
  {
    id: "data-scientist-map",
    title: "데이터 사이언티스트 커리어 맵",
    targetRole: "데이터 사이언티스트",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    nodes: [
      {
        id: "current",
        type: "current",
        position: { x: 300, y: 600 },
        data: {
          label: "현재\n신입 개발자",
        },
      },
      {
        id: "python-basic",
        type: "intermediate",
        position: { x: 150, y: 450 },
        data: {
          label: "Python\n기초 학습",
          info: {
            skillInfo: {
              description:
                "데이터 사이언스의 핵심 언어인 Python 기초 문법과 데이터 처리를 위한 라이브러리를 학습합니다.",
              prerequisites: ["프로그래밍 기초"],
              learningResources: [
                {
                  title: "점프 투 파이썬",
                  description: "Python 기초부터 심화까지 체계적 학습",
                  type: "book",
                },
                {
                  title: "파이썬 데이터 사이언스 핸드북",
                  description: "NumPy, Pandas, Matplotlib 완벽 가이드",
                  type: "book",
                },
                {
                  title: "모두를 위한 파이썬 (Python for Everybody)",
                  description: "미시간 대학교의 Python 기초 강의",
                  type: "course",
                },
              ],
              estimatedTime: "2-3개월",
              difficulty: "초급",
            },
          },
          reviews: [
            {
              id: "review-python-1",
              author: "김파이썬",
              rating: 5,
              content:
                "Python 기초를 탄탄히 다질 수 있었어요. 특히 데이터 처리 부분이 도움되었습니다.",
              createdAt: new Date("2024-01-19"),
              helpful: 28,
            },
            {
              id: "review-python-2",
              author: "이초보",
              rating: 4,
              content:
                "처음 배우기에 적절한 난이도였습니다. 실습 위주로 공부하니 재밌어요!",
              createdAt: new Date("2024-01-20"),
              helpful: 15,
            },
          ],
        },
      },
      {
        id: "final",

        type: "final",
        position: { x: 300, y: 50 },
        data: {
          label: "데이터 사이언티스트",
        },
      },
    ],
  },
  {
    id: "info-processing-engineer-map",
    title: "정보처리기사 커리어 맵",
    targetRole: "백엔드 개발자",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    nodes: [
      {
        id: "current",
        type: "current",
        position: { x: 300, y: 500 },
        data: {
          label: "현재\n프론트엔드 개발자",
        },
      },
      {
        id: "java-basic",

        type: "intermediate",
        position: { x: 200, y: 400 },
        data: {
          label: "Java\n기초 학습",
          info: {
            skillInfo: {
              description:
                "백엔드 개발의 핵심 언어인 Java 기초 문법과 객체지향 프로그래밍을 학습합니다.",
              prerequisites: ["프로그래밍 기초"],
              learningResources: [
                {
                  title: "자바의 정석",
                  description: "Java 학습의 바이블, 기초부터 심화까지",
                  type: "book",
                },
                {
                  title: "이것이 자바다",
                  description: "실무 중심의 Java 학습서",
                  type: "book",
                },
                {
                  title: "자바 프로그래밍 입문",
                  description: "생활코딩의 Java 기초 강의",
                  type: "course",
                },
              ],
              estimatedTime: "2-3개월",
              difficulty: "초급",
            },
          },
          reviews: [
            {
              id: "review-java-1",
              author: "김자바",
              rating: 5,
              content:
                "Java 기초를 탄탄히 다질 수 있었어요. 객체지향 개념이 특히 도움되었습니다.",
              createdAt: new Date("2024-01-13"),
              helpful: 25,
            },
          ],
        },
      },
      {
        id: "final",
        type: "final",
        position: { x: 300, y: 100 },
        data: {
          label: "asd",
        },
      },
    ],
  },
];
