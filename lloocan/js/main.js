// Main landing page interactions.  Starts heart animations and handles
// transition to the intro page when the user presses the start button.

document.addEventListener('DOMContentLoaded', () => {
  // begin hearts floating on first page
  if (typeof hearts !== 'undefined' && hearts.start) {
    hearts.start();
  }
  const startBtn = document.getElementById('startButton');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // play click sound if defined
      if (typeof playClickSound === 'function') playClickSound();
      // a brief delay before navigating gives time for sound to play
      setTimeout(() => {
        window.location.href = 'intro.html';
      }, 200);
    });
  }
});