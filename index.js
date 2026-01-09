/* Typing effect */
(function () {
  const el = document.getElementById('typing');
  if (!el) return;
  const base = el.getAttribute('data-text') || '';
  let i = 0;
  function type() {
    if (i <= base.length) {
      el.textContent = base.slice(0, i);
      i++;
      setTimeout(type, 65);
    } else {
      el.style.borderRight = '0';
    }
  }
  type();
})();

/* Music player + viz */
(function () {
  const audio = document.getElementById('audio');
  const btn = document.getElementById('playBtn');
  const viz = document.getElementById('viz');
  if (!audio || !btn || !viz) return;

  btn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (e) {
      console.warn(e);
    }
  });

  audio.addEventListener('play', () => {
    viz.classList.add('playing');
    btn.textContent = '⏸️ หยุดชั่วคราว';
  });
  audio.addEventListener('pause', () => {
    viz.classList.remove('playing');
    btn.textContent = '▶️ เล่นเพลง';
  });
  audio.addEventListener('ended', () => {
    viz.classList.remove('playing');
    btn.textContent = '▶️ เล่นเพลง';
  });
})();

/* Year */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===== Login + Protect contacts ===== */
(function () {
  let isAuthed = false;

  const modal = document.getElementById('loginModal');
  const openBtn = document.getElementById('loginOpen');
  const cancelBtn = document.getElementById('loginCancel');
  const submitBtn = document.getElementById('loginSubmit');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const errEl = document.getElementById('loginErr');

  if (!modal || !openBtn || !cancelBtn || !submitBtn || !emailEl || !passEl || !errEl) return;

  function open() {
    modal.classList.add('open');
    errEl.textContent = '';
    setTimeout(() => emailEl.focus(), 50);
  }
  function close() {
    modal.classList.remove('open');
  }

  openBtn.addEventListener('click', open);
  cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // ถ้าคลิกลิงก์ contact แล้วไม่ล็อกอิน → เปิด modal
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-protect="contact"]');
    if (!a) return;
    if (!isAuthed) {
      e.preventDefault();
      open();
    }
  });

  function unlockContacts() {
    document.querySelectorAll('a[data-protect="contact"]').forEach((a) => {
      const href = a.getAttribute('data-href');
      const label = a.getAttribute('data-label');
      if (href) a.setAttribute('href', href);
      if (label) a.textContent = label;
      a.classList.remove('locked');
      a.removeAttribute('data-protect');
    });
  }

  function tryLogin() {
    const email = (emailEl.value || '').trim().toLowerCase();
    const pass = passEl.value || '';

    // ตรงนี้ถ้าจะเปลี่ยน user/pass ให้แก้เองได้
    if (email === '5460kg@gmail.com' && pass === 'admin') {
      isAuthed = true;
      errEl.style.color = '#b8ffc4';
      errEl.textContent = 'เข้าสู่ระบบสำเร็จ ✔';
      unlockContacts();
      setTimeout(() => {
        close();
      }, 400);
    } else {
      errEl.style.color = '#ffb4b4';
      errEl.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
  }

  submitBtn.addEventListener('click', tryLogin);
  passEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryLogin();
  });
})();

/* ===== QR Support Modal ===== */
(function () {
  const btn = document.getElementById('supportQrBtn');
  const modal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('qrClose');
  if (!btn || !modal || !closeBtn) return;

  function openModal() {
    modal.classList.add('open');
  }
  function closeModal() {
    modal.classList.remove('open');
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
})();
