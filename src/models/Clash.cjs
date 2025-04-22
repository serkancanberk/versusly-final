const mongoose = require('mongoose');
const { Schema } = mongoose;

// Clash Schema
const clashSchema = new Schema({
  vs_title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  vs_statement: {
    type: String,
    required: [true, 'Statement is required'],
    trim: true,
    minlength: [5, 'Statement must be at least 5 characters long']
  },
  vs_argument: {
    type: String,
    required: [true, 'Argument is required'],
    trim: true,
    minlength: [5, 'Argument must be at least 5 characters long']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Creator artık opsiyonel
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote'
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  expires_at: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [168, 'Duration cannot exceed 1 week (168 hours)']
  }
});

// Pre-save middleware to update 'updated_at'
clashSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Clash model
const Clash = mongoose.model('Clash', clashSchema);

module.exports = Clash;
