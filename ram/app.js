(() => {
  const $ = (id) => document.getElementById(id);

  // UI
  const statePill = $("statePill");
  const miniState = $("miniState");
  const modePill = $("modePill");

  const duration = $("duration");
  const durLabel = $("durLabel");
  const bufferMB = $("bufferMB");
  const gmax = $("gmax");
  const gmaxLabel = $("gmaxLabel");
  const maxLabel = $("maxLabel");

  const btnGo = $("btnGo");
  const btnStop = $("btnStop");

  const bigNum = $("bigNum");
  const bigUnit = $("bigUnit");

  const readOut = $("readOut");
  const writeOut = $("writeOut");
  const avgOut = $("avgOut");

  const publicIpEl = $("publicIp");
  const hostNameEl = $("hostName");
  const hostIpEl = $("hostIp");

  const logEl = $("log");

  // Gauge parts
  const gauge = $("gauge");
  const ticksG = gauge.querySelector("#ticks");
  const needleG = gauge.querySelector("#needle");

  // State
  let stop = false;

  const ANG_MIN = -130;
  const ANG_MAX = 130;
  let needleAngle = ANG_MIN;
  let needleTarget = ANG_MIN;
  let rafId = null;

  function log(line){
    const ts = new Date().toLocaleTimeString();
    logEl.textContent += `[${ts}] ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setPillText(el, text){ el.textContent = text; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

  function formatSpeed(bytesPerSec){
    const mbps = bytesPerSec / (1024 * 1024);
    const gbps = bytesPerSec / (1024 * 1024 * 1024);
    // show main with best unit, and always compute both
    if (gbps >= 1) return { main: `${gbps.toFixed(2)} GB/s`, sub: `${mbps.toFixed(0)} MB/s` };
    return { main: `${mbps.toFixed(0)} MB/s`, sub: `${gbps.toFixed(3)} GB/s` };
  }

  function bpsToAngle(bytesPerSec){
    const gMax = Math.max(1, Number(gmax.value || 10)); // GB/s
    const gbps = bytesPerSec / (1024 * 1024 * 1024);
    const t = clamp(gbps / gMax, 0, 1);
    return ANG_MIN + (ANG_MAX - ANG_MIN) * t;
  }

  function setNeedleTarget(bytesPerSec){
    needleTarget = bpsToAngle(bytesPerSec);
  }

  function animateNeedle(){
    const diff = needleTarget - needleAngle;
    needleAngle += diff * 0.12;
    needleG.setAttribute("transform", `rotate(${needleAngle.toFixed(2)} 260 250)`);
    rafId = requestAnimationFrame(animateNeedle);
  }

  function rebuildTicks(){
    ticksG.innerHTML = "";
    const gMax = Math.max(1, Number(gmax.value || 10));
    const majorStep = 1;
    const minorStep = 0.5;

    const cx = 260, cy = 250;
    const rOuter = 204;
    const rInnerMajor = 178;
    const rInnerMinor = 186;

    function addTick(gbps, major){
      const t = gbps / gMax;
      const ang = (ANG_MIN + (ANG_MAX - ANG_MIN) * t) * Math.PI / 180;
      const x1 = cx + rOuter * Math.cos(ang);
      const y1 = cy + rOuter * Math.sin(ang);
      const x2 = cx + (major ? rInnerMajor : rInnerMinor) * Math.cos(ang);
      const y2 = cy + (major ? rInnerMajor : rInnerMinor) * Math.sin(ang);

      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", x1); line.setAttribute("y1", y1);
      line.setAttribute("x2", x2); line.setAttribute("y2", y2);
      line.setAttribute("stroke", major ? "rgba(234,241,255,.55)" : "rgba(234,241,255,.25)");
      line.setAttribute("stroke-width", major ? "2" : "1");
      line.setAttribute("stroke-linecap","round");
      ticksG.appendChild(line);

      if (major){
        const tx = cx + 160 * Math.cos(ang);
        const ty = cy + 160 * Math.sin(ang) + 4;
        const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        text.setAttribute("x", tx);
        text.setAttribute("y", ty);
        text.setAttribute("fill","rgba(234,241,255,.75)");
        text.setAttribute("font-size","12");
        text.setAttribute("text-anchor","middle");
        text.textContent = String(gbps);
        ticksG.appendChild(text);
      }
    }

    for (let v = 0; v <= gMax + 1e-9; v += minorStep){
      const isMajor = Math.abs(v - Math.round(v)) < 1e-9;
      addTick(v, isMajor);
    }

    gmaxLabel.textContent = String(gMax);
    maxLabel.textContent = `${gMax} GB/s`;
  }

  function setBig(bytesPerSec){
    const gbps = bytesPerSec / (1024 * 1024 * 1024);
    const mbps = bytesPerSec / (1024 * 1024);

    if (gbps >= 1){
      bigNum.textContent = gbps.toFixed(2);
      bigUnit.textContent = "GB/s";
    } else {
      bigNum.textContent = mbps.toFixed(0);
      bigUnit.textContent = "MB/s";
    }
  }

  function setRunningUI(running){
    btnGo.disabled = running;
    btnStop.disabled = !running;
    setPillText(statePill, running ? "Testing…" : "Ready");
    setPillText(miniState, running ? "Running" : "Idle");
  }

  async function throughputTest(kind, seconds, bufBytes, onUpdate){
    // kind: "read" | "write"
    const buf = new ArrayBuffer(bufBytes);
    const arr = new Uint32Array(buf);
    const len = arr.length;

    // Warmup
    for (let i = 0; i < Math.min(len, 250_000); i += 97) arr[i] = (i ^ 0x9e3779b9) >>> 0;

    let bytesDone = 0;
    let checksum = 0;

    const tStart = performance.now();
    const tEnd = tStart + seconds * 1000;

    const CHUNK_ELEMS = 1_000_000; // ~4MB chunk

    while (performance.now() < tEnd && !stop){
      const chunk = Math.min(CHUNK_ELEMS, len);

      if (kind === "write"){
        const base = (bytesDone >>> 2) >>> 0;
        for (let i = 0; i < chunk; i++){
          arr[i] = (base + i) >>> 0;
        }
        bytesDone += chunk * 4;
      } else {
        let s = 0;
        for (let i = 0; i < chunk; i++){
          s = (s + arr[i]) >>> 0;
        }
        checksum ^= s;
        bytesDone += chunk * 4;
      }

      const now = performance.now();
      const elapsed = Math.max(0.001, (now - tStart) / 1000);
      const bpsNow = bytesDone / elapsed;

      if (onUpdate) onUpdate(bpsNow, (now - tStart) / (seconds * 1000));

      await new Promise(r => requestAnimationFrame(r));
    }

    const elapsedFinal = Math.max(0.001, (performance.now() - tStart) / 1000);
    const bps = bytesDone / elapsedFinal;
    return { bps, checksum };
  }

  async function run(){
    stop = false;
    logEl.textContent = "";

    const seconds = Math.max(2, Number(duration.value || 8));
    const bufMB = Math.max(32, Number(bufferMB.value || 256));
    const bufBytes = bufMB * 1024 * 1024;

    // Reset summary
    readOut.textContent = "—";
    writeOut.textContent = "—";
    avgOut.textContent = "—";

    setRunningUI(true);
    setNeedleTarget(0);
    setBig(0);

    log(`Start: duration=${seconds}s, buffer=${bufMB}MB`);
    modePill.textContent = "READ";

    // READ
    const readRes = await throughputTest("read", seconds, bufBytes, (bpsNow) => {
      setNeedleTarget(bpsNow);
      setBig(bpsNow);
    });

    if (stop){
      modePill.textContent = "STOPPED";
      log("Stopped.");
      setRunningUI(false);
      return;
    }

    const rFmt = formatSpeed(readRes.bps);
    readOut.textContent = `${rFmt.main} (${rFmt.sub})`;
    log(`READ: ${rFmt.main} | ${rFmt.sub}`);

    // WRITE
    modePill.textContent = "WRITE";
    setNeedleTarget(0);
    setBig(0);

    const writeRes = await throughputTest("write", seconds, bufBytes, (bpsNow) => {
      setNeedleTarget(bpsNow);
      setBig(bpsNow);
    });

    if (stop){
      modePill.textContent = "STOPPED";
      log("Stopped.");
      setRunningUI(false);
      return;
    }

    const wFmt = formatSpeed(writeRes.bps);
    writeOut.textContent = `${wFmt.main} (${wFmt.sub})`;
    log(`WRITE: ${wFmt.main} | ${wFmt.sub}`);

    // AVG
    const avgBps = (readRes.bps + writeRes.bps) / 2;
    const aFmt = formatSpeed(avgBps);
    avgOut.textContent = `${aFmt.main} (${aFmt.sub})`;
    modePill.textContent = "DONE";
    log(`AVG: ${aFmt.main} | ${aFmt.sub}`);

    // keep needle at avg
    setNeedleTarget(avgBps);
    setBig(avgBps);

    setRunningUI(false);
  }

  // IP functions
  async function setPublicIP(){
    // Try multiple endpoints
    const endpoints = [
      { url: "https://api.ipify.org?format=json", pick: (j) => j.ip },
      { url: "https://ifconfig.co/json", pick: (j) => j.ip },
      { url: "https://ipinfo.io/json", pick: (j) => j.ip },
    ];

    for (const ep of endpoints){
      try{
        const res = await fetch(ep.url, { cache: "no-store" });
        if (!res.ok) continue;
        const j = await res.json();
        const ip = ep.pick(j);
        if (ip){
          publicIpEl.textContent = ip;
          return;
        }
      }catch(_){}
    }
    publicIpEl.textContent = "N/A (blocked/offline)";
  }

  async function setHostInfo(){
    const host = location.hostname || "—";
    hostNameEl.textContent = host;

    // Best-effort: ask external DNS-over-HTTPS style helper.
    // Many public DoH APIs exist; some require headers; some CORS-block.
    // We'll try a CORS-friendly JSON endpoint (may fail depending on environment).
    const tries = [
      // Google DoH (may be blocked by CORS in some contexts)
      `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`,
      // Cloudflare DoH JSON (often CORS-blocked)
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`,
    ];

    for (const url of tries){
      try{
        const res = await fetch(url, {
          cache: "no-store",
          headers: url.includes("cloudflare-dns.com") ? { "accept": "application/dns-json" } : undefined
        });
        if (!res.ok) continue;
        const j = await res.json();
        // dns.google returns Answer array with data = IP
        const ans = j.Answer || j.answer || [];
        const ip = ans.find(a => a.type === 1 && typeof a.data === "string")?.data;
        if (ip){
          hostIpEl.textContent = ip;
          return;
        }
      }catch(_){}
    }

    hostIpEl.textContent = "N/A (CORS/DNS restricted)";
  }

  // Events
  duration.addEventListener("input", () => {
    durLabel.textContent = `${duration.value}s`;
  });

  gmax.addEventListener("change", rebuildTicks);

  btnGo.addEventListener("click", run);
  btnStop.addEventListener("click", () => {
    stop = true;
    setPillText(statePill, "Stopping…");
    setPillText(miniState, "Stopping…");
  });

  // Init
  durLabel.textContent = `${duration.value}s`;
  rebuildTicks();

  if (!rafId) {
    rafId = requestAnimationFrame(function loop(){
      animateNeedle();
    });
  }

  // IP init
  setPublicIP();
  setHostInfo();
})();
