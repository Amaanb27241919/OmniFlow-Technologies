require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const logsRoutes = require('./routes/logs');
const { scheduleCron } = require('./services/executor');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use(authRoutes);
app.use(taskRoutes);
app.use(logsRoutes);

// Start cron scheduler for scheduled tasks
scheduleCron();

// Start the server
app.listen(port, () => {
  console.log(`OmniFlow backend running on port ${port}`);
});
