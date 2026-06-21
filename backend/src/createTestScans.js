const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Scan = require('./models/Scan');
require('dotenv').config();

async function run() {
  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    // 1. Find or create user
    const email = 'test2@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: 'Test Dashboard User',
        email,
        password: 'password123'
      });
      await user.save();
      console.log('Created test user:', user.name);
    } else {
      console.log('Found existing test user:', user.name);
    }

    // 2. Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '2h'
    });
    console.log('\n--- AUTH TOKEN ---');
    console.log(token);
    console.log('------------------\n');

    // 3. Clear and seed scans for this user to make sure we have distinct data
    await Scan.deleteMany({ user: user._id });
    console.log('Cleared previous scans for this user');

    const now = new Date();
    // Months back helper
    const getPastDate = (monthsAgo, day) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
      return d;
    };

    const scansToSeed = [
      {
        user: user._id,
        type: 'receipt',
        originalFilename: 'wholefoods_june.jpg',
        status: 'ocr_done',
        category: 'Groceries',
        co2Kg: 12.5,
        score: 85,
        createdAt: getPastDate(0, 10) // Current month
      },
      {
        user: user._id,
        type: 'barcode',
        barcodeValue: '001234567890',
        status: 'ocr_done',
        category: 'Beverages',
        co2Kg: 2.3,
        score: 72,
        createdAt: getPastDate(0, 15) // Current month
      },
      {
        user: user._id,
        type: 'flight',
        originalFilename: 'sfo_lax_flight.pdf',
        status: 'ocr_done',
        category: 'Travel',
        co2Kg: 95.0,
        score: 30,
        createdAt: getPastDate(1, 5) // Last month
      },
      {
        user: user._id,
        type: 'product',
        originalFilename: 'organic_milk.jpg',
        status: 'ocr_done',
        category: 'Milk',
        co2Kg: 3.2,
        score: 80,
        createdAt: getPastDate(2, 20) // 2 months ago
      },
      {
        user: user._id,
        type: 'product',
        originalFilename: 'failed_product.jpg',
        status: 'failed',
        errorMessage: 'OCR text was illegible',
        createdAt: getPastDate(1, 12) // Last month
      }
    ];

    await Scan.insertMany(scansToSeed);
    console.log('Seeded 5 scans successfully');

  } catch (err) {
    console.error('Error running seed script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
