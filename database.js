const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mcq.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    testDate TEXT,
    mode TEXT,
    score INTEGER,
    totalQuestions INTEGER,
    tags TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    testId INTEGER,
    questionId INTEGER,
    selectedAnswer TEXT,
    isCorrect BOOLEAN,
    isBookmarked BOOLEAN,
    FOREIGN KEY(testId) REFERENCES tests(id)
  )`);
});

module.exports = db;