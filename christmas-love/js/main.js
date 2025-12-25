import { questions } from "./questions.js";
import { snowEffect, burstEffect } from "./snow.js";

const app = document.getElementById("app");
const bgm = document.getElementById("bgm");

let index = 0;
let answers = {};

document.getElementById("startBtn").onclick = async () => {
  snowEffect(60);
  await bgm.play().catch(()=>{}); // ป้องกัน autoplay block
  index = 0;
  answers = {};
  showQuestion();
};

function showQuestion(){
  const q = questions[index];

  let html = `<h2>${q.q}</h2>`;

  if(q.type === "select"){
    html += `<select id="input">`;
    q.options.forEach(o => html += `<option value="${o}">${o}</option>`);
    html += `</select>`;
  } else {
    html += `<input id="input" type="${q.type}" placeholder="${q.placeholder ?? ""}">`;
  }

  html += `
    <div style="margin-top:8px">
      <button id="nextBtn">ยืนยัน ❄️</button>
      <button id="skipBtn" style="background:#457b9d;margin-left:8px">ข้าม</button>
    </div>
    <p class="mini">*เว็บนี้เป็นไฟล์สแตติก ไม่เก็บข้อมูล/ไม่เก็บ log ของผู้ใช้งาน</p>
    <div class="footer">จัดทำโดย PAT Studio</div>
  `;

  app.innerHTML = html;

  document.getElementById("nextBtn").onclick = () => {
    const val = document.getElementById("input").value?.trim() || "-";
    answers[q.key] = val;
    goNext();
  };

  document.getElementById("skipBtn").onclick = () => {
    answers[q.key] = "-";
    goNext();
  };
}

function goNext(){
  burstEffect(26);     // เอฟเฟกต์ตอนเปลี่ยนหน้า
  snowEffect(60);      // รีเฟรชหิมะ
  index++;
  if(index < questions.length) showQuestion();
  else summary();
}

function summary(){
  const safe = (v)=> (v && v !== "-" ? v : "ไม่ระบุ");

  app.innerHTML = `
    <h2>🎄 สรุปของคุณ 🎁</h2>

    <p><b>${safe(answers.myName)}</b> ชอบ <b>${safe(answers.loverName)}</b></p>
    <p>อายุ: ${safe(answers.age)} | สถานะ: ${safe(answers.status)}</p>
    <p>ฟีล: ${safe(answers.vibe)} | เจอกันที่: ${safe(answers.where)}</p>
    <p>เหตุผลที่ชอบ: ${safe(answers.reason)}</p>

    <hr style="border:0;border-top:1px solid rgba(255,255,255,.2);margin:16px 0">

    <p>💬 ระวังซานต้าจะมาแซวนะอิอิ 😝</p>
    <p class="mini">*เว็บนี้เป็นไฟล์สแตติก ใช้เล่นขำๆ ส่งให้คนพิเศษเท่านั้น</p>
    <div class="footer">จัดทำโดย PAT Studio</div>

    <div style="margin-top:14px">
      <button id="againBtn">ทำใหม่อีกรอบ ❄️</button>
    </div>
  `;

  document.getElementById("againBtn").onclick = () => {
    burstEffect(30);
    index = 0;
    answers = {};
    showQuestion();
  };
}
