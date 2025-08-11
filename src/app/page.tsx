"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

const imgRectangle3633 =
  "http://localhost:3845/assets/ea7b14aa88d22e69b27d8f454c1fd2093af3fd64.svg";

function HeroSection() {
  return (
    <div className="bg-gray-200 flex flex-col gap-6 items-center justify-center p-10 min-h-[369px] w-full">
      <h1 className="font-bold text-[40px] text-blue-900 text-center max-w-[634px] leading-tight">
        내 목표까지의 모든 과정,
        <br />
        나만의 로드맵
      </h1>
      <Link href="/ai-career">
        <button className="bg-gray-800 text-white font-bold text-[20px] px-6 py-4 rounded-[10px] border border-black hover:bg-gray-700 transition-colors">
          바로 만들러가기
        </button>
      </Link>
      <p className="font-medium text-[20px] text-black text-center">
        커리어의 시작부터 끝까지, 개인에게 최적화된 로드맵과 솔루션을
        제공합니다.
      </p>
    </div>
  );
}

function ExperienceSection() {
  const experiences = [
    {
      text: "내가 가고 싶은 직무는 있는데, 어디서부터 시작해야 할지 모르겠어요.",
      emoji: "🧭",
      bgColor: "bg-blue-50",
    },
    {
      text: "자격증도 따야 하고, 강의도 들어야 한다는데… 뭐부터 해야 하죠?",
      emoji: "📚",
      bgColor: "bg-gray-200",
    },
    {
      text: "지속적으로 변화하고 성장하는 내 커리어를 관리하고 싶어요.",
      emoji: "🛠️",
      bgColor: "bg-blue-50",
    },
    {
      text: "나랑 비슷한 사람이 어떤 길을 걸었는지 궁금한데, 찾기 어렵네요.",
      emoji: "👥",
      bgColor: "bg-gray-200",
    },
  ];

  return (
    <div className="bg-white flex flex-col gap-9 items-center justify-center px-2.5 py-[60px] w-full">
      <h2 className="font-bold text-[30px] text-blue-900 text-center max-w-[634px]">
        혹시 이런 경험 있으신가요?
      </h2>
      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-row gap-2.5 items-center justify-center p-5 rounded-[20px]",
              exp.bgColor,
            )}
          >
            <div className="font-medium text-[20px] text-black">
              <span className="mr-2">{exp.emoji}</span>
              <span>&quot;{exp.text}&quot;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SolutionSection() {
  const solutions = [
    {
      title: "AI가 데이터로 증명한",
      subtitle: "최적 성장 경로 설계",
      description:
        "AI가 현재 위치부터 목표 직무까지의 최적의 경로를 마인드맵으로!",
      imageLeft: true,
    },
    {
      title: "AI를 통한 간편한 수정으로",
      subtitle: "나에게 최적화된 로드맵 완성!",
      description: "AI와의 대화를 통해 나만의 맞춤형 로드맵으로!",
      imageLeft: false,
    },
    {
      title: "클릭만으로 필요한 정보와 후기를 한 눈에",
      subtitle: "",
      description:
        "내 목표를 위한 자격증, 강의 등의 정보와 후기를 바로 확인할 수 있습니다.",
      imageLeft: true,
      hasImage: true,
    },
    {
      title: "나와 같은 길을 걷는, 걸었던 사람들의",
      subtitle: "실제 로드맵과 후기까지",
      description:
        "검증된 사례를 참고하며, 내 길을 더 확신 있게 설계할 수 있습니다.",
      imageLeft: false,
    },
  ];

  return (
    <div className="bg-blue-50 w-full">
      <div className="flex flex-col gap-[70px] items-center justify-center p-10 min-h-[555px]">
        <h2 className="font-bold text-[30px] text-blue-900 text-center">
          Solution
        </h2>
      </div>

      {solutions.map((solution, index) => (
        <div
          key={index}
          className="bg-blue-50 flex flex-col gap-6 items-center justify-center p-10 min-h-[477px] w-full"
        >
          <div
            className={cn(
              "flex gap-6 items-start justify-center w-full max-w-6xl",
              solution.imageLeft ? "flex-row" : "flex-row-reverse",
            )}
          >
            <div className="bg-gray-300 h-[341px] w-[434px] flex-shrink-0 rounded-lg">
              {solution.hasImage && (
                <div className="relative">
                  <Image
                    alt=""
                    fill
                    className="w-full h-full object-cover rounded-lg"
                    src={imgRectangle3633}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-start text-left max-w-[603px]">
              <h3 className="font-bold text-[40px] text-black mb-4 leading-normal">
                {solution.title}
                {solution.subtitle && (
                  <>
                    <br />
                    <span className="text-blue-600">
                      {solution.subtitle.split(" ").slice(0, 3).join(" ")}
                    </span>
                    {solution.subtitle.split(" ").slice(3).length > 0 && (
                      <span>
                        {" "}
                        {solution.subtitle.split(" ").slice(3).join(" ")}
                      </span>
                    )}
                  </>
                )}
              </h3>
              <p className="font-medium text-[24px] text-black leading-normal">
                {solution.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start w-full">
      <HeroSection />
      <ExperienceSection />
      <SolutionSection />
    </div>
  );
}
