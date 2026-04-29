const express = require('express');
const Entry = require('../models/Entry');
const { authenticate } = require('../middleware/auth');
const { updateStreak } = require('../utils/streak');

const router = express.Router();

// ─── POST /api/entries ────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const { prompt, response } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required.' });
  }
  if (!response || !response.trim()) {
    return res.status(400).json({ error: 'response is required.' });
  }

  const entry = await Entry.create({
    userId: req.user.id,
    prompt: prompt.trim(),
    response: response.trim(),
  });

  // Update streak — idempotent if already journaled today
  await updateStreak(req.user.id);

  return res.status(201).json({ entry });
});

// ─── GET /api/entries ─────────────────────────────────────────────────────────
// Optional query params:
//   ?search=<text>   — keyword search across prompt + response
//   ?limit=<n>       — results per page (default 20, max 100)
//   ?page=<n>        — page number (default 1)
router.get('/', authenticate, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const filter = { userId: req.user.id };

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [entries, total] = await Promise.all([
    Entry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Entry.countDocuments(filter),
  ]);

  return res.json({
    entries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = router;
