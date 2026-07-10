// End-to-end test: Simulate Bot booking submission to Firebase
const https = require('https');

const DB_URL = 'macau-app-default-rtdb.asia-southeast1.firebasedatabase.app';
const FB_KEY = 'test_bot_e2e_' + Date.now();
const NOW = Date.now();

const booking = {
  _fbKey: FB_KEY,
  _updatedAt: NOW,
  guestName: '測試客人',
  casino: '新濠天地',
  hotel: '新濠天地',
  roomCode: 'CT-EXEC',
  roomType: '行政套房',
  checkIn: '2026-07-15',
  checkOut: '2026-07-17',
  nights: 2,
  roomCount: 1,
  status: 'confirmed',
  compType: 'full',
  transfer: 'airport',
  phone: '12345678',
  flight: 'CX123',
  special: '測試備註',
  agent: 'Bot測試',
  totalCost: 0,
  threshold: 800000,
  source: 'telegram_bot',
  createdBy: 'bot_test'
};

const botLog = {
  timestamp: NOW,
  userId: 12345,
  username: 'test_user',
  action: 'create_booking',
  bookingKey: FB_KEY,
  guestName: '測試客人',
  casino: '新濠天地',
  hotel: '新濠天地',
  roomType: '行政套房'
};

function fbPut(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: DB_URL,
      path: '/booking_data/' + path + '.json',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (d) => chunks += d);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fbGet(path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: DB_URL, path: '/booking_data/' + path + '.json', method: 'GET' };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (d) => chunks += d);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.end();
  });
}

function fbDelete(path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: DB_URL, path: '/booking_data/' + path + '.json', method: 'DELETE' };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (d) => chunks += d);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=== E2E Test: Bot → Firebase → Web ===\n');

  // Step 1: Bot writes booking
  console.log('1. Bot writes booking to Firebase...');
  console.log('   Key:', FB_KEY);
  const writeResult = await fbPut('bookings/' + FB_KEY, booking);
  console.log('   Status:', writeResult.status);
  console.log('   Response:', writeResult.body.substring(0, 100));
  console.log('   ' + (writeResult.status === 200 ? '✅ PASS' : '❌ FAIL') + '\n');

  // Step 2: Read back (simulating Web watcher)
  console.log('2. Web reads booking from Firebase (simulating watcher)...');
  const readResult = await fbGet('bookings/' + FB_KEY);
  const readData = JSON.parse(readResult.body);
  console.log('   Status:', readResult.status);
  console.log('   guestName:', readData.guestName);
  console.log('   casino:', readData.casino);
  console.log('   roomType:', readData.roomType);
  console.log('   _fbKey match:', readData._fbKey === FB_KEY);
  console.log('   ' + (readData.guestName === '測試客人' && readData._fbKey === FB_KEY ? '✅ PASS' : '❌ FAIL') + '\n');

  // Step 3: Bot writes log
  console.log('3. Bot writes operation log...');
  const logResult = await fbPut('botLogs/' + FB_KEY, botLog);
  console.log('   Status:', logResult.status);
  console.log('   ' + (logResult.status === 200 ? '✅ PASS' : '❌ FAIL') + '\n');

  // Step 4: Read all bookings (simulating syncDownloadAll)
  console.log('4. Web downloads all bookings (syncDownloadAll)...');
  const allResult = await fbGet('bookings');
  const allData = JSON.parse(allResult.body);
  const bookingCount = allData ? Object.keys(allData).length : 0;
  console.log('   Total bookings in Firebase:', bookingCount);
  console.log('   Test booking present:', allData && allData[FB_KEY] ? 'Yes' : 'No');
  console.log('   ' + (allData && allData[FB_KEY] ? '✅ PASS' : '❌ FAIL') + '\n');

  // Step 5: Cleanup - delete test data
  console.log('5. Cleanup: Deleting test data...');
  await fbDelete('bookings/' + FB_KEY);
  await fbDelete('botLogs/' + FB_KEY);
  const verifyDeleted = await fbGet('bookings/' + FB_KEY);
  console.log('   Deleted:', verifyDeleted.body === 'null' ? 'Yes' : 'No');
  console.log('   ' + (verifyDeleted.body === 'null' ? '✅ PASS' : '❌ FAIL') + '\n');

  console.log('=== E2E Test Complete ===');
  console.log('Firebase RTDB path: booking_data/');
  console.log('Web URL: https://prada741126-ship-it.github.io/booking-system-pages/');
  console.log('Bot can write → Firebase stores → Web can read ✅');
}

runTest().catch(console.error);
