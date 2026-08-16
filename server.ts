import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const COMMUNITY_FILE_PATH = path.join(process.cwd(), "community_posts.json");

// Define community post interface
interface SharedPost {
  id: string;
  timestamp: string;
  nickname: string;
  errorLog: string;
  frustration: string;
  errorType: 'delay' | 'network' | 'memory' | 'legacy' | 'other';
  plantType: 'eucalyptus' | 'bamboo' | 'monstera' | 'ivy' | 'recommend';
  remedy: string;
  cheers: number;
}

// Initial seed posts to make the community look lively right away
const COMMUNITY_SEEDS: SharedPost[] = [
  {
    id: "share-1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    nickname: "야근하는몬스테라",
    errorLog: "NullPointerException: Attempt to invoke virtual method 'String.trim()' on a null object reference",
    frustration: "모바일 API 연동 중에 null 체크 누락으로 메인 홈화면이 통째로 충돌났습니다. 밤샘 릴리즈였는데 머리가 아찔하네요.",
    errorType: "other",
    plantType: "monstera",
    remedy: "### 🪴 몬스테라 넓은 그늘 처방전\n정말 아찔하고 당황스러운 밤이었겠습니다. 하지만 그늘에서 숨 고르듯 차분히 정화될 수 있는 해결책을 전해드려요.\n\n#### 🌿 가드너의 조언\n- 이럴 때는 자바스크립트의 옵셔널 체이닝 `?.` 이나 디폴트 빈 문자열 폴백을 적용하면 안전하게 충돌을 예방할 수 있답니다.",
    cheers: 14
  },
  {
    id: "share-2",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    nickname: "대나무서버수호자",
    errorLog: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
    frustration: "갑자기 동시 사용자가 몰려서 DB 세션 풀이 다 찼대요... 연결 끊겨서 난리가 났었습니다.",
    errorType: "network",
    plantType: "bamboo",
    remedy: "### 🎋 대나무 유연한 연결 처방전\n폭풍처럼 불어온 유입에도 꺾이지 않는 단단한 연결망의 정화 기운을 보냅니다.\n\n#### 🌿 가드너의 조언\n- 커넥션 풀 누수(leak)가 없는지 검증하시고, 서킷 브레이커와 세션 타임아웃을 다듬어 주시는 것을 적극 권장합니다.",
    cheers: 8
  },
  {
    id: "share-3",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    nickname: "유칼립투스커피중독",
    errorLog: "API response took 18240ms. Gateway timeout.",
    frustration: "비동기 배치 돌릴 때 타임아웃에 자꾸 걸려서 퇴근이 늦어집니다. 왜 이리 무거운지 모르겠어요.",
    errorType: "delay",
    plantType: "eucalyptus",
    remedy: "### 🌿 상쾌한 유칼립투스 순환 처방전\n정체된 비동기 흐름의 가래를 시원하고 향기롭게 뚫어드릴게요.\n\n#### 🌿 가드너의 조언\n- 벌크 성격의 배치는 작은 척(Chunk) 단위로 분할(Paginated Process)하거나, 메인 스레드 밖으로 비동기 큐를 구축해 백그라운드로 격리해 보세요.",
    cheers: 21
  }
];

