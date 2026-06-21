const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Scan = require('./models/Scan');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne();
  if (!user) {
    console.error('No users found');
    process.exit(1);
  }

  const result = await Scan.updateMany({}, { $set: { user: user._id } });
  console.log(`Associated ${result.modifiedCount} scans with user ${user.email} (${user._id})`);

  await mongoose.disconnect();
}

main().catch(console.error);
