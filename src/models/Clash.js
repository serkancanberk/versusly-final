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
  tags: [String],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expires_at: Date,
  status: String,
}, { timestamps: true });

const Clash = mongoose.model("Clash", clashSchema);

export default Clash;
