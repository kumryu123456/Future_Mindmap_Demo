import {
  onboardingGoalStepSchema,
  onboardingInfoStepSchema,
} from "@/lib/onboarding-schema";
import { useFunnel } from "@use-funnel/browser";
import { Info } from "@/app/ai-career/onboarding/components/Info";
import { Goal } from "@/app/ai-career/onboarding/components/Goal";

export default function OnboardingFunnel() {
  const funnel = useFunnel({
    id: "onboarding-funnel",
    steps: {
      info: { parse: onboardingInfoStepSchema.parse },
      goal: { parse: onboardingGoalStepSchema.parse },
    },
    initial: {
      step: "info",
      context: {},
    },
  });

  return (
    <funnel.Render
      info={({ history, context }) => (
        <Info
          defaultValues={{
            ...context,
            education: "",
            major: "",
            skills: [],
            experience: "",
          }}
          onNext={(data) => history.push("goal", data)}
        />
      )}
      goal={({ history, context }) => (
        <Goal
          defaultValues={{ ...context, goal: "" }}
          onNext={(data) => history.push("info", data)}
        />
      )}
    />
  );
}
