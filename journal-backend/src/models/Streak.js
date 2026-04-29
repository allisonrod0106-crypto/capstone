const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastEntryDate: {
      type: String, // stored as 'YYYY-MM-DD' for easy date comparison
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Streak', streakSchema);
