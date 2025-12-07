(function () {
  "use strict";

  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas.getContext("2d");
  const canvasInner = document.getElementById("canvasInner");
  const canvasScroll = document.getElementById("canvasScroll");
  const selectionRect = document.getElementById("selectionRect");

  // File / buttons
  const fileInput = document.getElementById("fileInput");
  const btnOpen = document.getElementById("btnOpen");
  const btnExport = document.getElementById("btnExport");
  const btnUndo = document.getElementById("btnUndo");
  const btnReset = document.getElementById("btnReset");
  const btnHardReset = document.getElementById("btnHardReset");

  // Crop / transform
  const btnActivateCrop = document.getElementById("btnActivateCrop");
  const btnApplyCrop = document.getElementById("btnApplyCrop");
  const btnCancelCrop = document.getElementById("btnCancelCrop");
  const btnFlipH = document.getElementById("btnFlipH");
  const btnFlipV = document.getElementById("btnFlipV");
  const btnFitToView = document.getElementById("btnFitToView");

  // Labels
  const fileNameLabel = document.getElementById("fileNameLabel");
  const fileSizeLabel = document.getElementById("fileSizeLabel");
  const fileError = document.getElementById("fileError");
  const fileStatusDot = document.getElementById("fileStatusDot");
  const statusText = document.getElementById("statusText");
  const sizeLabel = document.getElementById("sizeLabel");
  const metaResolution = document.getElementById("metaResolution");
  const metaAspect = document.getElementById("metaAspect");
  const metaBitDepth = document.getElementById("metaBitDepth");
  const historyState = document.getElementById("historyState");
  const zoomRange = document.getElementById("zoomRange");
  const zoomLabel = document.getElementById("zoomLabel");
  const docName = document.getElementById("docName");
  const metaTool = document.getElementById("metaTool");

  // Effects
  const expSlider = document.getElementById("expSlider");
  const expLabel = document.getElementById("expLabel");
  const contrastSlider = document.getElementById("contrastSlider");
  const contrastLabel = document.getElementById("contrastLabel");
  const effectButtons = document.querySelectorAll(".btn-xs[data-effect]");

  // Tool settings
  const settingsBlocks = document.querySelectorAll(".settings-block");

  const colorPicker = document.getElementById("colorPicker");
  const colorHex = document.getElementById("colorHex");
  const brushSizeSlider = document.getElementById("brushSize");
  const brushSizeLabel = document.getElementById("brushSizeLabel");
  const brushOpacitySlider = document.getElementById("brushOpacity");
  const brushOpacityLabel = document.getElementById("brushOpacityLabel");

  const textColorPicker = document.getElementById("textColor");
  const textColorHex = document.getElementById("textColorHex");
  const textSizeSlider = document.getElementById("textSizeSlider");
  const textSizeLabel = document.getElementById("textSizeLabel");
  const textBoldCheckbox = document.getElementById("textBold");

  const shapeColorPicker = document.getElementById("shapeColor");
  const shapeColorHex = document.getElementById("shapeColorHex");
  const shapeStrokeSlider = document.getElementById("shapeStroke");
  const shapeStrokeLabel = document.getElementById("shapeStrokeLabel");

  const toolButtons = document.querySelectorAll(".tool-button");

  // State
  let imageLoaded = false;
  let currentTool = "pointer";
  let history = [];
  const MAX_HISTORY = 25;

  let selection = { active: false, drawing: false, x: 0, y: 0, w: 0, h: 0 };

  let brushColor = "#ffffff";
  let brushSize = 16;
  let brushOpacity = 1;

  let textColor = "#ffffff";
  let textSize = 36;

  let shapeColor = "#ffffff";
  let shapeStroke = 6;

  let painting = false;
  let lastX = 0;
  let lastY = 0;

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function updateMeta() {
    const w = canvas.width;
    const h = canvas.height;
    sizeLabel.textContent = w + " × " + h + " px";
    metaResolution.textContent = sizeLabel.textContent;

    if (w && h) {
      const ratio = (w / h).toFixed(2);
      let label = ratio;
      if (Math.abs(ratio - (16 / 9)) < 0.01) label += " (16:9)";
      else if (Math.abs(ratio - (4 / 3)) < 0.01) label += " (4:3)";
      else if (Math.abs(ratio - 1) < 0.01) label += " (1:1)";
      metaAspect.textContent = label;
    } else {
      metaAspect.textContent = "–";
    }
  }

  function pushHistory() {
    if (!imageLoaded) return;
    try {
      const dataURL = canvas.toDataURL("image/png");
      history.push(dataURL);
      if (history.length > MAX_HISTORY) history.shift();
      historyState.textContent = history.length + " steps";
      btnUndo.disabled = history.length === 0;
    } catch (e) {
      console.warn("Failed to push history:", e);
    }
  }

  function restoreFromDataURL(dataURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        clearCanvas();
        ctx.drawImage(img, 0, 0);
        updateMeta();
        resolve();
      };
      img.onerror = reject;
      img.src = dataURL;
    });
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history.pop();
    historyState.textContent = history.length + " steps";
    btnUndo.disabled = history.length === 0;
    restoreFromDataURL(last).then(() => {
      statusText.textContent = "ย้อนกลับล่าสุดแล้ว";
    }).catch(() => {
      statusText.textContent = "ไม่สามารถ Undo ได้";
    });
  }

  function applyZoom() {
    const z = parseFloat(zoomRange.value);
    canvasInner.style.transform = "scale(" + z + ")";
    zoomLabel.textContent = Math.round(z * 100) + "%";
  }

  function showSelection() {
    selectionRect.style.display = "block";
    selectionRect.style.left = selection.x + "px";
    selectionRect.style.top = selection.y + "px";
    selectionRect.style.width = selection.w + "px";
    selectionRect.style.height = selection.h + "px";
  }

  function hideSelection() {
    selectionRect.style.display = "none";
    selection.active = false;
    selection.drawing = false;
  }

  function setTool(tool) {
    currentTool = tool;
    toolButtons.forEach(btn => {
      if (btn.dataset.tool === tool) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    metaTool.textContent =
      tool === "pointer" ? "Pointer" :
      tool === "crop" ? "Crop" :
      tool === "brush" ? "Brush" :
      tool === "eraser" ? "Eraser" :
      tool === "text" ? "Text" :
      tool === "shape-rect" ? "Shape (Rect)" :
      tool === "eyedropper" ? "Eyedropper" : tool;

    // Crop & Shape: reset zoom เพื่อให้พิกัดตรง
    if (tool === "crop" || tool === "shape-rect") {
      zoomRange.value = 1;
      applyZoom();
      hideSelection();
      statusText.textContent =
        tool === "crop"
          ? "Crop mode: ลากเพื่อเลือกพื้นที่ แล้วกด Apply Crop"
          : "Shape mode: ลากเพื่อสร้างกรอบสี่เหลี่ยม";
    }

    updateToolSettingsUI();
  }

  function updateToolSettingsUI() {
    settingsBlocks.forEach(block => {
      const list = block.dataset.settings.split(",").map(s => s.trim());
      if (list.includes(currentTool)) block.style.display = "block";
      else block.style.display = "none";
    });
  }

  function fitToView() {
    if (!imageLoaded) return;
    const shellRect = canvasScroll.getBoundingClientRect();
    const margin = 80;
    const maxW = shellRect.width - margin;
    const maxH = shellRect.height - margin;
    const scaleX = maxW / canvas.width;
    const scaleY = maxH / canvas.height;
    const z = Math.min(scaleX, scaleY, 2.5);
    zoomRange.value = Math.max(0.3, z).toFixed(2);
    applyZoom();
    statusText.textContent = "ปรับ Zoom ให้พอดีกับหน้าจอแล้ว";
  }

  function flip(horizontal) {
    if (!imageLoaded) return;
    pushHistory();

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tctx = tempCanvas.getContext("2d");
    tctx.putImageData(imgData, 0, 0);

    clearCanvas();
    ctx.save();
    if (horizontal) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, h);
      ctx.scale(1, -1);
    }
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    statusText.textContent = horizontal ? "พลิกภาพแนวนอนแล้ว" : "พลิกภาพแนวตั้งแล้ว";
  }

  function applyCrop() {
    if (!imageLoaded) return;
    if (!selection.active || currentTool !== "crop") {
      statusText.textContent = "ต้องอยู่ในโหมด Crop และลากพื้นที่ก่อน";
      return;
    }
    if (selection.w < 5 || selection.h < 5) {
      statusText.textContent = "พื้นที่ครอปเล็กเกินไป";
      return;
    }

    pushHistory();

    const sx = Math.round(selection.x);
    const sy = Math.round(selection.y);
    const sw = Math.round(selection.w);
    const sh = Math.round(selection.h);

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = sw;
    tmpCanvas.height = sh;
    const tctx = tmpCanvas.getContext("2d");
    tctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.width = sw;
    canvas.height = sh;
    clearCanvas();
    ctx.drawImage(tmpCanvas, 0, 0);
    hideSelection();
    updateMeta();
    statusText.textContent = "ครอปภาพเรียบร้อย";
  }

  function applyEffect(effect) {
    if (!imageLoaded) return;
    pushHistory();
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    if (effect === "bw") {
      for (let i = 0; i < len; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      statusText.textContent = "แปลงภาพเป็นขาวดำแล้ว";
    } else if (effect === "invert") {
      for (let i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      statusText.textContent = "กลับสี (invert) แล้ว";
    } else if (effect === "warm") {
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, data[i] + 10);
        data[i + 2] = Math.max(0, data[i + 2] - 15);
      }
      statusText.textContent = "ปรับโทนอุ่นเล็กน้อยแล้ว";
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function applyExposureContrast() {
    if (!imageLoaded) return;
    pushHistory();
    const exposure = parseInt(expSlider.value, 10);
    const contrast = parseInt(contrastSlider.value, 10);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    const expFactor = exposure / 100;
    const c = contrast;
    const contrastFactor = (259 * (c + 255)) / (255 * (259 - c || 1));

    for (let i = 0; i < len; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      r = r + 255 * expFactor;
      g = g + 255 * expFactor;
      b = b + 255 * expFactor;

      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imgData, 0, 0);
    statusText.textContent = "ปรับ Exposure / Contrast แล้ว";
    expLabel.textContent = exposure;
    contrastLabel.textContent = contrast;
  }

  function resetFineControls() {
    expSlider.value = 0;
    contrastSlider.value = 0;
    expLabel.textContent = "0";
    contrastLabel.textContent = "0";
  }

  function hardReset() {
    imageLoaded = false;
    history = [];
    clearCanvas();
    fileNameLabel.textContent = "ยังไม่ได้เลือก";
    fileSizeLabel.textContent = "–";
    sizeLabel.textContent = "0 × 0 px";
    metaResolution.textContent = "0 × 0 px";
    metaAspect.textContent = "–";
    metaBitDepth.textContent = "8-bit RGBA (virtual)";
    historyState.textContent = "0 steps";
    btnUndo.disabled = true;
    statusText.textContent = "รีเซ็ตผืนงานทั้งหมดแล้ว";
    zoomRange.value = 1;
    applyZoom();
    hideSelection();
    resetFineControls();
    docName.textContent = "Untitled PNG";
    btnExport.disabled = true;
  }

  function softReset() {
    if (!imageLoaded) {
      hardReset();
      return;
    }
    resetFineControls();
    statusText.textContent = "เคลียร์การปรับ (Effects/Brush ยังอยู่)";
  }

  function onFileSelected(file) {
    fileError.style.display = "none";

    if (!file || file.type !== "image/png") {
      fileError.style.display = "block";
      statusText.textContent = "ไฟล์ไม่ใช่ PNG";
      fileStatusDot.style.background = "#f97373";
      fileStatusDot.style.boxShadow = "0 0 10px rgba(248,113,113,0.9)";
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      clearCanvas();
      ctx.drawImage(img, 0, 0);
      updateMeta();

      imageLoaded = true;
      statusText.textContent = "โหลด PNG สำเร็จแล้ว";
      btnExport.disabled = false;
      fileStatusDot.style.background = "#22c55e";
      fileStatusDot.style.boxShadow = "0 0 10px rgba(34,197,94,0.9)";
      fileNameLabel.textContent = file.name;
      const kb = (file.size / 1024).toFixed(1);
      fileSizeLabel.textContent = kb + " KB";
      metaBitDepth.textContent = "8-bit RGBA (จำลอง)";
      docName.textContent = file.name;

      history = [];
      pushHistory();
      resetFineControls();
      zoomRange.value = 1;
      applyZoom();
      hideSelection();
      URL.revokeObjectURL(url);
    };
    img.onerror = function () {
      statusText.textContent = "ไม่สามารถอ่านไฟล์ได้";
      fileError.style.display = "block";
    };
    img.src = url;
  }

  function exportPNG() {
    if (!imageLoaded) return;
    try {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "bemo-edited.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      statusText.textContent = "บันทึก PNG แล้ว (ดูในโฟลเดอร์ดาวน์โหลด)";
    } catch (e) {
      statusText.textContent = "เบราว์เซอร์ไม่อนุญาตให้ส่งออก";
    }
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function drawStroke(x, y) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = brushOpacity;

    if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = brushColor;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    lastX = x;
    lastY = y;
  }

  function pickColorAt(x, y) {
    if (!imageLoaded) return;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= canvas.width || iy >= canvas.height) {
      statusText.textContent = "อยู่นอกพื้นที่ภาพ";
      return;
    }
    const data = ctx.getImageData(ix, iy, 1, 1).data;
    const r = data[0], g = data[1], b = data[2], a = data[3];

    function toHex(v) {
      return v.toString(16).padStart(2, "0");
    }

    const hex = "#" + toHex(r) + toHex(g) + toHex(b);
    brushColor = hex;
    textColor = hex;
    shapeColor = hex;

    colorPicker.value = hex;
    colorHex.textContent = hex;
    textColorPicker.value = hex;
    textColorHex.textContent = hex;
    shapeColorPicker.value = hex;
    shapeColorHex.textContent = hex;

    if (a === 0) {
      statusText.textContent = "เลือกได้: โปร่งใส (alpha = 0) – สีประมาณ " + hex;
    } else {
      statusText.textContent = "เลือกสีแล้ว: " + hex;
    }
  }

  // ==== Canvas mouse events ====
  canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (!imageLoaded && currentTool !== "pointer") return;

    if (currentTool === "brush" || currentTool === "eraser") {
      painting = true;
      pushHistory();
      const { x, y } = getCanvasCoords(e);
      lastX = x;
      lastY = y;
      drawStroke(x, y);
    } else if (currentTool === "crop" || currentTool === "shape-rect") {
      const rect = canvas.getBoundingClientRect();
      selection.drawing = true;
      selection.active = true;
      selection.x = e.clientX - rect.left;
      selection.y = e.clientY - rect.top;
      selection.w = 0;
      selection.h = 0;
      showSelection();
    } else if (currentTool === "text") {
      const { x, y } = getCanvasCoords(e);
      const t = prompt("พิมพ์ข้อความ:");
      if (!t) return;
      pushHistory();
      ctx.save();
      ctx.fillStyle = textColor;
      const isBold = textBoldCheckbox && textBoldCheckbox.checked;
      ctx.font = (isBold ? "bold " : "") + textSize + "px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(t, x, y);
      ctx.restore();
      statusText.textContent = "เพิ่มข้อความลงบนภาพแล้ว";
    } else if (currentTool === "eyedropper") {
      const { x, y } = getCanvasCoords(e);
      pickColorAt(x, y);
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (painting) {
      const { x, y } = getCanvasCoords(e);
      drawStroke(x, y);
    } else if (selection.drawing) {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      let x = selection.x;
      let y = selection.y;
      let w = cx - selection.x;
      let h = cy - selection.y;

      if (w < 0) {
        x = cx;
        w = selection.x - cx;
      }
      if (h < 0) {
        y = cy;
        h = selection.y - cy;
      }

      selection.x = x;
      selection.y = y;
      selection.w = w;
      selection.h = h;
      showSelection();
    }
  });

  window.addEventListener("mouseup", () => {
    if (painting) {
      painting = false;
      ctx.globalCompositeOperation = "source-over";
    }
    if (selection.drawing) {
      selection.drawing = false;
      if (selection.w < 3 || selection.h < 3) {
        hideSelection();
        statusText.textContent = "พื้นที่เล็กเกินไป";
      } else if (currentTool === "shape-rect") {
        pushHistory();
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.lineWidth = shapeStroke;
        ctx.strokeStyle = shapeColor;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
        ctx.restore();
        hideSelection();
        statusText.textContent = "วาดกรอบสี่เหลี่ยมเรียบร้อย";
      } else if (currentTool === "crop") {
        statusText.textContent = "เลือกพื้นที่แล้ว กด Apply Crop ทางขวา";
      }
    }
  });

  // ==== Controls / UI bindings ====
  btnOpen.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    onFileSelected(file);
  });

  // Drag & drop
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  });

  btnExport.addEventListener("click", exportPNG);
  btnUndo.addEventListener("click", handleUndo);
  btnReset.addEventListener("click", softReset);
  btnHardReset.addEventListener("click", hardReset);

  zoomRange.addEventListener("input", applyZoom);

  toolButtons.forEach(btn => {
    if (btn.classList.contains("disabled")) return;
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (tool) setTool(tool);
    });
  });

  // Crop / transform
  btnActivateCrop.addEventListener("click", () => setTool("crop"));
  btnApplyCrop.addEventListener("click", applyCrop);
  btnCancelCrop.addEventListener("click", () => {
    hideSelection();
    statusText.textContent = "ยกเลิกการครอป/วาดกรอบ";
  });

  btnFlipH.addEventListener("click", () => flip(true));
  btnFlipV.addEventListener("click", () => flip(false));
  btnFitToView.addEventListener("click", fitToView);

  // Effects
  effectButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const effect = btn.dataset.effect;
      if (effect) applyEffect(effect);
    });
  });

  function sliderApplyOnRelease(slider, cb) {
    let isDown = false;
    slider.addEventListener("mousedown", () => { isDown = true; });
    slider.addEventListener("mouseup", () => {
      if (isDown) {
        isDown = false;
        cb();
      }
    });
    slider.addEventListener("touchstart", () => { isDown = true; }, { passive: true });
    slider.addEventListener("touchend", () => {
      if (isDown) {
        isDown = false;
        cb();
      }
    }, { passive: true });
    slider.addEventListener("change", () => {
      if (!isDown) cb();
    });
  }

  sliderApplyOnRelease(expSlider, applyExposureContrast);
  sliderApplyOnRelease(contrastSlider, applyExposureContrast);

  // Brush controls
  colorPicker.addEventListener("input", (e) => {
    brushColor = e.target.value;
    colorHex.textContent = brushColor.toLowerCase();
  });

  brushSizeSlider.addEventListener("input", (e) => {
    brushSize = parseInt(e.target.value, 10) || 1;
    brushSizeLabel.textContent = brushSize + " px";
  });

  brushOpacitySlider.addEventListener("input", (e) => {
    brushOpacity = parseFloat(e.target.value) || 1;
    const pct = Math.round(brushOpacity * 100);
    brushOpacityLabel.textContent = pct + "%";
  });

  // Text controls
  textColorPicker.addEventListener("input", (e) => {
    textColor = e.target.value;
    textColorHex.textContent = textColor.toLowerCase();
  });

  textSizeSlider.addEventListener("input", (e) => {
    textSize = parseInt(e.target.value, 10) || 10;
    textSizeLabel.textContent = textSize + " px";
  });

  // Shape controls
  shapeColorPicker.addEventListener("input", (e) => {
    shapeColor = e.target.value;
    shapeColorHex.textContent = shapeColor.toLowerCase();
  });

  shapeStrokeSlider.addEventListener("input", (e) => {
    shapeStroke = parseInt(e.target.value, 10) || 1;
    shapeStrokeLabel.textContent = shapeStroke + " px";
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
      e.preventDefault();
      handleUndo();
    }
    if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      exportPNG();
    }
  });

  // Initial
  clearCanvas();
  updateMeta();
  applyZoom();
  updateToolSettingsUI();
})();
