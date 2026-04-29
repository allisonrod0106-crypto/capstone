const Streak = require('../models/Streak');

/**
 * Updates a user's streak after a new entry is saved.
 * - Same day entry  → no change (idempotent)
 * - Previous day    → increment currentStreak
 * - Any other gap   → reset currentStreak to 1
 */
async function updateStreak(userId) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let streak = await Streak.findOne({ userId });

  if (!streak) {
    await Streak.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastEntryDate: today,
    });
    return;
  }

  // Already journaled today — nothing to do
  if (streak.lastEntryDate === today) return;

  const newCurrent = streak.lastEntryDate === yesterday
    ? streak.currentStreak + 1
    : 1;

  const newLongest = Math.max(newCurrent, streak.longestStreak);

  streak.currentStreak = newCurrent;
  streak.longestStreak = newLongest;
  streak.lastEntryDate = today;
  await streak.save();
}

module.exports = { updateStreak };
