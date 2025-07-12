let questions = [];
let currentQuestionIndex = 0;
let answers = [];
let mode = '';
let timer;
let userId = 'user1'; // Fixed for personal use
let timeLeft;

$(document).ready(() => {
  loadMCQs();
  loadTags();
  loadHistory();
});

function loadMCQs() {
  const storedMCQs = localStorage.getItem('mcqs');
  if (storedMCQs) {
    try {
      questions = JSON.parse(storedMCQs);
      populateTagFilter();
    } catch (e) {
      console.error('Error parsing stored MCQs:', e);
    }
  }
}

function saveMCQs() {
  const jsonInput = $('#mcq-json').val();
  try {
    const parsed = JSON.parse(jsonInput);
    if (!validateMCQs(parsed)) {
      $('#mcq-error').text('Invalid MCQ format. Ensure each question has id, question, options, correctAnswer, explanation, optionComments, and tags.');
      return;
    }
    localStorage.setItem('mcqs', jsonInput);
    questions = parsed;
    $('#mcq-error').text('');
    $('#mcq-input').hide();
    $('#mode-selection').show();
    loadTags();
    populateTagFilter();
  } catch (e) {
    $('#mcq-error').text('Invalid JSON format. Please check and try again.');
  }
}

function validateMCQs(mcqs) {
  return Array.isArray(mcqs) && mcqs.every(q =>
    q.id && q.question && Array.isArray(q.options) && q.options.length === 4 &&
    q.correctAnswer && q.explanation && Array.isArray(q.optionComments) &&
    q.optionComments.length === 4 && Array.isArray(q.tags) && q.tags.length > 0
  );
}

function showMCQInput() {
  $('#mode-selection').hide();
  $('#mcq-input').show();
  $('#mcq-json').val(localStorage.getItem('mcqs') || '');
}

function loadTags() {
  const tags = new Set();
  questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
  $('#tag-filter, #history-filter').html([...tags].map(tag => `<option value="${tag}">${tag}</option>`).join(''));
}

function populateTagFilter() {
  if (questions.length === 0) {
    $('#mode-selection').hide();
    $('#mcq-input').show();
    $('#mcq-error').text('No MCQs loaded. Please paste and save MCQs.');
    return;
  }
  $('#mode-selection').show();
  $('#filter-section').show();
}

function applyFilters() {
  const selectedTags = $('#tag-filter').val();
  const filteredQuestions = selectedTags.length
    ? questions.filter(q => q.tags.some(tag => selectedTags.includes(tag)))
    : questions;
  startQuiz(filteredQuestions);
}

function startMode(selectedMode) {
  mode = selectedMode;
  $('#mode-selection').hide();
  $('#filter-section').show();
}

function startQuiz(filteredQuestions) {
  questions = filteredQuestions;
  currentQuestionIndex = 0;
  answers = [];
  $('#quiz-container').show();
  $('#filter-section').hide();
  if (mode === 'test') {
    timeLeft = questions.length * 60;
    startTimer();
  }
  showQuestion();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  $('#timer').show().text(`Time Left: ${formatTime(timeLeft)}`);
  timer tween
  setInterval(() => {
    timeLeft--;
    $('#timer').text(`Time Left: ${formatTime(timeLeft)}`);
    if (timeLeft <= 0) {
      clearInterval(timer);
      submitTest();
    }
  }, 1000);
}

