"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockProfiles, type Profile } from "@/lib/profile-types";

const ProfileCard = ({ profile }: { profile: Profile }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-gray-200"
          style={{ backgroundImage: `url('${profile.avatar}')` }}
        />
        <div className="flex-1">
          <CardTitle className="text-lg font-bold text-blue-800">
            {profile.name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 font-medium">
            @{profile.username}
          </CardDescription>
          <p className="text-sm text-gray-800 font-medium mt-1">
            {profile.title}
          </p>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Quote */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-gray-700 italic leading-relaxed">
          &quot;{profile.quote}&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>📝 리뷰 {profile.reviewCount}개</span>
        <span>⭐ {profile.mainAreas.slice(0, 2).join(", ")}</span>
      </div>

      {/* Skills Preview */}
      <div className="flex flex-wrap gap-1">
        {[
          ...profile.skills.languages.slice(0, 2),
          ...profile.skills.backend.slice(0, 1),
        ].map((skill, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
        <span className="text-xs text-gray-500 px-2 py-1">+더보기</span>
      </div>

      {/* Main Areas */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">주요 활동 분야:</p>
        <p className="text-sm text-gray-600">{profile.mainAreas.join(" • ")}</p>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">강점:</p>
        <p className="text-sm text-gray-600">{profile.strengths.join(" • ")}</p>
      </div>
    </CardContent>
  </Card>
);

export default function ExplorePage() {
  const router = useRouter();

  const handleProfileClick = (profileId: string) => {
    router.push(`/explore/${profileId}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          개발자 둘러보기
        </h1>
        <p className="text-xl text-gray-600">
          다양한 분야의 개발자들을 만나보고 그들의 커리어 여정을 확인해보세요
        </p>
      </div>

      {/* Profile Cards Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          추천 개발자 프로필
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
            >
              <ProfileCard profile={profile} />
            </div>
          ))}
        </div>
      </section>

      {/* Filter/Search Section */}
      <section className="mb-16 bg-gray-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
          관심 있는 분야의 개발자를 찾아보세요
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "백엔드",
            "프론트엔드",
            "데이터 사이언스",
            "AI/ML",
            "DevOps",
            "모바일",
          ].map((field) => (
            <Button
              key={field}
              variant="outline"
              className="border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white"
            >
              {field}
            </Button>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="text-center bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          나만의 커리어 로드맵을 만들어보세요
        </h2>
        <p className="text-gray-600 mb-6">
          AI가 당신의 현재 상황을 분석하여 최적의 성장 경로를 제시합니다
        </p>
        <Link href="/ai-career/onboarding">
          <Button className="bg-blue-800 hover:bg-blue-700 px-8 py-3 text-lg">
            AI 커리어 설계 시작하기
          </Button>
        </Link>
      </section>
    </div>
  );
}
