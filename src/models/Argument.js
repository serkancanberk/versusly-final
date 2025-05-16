import mongoose from 'mongoose';

const argumentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clash: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clash',
    required: true
  },
  side: {
    type: String,
    enum: ['for', 'against', 'neutral'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
argumentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Argument = mongoose.model('Argument', argumentSchema);

export default Argument; 