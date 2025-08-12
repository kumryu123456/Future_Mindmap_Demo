// functions/fetch-enterprise-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.52.7";
import { corsHeaders } from "../_shared/cors.ts";

// [수정] 1차 검색(리랭킹용) 시 받아올 최소 데이터의 타입을 정의합니다.
interface CandidateForRank {
  id: string; // 또는 number, DB의 id 타입과 일치시킵니다.
  skills: string[];
  score: number;
}

// --- Helpers (수정 없음) -----------------------------------------------
function sanitizeSkills(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  const splitDelims = /[·,\/|・，、]/g;
  const cleaned = raw
    .flatMap((s) =>
      String(s)
        .split(splitDelims)
        .map((x) => x.trim())
        .map((x) => x.replace(/[^A-Za-z0-9.+#\-]/g, ""))
        .filter((x) => x.length >= 2)
    );
  return Array.from(new Set(cleaned)).slice(0, 12);
}

function extractTechTermsFromQuery(q: string): string[] {
  const candidates = (q.match(/[A-Za-z][A-Za-z0-9.+#\-]{1,}/g) || [])
    .map((s) => s.replace(/[^A-Za-z0-9.+#\-]/g, ""))
    .filter((s) => s.length >= 2);
  return Array.from(new Set(candidates)).slice(0, 12);
}

function overlapCount(a: string[] = [], b: string[] = []): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.reduce((acc, s) => acc + (setB.has(s.toLowerCase()) ? 1 : 0), 0);
}

// [수정] rerank 함수가 CandidateForRank 타입을 받도록 수정하고, id를 계속 전달하도록 변경합니다.
function rerank(results: CandidateForRank[], opts: {
  queryTerms: string[];
  filterSkills: string[];
}) {
  const { queryTerms, filterSkills } = opts;

  return results
    .map((r) => {
      const rSkills = Array.isArray(r.skills) ? r.skills : [];
      const o1 = overlapCount(rSkills, queryTerms);
      const o2 = overlapCount(rSkills, filterSkills);
      const vec = typeof r.score === "number" ? r.score : 0;
      const finalScore = 0.78 * vec + 0.12 * (o1 > 0 ? Math.min(o1, 3) / 3 : 0) + 0.10 * (o2 > 0 ? 1 : 0);
      
      // id를 포함하여 반환해야 나중에 최종 데이터를 가져올 수 있습니다.
      return { ...r, _vec: vec, _o1: o1, _o2: o2, _final: finalScore };
    })
    .sort((a, b) => b._final - a._final);
}

// --- DB 호출 (2단계로 분리) --------------------------------------------

// [수정] 1단계: 리랭킹을 위한 최소 정보(id, skills, score)만 가져오는 함수
async function vectorSearchForReranking(
  supabase: SupabaseClient,
  embedding: number[],
  { matchCount = 60 }: { matchCount?: number } = {}
): Promise<CandidateForRank[]> {
  const { data, error } = await supabase.rpc("match_careers_for_reranking", {
    query_embedding: embedding,
    match_threshold: 0.0,
    match_count: matchCount,
  });

  if (error) {
    console.error("RPC (match_careers_for_reranking) failed:", JSON.stringify(error, null, 2));
    throw new Error("An error occurred during the initial career search.");
  }
  return data || [];
}

// --- 메인 로직 -----------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    // 1) 입력 파싱 (수정 없음)
    const { query, filters = {} } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query string is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    console.log(`[Info] 🚀 Request received. Query: "${query}"`);

    // 2) 스킬/키워드 정제 (수정 없음)
    const cleanedSkills = sanitizeSkills(filters?.skills);
    const queryTerms = extractTechTermsFromQuery(query);
    const filterSkills = cleanedSkills.length ? cleanedSkills : [];
    console.log("[Info] queryTerms:", queryTerms);
    console.log("[Info] filterSkills(cleaned):", filterSkills);

    // 3) 임베딩 생성 (수정 없음)
    console.log(`[Info] 🧠 Generating embedding for query...`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log("[Info] embedding length:", queryEmbedding?.length);

    // [수정] 4단계 ~ 7단계 로직 전체 변경

    // 4) 1차 검색: 리랭킹을 위한 최소 데이터만 가져옴
    const candidatesForRank = await vectorSearchForReranking(supabaseAdminClient, queryEmbedding, { matchCount: 60 });
    console.log(`[Info] Found ${candidatesForRank.length} candidates for reranking.`);

    // 5) 리랭킹: 메모리 안에서 가볍게 실행
    const rerankedCandidates = rerank(candidatesForRank, { queryTerms, filterSkills });

    // 6) 상위 N개의 ID만 추출
    const topK = Number.isInteger(filters?.topK) ? Math.max(1, Math.min(filters.topK, 20)) : 10;
    const topK_Ids = rerankedCandidates.slice(0, topK).map(r => r.id);

    // 7) 최종 조회: 상위 ID들로 전체 상세 데이터 가져오기
    if (topK_Ids.length === 0) {
      console.log("[Info] ✅ No relevant IDs after reranking. Returning empty context.");
      return new Response(JSON.stringify({
        context: [],
        message: "No relevant career profiles found."
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[Info] Fetching full data for top ${topK_Ids.length} IDs...`);
    const { data: finalResults, error: finalError } = await supabaseAdminClient
      .rpc('get_careers_by_ids', { p_ids: topK_Ids }); // p_ids로 매개변수 이름 전달

    if (finalError) {
      console.error("RPC (get_careers_by_ids) failed:", JSON.stringify(finalError, null, 2));
      throw new Error("An error occurred during the final career data fetch.");
    }

    console.log(`[Info] ✅ Returning ${finalResults.length} final result(s).`);

    return new Response(JSON.stringify({
      context: finalResults,
      message: `Found ${finalResults.length} relevant career profiles.`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Error] Top-level error caught:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});