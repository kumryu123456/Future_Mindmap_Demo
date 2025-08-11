import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  OnboardingFormData,
  onboardingFormSchema,
} from "@/lib/onboarding-schema";

interface GoalProps {
  onNext: (data: OnboardingFormData) => void;
  defaultValues?: OnboardingFormData;
}

export const Goal = ({ onNext, defaultValues }: GoalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      onNext(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-[520px] px-0 py-[100px] flex flex-col gap-10 items-center justify-center">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full text-center">
            <h1 className="font-bold text-[32px] text-black">목표 직무 설정</h1>
          </div>
          <div className="w-full flex flex-col gap-6">
            <div className="w-full text-left">
              <p className="font-bold text-[20px] text-black">
                AI 커리어패스 설계를 위한 내 목표 직무 입력
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-6"
              >
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full h-[173px] bg-white border border-[rgba(0,0,0,0.1)] rounded-md p-3">
                          <Textarea
                            placeholder="자신의 목표 직무를 자세하게 입력해주세요! 구체적으로 입력할수록 좋아요!

ex) 나는 최종적으로 IT 기업에서 PO가 되는 게 목표야. 간편하고 혁신적인 핀테크 서비스를 직접 기획해서 사람들의 금융 생활을 바꾸는 일을 하고 싶어."
                            className="w-full h-[157px] text-[14px] text-[rgba(0,0,0,0.5)] border-none resize-none focus:ring-0 focus:outline-none p-0"
                            maxLength={1000}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className="bg-[#212121] border border-black rounded-[10px] px-6 py-4 hover:bg-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            <span className="font-bold text-[20px] text-white whitespace-nowrap">
              {isSubmitting ? "처리 중..." : "내 커리어 패스 확인하기"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
