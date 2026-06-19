/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

export default class Question {
  // TODO: Create constructor(quiz, container, onQuizEnd)
  constructor(quiz, container, onQuizEnd) {
    // 1. Store the three parameters
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    // 2. Get question data
    this.questionData = quiz.getCurrentQuestion();

    // 3. Store index
    this.index = quiz.currentQuestionIndex;

    // 4. Decode and store: question, correctAnswer, category
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    // 5. Decode wrong answers (use .map())
    this.wrongAnswers = this.questionData.incorrect_answers.map((ans) =>
      this.decodeHtml(ans),
    );

    // 6. Shuffle all answers
    this.allAnswers = this.shuffleAnswers();

    // 7. Initialize: answered = false, timerInterval = null, timeRemaining
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15; // العداد المطلوب 15 ثانية

    // تشغيل وعرض السؤال فوراً بمجرد بناء الـ Object
    this.displayQuestion();
  }

  // TODO: Create decodeHtml(html) method
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }

  // TODO: Create shuffleAnswers() method
  shuffleAnswers() {
    // 1. Combine wrongAnswers and correctAnswer into one array
    const array = [this.correctAnswer, ...this.wrongAnswers];

    // 2. Shuffle using Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    // 3. Return shuffled array
    return array;
  }

  // TODO: Create getProgress() method
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  // TODO: Create displayQuestion() method
  displayQuestion() {
    const progressPercent = this.getProgress();

    // 1. Create HTML string for the question card
    const questionHtml = `
      <div class="game-card question-card">
        
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty}">
            <i class="fa-solid ${this.quiz.difficulty === "easy" ? "fa-face-smile" : this.quiz.difficulty === "medium" ? "fa-face-meh" : "fa-skull"}"></i>
            <span>${this.quiz.difficulty}</span>
          </div>
          <div class="stat-badge timer" id="timerBadge">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value" id="timerValue">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid">
          ${this.allAnswers
            .map(
              (answer, i) => `
            <button class="answer-btn" data-answer="${answer}">
              <span class="answer-key">${i + 1}</span>
              <span class="answer-text">${answer}</span>
            </button>
          `,
            )
            .join("")}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    // 3. Set this.container.innerHTML = yourHTML
    this.container.innerHTML = questionHtml;

    // 4. Call this.addEventListeners()
    this.addEventListeners();

    // 5. Call this.startTimer()
    this.startTimer();
  }

  // TODO: Create addEventListeners() method
  addEventListeners() {
    // 1. Get all answer buttons
    const buttons = this.container.querySelectorAll(".answer-btn");

    // 2. Add click event to each
    buttons.forEach((button) => {
      button.addEventListener("click", () => this.checkAnswer(button));
    });

    // 3. Add keyboard support (الأرقام 1-4)
    this.boundKeyHandler = (e) => {
      const validKeys = ["1", "2", "3", "4"];
      if (validKeys.includes(e.key) && !this.answered) {
        const btnIndex = parseInt(e.key, 10) - 1;
        if (buttons[btnIndex]) {
          this.checkAnswer(buttons[btnIndex]);
        }
      }
    };
    window.addEventListener("keydown", this.boundKeyHandler);
  }

  // TODO: Create removeEventListeners() method
  removeEventListeners() {
    window.removeEventListener("keydown", this.boundKeyHandler);
  }

  // TODO: Create startTimer() method
  startTimer() {
    // 1. Get timer display element
    const timerValueEl = document.getElementById("timerValue");
    const timerBadgeEl = document.getElementById("timerBadge");

    // 2. Use setInterval to run every 1000ms (1 second)
    this.timerInterval = setInterval(() => {
      // 3. Decrement timeRemaining
      this.timeRemaining--;

      // 4. Update the display
      if (timerValueEl) timerValueEl.textContent = this.timeRemaining;

      // 5. If timeRemaining <= 10 seconds, add 'warning' class (يتحول للون الأحمر)
      if (this.timeRemaining <= 10 && timerBadgeEl) {
        timerBadgeEl.classList.add("warning");
      }

      // تشغيل صوت التك تك التنازلي ورا بعض عند آخر 5 ثواني
      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        this.playAudio("tick");
      }

      // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // TODO: Create stopTimer() method
  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // TODO: Create handleTimeUp() method
  handleTimeUp() {
    // 1. Set answered = true
    this.answered = true;

    // 2. Call removeEventListeners()
    this.removeEventListeners();

    // 3. Show correct answer (add 'correct' class)
    this.highlightCorrectAnswer();

    // 4. Show "TIME'S UP!" message
    const card = this.container.querySelector(".question-card");
    const timeUpEl = document.createElement("div");
    timeUpEl.className = "time-up-message animate__animated animate__bounceIn";
    timeUpEl.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
    card.insertBefore(timeUpEl, card.querySelector(".question-text"));

    // تشغيل صوت الإجابة الخاطئة لانتهاء الوقت
    this.playAudio("wrong");

    // 5. Call animateQuestion() after a delay
    this.animateQuestion(500);
  }

  // TODO: Create checkAnswer(choiceElement) method
  checkAnswer(choiceElement) {
    // 1. If already answered, return early
    if (this.answered) return;

    // 2. Set answered = true
    this.answered = true;

    // 3. Stop the timer
    this.stopTimer();
    this.removeEventListeners();

    // 4. Get selected answer from data-answer attribute
    const selectedAnswer = choiceElement.getAttribute("data-answer");

    // 5. Compare with correctAnswer (case insensitive)
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();
    const allButtons = this.container.querySelectorAll(".answer-btn");

    // 6. If correct: add 'correct' class, call quiz.incrementScore()
    if (isCorrect) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
      this.playAudio("correct"); // تشغيل صوت الإجابة الصحيحة
    } else {
      // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
      this.playAudio("wrong"); // تشغيل صوت الإجابة الخاطئة
    }

    // 8. Disable other buttons (add 'disabled' class)
    allButtons.forEach((btn) => btn.classList.add("disabled"));

    // 9. Call animateQuestion()
    this.animateQuestion(500);
  }

  // TODO: Create highlightCorrectAnswer() method
  highlightCorrectAnswer() {
    // Find the button with correct answer and add 'correct-reveal' class
    const allButtons = this.container.querySelectorAll(".answer-btn");
    allButtons.forEach((btn) => {
      if (
        btn.getAttribute("data-answer").toLowerCase() ===
        this.correctAnswer.toLowerCase()
      ) {
        btn.classList.add("correct-reveal");
      }
    });
  }

  // TODO: Create getNextQuestion() method
  getNextQuestion() {
    // 1. Call quiz.nextQuestion()
    const hasMore = this.quiz.nextQuestion();

    // 2. If returns true: create new Question and display it
    if (hasMore) {
      new Question(this.quiz, this.container, this.onQuizEnd);
    } else {
      // 3. If returns false: show results using quiz.endQuiz()
      this.container.innerHTML = this.quiz.endQuiz();

      // Also add click listener to Play Again button
      const playAgainBtn = document.getElementById("playAgainBtn");
      if (playAgainBtn) {
        playAgainBtn.addEventListener("click", this.onQuizEnd);
      }
    }
  }

  // TODO: Create animateQuestion(duration) method
  animateQuestion(duration) {
    // التعديل الجوهري: نضمن إيقاف العداد تماماً ومسحه من الذاكرة فوراً لمنع التخطي التلقائي للأمام
    this.stopTimer();

    // 1. Wait for 1500ms (transition delay)
    setTimeout(() => {
      const card = this.container.querySelector(".question-card");

      // 2. Add 'exit' class to question card
      if (card) {
        card.classList.add("exit");
      }

      // 3. Wait for duration
      setTimeout(() => {
        // 4. Call getNextQuestion()
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }

  // دالة تشغيل الأصوات المحلية بصيغة mp3 المتطابقة مع الفولدر عندك
  playAudio(type) {
    let soundPath = "";
    if (type === "correct") {
      soundPath = "./audio/correct.mp3";
    } else if (type === "wrong") {
      soundPath = "./audio/wrong.mp3";
    } else if (type === "tick") {
      soundPath = "./audio/tick.mp3";
    }

    const audio = new Audio(soundPath);
    if (type === "tick") {
      audio.volume = 0.15; // صوت التك تك هادي ومناسب للخلفية
    } else {
      audio.volume = 0.4;
    }

    audio.play().catch((e) => {
      console.log("Audio play deferred until user interaction: ", e);
    });
  }
}
