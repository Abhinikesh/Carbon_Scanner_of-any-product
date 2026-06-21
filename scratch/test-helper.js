const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/User');
const Scan = require('../backend/src/models/Scan');
const jwt = require('jsonwebtoken');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find a user
  const user = await User.findOne();
  if (!user) {
    console.error('No users found in the database. Run the server and sign in/up first.');
    process.exit(1);
  }

  // Generate a valid JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  console.log('\n=======================================');
  console.log('USER:', user.email);
  console.log('TOKEN:', token);
  console.log('=======================================\n');

  // Find scans of each type
  const types = ['product', 'receipt', 'flight', 'barcode'];
  for (const type of types) {
    const scan = await Scan.findOne({ type });
    if (scan) {
      console.log(`TYPE: ${type.toUpperCase()}`);
      console.log(`  ID: ${scan._id}`);
      console.log(`  Category: ${scan.category}`);
      console.log(`  CategoryKey: ${scan.categoryKey}`);
      console.log(`  CO2: ${scan.co2Kg}`);
      console.log(`  Details: ${JSON.stringify(scan.calculationDetails)}`);
      console.log('---------------------------------------');
    } else {
      console.log(`TYPE: ${type.toUpperCase()} -> None found.`);
      console.log('---------------------------------------');
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
