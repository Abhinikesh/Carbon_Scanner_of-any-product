const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const carbonHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  co2: { type: Number, required: true },
  category: { type: String, required: true },
  item: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    googleId: { type: String },
    totalScans: { type: Number, default: 0 },
    totalCO2: { type: Number, default: 0 },
    carbonHistory: [carbonHistorySchema],
    badges: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    lastScanDate: { type: Date },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
