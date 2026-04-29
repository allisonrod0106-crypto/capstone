const express = require('express');
const Streak = require('../models/Streak');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/streaks ─────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let streak = await Streak.findOne({ userId: req.user.id });

  if (!streak) {
    return res.json({
      streak: { currentStreak: 0, longestStreak: 0, lastEntryDate: null },
    });
  }

  // Lazy reset: if the user missed a day, reflect that on read
  const isActive =
    streak.lastEntryDate === today || streak.lastEntryDate === yesterday;

  if (!isActive && streak.currentStreak !== 0) {
    streak.currentStreak = 0;
    await streak.save();
  }

  return res.json({
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastEntryDate: streak.lastEntryDate,
    },
  });
});

module.exports = router;
