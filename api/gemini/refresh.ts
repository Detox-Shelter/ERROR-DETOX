import { GoogleGenAI } from "@google/genai";

// Vercel Node 런타임 핸들러. @vercel/node 타입 패키지를 새로 받지 않도록 최소한만 정의한다.
interface FunctionRequest {
  method?: string;
  body?: unknown;
}

interface FunctionResponse {
  status: (code: number) => FunctionResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

// Gemini 응답 생성이 10초를 넘길 수 있어 기본 제한을 늘린다.
export const config = { maxDuration: 60 };

const seedNameMap: Record<string, string> = {
  eucalyptus: "유칼립투스 (Eucalyptus - 차분한 은빛 잎새, 수분과 비동기 흐름 조율)",
  bamboo: "대나무 새싹 (Bamboo - 유연하게 휘어지나 부러지지 않는 회로 단선 및 견고한 인프라)",
  monstera: "몬스테라 (Monstera - 시원하고 큼직한 잎사귀, 넓은 그늘과 리소스/DB 병목 정화)",
  ivy: "아이비 넝쿨 (Ivy - 지저분하게 엉키며 자라는 강인한 생명력, 레거시 스파게티 극복)"
};

const buildPrompt = (chosenSeedLabel: string, safeErrorLog: string, safeFrustration: string) => `
사용자는 지친 서비스 소프트웨어 개발자입니다. 에러나 버그 때문에 심란하고 피로한 상태입니다.
당신은 지친 개발자의 마음을 환기하고 싱그러운 정원의 평온함을 전해주는 '초록빛 에러 디톡스 가드너(Green Error Detox Gardener)' 정원사 AI입니다.

[상황 데이터]
- 개발자가 가꾸기로 선택한 씨앗: ${chosenSeedLabel}
- 개발자가 마주한 에러 또는 상황: "${safeErrorLog || '에러 내용 없음'}"
- 개발자의 심정/메시지: "${safeFrustration || '마음이 답답합니다.'}"

[작성 지침]
0. **[가장 중요 - 최상단 요약 박스]** 본문을 시작하기 전에, 에러 본문의 **가장 최상단**에 반드시 아래 포맷 그대로의 **한눈에 보는 에러 디톡스 요약 카드/블록**을 최우선적으로 작성해 주세요. 이후 한 줄을 비우고 구분선(\`---\`)을 표시한 뒤 다정한 대화와 위로 본문을 작성해야 합니다.

### 📝 한눈에 보는 에러 디톡스 요약
> **🔍 에러 원인:** [에러 상황 및 로그를 분석하여 원인을 1줄로 명확하고 쉽게 친절히 요약]
> **📂 에러 내용:** [겪고 있는 오류 상황이나 핵심 장애 현상을 1줄로 한눈에 들어오게 정리]
> **💡 핵심 해결책:** [이 버그를 완벽히 정화하기 위해 당장 시도해볼 실무 조치법을 1~2단계로 명확히 가이드]

---

1. 먼저 따뜻하고 다정한 어조로 개발자의 지친 마음에 공감해 주세요. (한국어로 작성)
2. 특히 개발자가 선택한 식물인 '${chosenSeedLabel.split(' ')[0]}'의 보태니컬 생태 습성, 잎사귀 특성, 혹은 성장 원리(예: 유칼립투스의 차분한 허브향, 대나무의 꺾이지 않는 유연성, 몬스테라의 넓은 그늘막, 아이비의 엉켜 자라는 끈질긴 생명력)를 중심 은유로 삼아 개발자의 현재 어려움이나 에러를 시각화하고 치유하는 비유를 전개해 주세요.
3. 에러에 대한 실질적이고 유용한 기술적 해결 방안(디버깅 가이드)도 숲의 지혜처럼 친절하고 쉽게 정리해 주세요.
4. 마지막으로, 깊은 심호흡을 권하거나 가볍게 기지개를 켤 수 있도록 초록빛 위로를 건네주세요.
5. Markdown 형식을 사용해 가독성 있게 구조화해 주세요. (제목, 문단, 불릿 포인트 등)
`;

export default async function handler(req: FunctionRequest, res: FunctionResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 처리합니다." });
  }

  try {
    // Vercel Node 런타임은 JSON 본문을 파싱해 주지만, 문자열로 들어오는 경우도 방어한다.
    const raw = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
    const { errorLog, frustration, selectedSeed } = raw as {
      errorLog?: unknown;
      frustration?: unknown;
      selectedSeed?: unknown;
    };

    if (
      (errorLog !== undefined && typeof errorLog !== "string") ||
      (frustration !== undefined && typeof frustration !== "string") ||
      (selectedSeed !== undefined && typeof selectedSeed !== "string")
    ) {
      return res.status(400).json({ error: "올바르지 않은 입력 형식입니다." });
    }

    const validSeeds = ["eucalyptus", "bamboo", "monstera", "ivy"];
    if (selectedSeed && !validSeeds.includes(selectedSeed as string)) {
      return res.status(400).json({ error: "올바르지 않은 씨앗 선택입니다." });
    }

    // Gemini로 넘기는 문자열 길이를 제한해 과도한 페이로드 처리를 막는다.
    const safeErrorLog = ((errorLog as string) || "").slice(0, 4000);
    const safeFrustration = ((frustration as string) || "").slice(0, 1000);
    const safeSelectedSeed = (selectedSeed as string) || "eucalyptus";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 서버 환경 변수에 없습니다. Vercel 프로젝트 설정에서 등록해 주세요."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const chosenSeedLabel = seedNameMap[safeSelectedSeed] || "싱그러운 치유목";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: buildPrompt(chosenSeedLabel, safeErrorLog, safeFrustration),
      config: { temperature: 0.7 }
    });

    return res.status(200).json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API Error in serverless function:", err);
    return res.status(500).json({
      error: err?.message || "마음 환기 메시지 생성 도중 오류가 발생했습니다."
    });
  }
}
