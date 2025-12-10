// Typing effect ---------------------------------------------
(function () {
  const el = document.getElementById("typing");
  if (!el) return;

  const text = el.dataset.text || "";
  let i = 0;

  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 70);
    } else {
      // หยุดแสดงเส้นเคอร์เซอร์
      el.style.borderRight = "none";
    }
  }

  type();
})();

// Music player + viz ----------------------------------------
(function () {
  const audio = document.getElementById("audio");
  const btn = document.getElementById("playBtn");
  const viz = document.getElementById("viz");

  if (!audio || !btn || !viz) return;

  const iconPlay = '<i class="fa-solid fa-play"></i> เล่นเพลง';
  const iconPause = '<i class="fa-solid fa-pause"></i> หยุดเพลง';

  btn.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.warn("Audio error:", err);
    }
  });

  audio.addEventListener("play", () => {
    viz.classList.add("playing");
    btn.innerHTML = iconPause;
  });

  function resetBtn() {
    viz.classList.remove("playing");
    btn.innerHTML = iconPlay;
  }

  audio.addEventListener("pause", resetBtn);
  audio.addEventListener("ended", resetBtn);
})();

// Footer year -----------------------------------------------
(function () {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Login + protect contacts ----------------------------------
(function () {
  let isAuthed = false;

  const modal = document.getElementById("loginModal");
  const openBtn = document.getElementById("loginOpen");
  const cancelBtn = document.getElementById("loginCancel");
  const submitBtn = document.getElementById("loginSubmit");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const errEl = document.getElementById("loginErr");

  if (!modal || !openBtn || !cancelBtn || !submitBtn) return;

  const backdrop = modal.querySelector(".modal-backdrop");
  const dialog = modal.querySelector(".modal-dialog");

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    errEl.textContent = "";
    setTimeout(() => emailEl && emailEl.focus(), 50);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  function unlockContacts() {
    document.querySelectorAll('a[data-protect="contact"]').forEach((a) => {
      const href = a.getAttribute("data-href");
      const label = a.getAttribute("data-label");
      if (href) a.setAttribute("href", href);
      if (label) a.textContent = label;
      a.classList.remove("locked");
      a.removeAttribute("data-protect");
    });
  }

  function tryLogin() {
    const email = (emailEl.value || "").trim().toLowerCase();
    const pass = passEl.value || "";

    if (email === "5460kg@gmail.com" && pass === "admin") {
      isAuthed = true;
      errEl.style.color = "var(--success)";
      errEl.textContent = "เข้าสู่ระบบสำเร็จ ✔";
      unlockContacts();
      setTimeout(closeModal, 400);
    } else {
      errEl.style.color = "var(--danger)";
      errEl.textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    }
  }

  submitBtn.addEventListener("click", tryLogin);
  passEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });

  // ถ้าคลิกลิงก์ที่ถูก protect ให้เปิด modal
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[data-protect="contact"]');
    if (!a) return;
    if (!isAuthed) {
      e.preventDefault();
      openModal();
    }
  });
})();

// QR Support modal ------------------------------------------
(function () {
  const modal = document.getElementById("qrModal");
  const openBtn = document.getElementById("supportQrBtn");
  if (!modal || !openBtn) return;

  const backdrop = modal.querySelector(".modal-backdrop");
  const closeBtn = document.getElementById("qrClose");

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
})();
