/*
  script.js for the 60‑question quiz
  ----------------------------------
  Provides interactive functionality for the quiz page. It handles
  timing, displaying questions, processing user selections, and
  storing results in localStorage for the results page.
*/

let currentQuestion = 0;
let correctCount = 0;
let timerInterval;
let quizStartTime;

/**
 * Starts the quiz timer. Updates the display every second.
 */
function startTimer() {
  quizStartTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - quizStartTime) / 1000);
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    const timeEl = document.getElementById('time');
    if (timeEl) {
      timeEl.textContent = `${minutes}:${seconds}`;
    }
  }, 1000);
}

/**
 * Renders the current question, its category, and answer options.
 */
function showQuestion() {
  const q = questions[currentQuestion];
  // Update progress indicator
  const questionNumberEl = document.getElementById('questionNumber');
  if (questionNumberEl) {
    questionNumberEl.textContent = currentQuestion + 1;
  }
  // Display category and question text
  const categoryEl = document.getElementById('category');
  if (categoryEl) {
    categoryEl.textContent = q.category;
  }
  const questionEl = document.getElementById('question');
  if (questionEl) {
    questionEl.textContent = q.question;
  }
  // Display an image if the question provides an image property
  const imageEl = document.getElementById('questionImage');
  if (imageEl) {
    if (q.image) {
      imageEl.src = q.image;
      imageEl.style.display = 'block';
    } else {
      imageEl.style.display = 'none';
      imageEl.src = '';
    }
  }
  // Render options as buttons
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.textContent = optionText;
    btn.addEventListener('click', () => {
      // Remove selected class from all buttons
      document.querySelectorAll('#options button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const nextButton = document.getElementById('nextBtn');
      if (nextButton) nextButton.disabled = false;
    });
    optionsDiv.appendChild(btn);
  });
  // Disable next button until an option is chosen
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.disabled = true;
}

/**
 * Processes the selected answer and moves to the next question or
 * finishes the quiz.
 */
function handleNext() {
  const selectedBtn = document.querySelector('#options button.selected');
  if (!selectedBtn) return;
  // Determine index of selected option
  const buttons = Array.from(document.querySelectorAll('#options button'));
  const selectedIndex = buttons.indexOf(selectedBtn);
  if (selectedIndex === questions[currentQuestion].answer) {
    correctCount++;
  }
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    // End of quiz: stop timer and store results
    clearInterval(timerInterval);
    const totalTimeSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
    localStorage.setItem('quiz_total', questions.length.toString());
    localStorage.setItem('quiz_correct', correctCount.toString());
    localStorage.setItem('quiz_time', totalTimeSeconds.toString());
    window.location.href = 'result.html';
  }
}

// Initialize quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if there are questions to ask
  if (Array.isArray(questions) && questions.length > 0) {
    startTimer();
    showQuestion();
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', handleNext);
  }
});