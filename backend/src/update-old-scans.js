const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Scan = require('./models/Scan');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Update product scan
  const productScan = await Scan.findOne({ type: 'product' });
  if (productScan) {
    productScan.category = 'Leather Goods';
    productScan.categoryKey = 'leather';
    productScan.co2Kg = 15.0;
    productScan.score = 75;
    await productScan.save();
    console.log('Updated product scan');
  }

  // Update receipt scan
  const receiptScan = await Scan.findOne({ type: 'receipt' });
  if (receiptScan) {
    receiptScan.category = 'Groceries';
    receiptScan.categoryKey = 'groceries';
    receiptScan.co2Kg = 7.5;
    receiptScan.score = 90;
    await receiptScan.save();
    console.log('Updated receipt scan');
  }

  // Update flight scan (under short-haul threshold for rail alternative testing)
  const flightScan = await Scan.findOne({ type: 'flight' });
  if (flightScan) {
    flightScan.category = 'Flight (LHR → CDG)';
    flightScan.categoryKey = 'flight';
    flightScan.co2Kg = 60.4;
    flightScan.score = 80;
    flightScan.calculationDetails = { distanceKm: 400, calculationMethod: 'distance-based' };
    await flightScan.save();
    console.log('Updated flight scan');
  }

  // Update barcode scan (beef product for swap testing)
  const barcodeScan = await Scan.findOne({ type: 'barcode' });
  if (barcodeScan) {
    barcodeScan.category = 'Organic Ribeye';
    barcodeScan.categoryKey = 'beef';
    barcodeScan.co2Kg = 60.0;
    barcodeScan.score = 15;
    barcodeScan.calculationDetails = { calculationMethod: 'openfoodfacts-agribalyse' };
    await barcodeScan.save();
    console.log('Updated barcode scan');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
