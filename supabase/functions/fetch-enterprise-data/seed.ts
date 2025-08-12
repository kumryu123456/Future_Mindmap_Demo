// seed.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { OpenAI } from "https://esm.sh/openai@4.52.7"; // [추가] OpenAI 라이브러리

// 데이터 파일 타입 정의
interface CareerData {
  work_history: any;
  education_history: any;
  projects: any;
  skills: string[];
  career_summary: string;
}

async function main() {
  // .env 파일에서 환경 변수 로드
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAIKey = Deno.env.get("OPENAI_API_KEY"); // [추가] OpenAI API 키 로드

  if (!supabaseUrl || !supabaseServiceKey || !openAIKey) {
    console.error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY must be set in .env file.");
    return;
  }
  
  // Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  // [추가] OpenAI 클라이언트 생성
  const openai = new OpenAI({ apiKey: openAIKey });

  // JSON 파일 읽기
  const fileContent = await Deno.readTextFile("./careers.json");
  const careersData: CareerData[] = JSON.parse(fileContent);

  console.log(`총 ${careersData.length}개의 커리어 데이터를 데이터베이스에 추가합니다...`);

  for (const career of careersData) {
    console.log(`  - 처리 중: ${career.career_summary.substring(0, 40)}...`);

    try {
      // --- [변경] Edge Function 호출 대신 직접 OpenAI API 호출 ---
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: career.career_summary,
      });

      const embedding = embeddingResponse.data[0].embedding;
      // --------------------------------------------------------

      // 최종 데이터를 DB에 삽입
      const { error: insertError } = await supabase.from("careers").insert({
        work_history: career.work_history,
        education_history: career.education_history,
        projects: career.projects,
        skills: career.skills,
        career_summary: career.career_summary,
        embedding: embedding, // 생성된 임베딩 추가
      });

      if (insertError) {
        console.error(`    데이터 삽입 실패:`, insertError.message);
      } else {
        console.log(`    ✅ 성공적으로 추가되었습니다.`);
      }

    } catch (e) {
      const error = e as Error;
      console.error(`    임베딩 생성 또는 처리 중 오류 발생:`, error.message);
      continue; // 오류 발생 시 다음 데이터로 넘어감
    }
  }

  console.log("\n모든 데이터 처리가 완료되었습니다.");
}

main();