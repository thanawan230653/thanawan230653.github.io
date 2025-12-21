// server.js
// npm i express
// ตั้ง ENV: OPENAI_API_KEY=xxx
// รัน: node server.js

const express = require("express");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.static(".")); // เสิร์ฟ index.html ในโฟลเดอร์เดียวกัน

app.post("/api/image", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const { prompt, model = "gpt-image-1.5", size = "1024x1024", quality = "auto", n = 1 } = req.body || {};
    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "prompt is required" });

    const body = {
      model,
      prompt,
      size,
      quality,
      n: Math.max(1, Math.min(4, Number(n) || 1)),
      // NOTE: ถ้า API คืนเป็น b64_json ก็จะแปลงเป็น data URL ให้หน้าเว็บ
      // บางบัญชี/รุ่นอาจคืน url หรือ b64_json ตามค่าเริ่มต้น/การตั้งค่า
    };

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json(json);

    const images = (json.data || [])
      .map(x => x.url ? x.url : (x.b64_json ? `data:image/png;base64,${x.b64_json}` : null))
      .filter(Boolean);

    return res.json({ images });
  } catch (e) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running: http://localhost:" + PORT));
