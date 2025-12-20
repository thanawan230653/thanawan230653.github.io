(() => {
  const $ = (id) => document.getElementById(id);

  // UI refs
  const envPill = $("envPill");
  const runState = $("runState");
  const modeTag = $("modeTag");

  const duration = $("duration");
  const durLabel = $("durLabel");
  const bufferMB = $("bufferMB");
  const gmax = $("gmax");
  const gmaxLabel = $("gmaxLabel");
  const maxLabel = $("maxLabel");

  const mode = $("mode");

  const btnGo = $("btnGo");
  const btnStop = $("btnStop");

  const bigNum = $("bigNum");
  const bigUnit = $("bigUnit");

  const pingVal = $("pingVal");
  const jitVal = $("jitVal");
  const dlVal = $("dlVal");
  const dlSub = $("dlSub");
  const ulVal = $("ulVal");
  const ulSub = $("ulSub");

  const logEl = $("log");

  const gauge = $("gauge");
  const ticksG = gauge.querySelector("#ticks");
  const needleG = gauge.querySelector("#needle");

  // State
  let stop = false;

  // Gauge mapping
  const ANG_MIN = -130;  // left
  const ANG_MAX = 130;   // right

  let needleAngle = ANG_MIN;     // current
  let needleTarget = ANG_MIN;    // desired
  let rafId = null;

  function log(line){
    const ts = new Date().toLocaleTimeString();
    logEl.textContent += `[${ts}] ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setPill(el, text){
    el.textContent = text;
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function formatSpeed(bytesPerSec){
    const mbps = bytesPerSec / (1024 * 1024);
    const gbps = bytesPerSec / (1024 * 1024 * 1024);
    // We show both MB/s and GB/s in the "sub" line
    if (gbps >= 1) {
      return { main: gbps.toFixed(2), unit: "GB/s", sub: `${mbps.toFixed(0)} MB/s` };
    }
    return { main: mbps.toFixed(0), unit: "MB/s", sub: `${gbps.toFixed(3)} GB/s` };
  }

  function speedToAngle(bytesPerSec){
    const gMax = Math.max(1, Number(gmax.value || 10)); // in GB/s
    const gbps = bytesPerSec / (1024 * 1024 * 1024);
    const t = clamp(gbps / gMax, 0, 1);
    return ANG_MIN + (ANG_MAX - ANG_MIN) * t;
  }

  function setNeedleTargetBySpeed(bytesPerSec){
    needleTarget = speedToAngle(bytesPerSec);
  }

  function animateNeedle(){
    // smooth toward target
    const diff = needleTarget - needleAngle;
    needleAngle += diff * 0.12; // damping
    needleG.setAttribute("transform", `rotate(${needleAngle.toFixed(2)} 260 250)`);
    rafId = requestAnimationFrame(animateNeedle);
  }

  function rebuildTicks(){
    ticksG.innerHTML = "";
    const gMax = Math.max(1, Number(gmax.value || 10));

    // major ticks: 0..gMax (GB/s) each 1
    // minor ticks: 0.5
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
        const tx = cx + (160) * Math.cos(ang);
        const ty = cy + (160) * Math.sin(ang) + 4;
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

  // Ping/Jitter: measure setTimeout drift (event loop latency)
  async function measurePingJitter(samples = 20){
    const lat = [];
    for (let i = 0; i < samples; i++){
      const t0 = performance.now();
      await new Promise(r => setTimeout(r, 0));
      const t1 = performance.now();
      lat.push(t1 - t0);
      if (stop) break;
    }
    lat.sort((a,b)=>a-b);
    const median = lat[Math.floor(lat.length/2)] || 0;
    const mean = lat.reduce((a,b)=>a+b,0) / Math.max(1, lat.length);
    const jitter = Math.sqrt(lat.reduce((a,b)=>a+(b-mean)*(b-mean),0)/Math.max(1,lat.length));
    return { pingMs: median, jitterMs: jitter };
  }

  // Chunked throughput test to keep UI responsive
  async function throughputTest({ kind, seconds, bufBytes }){
    // kind: "read" or "write"
    // Use Uint32Array for speed
    const buf = new ArrayBuffer(bufBytes);
    const arr = new Uint32Array(buf);
    const len = arr.length;

    // warmup
    for (let i = 0; i < Math.min(len, 250_000); i += 97) arr[i] = (i ^ 0x9e3779b9) >>> 0;

    let bytesDone = 0;
    let checksum = 0;

    const tEnd = performance.now() + seconds * 1000;
    const CHUNK_ELEMS = 1_000_000; // ~4MB per chunk

    while (performance.now() < tEnd && !stop){
      // do a chunk
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

      // Yield
      await new Promise(r => requestAnimationFrame(r));
    }

    const elapsed = Math.max(0.001, seconds - Math.max(0, (tEnd - performance.now()) / 1000));
    const bps = bytesDone / elapsed;

    return { bps, checksum };
  }

  function setBig(bytesPerSec){
    const f = formatSpeed(bytesPerSec);
    bigNum.textContent = f.main;
    bigUnit.textContent = f.unit;
  }

  function setMetric(elMain, elSub, bytesPerSec){
    const f = formatSpeed(bytesPerSec);
    elMain.textContent = `${f.main} ${f.unit}`;
    elSub.textContent = f.sub;
  }

  function setRunningUI(running){
    btnGo.disabled = running;
    btnStop.disabled = !running;
    setPill(runState, running ? "Running" : "Idle");
    setPill(envPill, running ? "Testing…" : "Ready");
  }

  async function run(){
    stop = false;
    logEl.textContent = "";

    const seconds = Math.max(2, Number(duration.value || 8));
    const bufMB = Math.max(32, Number(bufferMB.value || 256));
    const bufBytes = bufMB * 1024 * 1024;
    const selected = mode.value;

    // Reset values
    pingVal.textContent = "—";
    jitVal.textContent = "Jitter: —";
    dlVal.textContent = "—";
    dlSub.textContent = "—";
    ulVal.textContent = "—";
    ulSub.textContent = "—";

    modeTag.textContent = "PING";
    setBig(0);
    setNeedleTargetBySpeed(0);

    setRunningUI(true);
    log(`Start: duration=${seconds}s, buffer=${bufMB}MB, mode=${selected}`);

    // 1) Ping/Jitter
    const pj = await measurePingJitter(24);
    if (!stop){
      pingVal.textContent = `${pj.pingMs.toFixed(1)} ms`;
      jitVal.textContent = `Jitter: ${pj.jitterMs.toFixed(1)} ms`;
      log(`Ping≈${pj.pingMs.toFixed(1)}ms, Jitter≈${pj.jitterMs.toFixed(1)}ms`);
    }

    // Helper to animate gauge live-ish (set to current test throughput)
    async function runOne(kind){
      modeTag.textContent = kind === "read" ? "DOWNLOAD" : "UPLOAD";
      log(`${kind.toUpperCase()} test running…`);

      // Do test
      const res = await throughputTest({ kind, seconds, bufBytes });

      if (stop) return null;

      // Update gauge to final
      setNeedleTargetBySpeed(res.bps);
      setBig(res.bps);

      return res;
    }

    let readRes = null, writeRes = null;

    // 2) Read / Write as selected
    if (!stop && (selected === "both" || selected === "read")){
      // animate gauge during run: simple "pulse" by periodically sampling drift
      // We'll do a lightweight live indicator by setting needle to last known estimate.
      // (A more exact live estimate would require instrumenting inside throughputTest.)
      setNeedleTargetBySpeed(0);
      setBig(0);
      readRes = await runOne("read");
      if (readRes){
        setMetric(dlVal, dlSub, readRes.bps);
      }
    }

    if (!stop && (selected === "both" || selected === "write")){
      setNeedleTargetBySpeed(0);
      setBig(0);
      writeRes = await runOne("write");
      if (writeRes){
        setMetric(ulVal, ulSub, writeRes.bps);
      }
    }

    if (stop){
      modeTag.textContent = "STOPPED";
      log("Stopped by user.");
      setRunningUI(false);
      return;
    }

    // 3) Summary
    modeTag.textContent = "DONE";
    log("Done.");
    if (readRes) log(`READ checksum: 0x${readRes.checksum.toString(16).padStart(8,"0")}`);
    if (writeRes) log(`WRITE done (no checksum).`);

    setRunningUI(false);
  }

  // Events
  duration.addEventListener("input", () => {
    durLabel.textContent = `${duration.value}s`;
  });

  gmax.addEventListener("change", () => {
    rebuildTicks();
  });

  btnGo.addEventListener("click", run);
  btnStop.addEventListener("click", () => {
    stop = true;
    setPill(envPill, "Stopping…");
    setPill(runState, "Stopping…");
  });

  // Init
  durLabel.textContent = `${duration.value}s`;
  rebuildTicks();

  // Start needle animation loop once
  if (!rafId) animateNeedle();
})();
