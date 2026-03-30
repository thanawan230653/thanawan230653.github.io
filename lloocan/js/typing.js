// Handles typing animation for a list of lines.  Each line is typed one
// character at a time, then fades out before the next line begins.

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeLine(line, elem) {
  for (const char of line) {
    elem.textContent += char;
    // play typing sound on each keystroke if available
    if (typeof playTypingSound === 'function') {
      playTypingSound();
    }
    await delay(settings.typingSpeed);
  }
}

async function runTyping() {
  const elem = document.getElementById('text');
  if (!elem) return;
  // start hearts floating
  if (typeof hearts !== 'undefined' && hearts.start) hearts.start();
  // begin background music if defined
  if (typeof playBackgroundMusic === 'function') playBackgroundMusic();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    await typeLine(line, elem);
    // emphasise certain lines with sound/pop
    if (/กรูชอบมืง/.test(line) && typeof playPopSound === 'function') {
      playPopSound();
    }
    await delay(settings.pauseBetween);
    // fade out current line
    elem.classList.add('fade-out');
    await delay(settings.fadeOutDuration);
    elem.classList.remove('fade-out');
    elem.textContent = '';
  }
  // after finishing all lines, go to credit page after a short pause
  setTimeout(() => {
    window.location.href = 'credit.html';
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  runTyping().catch((err) => console.error(err));
});