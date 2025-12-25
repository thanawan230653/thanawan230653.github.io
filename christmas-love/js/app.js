const ICONS = {
  santa: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f385.svg",
  tree:  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f384.svg",
  gift:  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f381.svg",
  snow:  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2744.svg",
};

const $ = (sel, root = document) => root.querySelector(sel);

const app = $("#app");
const toast = $("#toast");
const audio = $("#bgm");
const snowCanvas = $("#snow");

const state = {
  step: 0,
  snowOn: true,
  musicOn: false,
  bgDataUrl: null,
  answers: {
    you:   { name: "", genders: [], age: "", height: "" , fb: "" },
    crush: { name: "", genders: [], age: "", height: "" , fb: "" },
    story: {
      cute: "ใช่",
      together: "ยังไม่คบ",
      whoFirst: "ยังไม่แน่ใจ",
      why: "",
      metWhere: "",
      knowDays: ""
    },
    confess: {
      plan: "ข้าม",
      date: "",
      note: "",
    }
  }
};

// ---------- Snow (Canvas) ----------
class Snow {
  constructor(canvas){
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = 0; this.h = 0;
    this.flakes = [];
    this.running = false;
    this._resize = () => this.resize();
    window.addEventListener("resize", this._resize);
    this.resize();
    this.seed(140);
  }
  resize(){
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.w = this.c.width  = Math.floor(window.innerWidth * dpr);
    this.h = this.c.height = Math.floor(window.innerHeight * dpr);
    this.c.style.width = "100%";
    this.c.style.height = "100%";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  seed(n){
    this.flakes = [];
    for(let i=0;i<n;i++) this.flakes.push(this.makeFlake(true));
  }
  makeFlake(randomY=false){
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : -10,
      r: 1 + Math.random() * 2.8,
      v: 0.6 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 0.7,
      o: 0.25 + Math.random() * 0.55
    };
  }
  burst(n=28){
    for(let i=0;i<n;i++){
      const f = this.makeFlake(false);
      f.x = window.innerWidth * (0.25 + Math.random()*0.5);
      f.v = 2.2 + Math.random()*2.2;
      f.r = 1.2 + Math.random()*3.2;
      this.flakes.push(f);
    }
    this.flakes = this.flakes.slice(-260);
  }
  start(){
    if(this.running) return;
    this.running = true;
    const tick = () => {
      if(!this.running) return;
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  stop(){
    this.running = false;
    this.ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  }
  draw(){
    const ctx = this.ctx;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    ctx.beginPath();
    for(const f of this.flakes){
      f.y += f.v;
      f.x += f.drift;
      if(f.y > window.innerHeight + 10){
        f.y = -10; f.x = Math.random() * window.innerWidth;
      }
      if(f.x < -10) f.x = window.innerWidth + 10;
      if(f.x > window.innerWidth + 10) f.x = -10;

      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    }
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fill();
  }
}
const snow = new Snow(snowCanvas);
snow.start();

// ---------- UI / Render ----------
const steps = [
  { id: "home", title: "Merry Christmas", render: renderHome },
  { id: "you", title: "ข้อมูลของคุณ", render: renderYou },
  { id: "crush", title: "ข้อมูลคนที่ชอบ", render: renderCrush },
  { id: "story", title: "ความรู้สึก", render: renderStory },
  { id: "confess", title: "วันบอกชอบ + รูปพื้นหลัง", render: renderConfess },
  { id: "summary", title: "Summary", render: renderSummary },
];

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function setStep(nextIndex){
  const page = $(".page", app);
  if(page){
    page.classList.add("exit");
    if(state.snowOn) snow.burst(22);
    setTimeout(() => {
      state.step = Math.max(0, Math.min(steps.length - 1, nextIndex));
      render();
    }, 170);
  }else{
    state.step = nextIndex;
    render();
  }
}

function render(){
  const s = steps[state.step];
  app.innerHTML = s.render();
  updateSnow();
  // stepper dots
  const dots = $("[data-stepper]", app);
  if(dots){
    const n = steps.length;
    const current = state.step;
    dots.innerHTML = Array.from({length:n}, (_,i)=>`<span class="dotstep ${i===current?"on":""}"></span>`).join("");
  }
}

function updateSnow(){
  if(state.snowOn) snow.start();
  else snow.stop();
}

async function toggleMusic(){
  state.musicOn = !state.musicOn;
  if(state.musicOn){
    try{
      await audio.play();
      showToast("Music: ON");
    }catch{
      state.musicOn = false;
      showToast("แตะปุ่มอีกครั้งเพื่อเริ่มเพลง");
    }
  }else{
    audio.pause();
    showToast("Music: OFF");
  }
}

function toggleSnow(){
  state.snowOn = !state.snowOn;
  updateSnow();
  showToast(state.snowOn ? "Snow: ON" : "Snow: OFF");
}

function enforceMax2(arr, value){
  const has = arr.includes(value);
  if(has) return arr.filter(v => v !== value);
  if(arr.length >= 2) return arr; // max 2
  return [...arr, value];
}

// ---------- Screens ----------
function renderHome(){
  return `
  <div class="page card">
    <div class="hero">
      <div class="hero-top">
        <div class="hero-ico" title="Santa"><img alt="santa" src="${ICONS.santa}"></div>
        <div class="hero-ico" title="Tree"><img alt="tree"  src="${ICONS.tree}"></div>
      </div>

      <h1>Merry<br/>Christmas</h1>
      <p>🎁🎄 เล่นขำๆ แล้วคัดลอกไปส่งได้เลย</p>

      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="row">
        <button class="btn btn-primary" type="button" data-action="next">Next →</button>
      </div>
      <div class="fine" style="margin-top:10px;text-align:center;color:rgba(255,255,255,.75);font-weight:800;">
        *เพลงจะเริ่มหลัง “คลิกปุ่ม” ครั้งแรก (กฎ autoplay ของเบราว์เซอร์)
      </div>
    </div>
  </div>`;
}

function renderYou(){
  const y = state.answers.you;
  return `
  <div class="page card">
    <div class="hero">
      <div class="hero-top">
        <div class="hero-ico"><img alt="snow" src="${ICONS.snow}"></div>
        <div class="hero-ico"><img alt="gift" src="${ICONS.gift}"></div>
      </div>
      <h1>Q1</h1>
      <p>ข้อมูลของคุณ</p>
      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="form">
        <div class="field">
          <label>ชื่อของคุณ</label>
          <input name="you_name" placeholder="พิมชื่อเล่น/ชื่อจริงก็ได้" value="${escapeHtml(y.name)}">
        </div>

        <div class="grid2">
          <div class="field">
            <label>อายุคุณ</label>
            <input name="you_age" inputmode="numeric" placeholder="เช่น 18" value="${escapeHtml(y.age)}">
          </div>
          <div class="field">
            <label>ส่วนสูงคุณ (ประมาณ)</label>
            <input name="you_height" placeholder="เช่น 165 cm" value="${escapeHtml(y.height)}">
          </div>
        </div>

        <div class="field">
          <label>เพศของคุณ (เลือกได้สูงสุด 2)</label>
          <div class="chips">
            ${genderPills("you_gender", y.genders)}
          </div>
        </div>

        <div class="field">
          <label>ชื่อเฟสคุณ (ไม่ใส่ก็ได้)</label>
          <input name="you_fb" placeholder="Facebook name (optional)" value="${escapeHtml(y.fb)}">
        </div>
      </div>

      <div class="row">
        <button class="btn btn-ghost" type="button" data-action="back">Back</button>
        <button class="btn btn-primary" type="button" data-action="next">Next →</button>
      </div>
    </div>
  </div>`;
}

function renderCrush(){
  const c = state.answers.crush;
  return `
  <div class="page card">
    <div class="hero">
      <div class="hero-top">
        <div class="hero-ico"><img alt="santa" src="${ICONS.santa}"></div>
        <div class="hero-ico"><img alt="tree" src="${ICONS.tree}"></div>
      </div>
      <h1>Q2</h1>
      <p>ข้อมูลคนที่คุณชอบ</p>
      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="form">
        <div class="field">
          <label>ชื่อคนที่ชอบ</label>
          <input name="crush_name" placeholder="ชื่อเล่น/ชื่อจริง" value="${escapeHtml(c.name)}">
        </div>

        <div class="grid2">
          <div class="field">
            <label>อายุเขา</label>
            <input name="crush_age" inputmode="numeric" placeholder="เช่น 19" value="${escapeHtml(c.age)}">
          </div>
          <div class="field">
            <label>ส่วนสูงเขา (ประมาณ)</label>
            <input name="crush_height" placeholder="เช่น 172 cm" value="${escapeHtml(c.height)}">
          </div>
        </div>

        <div class="field">
          <label>เพศของเขา (เลือกได้สูงสุด 2)</label>
          <div class="chips">
            ${genderPills("crush_gender", c.genders)}
          </div>
        </div>

        <div class="field">
          <label>ชื่อเฟสเขา (ไม่ใส่ก็ได้)</label>
          <input name="crush_fb" placeholder="Facebook name (optional)" value="${escapeHtml(c.fb)}">
        </div>
      </div>

      <div class="row">
        <button class="btn btn-ghost" type="button" data-action="back">Back</button>
        <button class="btn btn-primary" type="button" data-action="next">Next →</button>
      </div>
    </div>
  </div>`;
}

function renderStory(){
  const s = state.answers.story;
  return `
  <div class="page card">
    <div class="hero">
      <h1>Q3</h1>
      <p>ความรู้สึก & สถานะ</p>
      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="form">
        <div class="field">
          <label>น่ารักในสายตาคุณไหม?</label>
          ${singleChoice("story_cute", ["ใช่","ไม่แน่ใจ","ไม่ค่อย"], s.cute)}
        </div>

        <div class="field">
          <label>คบกันยัง?</label>
          ${singleChoice("story_together", ["คบแล้ว","ยังไม่คบ","กำลังคุยๆ"], s.together)}
        </div>

        <div class="field">
          <label>ใครเริ่มบอกชอบก่อน</label>
          ${singleChoice("story_first", ["เรา","เขา","พร้อมกัน","ยังไม่เคยบอก"], s.whoFirst)}
        </div>

        <div class="field">
          <label>เจอกัน/รู้จักกันที่ไหน</label>
          <input name="story_met" placeholder="เช่น โรงเรียน / งาน / เกม / เพื่อนแนะนำ" value="${escapeHtml(s.metWhere)}">
        </div>

        <div class="field">
          <label>รู้จักกันมาแล้วกี่วัน</label>
          <input name="story_days" inputmode="numeric" placeholder="เช่น 120" value="${escapeHtml(s.knowDays)}">
        </div>

        <div class="field">
          <label>ทำไมถึงชอบเขา</label>
          <textarea name="story_why" placeholder="พิมพ์ยาวๆ ได้เลย">${escapeHtml(s.why)}</textarea>
        </div>
      </div>

      <div class="row">
        <button class="btn btn-ghost" type="button" data-action="back">Back</button>
        <button class="btn btn-primary" type="button" data-action="next">Next →</button>
      </div>
    </div>
  </div>`;
}

function renderConfess(){
  const c = state.answers.confess;
  const plan = c.plan;
  const dateDisabled = plan !== "อยากบอกวันไหน";
  return `
  <div class="page card">
    <div class="hero">
      <h1>Q4</h1>
      <p>อยากบอกชอบวันไหน + ใส่รูปเขาเป็นพื้นหลังได้</p>
      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="form">
        <div class="field">
          <label>โหมด “วันบอกชอบ”</label>
          ${singleChoice("confess_plan", ["อยากบอกวันไหน","บอกไปแล้ว","ข้าม"], plan)}
        </div>

        <div class="field">
          <label>วันที่อยากบอก (ถ้าเลือก “อยากบอกวันไหน”)</label>
          <input name="confess_date" type="date" ${dateDisabled ? "disabled" : ""} value="${escapeHtml(c.date)}">
        </div>

        <div class="field">
          <label>โน้ตสั้นๆ (ไม่ใส่ก็ได้)</label>
          <input name="confess_note" placeholder="เช่น ขอให้เราได้อยู่ข้างๆ เธอนะ" value="${escapeHtml(c.note)}">
        </div>

        <div class="field">
          <label>อัปโหลดรูป (เอาไว้ตั้งเป็นพื้นหลังเว็บ) — ไม่อัปก็ได้</label>
          <input name="bg_upload" type="file" accept="image/*">
        </div>

        <div class="row" style="justify-content:space-between;">
          <button class="btn btn-ghost" type="button" data-action="clear-bg">ล้างพื้นหลัง</button>
          <button class="btn btn-ghost" type="button" data-action="copy-summary">Copy Summary</button>
        </div>
      </div>

      <div class="row">
        <button class="btn btn-ghost" type="button" data-action="back">Back</button>
        <button class="btn btn-primary" type="button" data-action="next">Finish →</button>
      </div>
    </div>
  </div>`;
}

function renderSummary(){
  const text = buildSummary();
  return `
  <div class="page card">
    <div class="hero">
      <h1>Summary</h1>
      <p>ระวังซานต้าจะมาแซลนะอิอิ 🎅✨</p>
      <div class="stepper" data-stepper></div>
    </div>

    <div class="body">
      <div class="form">
        <div class="field">
          <label>สรุป (คัดลอกไปส่งได้เลย)</label>
          <textarea readonly>${escapeHtml(text)}</textarea>
        </div>
      </div>

      <div class="row">
        <button class="btn btn-primary" type="button" data-action="copy-summary">Copy</button>
        <button class="btn btn-ghost" type="button" data-action="startover">Start Over</button>
      </div>
    </div>
  </div>`;
}

// ---------- Helpers ----------
function genderPills(groupName, selected){
  const options = ["เก", "ชาย", "หญิง", "ทอม", "กระเทย"];
  return options.map(opt => {
    const on = selected.includes(opt);
    return `
      <label class="pill ${on ? "on":""}" data-gender-group="${groupName}" data-gender="${opt}">
        <input type="checkbox" ${on ? "checked":""} />
        <span>${opt}</span>
      </label>
    `;
  }).join("");
}

function singleChoice(name, options, current){
  return `
    <div class="chips">
      ${options.map(opt => `
        <label class="pill ${opt===current?"on":""}" data-choice-name="${name}" data-choice="${opt}">
          <input type="radio" name="${name}" ${opt===current?"checked":""}/>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function buildSummary(){
  const { you, crush, story, confess } = state.answers;

  const youG = you.genders.length ? you.genders.join(", ") : "ไม่ระบุ";
  const crG  = crush.genders.length ? crush.genders.join(", ") : "ไม่ระบุ";

  const dateLine =
    confess.plan === "อยากบอกวันไหน"
      ? `อยากบอกชอบวันที่: ${confess.date || "(ยังไม่เลือกวัน)"}`
      : confess.plan === "บอกไปแล้ว"
        ? "สถานะบอกชอบ: บอกไปแล้ว ✅"
        : "สถานะบอกชอบ: ข้าม";

  return [
    "🎄 Christmas Love Quiz",
    "",
    `เรา: ${you.name || "ไม่ระบุ"} | เพศ: ${youG} | อายุ: ${you.age || "-"} | สูง: ${you.height || "-"}`,
    `เขา: ${crush.name || "ไม่ระบุ"} | เพศ: ${crG} | อายุ: ${crush.age || "-"} | สูง: ${crush.height || "-"}`,
    "",
    `น่ารักในสายตาเราไหม: ${story.cute}`,
    `คบกันยัง: ${story.together}`,
    `ใครเริ่มบอกชอบก่อน: ${story.whoFirst}`,
    `รู้จักกันที่ไหน: ${story.metWhere || "-"}`,
    `รู้จักกันมาแล้วกี่วัน: ${story.knowDays || "-"}`,
    "",
    "ทำไมถึงชอบเขา:",
    story.why ? story.why : "-",
    "",
    dateLine,
    confess.note ? `โน้ต: ${confess.note}` : "",
    "",
    "ระวังซานต้าจะมาแซลนะอิอิ 🎅✨",
    "จัดทำโดย PAT Studlo"
  ].filter(Boolean).join("\n");
}

// ---------- Events ----------
document.addEventListener("click", async (e) => {
  const a = e.target.closest("[data-action]");
  if(a){
    const act = a.dataset.action;

    if(act === "toggle-snow") toggleSnow();
    if(act === "toggle-music") await toggleMusic();
    if(act === "copy-summary") await copySummary();

    if(act === "next"){
      // เริ่มเพลงครั้งแรก (ถ้า user เปิด music ไว้)
      if(state.musicOn){
        try{ await audio.play(); }catch{}
      }
      // validate บางหน้า
      if(!saveCurrentInputs()) return;
      setStep(state.step + 1);
    }

    if(act === "back"){
      saveCurrentInputs();
      setStep(state.step - 1);
    }

    if(act === "startover"){
      Object.assign(state, {
        step: 0,
        bgDataUrl: null,
        answers: {
          you:   { name: "", genders: [], age: "", height: "" , fb: "" },
          crush: { name: "", genders: [], age: "", height: "" , fb: "" },
          story: { cute: "ใช่", together: "ยังไม่คบ", whoFirst: "ยังไม่แน่ใจ", why: "", metWhere: "", knowDays: "" },
          confess: { plan: "ข้าม", date: "", note: "" }
        }
      });
      document.documentElement.style.setProperty("--userbg", "none");
      render();
      showToast("เริ่มใหม่แล้ว");
    }

    if(act === "clear-bg"){
      state.bgDataUrl = null;
      document.documentElement.style.setProperty("--userbg", "none");
      showToast("ล้างพื้นหลังแล้ว");
    }
    return;
  }

  // pill single-choice
  const ch = e.target.closest("[data-choice-name]");
  if(ch){
    const name = ch.dataset.choiceName;
    const val = ch.dataset.choice;

    // update state
    if(name === "story_cute") state.answers.story.cute = val;
    if(name === "story_together") state.answers.story.together = val;
    if(name === "story_first") state.answers.story.whoFirst = val;

    if(name === "confess_plan"){
      state.answers.confess.plan = val;
      if(val !== "อยากบอกวันไหน"){
        state.answers.confess.date = "";
      }
      render();
    }
    return;
  }

  // gender pills (max 2)
  const g = e.target.closest("[data-gender-group]");
  if(g){
    const group = g.dataset.genderGroup; // you_gender / crush_gender
    const val = g.dataset.gender;

    if(group === "you_gender"){
      state.answers.you.genders = enforceMax2(state.answers.you.genders, val);
      render();
    }
    if(group === "crush_gender"){
      state.answers.crush.genders =
