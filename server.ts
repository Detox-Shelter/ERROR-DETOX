import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Green Mind Refresh & Botanical Debugging
  app.post("/api/gemini/refresh", async (req, res) => {
    try {
      const { errorLog, frustration, selectedSeed } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 환경 변수에 설정되지 않았습니다. 개발 서버 설정에서 확인해 주세요."
        });
      }

      // Map selected seed IDs to Korean labels for the prompt
      const seedNameMap: Record<string, string> = {
        eucalyptus: "유칼립투스 (Eucalyptus - 차분한 은빛 잎새, 수분과 비동기 흐름 조율)",
        bamboo: "대나무 새싹 (Bamboo - 유연하게 휘어지나 부러지지 않는 회로 단선 및 견고한 인프라)",
        monstera: "몬스테라 (Monstera - 시원하고 큼직한 잎사귀, 넓은 그늘과 리소스/DB 병목 정화)",
        ivy: "아이비 넝쿨 (Ivy - 지저분하게 엉키며 자라는 강인한 생명력, 레거시 스파게티 극복)"
      };
      const chosenSeedLabel = seedNameMap[selectedSeed] || "싱그러운 치유목";

      const prompt = `
사용자는 지친 서비스 소프트웨어 개발자입니다. 에러나 버그 때문에 심란하고 피로한 상태입니다.
당신은 지친 개발자의 마음을 환기하고 싱그러운 정원의 평온함을 전해주는 '초록빛 에러 디톡스 가드너(Green Error Detox Gardener)' 정원사 AI입니다.

[상황 데이터]
- 개발자가 가꾸기로 선택한 씨앗: ${chosenSeedLabel}
- 개발자가 마주한 에러 또는 상황: "${errorLog || '에러 내용 없음'}"
- 개발자의 심정/메시지: "${frustration || '마음이 답답합니다.'}"

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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error in backend:", err);
      res.status(500).json({ error: err.message || "마음 환기 메시지 생성 도중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
