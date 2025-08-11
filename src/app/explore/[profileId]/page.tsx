"use client";

import { use } from "react";
import { mockProfiles } from "@/lib/profile-types";
import { notFound } from "next/navigation";
import Image from "next/image";

// Social Icons Components
const IconSnsLink = () => (
  <div className="relative size-6">
    <Image
      fill
      alt="Link"
      className="block max-w-none size-full"
      src="http://localhost:3845/assets/ec62967f1924c5d7f72a78a773a98c983b6c0eb3.svg"
    />
  </div>
);

const IconSnsYoutube = () => (
  <div className="relative size-6">
    <Image
      fill
      alt="YouTube"
      className="block max-w-none size-full"
      src="http://localhost:3845/assets/e6fa2d8ef305ef671e216ae95c1e7ededd58b75e.svg"
    />
  </div>
);

const IconSnsInstagram = () => (
  <div className="relative size-6">
    <Image
      fill
      alt="Instagram"
      className="block max-w-none size-full"
      src="http://localhost:3845/assets/9bb52e9465f2dda0d13d1069b69de497920174a3.svg"
    />
  </div>
);

const IconSnsFacebook = () => (
  <div className="relative size-6">
    <Image
      fill
      alt="Facebook"
      className="block max-w-none size-full"
      src="http://localhost:3845/assets/13f8f1381b5f373a57e50a54419104cb4f7845a8.svg"
    />
  </div>
);

const IconSnsLinkedin = () => (
  <div className="relative size-6">
    <Image
      fill
      alt="LinkedIn"
      className="block max-w-none size-full"
      src="http://localhost:3845/assets/604c92f4e07608c9119e094e771edaae251b167f.svg"
    />
  </div>
);

interface ProfileDetailPageProps {
  params: Promise<{
    profileId: string;
  }>;
}

export default function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const resolvedParams = use(params);
  const profile = mockProfiles.find((p) => p.id === resolvedParams.profileId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#eeeeee] flex items-center justify-start px-14 py-10 gap-[90px]">
        <div className="flex flex-col gap-6 items-start">
          <div
            className="w-[250px] h-[250px] bg-center bg-cover bg-no-repeat rounded-full"
            style={{ backgroundImage: `url('${profile.avatar}')` }}
          />
        </div>

        <div className="flex flex-col gap-2.5 items-center">
          <h1 className="font-bold text-[48px] text-blue-800 leading-normal whitespace-nowrap">
            {profile.name}
          </h1>
          <div className="flex flex-col gap-[22px] items-center">
            <div className="flex gap-2.5 items-start">
              <p className="font-semibold text-[24px] text-black leading-normal whitespace-nowrap">
                @{profile.username}
              </p>
            </div>
            <div className="flex items-center justify-between px-6 py-2 w-[250px] border border-[#9e9e9e]">
              <IconSnsLink />
              <IconSnsYoutube />
              <IconSnsInstagram />
              <IconSnsFacebook />
              <IconSnsLinkedin />
            </div>
          </div>
        </div>

        <div className="w-[576px] font-medium text-black">
          <p className="text-[28px] leading-normal mb-0">
            &quot;{profile.quote}&quot;
          </p>
          <p className="text-[20px] leading-normal">&nbsp;</p>
          <ul className="list-disc pl-6 space-y-1">
            <li className="text-[20px] leading-normal">
              작성 리뷰 수: {profile.reviewCount}개
            </li>
            <li className="text-[20px] leading-normal">
              주요 활동 분야: {profile.mainAreas.join(", ")}
            </li>
            <li className="text-[20px] leading-normal">
              강점: {profile.strengths.join(", ")}
            </li>
          </ul>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-[46px] py-[55px]">
        <div className="max-w-[944px] font-semibold text-black space-y-8">
          {/* About Me */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">👤 About Me</h2>
            <ul className="list-disc pl-6">
              <li className="font-medium text-[24px] leading-relaxed">
                {profile.bio}
              </li>
            </ul>
          </section>

          {/* Career Timeline */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">
              💼 Career Timeline
            </h2>
            <ul className="list-disc pl-6 space-y-4">
              {profile.careerTimeline.map((career, index) => (
                <li
                  key={index}
                  className="font-medium text-[24px] leading-normal"
                >
                  {career.period} | {career.company}
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {career.description.map((desc, i) => (
                      <li key={i} className="text-[24px] leading-normal">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">🛠 Skills</h2>
            <ul className="list-disc pl-6">
              <li className="font-medium text-[24px] leading-relaxed">
                Languages – {profile.skills.languages.join(", ")}
                <br />
                Backend – {profile.skills.backend.join(", ")}
                <br />
                Database – {profile.skills.database.join(", ")}
                <br />
                Cloud/DevOps – {profile.skills.cloudDevOps.join(", ")}
                <br />
                Etc. – {profile.skills.etc.join(", ")}
              </li>
            </ul>
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">
              📜 Certifications
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {profile.certifications.map((cert, index) => (
                <li
                  key={index}
                  className="font-medium text-[24px] leading-normal"
                >
                  {cert}
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">🎓 Education</h2>
            <ul className="list-disc pl-6 space-y-4">
              {profile.education.map((edu, index) => (
                <li key={index} className="text-[24px] leading-normal">
                  {edu.degree}, {edu.school}
                  {edu.subjects && (
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li className="text-[24px] leading-normal">
                        주요 과목: {edu.subjects.join(", ")}
                      </li>
                    </ul>
                  )}
                  {edu.project && (
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li className="text-[24px] leading-normal">
                        {edu.project}
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Awards */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">🏆 Awards</h2>
            <ul className="list-disc pl-6 space-y-2">
              {profile.awards.map((award, index) => (
                <li
                  key={index}
                  className="font-medium text-[24px] leading-normal"
                >
                  {award}
                </li>
              ))}
            </ul>
          </section>

          {/* Featured Projects */}
          <section>
            <h2 className="text-[30px] leading-normal mb-4">
              📂 Featured Projects
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              {profile.projects.map((project, index) => (
                <li
                  key={index}
                  className="font-medium text-[24px] leading-normal"
                >
                  {project.title} – {project.description} ({project.year})
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#616161] h-16 flex items-center justify-center p-2">
        <p className="font-bold text-[32px] text-white">Footer</p>
      </div>
    </div>
  );
}
