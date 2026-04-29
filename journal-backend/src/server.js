require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDb } = require('./db/database');

// ─── Route modules ────────────────────────────────────────────────────────────
const usersRouter   = require('./routes/users');
const promptsRouter = require('./routes/prompts');
const entriesRouter = require('./routes/entries');
const streaksRouter = require('./routes/streaks');

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users',   usersRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/streaks', streaksRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Journal API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
