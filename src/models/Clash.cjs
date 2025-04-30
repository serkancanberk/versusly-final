const mongoose = require('mongoose');

const argumentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const clashSchema = new mongoose.Schema({
  vs_title: String,
  vs_statement: String,
  vs_argument: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  votes: [],
  status: { type: String, default: 'active' },
  expires_at: Date,
  duration: Number,
  arguments: [argumentSchema],
  reactions: {
    nailed_it: { type: Number, default: 0 },
    fair_point: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    really: { type: Number, default: 0 },
    try_again: { type: Number, default: 0 }
  }
}, { timestamps: true });

clashSchema.index({ created_at: -1 });

module.exports = mongoose.model('Clash', clashSchema);
