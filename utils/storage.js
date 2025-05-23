// utils/storage.js
const db = require('./db');

// Create a new user
function addUser(username, password) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password) VALUES (?,?)',
      [username, password],
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Fetch a user (returns null if not found)
function getUser(username) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT username, password FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) return reject(err);
          // if no matching row, resolve with null instead of rejecting
          resolve(row || null);
        }
      );
    });
  }

// Create a task, returning the new task object including its ID
function addTask(taskObj) {
  const { task, schedule, status, user } = taskObj;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tasks (task, schedule, status, user) VALUES (?,?,?,?)',
      [task, schedule, status, user],
      function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, task, schedule, status, user });
      }
    );
  });
}

// Update a task’s status and result
function updateTask(taskObj) {
  const { id, status, result } = taskObj;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tasks SET status = ?, result = ? WHERE id = ?',
      [status, result, id],
      err => (err ? reject(err) : resolve())
    );
  });
}

// Get all pending scheduled tasks
function getPendingScheduledTasks() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE status = "pending" AND schedule IS NOT NULL',
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

// Fetch all tasks for a given user
function getUserTasks(user) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE user = ?',
      [user],
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

// Add a log entry
function addLog(logObj) {
  const { user, task, result } = logObj;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO logs (user, task, result) VALUES (?,?,?)',
      [user, task, result],
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Fetch logs for a given user, most recent first
function getUserLogs(user) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM logs WHERE user = ? ORDER BY timestamp DESC',
      [user],
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

module.exports = {
  addUser,
  getUser,
  addTask,
  updateTask,
  getPendingScheduledTasks,
  getUserTasks,
  addLog,
  getUserLogs
};