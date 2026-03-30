// Simple heart spawner that continuously adds floating heart icons to the page.
const hearts = (function () {
  let intervalId;

  function spawnHeart() {
    const container = document.getElementById('heart-container');
    if (!container) return;
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '♥';
    // Randomise horizontal position and size
    heart.style.left = Math.random() * 100 + '%';
    const size = 12 + Math.random() * 24; // 12px – 36px
    heart.style.fontSize = `${size}px`;
    // Randomise animation duration so some hearts float faster than others
    const duration = 5 + Math.random() * 4; // 5s – 9s
    heart.style.animationDuration = `${duration}s`;
    container.appendChild(heart);
    // Clean up after animation completes
    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }

  return {
    start() {
      // prevent multiple intervals
      if (intervalId) return;
      // spawn initial hearts immediately for immediate effect
      for (let i = 0; i < 10; i++) spawnHeart();
      intervalId = setInterval(spawnHeart, 700);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    },
  };
})();