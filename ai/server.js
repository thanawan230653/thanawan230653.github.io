/**
 * server.js
 * npm i express
 * ตั้งค่า ENV: OPENAI_API_KEY=xxx
 * รัน: node server.js
 */
import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(".")); // เสิร์ฟ index.html ในโฟลเดอร์เดียวกัน

app.post("/api/image", async (req, res) => {
  try {
    const { prompt, model = "gpt-image-1.5", size = "1024x1024", quality = "auto", n = 1 } = req.body || {};
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in environment." });
    }
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    const body = {
      model,
      prompt,
      size,
      quality,
      n: Math.max(1, Math.min(4, Number(n) || 1)),
      // หมายเหตุ: บางการตั้งค่าอื่นอาจมีในเอกสาร (เช่น response_format) ขึ้นกับรุ่น/endpoint
    };

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).send(JSON.stringify(json));
    }

    // โดยทั่วไป images API จะคืน data[] ที่มี url หรือ b64_json (ขึ้นกับ response_format)
    // โค้ดนี้พยายาม map ออกมาเป็น array ของ url หรือ dataURL
    const images = (json.data || []).map(x => {
      if (x.url) return x.url;
      if (x.b64_json) return `data:image/png;base64,${x.b64_json}`;
      return null;
    }).filter(Boolean);

    res.json({ images, raw: json });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
