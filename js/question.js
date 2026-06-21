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
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    this.wrongAnswers = this.questionData.incorrect_answers.map(ans => this.decodeHtml(ans));
    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15; // العداد 15 ثانية

    // تجهيز متغير صوت الـ Ticking في الذاكرة من البداية لسهولة التحكم فيه وإيقافه
    this.tickAudio = new Audio('./audio/tick.mp3');
    this.tickAudio.volume = 0.15; // صوت هادئ ومناسب للخلفية
    this.tickStarted = false; // flag عشان نضمن إنه يشتغل مرة واحدة بس

    this.displayQuestion();
  }

  // TODO: Create decodeHtml(html) method
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent;
  }

  // TODO: Create shuffleAnswers() method
  shuffleAnswers() {
    const array = [this.correctAnswer, ...this.wrongAnswers];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // TODO: Create getProgress() method
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  // TODO: Create displayQuestion() method
  displayQuestion() {
    const progressPercent = this.getProgress();
    
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
            <i class="fa-solid ${this.quiz.difficulty === 'easy' ? 'fa-face-smile' : this.quiz.difficulty === 'medium' ? 'fa-face-meh' : 'fa-skull'}"></i>
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
          ${this.allAnswers.map((answer, i) => `
            <button class="answer-btn" data-answer="${answer}">
              <span class="answer-key">${i + 1}</span>
              <span class="answer-text">${answer}</span>
            </button>
          `).join('')}
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

    this.container.innerHTML = questionHtml;
    this.addEventListeners();
    this.startTimer();
  }

  // TODO: Create addEventListeners() method
  addEventListeners() {
    const buttons = this.container.querySelectorAll('.answer-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => this.checkAnswer(button));
    });

    this.boundKeyHandler = (e) => {
      const validKeys = ['1', '2', '3', '4'];
      if (validKeys.includes(e.key) && !this.answered) {
        const btnIndex = parseInt(e.key, 10) - 1;
        if (buttons[btnIndex]) {
          this.checkAnswer(buttons[btnIndex]);
        }
      }
    };
    window.addEventListener('keydown', this.boundKeyHandler);
  }

  // TODO: Create removeEventListeners() method
  removeEventListeners() {
    window.removeEventListener('keydown', this.boundKeyHandler);
  }

  // TODO: Create startTimer() method
  startTimer() {
    this.stopTimer();

    const timerValueEl = document.getElementById('timerValue');
    const timerBadgeEl = document.getElementById('timerBadge');

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      
      if (timerValueEl) timerValueEl.textContent = this.timeRemaining;

      // عند الوصول لـ 5 ثواني أو أقل، يتحول اللون للأحمر المثير
      if (this.timeRemaining <= 5 && timerBadgeEl) {
        timerBadgeEl.classList.add('warning');
      }

      // تشغيل صوت التك تك التنازلي "مرة واحدة فقط" عند ثانية 5 لمنع التداخل والسرعة المجنونة
      if (this.timeRemaining <= 5 && this.timeRemaining > 0 && !this.tickStarted) {
        this.tickStarted = true;
        this.tickAudio.play().catch(e => console.log("Autoplay block: ", e));
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // TODO: Create stopTimer() method
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // كتم وإيقاف صوت العداد فوراً لمنعه من الاستمرار في الخلفية أو الانتقال للسؤال القادم
    if (this.tickAudio) {
      this.tickAudio.pause();
      this.tickAudio.currentTime = 0; // إعادة مؤشر الصوت للصفر
    }
  }

  // TODO: Create handleTimeUp() method
  handleTimeUp() {
    this.answered = true;
    this.stopTimer(); 
    this.removeEventListeners();

    this.highlightCorrectAnswer();

    const card = this.container.querySelector('.question-card');
    const timeUpEl = document.createElement('div');
    timeUpEl.className = 'time-up-message animate__animated animate__bounceIn';
    timeUpEl.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
    card.insertBefore(timeUpEl, card.querySelector('.question-text'));

    this.playAudio('wrong');
    this.animateQuestion(500);
  }

  // TODO: Create checkAnswer(choiceElement) method
  checkAnswer(choiceElement) {
    if (this.answered) return;
    this.answered = true;

    this.stopTimer(); 
    this.removeEventListeners();

    const selectedAnswer = choiceElement.getAttribute('data-answer');
    const isCorrect = selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();
    const allButtons = this.container.querySelectorAll('.answer-btn');

    if (isCorrect) {
      choiceElement.classList.add('correct');
      this.quiz.incrementScore();
      this.playAudio('correct');
    } else {
      choiceElement.classList.add('wrong');
      this.highlightCorrectAnswer();
      this.playAudio('wrong');
    }

    allButtons.forEach(btn => btn.classList.add('disabled'));
    this.animateQuestion(500);
  }

  // TODO: Create highlightCorrectAnswer() method
  highlightCorrectAnswer() {
    const allButtons = this.container.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => {
      if (btn.getAttribute('data-answer').toLowerCase() === this.correctAnswer.toLowerCase()) {
        btn.classList.add('correct-reveal');
      }
    });
  }

  // TODO: Create getNextQuestion() method
  getNextQuestion() {
    this.stopTimer();
    this.removeEventListeners();

    const hasMore = this.quiz.nextQuestion();
    
    if (hasMore) {
      new Question(this.quiz, this.container, this.onQuizEnd);
    } else {
      this.container.innerHTML = this.quiz.endQuiz();
      
      const playAgainBtn = document.getElementById('playAgainBtn');
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', this.onQuizEnd);
      }
    }
  }

  // TODO: Create animateQuestion(duration) method
  animateQuestion(duration) {
    this.stopTimer(); 

    setTimeout(() => {
      const card = this.container.querySelector('.question-card');
      if (card) {
        card.classList.add('exit');
      }
      
      setTimeout(() => {
        this.getNextQuestion();
      }, duration);

    }, 1500);
  }

  playAudio(type) {
    let soundPath = '';
    if (type === 'correct') {
      soundPath = './audio/correct.mp3';
    } else if (type === 'wrong') {
      soundPath = './audio/wrong.mp3';
    }

    // الـ tick اتشالت من هنا لأنها اتعالجت فوق باحترافية وانعزلت لوحدها لمنع التداخل
    if (soundPath) {
      const audio = new Audio(soundPath);
      audio.volume = 0.4;
      audio.play().catch(e => {
        console.log("Audio play deferred: ", e);
      });
    }
  }
}