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
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Preserved fields for application statistics and dashboards
    googleId: { type: String },
    totalScans: { type: Number, default: 0 },
    totalCO2: { type: Number, default: 0 },
    carbonHistory: [carbonHistorySchema],
    badges: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    lastScanDate: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving with 10 salt rounds
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
