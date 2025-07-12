let questions = [];
let currentQuestionIndex = 0;
let answers = [];
let mode = '';
let timer;
let userId = 'user1';
let timeLeft;

// Sample questions (will be replaced when user uploads their own)
const sampleQuestions = [
  {
    id: 1,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    explanation: "Basic addition",
    optionComments: ["Too low", "Correct!", "Too high", "Way too high"],
    tags: ["math", "easy"]
  },
  {
    id: 2,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "France's capital is Paris",
    optionComments: ["That's UK", "That's Germany", "Correct!", "That's Spain"],
    tags: ["geography", "easy"]
  }
];

$(document).ready(() => {
  // Load sample questions if none exist
  if (!localStorage.getItem('mcqs')) {
    localStorage.setItem('mcqs', JSON.stringify(sampleQuestions));
  }
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

// [Rest of your existing functions remain exactly the same]
// [Include all other functions from your original scripts.js]
// [Make sure to keep the same function names and logic]

// Only change needed: Remove all server/database code and rely on localStorage
function saveTestHistory(testData) {
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
  history.push({ id: Date.now(), ...testData });
  localStorage.setItem('testHistory', JSON.stringify(history));
  loadHistory();
}