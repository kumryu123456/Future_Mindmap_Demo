"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EDUCATION_OPTIONS,
  SKILL_OPTIONS,
  OnboardingGoalStepFormData,
  onboardingGoalStepSchema,
} from "@/lib/onboarding-schema";
import Image from "next/image";

interface InfoProps {
  onNext: (data: OnboardingGoalStepFormData) => void;
  defaultValues?: OnboardingGoalStepFormData;
}

export const Info = ({ onNext, defaultValues }: InfoProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(onboardingGoalStepSchema),
    defaultValues,
  });

  // Sync selectedSkills with form values
  useEffect(() => {
    const skills = form.getValues("skills") || [];
    setSelectedSkills(skills);
  }, [form]);

  const handleSkillToggle = (skillValue: string) => {
    const currentSkills = form.getValues("skills");
    let updatedSkills;

    if (currentSkills.includes(skillValue)) {
      updatedSkills = currentSkills.filter((skill) => skill !== skillValue);
    } else {
      updatedSkills = [...currentSkills, skillValue];
    }

    form.setValue("skills", updatedSkills);
    setSelectedSkills(updatedSkills);
  };

  const onSubmit = async (data: OnboardingGoalStepFormData) => {
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
    <div className="w-full min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            내 정보 입력하기
          </h1>
          <p className="text-gray-600">AI 커리어패스 설계를 위한 정보 입력</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 학력 */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    학력 <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="대학교 재학" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 학교 */}
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    학교
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="대학교를 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 전공 */}
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    전공 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="전공 이름을 정확히 입력해주세요."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 보유 기술 */}
            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem className="w-[520px]">
                  <div className="flex items-start justify-between gap-2 h-[60px]">
                    <div className="flex flex-col gap-1 flex-1">
                      <FormLabel className="text-sm font-medium text-black leading-[20px]">
                        보유 기술{" "}
                        <span className="font-bold text-red-500">*</span>
                      </FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="bg-black text-white px-4 py-0 h-9 rounded-[5px] text-sm font-medium leading-[20px] hover:bg-gray-800 transition-colors"
                          >
                            추가하기
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[200px] max-h-60 overflow-y-auto"
                        >
                          {SKILL_OPTIONS.filter(
                            (skill) => !selectedSkills.includes(skill.value),
                          ).length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">
                              모든 기술이 선택되었습니다
                            </div>
                          ) : (
                            SKILL_OPTIONS.filter(
                              (skill) => !selectedSkills.includes(skill.value),
                            ).map((skill) => (
                              <DropdownMenuItem
                                key={skill.value}
                                onClick={() => handleSkillToggle(skill.value)}
                                className="text-sm cursor-pointer"
                              >
                                {skill.label}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Selected Skills Display */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-4 items-start">
                      {selectedSkills.map((skillValue) => {
                        const skill = SKILL_OPTIONS.find(
                          (s) => s.value === skillValue,
                        );
                        return skill ? (
                          <div
                            key={skillValue}
                            className="bg-[#dcedfe] border border-blue-800 px-3 py-1.5 rounded-[10px] flex items-center gap-2"
                          >
                            <span className="text-black text-sm font-medium leading-[20px]">
                              {skill.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSkillToggle(skillValue)}
                              className="w-2.5 h-2.5 flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <div className="relative">
                                <Image
                                  fill
                                  src="http://localhost:3845/assets/44268d13d0da5468366a13d40b35adbada9254f4.svg"
                                  alt="Remove"
                                />
                              </div>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 보유 자격증 */}
            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    보유 자격증
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="자격증 이름을 정확히 입력해주세요."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 기타 작업 경험 검토 */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    기타 작업 경험 검토
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="그동안 작업한 경험을 한 번에 아시나요? 최대 300자까지 입력 가능합니다."
                      className="min-h-[120px] resize-none"
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right">
                    {field.value?.length || 0}/300
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-black text-white py-3 text-lg font-medium hover:bg-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "처리 중..." : "목표 직무 설정하기"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
