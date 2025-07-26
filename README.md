# AIFortune-Gemini

零基础部署：
1. 把代码传到 GitHub（仓库：aifortune-demo）
2. 打开 https://vercel.com/new Import 该仓库
3. 在 Vercel → Project Settings → Environment Variables 新增：
   GEMINI_API_KEY=你的 Google Gemini API Key
4. 点击 Deploy，等待 1~2 分钟即可访问

本地开发（可选）：
```bash
npm i    # 或 pnpm i / yarn
npm run dev
