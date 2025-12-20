(() => {
  const el = (id) => document.getElementById(id);

  const sizeMBEl = el("sizeMB");
  const passesEl = el("passes");
  const allocStepMBEl = el("allocStepMB");
  const modeEl = el("mode");

  const btnRun = el("btnRun");
  const btnStop = el("btnStop");
  const btnAlloc = el("btnAlloc");
  const btnFree = el("btnFree");

  const statusEl = el("status");
  const resultEl = el("result");
  const heapUsedEl = el("heapUsed");
  const allocatedEl = el("allocated");
  const logEl = el("log");

  let stopFlag = false;
  let allocatedBlocks = []; // keep references to prevent GC

  function log(line) {
    const ts = new Date().toLocaleTimeString();
    logEl.textContent += `[${ts}] ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setStatus(s) {
    statusEl.textContent = s;
  }

  function fmtMB(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function updateHeapUI() {
    // performance.memory is Chrome-only and requires non-cross-origin isolated? (varies)
    const mem = performance && performance.memory ? performance.memory : null;
    if (!mem) {
      heapUsedEl.textContent = "N/A";
      return;
    }
    heapUsedEl.textContent = fmtMB(mem.usedJSHeapSize);
  }

  function busyWaitNextFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  async function runSpeedTest() {
    stopFlag = false;
    btnRun.disabled = true;
    btnStop.disabled = false;

    resultEl.textContent = "—";
    setStatus("Preparing...");
    log("Speed test started.");

    const sizeMB = Math.max(16, Number(sizeMBEl.value || 256));
    const passes = Math.max(1, Number(passesEl.value || 6));
    const mode = modeEl.value;

    // Allocate buffer
    const bytes = sizeMB * 1024 * 1024;
    const buf = new ArrayBuffer(bytes);

    // Use Uint32 for faster stepping; 4 bytes per element
    const arr = new Uint32Array(buf);
    const len = arr.length;

    // Warmup (helps JIT)
    setStatus("Warming up...");
    for (let i = 0; i < Math.min(len, 1_000_000); i += 97) {
      arr[i] = (i ^ 0x9e3779b9) >>> 0;
    }
    await busyWaitNextFrame();

    // Timed loops
    setStatus("Running...");
    updateHeapUI();

    const t0 = performance.now();
    let checksum = 0;

    for (let p = 0; p < passes; p++) {
      if (stopFlag) break;

      // Write pass
      if (mode === "rw" || mode === "write") {
        // step by 1 is “heavier”; step by 2/4 is “lighter”
        for (let i = 0; i < len; i++) {
          arr[i] = (i + p * 2654435761) >>> 0;
        }
      }

      // Read pass
      if (mode === "rw" || mode === "read") {
        // Sum a subset to avoid insane CPU cost? We'll sum all for stable work.
        // Keep it simple: sum all, but use >>>0 to keep uint32-ish.
        let s = 0;
        for (let i = 0; i < len; i++) {
          s = (s + arr[i]) >>> 0;
        }
        checksum ^= s;
      }

      // Yield to UI occasionally
      if (p % 2 === 1) {
        updateHeapUI();
        log(`Pass ${p + 1}/${passes} done.`);
        await busyWaitNextFrame();
      }
    }

    const t1 = performance.now();
    const elapsedSec = Math.max(0.000001, (t1 - t0) / 1000);

    btnRun.disabled = false;
    btnStop.disabled = true;

    if (stopFlag) {
      setStatus("Stopped");
      log("Speed test stopped by user.");
      return;
    }

    setStatus("Done");

    // Compute effective transferred bytes:
    // - write: bytes per pass
    // - read: bytes per pass
    // - rw: 2*bytes per pass
    const factor = mode === "rw" ? 2 : 1;
    const transferredBytes = bytes * passes * factor;
    const mbps = (transferredBytes / (1024 * 1024)) / elapsedSec;

    resultEl.textContent = `${mbps.toFixed(0)} MB/s`;
    updateHeapUI();
    log(`Mode: ${mode}, Size: ${sizeMB}MB, Passes: ${passes}`);
    log(`Elapsed: ${elapsedSec.toFixed(3)}s, Throughput: ${mbps.toFixed(1)} MB/s`);
    log(`Checksum (anti-opt): 0x${checksum.toString(16).padStart(8, "0")}`);
  }

  async function allocateUntilFail() {
    stopFlag = false;
    btnAlloc.disabled = true;
    btnFree.disabled = false;

    const stepMB = Math.max(8, Number(allocStepMBEl.value || 128));
    const stepBytes = stepMB * 1024 * 1024;

    setStatus("Allocating...");
    log(`Allocation started. Step = ${stepMB}MB`);

    let total = allocatedBlocks.reduce((a, b) => a + b.byteLength, 0);

    // Keep allocating blocks until it throws or user stops.
    while (!stopFlag) {
      try {
        const block = new Uint8Array(stepBytes);
        // Touch memory so it is actually committed
        for (let i = 0; i < block.length; i += 4096) block[i] = (i ^ 0x5a) & 0xff;

        allocatedBlocks.push(block);
        total += stepBytes;

        allocatedEl.textContent = String(allocatedBlocks.length);
        updateHeapUI();
        log(`Allocated +${stepMB}MB (total kept: ${fmtMB(total)})`);

        // Yield to UI
        await busyWaitNextFrame();
      } catch (e) {
        setStatus("Allocation failed");
        log(`Allocation failed after total kept: ${fmtMB(total)}`);
        log(`Error: ${e && e.message ? e.message : String(e)}`);
        break;
      }
    }

    btnAlloc.disabled = false;
  }

  function freeAllocations() {
    allocatedBlocks = [];
    allocatedEl.textContent = "0";
    updateHeapUI();
    setStatus("Freed allocations");
    log("Freed allocated blocks (GC may take a moment).");
  }

  btnRun.addEventListener("click", runSpeedTest);
  btnStop.addEventListener("click", () => {
    stopFlag = true;
    setStatus("Stopping...");
    log("Stop requested.");
  });
  btnAlloc.addEventListener("click", allocateUntilFail);
  btnFree.addEventListener("click", freeAllocations);

  // init
  logEl.textContent = "";
  updateHeapUI();
})();
