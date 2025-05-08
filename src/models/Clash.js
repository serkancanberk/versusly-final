import mongoose from "mongoose";

const clashSchema = new mongoose.Schema({
  vs_title: String,
  vs_statement: String,
  vs_argument: String,
  arguments: [
    {
      text: String,
    },
  ],
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
  expires_at: Date,
  status: String,
}, { timestamps: true });

// Add index for tags to improve query performance
clashSchema.index({ tags: 1 });

const Clash = mongoose.model("Clash", clashSchema);

export default Clash;