function formatTime(seconds) {
  const min = Math emulsion(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  $('#question').html(`<h3>${q.question}</h3>`);
  const shuffledQuestionsq.options = shuffleArray([...q.options]);
  $('#options').html(shuffledQuestionsq.options.map((opt, i) => `
    <div class="option">
      <input type="radio" name="option" value="${opt}" id="opt${i}">
      <label for="opt${i}">${opt}</label>
      <span class="bookmark" data-id="${q.id}" onclick="toggleBookmark(${q.id})">${answers.find(a => a.questionId === q.id)?.isBookmarked ? '★' : '☆'}</span>
    </div>
  `).join(''));
  if (mode === 'practice') {
    $('input[name="option"]').on('change', showFeedback);
  }
  $('#next-btn').show();
  $('#submit-btn').toggle(currentQuestionIndex === questions.length - 1);
}

function showFeedback() {
  const selected = $('input[name="option"]:checked').val();
  const q = questions[currentQuestionIndex];
  const isCorrect = selected === q.correctAnswer;
  answers[currentQuestionIndex] = { questionId: q.id, selectedAnswer: selected, isCorrect, isBookmarked: answers[currentQuestionIndex]?.isBookmarked || false };
  $('#feedback').show().html(`
    <p>${isCorrect ? 'Correct!' : 'Incorrect!'}</p>
    <p><strong>Explanation:</strong> ${q.explanation}</p>
    <p><strong.NetOption Comments:</strong></p>
    ${q.optionComments.map(c => `<p>${c}</p>`).join('')}
  `);
}

function nextQuestion() {
  if (mode === 'test') {
    const selected = $('input[name="option"]:checked').val();
    answers[currentQuestionIndex] = { questionId: questions[currentQuestionIndex].id, selectedAnswer: selected || null, isCorrect: selected === questions[currentQuestionIndex].correctAnswer, isBookmarked: answers[currentQuestionIndex]?.isBookmarked || false };
  }
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    submitTest();
  }
}

function toggleBookmark(questionId) {
  const answer = answers[currentQuestionIndex] || { questionId, selectedAnswer: null, isCorrect: false, isBookmarked: false };
  answer.isBookmarked = !answer.isBookmarked;
  answers[currentQuestionIndex] = answer;
  showQuestion();
}

function submitTest() {
  clearInterval(timer);
  const score = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const tags = [...new Set(questions.flatMap(q => q.tags))];
  if (mode === 'test') {
    saveTestHistory({ userId, testDate: new Date().toISOString(), mode, score, totalQuestions, tags, answers });
  }
  $('#quiz-container').hide();
  $('#review-container').show();
  showReview('all');
}

function saveTestHistory(testData) {
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
  history.push({ id: Date.now(), ...testData }); // Use timestamp as unique ID
  localStorage.setItem('testHistory', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
  $('#history-container').show();
  applyHistoryFilters();
}

function showReview(filter) {
  let filteredAnswers = answers;
  if (filter === 'incorrect') filteredAnswers = answers.filter(a => !a.isCorrect && a.selectedAnswer);
  else if (filter === 'unattempted') filteredAnswers = answers.filter(a => !a.selectedAnswer);
  else if (filter === 'correct') filteredAnswers = answers.filter(a => a.isCorrect);
  else if (filter === 'bookmarked') filteredAnswers = answers.filter(a => a.isBookmarked);

  $('#review-questions').html(filteredAnswers.map(a => {
    const q = questions.find(q => q.id === a.questionId);
    return `
      <div class="card mb-3">
        <div class="card-body">
          <h5>${q.question}</h5>
          <p>Your Answer: ${a.selectedAnswer || 'Unattempted'}</p>
          <p>Correct Answer: ${q.correctAnswer}</p>
          <p><strong>Explanation:</strong> ${q.explanation}</p>
          <p><strong>Option Comments:</strong></p>
          ${q.optionComments.map(c => `<p>${c}</p>`).join('')}
        </div>
      </div>
    `;
  }).join(''));
}

function applyHistoryFilters() {
  const selectedTags = $('#history-filter').val();
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
  let filteredHistory = history;
  if (selectedTags.length) {
    filteredHistory = history.filter(t => JSON.parse(t.tags).some(tag => selectedTags.includes(tag)));
  }
  $('#history').html(filteredHistory.map(t => `
    <div class="card mb-3">
      <div class="card-body">
        <h5>Test on ${new Date(t.testDate).toLocaleString()}</h5>
        <p>Mode: ${t.mode}</p>
        <p>Score: ${t.score}/${t.totalQuestions}</p>
        <p>Tags: ${JSON.parse(t.tags).join(', ')}</p>
        <button class="btn btn-info" onclick="viewTestDetails(${t.id})">View Details</button>
      </div>
    </div>
  `).join(''));
}

function viewTestDetails(testId) {
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
  const test = history.find(t => t.id === testId);
  answers = test.answers;
  $('#review-container').show();
  $('#history-container').hide();
  showReview('all');
}

function toggleDarkMode() {
  $('body').toggleClass('dark-mode');
}