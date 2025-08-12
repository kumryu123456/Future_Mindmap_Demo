// functions/fetch-path-info/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.52.7";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * [정의] 1차 벡터 검색으로 가져올 후보 데이터의 최소 타입.
 * 리랭킹에 필요한 id, 토픽 태그, 벡터 유사도 점수만 포함합니다.
 */
interface PathInfoCandidateForRank {
  id: string; // DB의 id 타입과 일치
  topic_tags: string[];
  score: number;
}

// --- Helpers (진로 정보에 맞게 일부 수정) --------------------------------

/**
 * topic_tags 배열을 정제하는 함수.
 * @param raw - DB에서 가져온 topic_tags 필드
 * @returns 정제된 태그 문자열 배열
 */
function sanitizeTags(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  // 특별한 구분자 없이 이미 배열이므로, 각 항목을 trim하고 간단히 정제합니다.
  const cleaned = raw
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(cleaned)).slice(0, 20); // 태그는 더 많이 허용
}

/**
 * 사용자 쿼리에서 기술 용어/키워드를 추출하는 함수 (재사용).
 * @param q - 사용자 입력 문자열
 * @returns 추출된 키워드 문자열 배열
 */
function extractKeywordsFromQuery(q: string): string[] {
  const candidates = (q.match(/[A-Za-z가-힣][A-Za-z0-9.+#\-가-힣]{1,}/g) || [])
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 2);
  return Array.from(new Set(candidates)).slice(0, 12);
}

/**
 * 두 문자열 배열 간의 중복 항목 개수를 세는 함수 (재사용).
 */
function overlapCount(a: string[] = [], b: string[] = []): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.reduce((acc, s) => acc + (setB.has(s.toLowerCase()) ? 1 : 0), 0);
}

/**
 * [수정] 진로 정보 후보군을 리랭킹하는 함수.
 * 'topic_tags'를 기반으로 최종 점수를 계산합니다.
 */
function rerankPathInfo(results: PathInfoCandidateForRank[], opts: {
  queryKeywords: string[];
  filterTags: string[];
}) {
  const { queryKeywords, filterTags } = opts;

  return results
    .map((r) => {
      // topic_tags가 null이거나 배열이 아닐 경우를 대비
      const rTags = Array.isArray(r.topic_tags) ? r.topic_tags : [];
      const o1 = overlapCount(rTags, queryKeywords); // 쿼리와의 태그 일치도
      const o2 = overlapCount(rTags, filterTags);    // 필터와의 태그 일치도
      const vec = typeof r.score === "number" ? r.score : 0; // 벡터 유사도

      // 가중치: 벡터 유사도 75%, 쿼리 키워드 일치도 15%, 필터 태그 일치도 10%
      const finalScore = 0.75 * vec + 0.15 * (o1 > 0 ? Math.min(o1, 4) / 4 : 0) + 0.10 * (o2 > 0 ? 1 : 0);
      
      return { ...r, _vec: vec, _o1: o1, _o2: o2, _final: finalScore };
    })
    .sort((a, b) => b._final - a._final);
}

// --- DB 호출 (Supabase RPC) --------------------------------------------

/**
 * [신규] 1단계: 리랭킹을 위한 최소 정보(id, topic_tags, score)만 가져오는 RPC 호출 함수.
 * 이 함수를 위해 Supabase에 'match_path_info_for_reranking' RPC를 생성해야 합니다.
 */
async function vectorSearchForReranking(
  supabase: SupabaseClient,
  embedding: number[],
  { matchCount = 80 }: { matchCount?: number } = {}
): Promise<PathInfoCandidateForRank[]> {
  const { data, error } = await supabase.rpc("match_path_info_for_reranking", {
    query_embedding: embedding,
    match_threshold: 0.1, // 초기 임계값은 낮게 설정하여 많은 후보군 확보
    match_count: matchCount,
  });

  if (error) {
    console.error("RPC (match_path_info_for_reranking) failed:", JSON.stringify(error, null, 2));
    throw new Error("An error occurred during the initial path info search.");
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

    // 1) 입력 파싱
    const { query, filters = {} } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query string is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    console.log(`[PathInfo] 🚀 Request received. Query: "${query}"`);

    // 2) 태그/키워드 정제
    const cleanedTags = sanitizeTags(filters?.tags);
    const queryKeywords = extractKeywordsFromQuery(query);
    console.log("[PathInfo] queryKeywords:", queryKeywords);
    console.log("[PathInfo] filterTags(cleaned):", cleanedTags);

    // 3) 쿼리 임베딩 생성
    console.log(`[PathInfo] 🧠 Generating embedding for query...`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 4) 1차 검색: 리랭킹을 위한 후보군 데이터만 가져옴
    const candidatesForRank = await vectorSearchForReranking(supabaseAdminClient, queryEmbedding, { matchCount: 80 });
    console.log(`[PathInfo] Found ${candidatesForRank.length} candidates for reranking.`);

    // 5) 리랭킹: 메모리 안에서 가볍게 실행
    const rerankedCandidates = rerankPathInfo(candidatesForRank, { queryKeywords, filterTags: cleanedTags });

    // 6) 상위 N개의 ID만 추출
    const topK = Number.isInteger(filters?.topK) ? Math.max(1, Math.min(filters.topK, 25)) : 15;
    const topK_Ids = rerankedCandidates.slice(0, topK).map(r => r.id);

    // 7) 최종 조회: 상위 ID들로 전체 상세 데이터 가져오기
    if (topK_Ids.length === 0) {
      console.log("[PathInfo] ✅ No relevant IDs after reranking. Returning empty data.");
      return new Response(JSON.stringify({
        data: [], // 프론트엔드와 약속한 'data' 키 사용
        message: "No relevant path info found."
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    /**
     * 최종 조회를 위해 Supabase에 'get_path_info_by_ids' RPC를 생성해야 합니다.
     * 이 RPC는 id 배열을 받아 해당 id들의 모든 컬럼을 반환해야 합니다.
     */
    console.log(`[PathInfo] Fetching full data for top ${topK_Ids.length} IDs...`);
    const { data: finalResults, error: finalError } = await supabaseAdminClient
      .from('path_info') // 혹은 RPC: .rpc('get_path_info_by_ids', { p_ids: topK_Ids })
      .select('*')
      .in('id', topK_Ids);

    if (finalError) {
      console.error("Final data fetch failed:", JSON.stringify(finalError, null, 2));
      throw new Error("An error occurred during the final path info data fetch.");
    }

    // 리랭킹된 순서대로 최종 결과를 정렬
    const sortedFinalResults = topK_Ids.map(id => finalResults.find(item => item.id === id)).filter(Boolean);

    console.log(`[PathInfo] ✅ Returning ${sortedFinalResults.length} final result(s).`);

    return new Response(JSON.stringify({
      data: sortedFinalResults, // 프론트엔드와 약속한 'data' 키 사용
      message: `Found ${sortedFinalResults.length} relevant path info items.`
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
