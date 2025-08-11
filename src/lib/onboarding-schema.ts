import { z } from "zod";

export const onboardingFormSchema = z.object({
  // 학력
  education: z.string({
    error: "학력을 선택해주세요.",
  }),

  // 학교 (선택사항)
  school: z.string().optional(),

  // 전공
  major: z
    .string({
      error: "전공을 입력해주세요.",
    })
    .min(1, "전공을 입력해주세요."),

  // 보유 기술
  skills: z.array(z.string()).min(1, "최소 하나의 기술을 선택해주세요."),

  // 보유 자격증 (선택사항)
  certifications: z.string().optional(),

  // 기타 작업 경험 검토
  experience: z
    .string({
      error: "기타 작업 경험을 입력해주세요.",
    })
    .min(10, "최소 10자 이상 입력해주세요.")
    .max(500, "최대 500자까지 입력 가능합니다."),

  // 목표 직무
  goal: z
    .string({
      error: "목표 직무를 입력해주세요.",
    })
    .min(20, "최소 20자 이상 구체적으로 입력해주세요.")
    .max(1000, "최대 1000자까지 입력 가능합니다."),
});

export const onboardingInfoStepSchema = onboardingFormSchema.partial();

export type OnboardingInfoStepFormData = z.infer<
  typeof onboardingInfoStepSchema
>;

export const onboardingGoalStepSchema = onboardingInfoStepSchema.required({
  education: true,
  major: true,
  skills: true,
  experience: true,
});

export type OnboardingGoalStepFormData = z.infer<
  typeof onboardingGoalStepSchema
>;

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

// 상수 정의
export const EDUCATION_OPTIONS = [
  { value: "highschool", label: "고등학교" },
  { value: "college", label: "대학교 재학" },
  { value: "bachelor", label: "대학교 졸업" },
  { value: "master", label: "대학원 재학/졸업" },
  { value: "other", label: "기타" },
];

export const SKILL_OPTIONS = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "react", label: "React" },
  { value: "nodejs", label: "Node.js" },
  { value: "tensorflow", label: "TensorFlow" },
  { value: "pytorch", label: "PyTorch" },
  { value: "sql", label: "SQL" },
  { value: "git", label: "Git" },
  { value: "docker", label: "Docker" },
  { value: "aws", label: "AWS" },
  { value: "etc", label: "기타" },
];
