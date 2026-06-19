/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 * 
 * This class manages the entire quiz game state.
 * 
 * PROPERTIES TO CREATE:
 * - category (string) - The selected category ID
 * - difficulty (string) - easy, medium, or hard
 * - numberOfQuestions (number) - How many questions
 * - playerName (string) - The player's name
 * - score (number) - Current score, starts at 0
 * - questions (array) - Questions from API, starts empty
 * - currentQuestionIndex (number) - Which question we're on, starts at 0
 * 
 * METHODS TO IMPLEMENT:
 * - constructor(category, difficulty, numberOfQuestions, playerName)
 * - async getQuestions() - Fetch questions from API
 * - buildApiUrl() - Create the API URL with parameters
 * - incrementScore() - Add 1 to score
 * - getCurrentQuestion() - Get the current question object
 * - nextQuestion() - Move to next question, return true/false
 * - isComplete() - Check if quiz is finished
 * - getScorePercentage() - Calculate percentage (0-100)
 * - saveHighScore() - Save to localStorage
 * - getHighScores() - Load from localStorage
 * - isHighScore() - Check if current score qualifies
 * - endQuiz() - Generate results screen HTML
 * 
 */


/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 */

export default class Quiz {
  
  // 1. الـ Constructor: تهيئة كل البيانات الأساسية للعبة
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = Number(numberOfQuestions); // نضمن إنه رقم
    this.playerName = playerName || 'Player'; // لو مفيش اسم نخليه Player افتراضي
    
    this.score = 0;
    this.questions = []; // هتشيل الأسئلة القادمة من الـ API
    this.currentQuestionIndex = 0;
  }
  
  // 2. بناء رابط الـ API باستخدام URLSearchParams
  buildApiUrl() {
    const baseUrl = 'https://opentdb.com/api.php';
    const params = new URLSearchParams({
        amount: this.numberOfQuestions
    });
    
    // لو اخترنا Category معينة ضيفها للرابط (لو فاضية سيبها عشوائي)
    if (this.category) params.append('category', this.category);
    // لو اخترنا صعوبة معينة ضيفها
    if (this.difficulty) params.append('difficulty', this.difficulty);
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  // 3. جلب الأسئلة من الـ API
  async getQuestions() {
    const url = this.buildApiUrl();
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch questions from API');
    }
    
    const data = await response.json();
    
    // التأكد من أن الـ API رجع داتا بنجاح (response_code === 0)
    if (data.response_code === 0) {
        this.questions = data.results;
        return this.questions;
    } else {
        throw new Error('No questions found for these options. Try reducing amount.');
    }
  }
  
  // 4. زيادة الـ Score بمقدار 1
  incrementScore() {
    this.score++;
  }
  
  // 5. الحصول على كائن السؤال الحالي
  getCurrentQuestion() {
    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
        return this.questions[this.currentQuestionIndex];
    }
    return null;
  }
  
  // 6. الانتقال للسؤال التالي
  nextQuestion() {
    this.currentQuestionIndex++;
    return !this.isComplete(); // يرجع true لو لسه فيه أسئلة، و false لو خلصنا
  }
  
  // 7. التأكد هل اللعبة انتهت أم لا
  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }
  
  // 8. حساب النسبة المئوية لدرجة المستخدم
  getScorePercentage() {
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }
  
  // 9. تحميل قائمة الـ High Scores من الـ LocalStorage
  getHighScores() {
    try {
        const scores = localStorage.getItem('quizHighScores');
        return scores ? JSON.parse(scores) : [];
    } catch (error) {
        console.error("Error reading high scores:", error);
        return [];
    }
  }
  
  // 10. التأكد هل السكور الحالي يدخل قائمة التوب 10؟
  isHighScore() {
    const highScores = this.getHighScores();
    const currentPercentage = this.getScorePercentage();
    
    if (highScores.length < 10) return true;
    
    const lowestScore = highScores[highScores.length - 1].percentage;
    return currentPercentage > lowestScore;
  }
  
  // 11. حفظ السكور الجديد في الـ LocalStorage
  saveHighScore() {
    const highScores = this.getHighScores();
    const newScoreObj = {
        name: this.playerName,
        score: this.score,
        total: this.numberOfQuestions,
        percentage: this.getScorePercentage(),
        difficulty: this.difficulty,
        date: new Date().toLocaleDateString()
    };
    
    highScores.push(newScoreObj);
    highScores.sort((a, b) => b.percentage - a.percentage); // الترتيب من الأعلى للأقل
    
    const topTen = highScores.slice(0, 10); // احتفظ بأول 10 بس
    localStorage.setItem('quizHighScores', JSON.stringify(topTen));
  }
  
  // 12. شاشة نهاية اللعبة وعرض النتائج (مأخوذة من نفس هيكل الـ HTML المطلوب)
  endQuiz() {
    const percentage = this.getScorePercentage();
    if (this.isHighScore()) {
        this.saveHighScore();
    }
    
    const allHighScores = this.getHighScores();
    
    // رسم جدول الـ Leaderboard التوب 10
    const leaderboardItems = allHighScores.map((s, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
          <li class="leaderboard-item ${rankClass}">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${s.name}</span>
            <span class="leaderboard-score">${s.percentage}%</span>
          </li>
        `;
    }).join('');

    return `
        <div class="game-card results-card animate__animated animate__zoomIn">
          <h2 class="results-title">Quiz Complete!</h2>
          <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
          <p class="results-percentage">${percentage}% Accuracy</p>
          
          ${this.isHighScore() ? `
          <div class="new-record-badge">
            <i class="fa-solid fa-star"></i> New High Score!
          </div>` : ''}
          
          <div class="leaderboard">
            <h4 class="leaderboard-title">
              <i class="fa-solid fa-trophy"></i> Leaderboard
            </h4>
            <ul class="leaderboard-list">
              ${leaderboardItems}
            </ul>
          </div>
          
          <div class="action-buttons">
            <button class="btn-restart" id="playAgainBtn">
              <i class="fa-solid fa-rotate-right"></i> Play Again
            </button>
          </div>
        </div>
    `;
  }
}