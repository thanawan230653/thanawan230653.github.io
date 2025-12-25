export const questions = [
  { q: "ชื่อคุณคืออะไร 💕", type: "text", key: "myName", placeholder:"ชื่อเล่น/ชื่อจริงก็ได้" },
  { q: "ชื่อแฟน / คนที่ชอบ 🎁", type: "text", key: "loverName", placeholder:"พิมพ์ชื่อเขา..." },
  { q: "อายุเขาเท่าไหร่ 🎂", type: "number", key: "age", placeholder:"เช่น 18" },
  { q: "คบกันยัง 😆", type: "select", key:"status", options: ["กำลังคุย", "คบแล้ว", "แอบชอบ", "ไม่บอกก็ได้"] },
  { q: "หล่อไหม / ติ๋มไหม 😝", type: "select", key:"vibe", options: ["หล่อมาก", "น่ารักมาก", "ติ๋มนิดๆ", "เท่จัด", "ขี้เล่น", "ไม่ระบุ"] },
  { q: "เจอกันที่ไหน 🤍", type: "text", key: "where", placeholder:"เช่น โรงเรียน / ที่ทำงาน / เกม" },
  { q: "ทำไมถึงชอบเขา 💖", type: "text", key: "reason", placeholder:"พิมพ์เหตุผลน่ารักๆ" },

  // ตัวเลือกส่วนเสริม (ไม่ระบุก็ได้)
  { q: "ชื่อเฟสคุณ (ไม่ระบุก็ได้)", type: "text", key: "myFb", placeholder:"ใส่หรือข้ามได้" },
  { q: "ชื่อเฟสแฟน (ไม่ระบุก็ได้)", type: "text", key: "loverFb", placeholder:"ใส่หรือข้ามได้" },
];
