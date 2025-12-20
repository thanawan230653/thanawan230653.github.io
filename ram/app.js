async function throughputTest(kind, seconds, bufBytes, onUpdate, turbo = true){
  const buf = new ArrayBuffer(bufBytes);
  const arr = new Uint32Array(buf);
  const len = arr.length;

  // BIG warmup (force JIT)
  for (let r = 0; r < 3; r++){
    for (let i = 0; i < len; i++){
      arr[i] = (i + r) >>> 0;
    }
  }

  let bytesDone = 0;
  let checksum = 0;

  const tStart = performance.now();
  const tEnd = tStart + seconds * 1000;

  // Unrolled loop step
  const STEP = 16; // 16 * 4 bytes per iteration
  const limit = len - (len % STEP);

  if (kind === "write"){
    while (performance.now() < tEnd && !stop){
      // Hot loop (no await for turbo)
      for (let i = 0; i < limit; i += STEP){
        const v = (i + bytesDone) >>> 0;
        arr[i]     = v;     arr[i+1]  = v+1;  arr[i+2]  = v+2;  arr[i+3]  = v+3;
        arr[i+4]   = v+4;   arr[i+5]  = v+5;  arr[i+6]  = v+6;  arr[i+7]  = v+7;
        arr[i+8]   = v+8;   arr[i+9]  = v+9;  arr[i+10] = v+10; arr[i+11] = v+11;
        arr[i+12]  = v+12;  arr[i+13] = v+13; arr[i+14] = v+14; arr[i+15] = v+15;
      }
      bytesDone += limit * 4;

      if (!turbo){
        const now = performance.now();
        const elapsed = Math.max(0.001, (now - tStart) / 1000);
        const bpsNow = bytesDone / elapsed;
        onUpdate?.(bpsNow, (now - tStart) / (seconds * 1000));
        await new Promise(r => requestAnimationFrame(r));
      }
    }
  } else {
    while (performance.now() < tEnd && !stop){
      let s = 0;
      for (let i = 0; i < limit; i += STEP){
        s = (s + arr[i] + arr[i+1] + arr[i+2] + arr[i+3]
               + arr[i+4] + arr[i+5] + arr[i+6] + arr[i+7]
               + arr[i+8] + arr[i+9] + arr[i+10] + arr[i+11]
               + arr[i+12] + arr[i+13] + arr[i+14] + arr[i+15]) >>> 0;
      }
      checksum ^= s;
      bytesDone += limit * 4;

      if (!turbo){
        const now = performance.now();
        const elapsed = Math.max(0.001, (now - tStart) / 1000);
        const bpsNow = bytesDone / elapsed;
        onUpdate?.(bpsNow, (now - tStart) / (seconds * 1000));
        await new Promise(r => requestAnimationFrame(r));
      }
    }
  }

  const elapsedFinal = Math.max(0.001, (performance.now() - tStart) / 1000);
  const bps = bytesDone / elapsedFinal;

  // Final update even in turbo
  onUpdate?.(bps, 1);

  return { bps, checksum };
}
