import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema(
  {
    clashId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clash',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reaction: {
      type: String,
      enum: ['nailed_it', 'fair_point', 'neutral', 'really', 'try_again'],
      required: true,
    },
  },
  { timestamps: true }
);

const Reaction = mongoose.model('Reaction', ReactionSchema);

export default Reaction;
