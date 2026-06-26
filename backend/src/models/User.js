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
      // Only required for local accounts — Google accounts have no password
      required: function () { return !this.googleId; },
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
    // OAuth / auth provider fields
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,   // sparse index: only indexes docs where googleId is non-null
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Application statistics and dashboards
    totalScans: { type: Number, default: 0 },
    totalCO2: { type: Number, default: 0 },
    carbonHistory: [carbonHistorySchema],
    badges: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    lastScanDate: { type: Date, default: null },
    preferences: {
      pushNotifications: { type: Boolean, default: true }
    },
    currentStreakDays: { type: Number, default: 0 },
    longestStreakDays: { type: Number, default: 0 },
    recycleLookupsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Hash password before saving — only when a password is present AND was modified.
// Google-only accounts (no password field) skip this entirely.
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password (only valid on local accounts that have a password)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
