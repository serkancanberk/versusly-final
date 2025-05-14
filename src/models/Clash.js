import mongoose from "mongoose";

const clashSchema = new mongoose.Schema({
  vs_title: String,
  vs_statement: String,
  vs_argument: String,
  Clash_arguments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
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
      }
    }
  ],
  sideLabels: {
    type: {
      sideA: {
        label: String,
        value: String
      },
      sideB: {
        label: String,
        value: String
      },
      neutral: {
        label: String,
        value: String
      }
    },
    default: {
      sideA: { label: "Side A", value: "for" },
      sideB: { label: "Side B", value: "against" },
      neutral: { label: "Neutral", value: "neutral" }
    }
  },
  side: String,
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return Array.isArray(tags) && tags.every(tag => typeof tag === 'string' && tag.trim().length > 0);
      },
      message: 'Tags must be an array of non-empty strings'
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    side: {
      type: String,
      enum: ['for', 'against', 'neutral'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  expires_at: Date,
  status: String,
}, { timestamps: true });

// Add index for tags to improve query performance
clashSchema.index({ tags: 1 });

const Clash = mongoose.model("Clash", clashSchema);

export default Clash;
