const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Writing prompts — stored in-memory (no DB needed; easy to extend to a DB later)
const PROMPTS = [
  { id: 1, text: "What are three things you're genuinely grateful for today, and why?", theme: "gratitude" },
  { id: 2, text: "Describe a challenge you're currently facing. What's one small step you could take toward solving it?", theme: "goal-setting" },
  { id: 3, text: "What emotion has been most present for you today? Where do you feel it in your body?", theme: "self-reflection" },
  { id: 4, text: "Who has positively influenced your life recently, and what did they do?", theme: "gratitude" },
  { id: 5, text: "What's a belief you hold today that you didn't hold five years ago?", theme: "self-reflection" },
  { id: 6, text: "If you could give your past self one piece of advice, what would it be?", theme: "self-reflection" },
  { id: 7, text: "What does your ideal day look like? How close was today to that?", theme: "goal-setting" },
  { id: 8, text: "Describe something that made you smile or laugh recently.", theme: "gratitude" },
  { id: 9, text: "What is one habit you want to build, and why does it matter to you?", theme: "goal-setting" },
  { id: 10, text: "What is something you've been avoiding? What's holding you back?", theme: "self-reflection" },
  { id: 11, text: "Write about a moment this week when you felt truly present.", theme: "self-reflection" },
  { id: 12, text: "What are you most proud of accomplishing in the last month?", theme: "gratitude" },
  { id: 13, text: "What does success mean to you right now, in this season of your life?", theme: "goal-setting" },
  { id: 14, text: "Describe a fear you have. What would happen if you leaned into it?", theme: "self-reflection" },
  { id: 15, text: "Who do you want to become in the next year? What's one action you can take today?", theme: "goal-setting" },
];

// ─── GET /api/prompts/daily ───────────────────────────────────────────────────
// Deterministic per user per calendar day — rotates at midnight.
router.get('/daily', authenticate, (req, res) => {
  const dayOfYear = getDayOfYear(new Date());
  // Use a simple hash of userId string for variety across users
  const userSeed = [...req.user.id.toString()].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const index = (dayOfYear + userSeed) % PROMPTS.length;
  const prompt = PROMPTS[index];

  return res.json({
    prompt,
    date: new Date().toISOString().slice(0, 10),
  });
});

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
}

module.exports = router;