// Helper to read posts from JSON
function readCommunityPosts(): SharedPost[] {
  try {
    if (fs.existsSync(COMMUNITY_FILE_PATH)) {
      const data = fs.readFileSync(COMMUNITY_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } else {
      // Create with default seeds if it doesn't exist
      fs.writeFileSync(COMMUNITY_FILE_PATH, JSON.stringify(COMMUNITY_SEEDS, null, 2), "utf-8");
      return COMMUNITY_SEEDS;
    }
  } catch (err) {
    console.error("Failed to read community posts:", err);
    return COMMUNITY_SEEDS;
  }
}

// Helper to write posts to JSON
function writeCommunityPosts(posts: SharedPost[]) {
  try {
    fs.writeFileSync(COMMUNITY_FILE_PATH, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write community posts:", err);
  }
}

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

  // 1. Basic Security Headers to prevent common vulnerabilities
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    next();
  });

  // 2. Limit the body payload size to prevent DoS (Denial of Service) attacks
  app.use(express.json({ limit: "150kb" }));

  // API Route: Green Mind Refresh & Botanical Debugging
  app.post("/api/gemini/refresh", async (req, res) => {
    try {
      const { errorLog, frustration, selectedSeed } = req.body;

      // 3. Strict Input Type and Value Validation
      if (
        (errorLog !== undefined && typeof errorLog !== "string") ||
        (frustration !== undefined && typeof frustration !== "string") ||
        (selectedSeed !== undefined && typeof selectedSeed !== "string")
      ) {
        return res.status(400).json({ error: "올바르지 않은 입력 형식입니다." });
      }

      // Check for valid seed value
      const validSeeds = ["eucalyptus", "bamboo", "monstera", "ivy"];
      if (selectedSeed && !validSeeds.includes(selectedSeed)) {
        return res.status(400).json({ error: "올바르지 않은 씨앗 선택입니다." });
      }

      // 4. Safe limit string lengths to prevent massive payload processing by Gemini API
      const safeErrorLog = (errorLog || "").slice(0, 4000);
      const safeFrustration = (frustration || "").slice(0, 1000);
      const safeSelectedSeed = selectedSeed || "eucalyptus";

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
      const chosenSeedLabel = seedNameMap[safeSelectedSeed] || "싱그러운 치유목";

      const prompt = `
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

  // GET: Fetch all shared community posts
  app.get("/api/community", (req, res) => {
    try {
      const posts = readCommunityPosts();
      // Sort posts by timestamp descending so newest appear first
      const sorted = [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(sorted);
    } catch (err: any) {
      console.error("Failed to get community posts:", err);
      res.status(500).json({ error: "정원 광장 일지를 가져오는데 실패했습니다." });
    }
  });

  // POST: Share a purified error with the community
  app.post("/api/community", (req, res) => {
    try {
      const { nickname, errorLog, frustration, errorType, plantType, remedy } = req.body;

      if (!frustration || !remedy) {
        return res.status(400).json({ error: "필수 입력 항목(마음 한마디, 처방전)이 누락되었습니다." });
      }

      const posts = readCommunityPosts();
      const newPost: SharedPost = {
        id: "share-" + Date.now(),
        timestamp: new Date().toISOString(),
        nickname: (nickname || "익명의정원사").slice(0, 30),
        errorLog: (errorLog || "").slice(0, 3000),
        frustration: frustration.slice(0, 1000),
        errorType: errorType || "other",
        plantType: plantType || "recommend",
        remedy: remedy,
        cheers: 0
      };

      posts.push(newPost);
      writeCommunityPosts(posts);

      res.status(210).json(newPost);
    } catch (err: any) {
      console.error("Failed to save community post:", err);
      res.status(500).json({ error: "정원 광장에 일지를 공유하는 도중 에러가 발생했습니다." });
    }
  });

  // POST: Cheer a community post (Support/Like)
  app.post("/api/community/:id/cheer", (req, res) => {
    try {
      const { id } = req.params;
      const posts = readCommunityPosts();
      const postIndex = posts.findIndex(p => p.id === id);

      if (postIndex === -1) {
        return res.status(404).json({ error: "해당 일지를 찾을 수 없습니다." });
      }

      posts[postIndex].cheers = (posts[postIndex].cheers || 0) + 1;
      writeCommunityPosts(posts);

      res.json({ id: posts[postIndex].id, cheers: posts[postIndex].cheers });
    } catch (err: any) {
      console.error("Failed to cheer post:", err);
      res.status(500).json({ error: "응원 메시지를 보내는 도중 에러가 발생했습니다." });
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
