const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required.'],
      trim: true,
    },
    response: {
      type: String,
      required: [true, 'Response is required.'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast per-user lookups and text search
entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ userId: 1, prompt: 'text', response: 'text' });

module.exports = mongoose.model('Entry', entrySchema);
