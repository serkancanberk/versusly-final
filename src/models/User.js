import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values while maintaining uniqueness
  },
  bio: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to generate a unique nickname
userSchema.statics.generateUniqueNickname = async function(firstName, lastName) {
  // Create base nickname from first name
  const baseNickname = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let nickname = baseNickname;
  let counter = 1;
  
  // Keep trying until we find a unique nickname
  while (true) {
    const existingUser = await this.findOne({ nickname });
    if (!existingUser) {
      return nickname;
    }
    nickname = `${baseNickname}${counter}`;
    counter++;
  }
};

const User = mongoose.model("User", userSchema);

export default User;