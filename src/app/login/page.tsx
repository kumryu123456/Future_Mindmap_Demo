"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 로그인 로직 구현 예정
    setTimeout(() => {
      setIsLoading(false);
      alert("로그인 기능은 구현 예정입니다.");
    }, 1000);
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">로그인</h1>
            <p className="text-gray-600">커리어 로드맵을 시작해보세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                이메일
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-700 py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="text-blue-800 hover:text-blue-600 font-semibold"
              >
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">소셜 로그인</p>
              <div className="space-y-3">
                <Button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium">Google로 로그인</span>
                </Button>
                <Button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium">카카오로 로그인</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
