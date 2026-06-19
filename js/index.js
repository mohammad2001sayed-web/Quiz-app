/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 * 
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 * 
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 * 
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */



// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()


// ============================================
// TODO: Create variable to store current quiz
// ============================================
// let currentQuiz = null;


// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure


// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay


// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()


// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)


// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect


// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null


// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message


// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()


import Quiz from './quiz.js';
import Question from './question.js';

// ============================================
// 1. Get DOM Element References
// ============================================
const quizOptionsForm = document.getElementById('quizOptions');
const playerNameInput = document.getElementById('playerName');
const categoryInput = document.getElementById('categoryMenu'); // الهيدن input اللي ui-controls بيملاه
const difficultyOptions = document.getElementById('difficultyOptions'); // الهيدن input التاني
const questionsNumber = document.getElementById('questionsNumber');
const startQuizBtn = document.getElementById('startQuiz');
const questionsContainer = document.getElementById('questionsContainer');

// متغير لحفظ نسخة اللعبة الحالية
let currentQuiz = null;

// ============================================
// 2. FUNCTIONS IMPLEMENTATION
// ============================================

// إظهار اللودينج سبينر في المكان المخصص
function showLoading() {
    questionsContainer.innerHTML = `
        <div class="loading-overlay">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading Questions...</p>
        </div>
    `;
    questionsContainer.style.display = 'block'; // نضمن إنه ظاهر
}

// إخفاء اللودينج سبينر
function hideLoading() {
    const loadingOverlay = questionsContainer.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// إظهار كارت الخطأ لو الـ API فشل
function showError(message) {
    questionsContainer.innerHTML = `
        <div class="game-card error-card">
          <div class="error-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3 class="error-title">Oops! Something went wrong</h3>
          <p class="error-message">${message}</p>
          <button class="btn-play retry-btn" id="retryBtn">
            <i class="fa-solid fa-rotate-right"></i> Try Again
          </button>
        </div>
    `;
    
    // ربط زرار إعادة المحاولة
    document.getElementById('retryBtn').addEventListener('click', resetToStart);
}

// التحقق من صحة عدد الأسئلة (بين 1 و 50)
function validateForm() {
    const value = parseInt(questionsNumber.value, 10);
    if (!questionsNumber.value || isNaN(value)) {
        return { isValid: false, error: 'Please enter the number of questions.' };
    }
    if (value < 1 || value > 50) {
        return { isValid: false, error: 'Number of questions must be between 1 and 50.' };
    }
    return { isValid: true, error: null };
}

// إظهار خطأ أسفل الفورم يختفي بعد 3 ثواني
function showFormError(message) {
    // لو فيه خطأ قديم معروض شيله عشان ميتكرروش
    const oldError = document.querySelector('.form-error');
    if (oldError) oldError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error animate__animated animate__fadeIn';
    errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    
    // إدخاله قبل زرار الـ Start
    startQuizBtn.parentNode.insertBefore(errorDiv, startQuizBtn);
    
    // إخفاء بعد 3 ثواني بـ تأثير fade
    setTimeout(() => {
        errorDiv.classList.replace('animate__fadeIn', 'animate__fadeOut');
        errorDiv.addEventListener('animationend', () => errorDiv.remove());
    }, 3000);
}

// إعادة التطبيق للحالة الأولى (الـ Home)
function resetToStart() {
    questionsContainer.innerHTML = '';
    quizOptionsForm.reset();
    
    // إعادة تعيين قيم الـ custom selects الافتراضية
    document.getElementById('categoryMenu').value = '';
    document.getElementById('difficultyOptions').value = 'easy';
    
    // إظهار الفورم مجدداً وإخفاء مكان الأسئلة
    quizOptionsForm.classList.remove('hidden');
    quizOptionsForm.style.display = 'block';
    currentQuiz = null;
}

// الدالة الأساسية لبدء اللعبة
async function startQuiz() {
    // 1. التحقق من الفورم
    const validation = validateForm();
    if (!validation.isValid) {
        showFormError(validation.error);
        return;
    }
    
    // 2. سحب قيم المدخلات
    const playerName = playerNameInput.value.trim();
    const category = categoryInput.value;
    const difficulty = difficultyOptions.value;
    const numberOfQuestions = questionsNumber.value;
    
    // 3. عمل نسخة من كلاس اللعبة الكبير Quiz
    currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);
    
    // 4. إخفاء الفورم
    quizOptionsForm.classList.add('hidden');
    quizOptionsForm.style.display = 'none';
    
    // 5. إظهار اللودينج
    showLoading();
    
    try {
        // 6. جلب الأسئلة
        const questions = await currentQuiz.getQuestions();
        hideLoading();
        
        if (!questions || questions.length === 0) {
            showError('No questions returned from the server.');
            return;
        }
        
        // 7. إنشاء أول سؤال وتشغيله
        // بنباصي (الـ quiz الحالية، المكان اللي هيرسم فيه، ودالة النهاية عشان لو عوزنا نربط حاجة)
        new Question(currentQuiz, questionsContainer, resetToStart);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ============================================
// 3. ADD EVENT LISTENERS
// ============================================
startQuizBtn.addEventListener('click', startQuiz);

questionsNumber.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // منع الفورم يعمل ريفريش
        startQuiz();
    }
});