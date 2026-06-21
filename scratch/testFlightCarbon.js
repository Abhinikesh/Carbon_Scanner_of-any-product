const { calculateCarbon } = require('../backend/src/utils/carbonEngine');

async function testFlight() {
  try {
    const parsedFields = {
      airportCodes: ['LHR', 'JFK'],
      flightNumber: 'BA173',
      dateGuess: '21-Jun'
    };
    
    console.log('Testing flight calculation between LHR and JFK...');
    const result = await calculateCarbon('flight', parsedFields);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFlight();
