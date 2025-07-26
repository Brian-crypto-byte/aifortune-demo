import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchMetricsByCA } from "@/lib/fetchers";
import { calcScores } from "@/lib/scoring";
import { ICHING } from "@/lib/iching";
import { TAROT, TAROT_AI_MAP } from "@/lib/tarot";
import { MANTRAS } from "@/lib/mantra";
import { generateInterpretationGemini } from "@/lib/gemini";

const bodySchema = z.object({
  ca: z.string().min(4, "Invalid CA"),
  coin: z.string().optional(),
});

function strToSeed(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function xorshift32(seed: number) {
  let x = seed >>> 0;
  return function () {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x >>> 0) / 4294967296;
  }
}
function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { ca, coin } = bodySchema.parse(json);

    const metrics = await fetchMetricsByCA(ca);
    const breakdown = calcScores(metrics);
    const finalScore = breakdown.finalScore;

    const seed = strToSeed(ca.toLowerCase());
    const rand = xorshift32(seed);

    const iching = pick(rand, ICHING);
    const tarotCards = (() => {
      const cloned = [...TAROT];
      const pos = ["Past", "Present", "Future"] as const;
      const res: Array<{ card: string; upright: boolean; ai: string; pos: "Past"|"Present"|"Future" }> = [];
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(rand() * cloned.length);
        const upright = rand() > 0.5;
        const card = cloned.splice(idx, 1)[0];
        const base = TAROT_AI_MAP[card] || "趋势复杂，需要结合市场与链上数据进一步观察。";
        const ai = upright ? base : `（逆位）${base} —— 方向可能相反 / 势能减弱 / 风险加剧。`;
        res.push({ card, upright, ai, pos: pos[i] });
      }
      return res;
    })();
    const mantra = pick(rand, MANTRAS);

    const gpt = await generateInterpretationGemini({
      coin: coin || "Unknown Meme",
      ca,
      finalScore,
      breakdown,
      iching,
      tarot: tarotCards,
      mantra,
    });

    return NextResponse.json({
      ok: true,
      seed,
      aiScore: finalScore,
      breakdown,
      iching,
      tarot: tarotCards,
      mantra,
      gptInterpretation: gpt
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
