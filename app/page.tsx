
---

> **6) `app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import ScoreBar from "@/components/ScoreBar";
import ShareCard from "@/components/ShareCard";

type PredictResp = {
  ok: boolean;
  seed: number;
  aiScore: number;
  breakdown: {
    technicalScore: number;
    capitalScore: number;
    socialScore: number;
    narrativeScore: number;
    finalScore: number;
  };
  iching: { name: string; brief: string; ai: string };
  tarot: Array<{ card: string; upright: boolean; ai: string; pos: "Past"|"Present"|"Future" }>;
  mantra: string;
  gptInterpretation: string;
  error?: string;
};

export default function Home() {
  const [ca, setCA] = useState("");
  const [coin, setCoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictResp | null>(null);

  async function onPredict() {
    if (!ca) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: JSON.stringify({ ca, coin }),
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json()) as PredictResp;
      if (!json.ok) throw new Error(json.error || "predict failed");
      setData(json);
    } catch (err: any) {
      alert(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <header className="py-8 text-center">
        <h1 className="text-3xl font-bold">🤖 AIFortune · AI 财富 Meme 预测器（Gemini）</h1>
        <p className="text-sm text-[#9aa0aa] mt-2">
          输入你的 Meme 币 <code className="bg-[#111418] px-1 rounded">CA</code>，
          让 <strong>东方易数 + 西方塔罗 + AI Score + Gemini 拟人化解读</strong> 给你一份“财富命运书”。
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24">
        <section className="bg-[#171a21] border border-[#242832] rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">开始占卜</h2>
          <div className="space-y-3">
          <input
            placeholder="输入代币名称（可选）"
            value={coin}
            onChange={e => setCoin(e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-[#111418] border border-[#242832] text-white text-sm"
          />
          <div className="flex gap-2">
            <input
              placeholder="输入代币合约地址（CA）…"
              value={ca}
              onChange={e => setCA(e.target.value)}
              className="flex-1 px-3 py-3 rounded-xl bg-[#111418] border border-[#242832] text-white text-sm"
            />
            <button
              onClick={onPredict}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-[#6c5ce7] text-white text-sm"
            >
              {loading ? "预测中..." : "开始预测"}
            </button>
          </div>
          <p className="text-xs text-[#666]">示例：0x1234...ABCD</p>
          </div>
        </section>

        {data && (
          <section className="bg-[#171a21] border border-[#242832] rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold">🔮 预测结果</h2>
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                seed: {data.seed}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">AI 财富潜力指数</h3>
                <ScoreBar score={data.aiScore} />
                <div className="text-3xl font-bold text-[#00d8a4] mt-2">{data.aiScore}</div>
              </div>

              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">Score Breakdown</h3>
                <div className="text-sm text-[#9aa0aa] leading-6">
                  技术面：{data.breakdown.technicalScore.toFixed(1)} /
                  资金面：{data.breakdown.capitalScore.toFixed(1)} /
                  社交面：{data.breakdown.socialScore.toFixed(1)} /
                  叙事面：{data.breakdown.narrativeScore.toFixed(1)}
                </div>
              </div>

              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">东方易数卦象</h3>
                <div className="font-semibold">{data.iching.name}</div>
                <div className="text-sm text-[#9aa0aa] mt-1">{data.iching.brief}</div>
                <div className="mt-2">AI解读：{data.iching.ai}</div>
              </div>

              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">西方塔罗（三张牌：过去 / 现在 / 未来）</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {data.tarot.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#1b1f27] border border-white/5">
                      <div className="text-xs text-[#9aa0aa] mb-1">{t.pos}</div>
                      <div className="font-semibold">
                        {t.card} {t.upright ? "" : "（逆位）"}
                      </div>
                      <div className="text-xs text-[#9aa0aa] mt-1">{t.ai}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">Gemini 拟人化解读</h3>
                <pre className="whitespace-pre-wrap text-sm leading-6 text-[#e5e9f0]">
                  {data.gptInterpretation}
                </pre>
              </div>

              <div>
                <h3 className="text-[#00d8a4] font-semibold mb-2">AI 财富箴言</h3>
                <div className="italic">“{data.mantra}”</div>
              </div>

              <ShareCard
                data={{
                  ca,
                  coin,
                  score: data.aiScore,
                  iching: data.iching,
                  mantra: data.mantra
                }}
              />

              <p className="text-xs text-[#666]">
                * 本页面仅做娱乐性质的 Meme 预测，不构成任何投资建议。Crypto is highly volatile. DYOR.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="py-10 text-center text-[#9aa0aa] text-sm">
        © 2025 AIFortune • #AI #MemeCoin #Tarot #IChing #100x
      </footer>
    </div>
  );
}
