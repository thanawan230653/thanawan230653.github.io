// Centralised sound effects used throughout the site.  By defining these
// here we avoid repeatedly loading the same audio files and can adjust
// properties such as volume and loop settings in one place.

// Load audio files relative to the HTML root.  Browsers require a
// user gesture before playing audio; our event handlers call these
// functions in response to button clicks or typing events.
const _bgm = new Audio('assets/audio/bgm.mp3');
_bgm.loop = true;
_bgm.volume = 0.25;

const _click = new Audio('assets/audio/click.mp3');
_click.volume = 0.5;

const _typing = new Audio('assets/audio/typing.mp3');
_typing.volume = 0.15;

const _pop = new Audio('assets/audio/pop.mp3');
_pop.volume = 0.5;

function playBackgroundMusic() {
  _bgm.play().catch(() => {
    /* Autoplay blocked until user gesture */
  });
}

function playClickSound() {
  // rewind to start for repeated clicks
  _click.currentTime = 0;
  _click.play().catch(() => {});
}

function playTypingSound() {
  _typing.currentTime = 0;
  _typing.play().catch(() => {});
}

function playPopSound() {
  _pop.currentTime = 0;
  _pop.play().catch(() => {});
}