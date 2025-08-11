"use client";

import dynamic from "next/dynamic";

const OnboardingFunnel = dynamic(
  () => import("@/app/ai-career/onboarding/components/OnboardingFunnel"),
  {
    ssr: false,
  },
);

export default function AICareerOnboardingPage() {
  return <OnboardingFunnel />;
}
