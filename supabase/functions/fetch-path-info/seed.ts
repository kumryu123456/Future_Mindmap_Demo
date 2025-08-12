// scripts/insert_path_info.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.52.7";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

// .env 파일에서 환경 변수 로드
const env = config();

// --- 클라이언트 설정 ---
const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error("Missing environment variables. Please check your .env file.");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// --- 데이터 타입 정의 (테이블 구조와 일치) ---
interface PathInfo {
  id: string;
  title_ko: string;
  category: string[];
  topic_tags: string[];
  organizer: string;
  eligibility: string | null;
  application_start: string | null;
  application_end: string | null;
  event_schedule: any; // JSONB
  location: string | null;
  benefits: string | null;
  submission_requirements: string[] | null;
  official_url: string | null;
  contact: string | null;
  source_doc: string;
  source_lines_note: string;
  retrieval_text: string;
}

/**
 * 주어진 텍스트의 임베딩 벡터를 생성하는 함수
 * @param text - 임베딩할 텍스트
 * @returns 임베딩 벡터 배열
 */
async function getEmbedding(text: string): Promise<number[]> {
  if (!text) {
    console.warn("Embedding text is empty, returning zero vector.");
    return Array(1536).fill(0);
  }
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "), // OpenAI API는 개행 문자를 공백으로 처리하는 것을 권장
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const filePath = "./path_info_data.jsonl"; // 데이터 파일 경로
  console.log(`Reading data from ${filePath}...`);

  try {
    const fileContent = await Deno.readTextFile(filePath);
    const lines = fileContent.trim().split("\n");

    // [수정] 중복 ID를 처리하기 위해 Array 대신 Map을 사용합니다.
    const recordsMap = new Map<string, any>();

    for (const line of lines) {
      if (line.trim() === "") continue;

      const item: PathInfo = JSON.parse(line);
      console.log(`- Processing item: ${item.id}`);

      // 1. retrieval_text로 임베딩 생성
      const embedding = await getEmbedding(item.retrieval_text);

      // 2. DB에 삽입할 최종 데이터 구조를 Map에 저장합니다.
      // 동일한 ID가 있을 경우, 기존 데이터를 덮어쓰므로 항상 최신 데이터만 남게 됩니다.
      recordsMap.set(item.id, {
        ...item,
        embedding: embedding,
      });

      // OpenAI API의 Rate Limit을 피하기 위해 약간의 딜레이 추가 (선택 사항)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // [수정] Map의 값들만 추출하여 최종 삽입할 배열을 만듭니다.
    const recordsToInsert = Array.from(recordsMap.values());

    if (recordsToInsert.length > 0) {
        console.log(`\nFound ${recordsToInsert.length} unique records to insert/update.`);
        console.log(`Inserting into Supabase...`);
        
        // 3. Supabase에 중복이 제거된 데이터 일괄 삽입
        const { error } = await supabase
            .from('path_info')
            .upsert(recordsToInsert, { onConflict: 'id' });

        if (error) {
            console.error("Error inserting data into Supabase:", error);
        } else {
            console.log("✅ Successfully inserted/updated all records!");
        }
    } else {
        console.log("No records to insert.");
    }

  } catch (error) {
    console.error(`Failed to process file: ${error.message}`);
  }
}

// 스크립트 실행
main();
