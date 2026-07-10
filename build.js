/**
 * build.js — Build Script for BookingHub
 * v2.0.0 (v8 spec)
 * Combines all CSS and JS source files into a single dist/index.html
 * Runs automated tests after build
 * Usage: node build.js
 */

var fs = require('fs');
var path = require('path');

/* ===== Configuration ===== */
var ROOT = __dirname;
var DIST_DIR = path.join(ROOT, 'dist');
var TEMPLATE = path.join(ROOT, 'template.html');

var CSS_FILES = [
  'css/variables.css',
  'css/layout.css',
  'css/components.css',
  'css/mobile.css'
];

var JS_FILES = [
  /* Core layer */
  'src/core/constants.js',
  'src/core/events.js',
  'src/core/state.js',
  'src/core/store.js',
  'src/core/utils.js',
  'src/core/auth.js',
  'src/core/router.js',
  'src/core/app.js',
  /* Sync layer */
  'src/sync/recently-deleted.js',
  'src/sync/merger.js',
  'src/sync/firebase.js',
  'src/sync/uploader.js',
  'src/sync/watchers.js',
  /* Data layer */
  'src/data/hotels.js',
  'src/data/bookings.js',
  'src/data/agents.js',
  'src/data/employees.js',
  'src/data/archives.js',
  'src/data/backup.js',
  /* Calc layer */
  'src/calc/filters.js',
  'src/calc/stats.js',
  /* UI layer */
  'src/ui/keyboard.js',
  'src/ui/toast.js',
  'src/ui/modal.js',
  /* Page layer — v8: 7 pages */
  'src/pages/overview.js',
  'src/pages/profit.js',
  'src/pages/fees.js',
  'src/pages/agent-performance.js',
  'src/pages/archives.js',
  'src/pages/employees.js',
  'src/pages/hotel-config.js',
  /* Bridge layer */
  'src/bridge/bridge.js'
];

/* External scripts to include before inlined JS */
var EXTERNAL_SCRIPTS = [
  { src: 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js', defer: true },
  { src: 'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-app-compat.min.js', defer: true },
  { src: 'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-auth-compat.min.js', defer: true },
  { src: 'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-database-compat.min.js', defer: true }
];

/* ===== Helpers ===== */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error('[BUILD ERROR] Cannot read file:', filePath);
    console.error(e.message);
    process.exit(1);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/* ===== Build ===== */
function build() {
  console.log('');
  console.log('========================================');
  console.log('  BookingHub Build System v2.0.0');
  console.log('========================================');
  console.log('');

  /* 1. Read template */
  console.log('[1/5] Reading template.html...');
  var html = readFile(TEMPLATE);

  /* 2. Read and combine CSS */
  console.log('[2/5] Combining CSS files...');
  var cssContent = '';
  for (var i = 0; i < CSS_FILES.length; i++) {
    var cssPath = path.join(ROOT, CSS_FILES[i]);
    var css = readFile(cssPath);
    cssContent += '\n/* ===== ' + CSS_FILES[i] + ' ===== */\n' + css + '\n';
    console.log('       + ' + CSS_FILES[i] + ' (' + css.length + ' bytes)');
  }
  var cssTag = '<style>\n' + cssContent + '\n</style>';
  html = html.replace('<!-- {{CSS}} -->', cssTag);

  /* 3. Read and combine JS */
  console.log('[3/5] Combining JS files...');
  var jsContent = '';

  /* External scripts first */
  for (var e = 0; e < EXTERNAL_SCRIPTS.length; e++) {
    var ext = EXTERNAL_SCRIPTS[e];
    jsContent += '<script src="' + ext.src + '"' + (ext.defer ? ' defer' : '') + '></script>\n';
  }

  /* Inlined source files */
  for (var j = 0; j < JS_FILES.length; j++) {
    var jsPath = path.join(ROOT, JS_FILES[j]);
    var js = readFile(jsPath);
    jsContent += '\n<!-- ===== ' + JS_FILES[j] + ' ===== -->\n<script>\n' + js + '\n</script>\n';
    console.log('       + ' + JS_FILES[j] + ' (' + js.length + ' bytes)');
  }

  /* App init script (runs after DOM ready) */
  jsContent += '\n<!-- ===== App Init ===== -->\n<script>\n';
  jsContent += 'document.addEventListener("DOMContentLoaded", function() {\n';
  jsContent += '  if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {\n';
  jsContent += '    var overlay = document.getElementById("login-overlay");\n';
  jsContent += '    if (overlay) overlay.classList.add("hidden");\n';
  jsContent += '    App.init();\n';
  jsContent += '  }\n';
  jsContent += '  var pwdInput = document.getElementById("login-password");\n';
  jsContent += '  if (pwdInput) pwdInput.focus();\n';
  jsContent += '});\n';
  jsContent += '</script>\n';

  html = html.replace('<!-- {{JS}} -->', jsContent);

  /* 4. Write to dist */
  console.log('[4/5] Writing dist/index.html...');
  ensureDir(DIST_DIR);
  var outputPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log('       Output: ' + outputPath + ' (' + html.length + ' bytes)');

  /* 5. Run tests */
  console.log('[5/5] Running tests...');
  var testResult = runTests();
  if (!testResult.passed) {
    console.error('');
    console.error('BUILD FAILED: ' + testResult.failed + ' test(s) failed');
    process.exit(1);
  }

  console.log('');
  console.log('========================================');
  console.log('  BUILD SUCCESS');
  console.log('  Output: dist/index.html');
  console.log('  Size: ' + (html.length / 1024).toFixed(1) + ' KB');
  console.log('  Tests: ' + testResult.passed + '/' + testResult.total + ' PASS');
  console.log('========================================');
  console.log('');
}

/* ===== Tests ===== */
function runTests() {
  var passed = 0;
  var failed = 0;
  var total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log('  [PASS] ' + name);
    } catch (e) {
      failed++;
      console.error('  [FAIL] ' + name + ' — ' + e.message);
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  /* ===== Read all source files for testing ===== */
  function getSrc(file) {
    return readFile(path.join(ROOT, file));
  }

  /* ===== Test: All source files exist ===== */
  test('All JS files exist', function () {
    for (var i = 0; i < JS_FILES.length; i++) {
      var p = path.join(ROOT, JS_FILES[i]);
      assert(fs.existsSync(p), 'Missing file: ' + JS_FILES[i]);
    }
  });

  test('All CSS files exist', function () {
    for (var i = 0; i < CSS_FILES.length; i++) {
      var p = path.join(ROOT, CSS_FILES[i]);
      assert(fs.existsSync(p), 'Missing file: ' + CSS_FILES[i]);
    }
  });

  test('template.html exists', function () {
    assert(fs.existsSync(TEMPLATE), 'template.html not found');
  });

  /* ===== Test: Template has placeholders ===== */
  test('Template has CSS placeholder', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('{{CSS}}') !== -1, 'Missing {{CSS}} placeholder');
  });

  test('Template has JS placeholder', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('{{JS}}') !== -1, 'Missing {{JS}} placeholder');
  });

  /* ===== Test: Template has required DOM elements ===== */
  test('Template has login-overlay', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="login-overlay"') !== -1, 'Missing #login-overlay');
  });

  test('Template has app-shell', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="app-shell"') !== -1, 'Missing #app-shell');
  });

  test('Template has sidebar', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="sidebar"') !== -1, 'Missing #sidebar');
  });

  test('Template has main-content', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="main-content"') !== -1, 'Missing #main-content');
  });

  test('Template has topbar', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="topbar"') !== -1, 'Missing #topbar');
  });

  test('Template has 7 page-content divs (v8)', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="page-overview"') !== -1, 'Missing #page-overview');
    assert(tpl.indexOf('id="page-profit"') !== -1, 'Missing #page-profit');
    assert(tpl.indexOf('id="page-fees"') !== -1, 'Missing #page-fees');
    assert(tpl.indexOf('id="page-agent-performance"') !== -1, 'Missing #page-agent-performance');
    assert(tpl.indexOf('id="page-archives"') !== -1, 'Missing #page-archives');
    assert(tpl.indexOf('id="page-employees"') !== -1, 'Missing #page-employees');
    assert(tpl.indexOf('id="page-hotel-config"') !== -1, 'Missing #page-hotel-config');
  });

  test('Template does NOT have old v1 pages', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="page-calendar"') === -1, 'Should not have #page-calendar');
    assert(tpl.indexOf('id="page-booking-list"') === -1, 'Should not have #page-booking-list');
    assert(tpl.indexOf('id="page-stats"') === -1, 'Should not have #page-stats');
    assert(tpl.indexOf('id="page-bot-log"') === -1, 'Should not have #page-bot-log');
  });

  test('Template has bottom-nav', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="bottom-nav"') !== -1, 'Missing #bottom-nav');
  });

  test('Template has toast-container', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="toast-container"') !== -1, 'Missing #toast-container');
  });

  test('Template has month-nav with prev/next', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('prevMonth()') !== -1, 'Missing prevMonth()');
    assert(tpl.indexOf('nextMonth()') !== -1, 'Missing nextMonth()');
  });

  test('Template uses light theme-color', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('#f0f2f5') !== -1, 'Should use light theme-color #f0f2f5');
  });

  test('Template version label is v2.0.0', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('v2.0.0') !== -1, 'Version label should be v2.0.0');
  });

  /* ===== Test: constants.js defines required constants ===== */
  test('constants.js defines APP', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var APP') !== -1, 'Missing APP');
    assert(src.indexOf("VERSION: '2.0.0'") !== -1, 'APP.VERSION should be 2.0.0');
  });

  test('constants.js defines CONFIG with v8 settings', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var CONFIG') !== -1, 'Missing CONFIG');
    assert(src.indexOf('DEFAULT_CHECKIN_TIME') !== -1, 'Missing DEFAULT_CHECKIN_TIME');
    assert(src.indexOf('REMINDER_DAYS_BEFORE') !== -1, 'Missing REMINDER_DAYS_BEFORE');
    assert(src.indexOf('RECENT_AGENT_LIMIT') !== -1, 'Missing RECENT_AGENT_LIMIT');
  });

  test('constants.js defines STORAGE_KEYS with v8 keys', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var STORAGE_KEYS') !== -1, 'Missing STORAGE_KEYS');
    assert(src.indexOf('EMPLOYEE_LIST') !== -1, 'Missing EMPLOYEE_LIST key');
    assert(src.indexOf('ARCHIVES') !== -1, 'Missing ARCHIVES key');
    assert(src.indexOf('CLOSED_MONTHS') !== -1, 'Missing CLOSED_MONTHS key');
    assert(src.indexOf('SETTINGS') !== -1, 'Missing SETTINGS key');
  });

  test('constants.js defines FIREBASE_CONFIG', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var FIREBASE_CONFIG') !== -1, 'Missing FIREBASE_CONFIG');
  });

  test('constants.js defines FB_PATH with booking_data/ prefix', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var FB_PATH') !== -1, 'Missing FB_PATH');
    assert(src.indexOf('booking_data/') !== -1, 'FB_PATH should use booking_data/ prefix');
    assert(src.indexOf('macau_data/') === -1, 'Should NOT use macau_data/ prefix');
  });

  test('constants.js defines EVENTS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var EVENTS') !== -1, 'Missing EVENTS');
  });

  test('constants.js defines UI_COLORS (light theme)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var UI_COLORS') !== -1, 'Missing UI_COLORS');
    assert(src.indexOf('#f0f2f5') !== -1, 'Should have light bgBase #f0f2f5');
    assert(src.indexOf('#1e293b') !== -1, 'Should have light textPrimary #1e293b');
  });

  test('constants.js defines ROOM_TYPES (6 types)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var ROOM_TYPES') !== -1, 'Missing ROOM_TYPES');
    assert(src.indexOf("'king'") !== -1, 'Missing king room type');
    assert(src.indexOf("'twin'") !== -1, 'Missing twin room type');
    assert(src.indexOf("'mini-suite'") !== -1, 'Missing mini-suite room type');
    assert(src.indexOf("'grand-suite'") !== -1, 'Missing grand-suite room type');
    assert(src.indexOf("'two-bedroom'") !== -1, 'Missing two-bedroom room type');
    assert(src.indexOf("'three-bedroom'") !== -1, 'Missing three-bedroom room type');
  });

  test('constants.js defines PAGES (7 pages)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var PAGES') !== -1, 'Missing PAGES');
    assert(src.indexOf('OVERVIEW') !== -1, 'Missing OVERVIEW page');
    assert(src.indexOf('PROFIT') !== -1, 'Missing PROFIT page');
    assert(src.indexOf('FEES') !== -1, 'Missing FEES page');
    assert(src.indexOf('AGENT_PERF') !== -1, 'Missing AGENT_PERF page');
    assert(src.indexOf('ARCHIVES') !== -1, 'Missing ARCHIVES page');
    assert(src.indexOf('EMPLOYEES') !== -1, 'Missing EMPLOYEES page');
    assert(src.indexOf('HOTEL_CONFIG') !== -1, 'Missing HOTEL_CONFIG page');
  });

  test('constants.js defines BOOKING_STATUS (5 statuses)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var BOOKING_STATUS') !== -1, 'Missing BOOKING_STATUS');
    assert(src.indexOf('pending') !== -1, 'Missing pending status');
    assert(src.indexOf('confirmed') !== -1, 'Missing confirmed status');
    assert(src.indexOf('checked-in') !== -1, 'Missing checked-in status');
    assert(src.indexOf('checked-out') !== -1, 'Missing checked-out status');
    assert(src.indexOf('cancelled') !== -1, 'Missing cancelled status');
  });

  test('constants.js defines STATUS_RULES', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var STATUS_RULES') !== -1, 'Missing STATUS_RULES');
    assert(src.indexOf('canEdit') !== -1, 'Missing canEdit rule');
    assert(src.indexOf('canEditDates') !== -1, 'Missing canEditDates rule');
  });

  test('constants.js defines FEE_TYPES (free/paid)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var FEE_TYPES') !== -1, 'Missing FEE_TYPES');
    assert(src.indexOf("'free'") !== -1, 'Missing free fee type');
    assert(src.indexOf("'paid'") !== -1, 'Missing paid fee type');
  });

  test('constants.js defines CURRENCY_OPTIONS (HKD/RMB/TWD)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var CURRENCY_OPTIONS') !== -1, 'Missing CURRENCY_OPTIONS');
    assert(src.indexOf('HKD') !== -1, 'Missing HKD');
    assert(src.indexOf('RMB') !== -1, 'Missing RMB');
    assert(src.indexOf('TWD') !== -1, 'Missing TWD');
  });

  test('constants.js defines BOT_COMMANDS (6 Chinese commands)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var BOT_COMMANDS') !== -1, 'Missing BOT_COMMANDS');
    assert(src.indexOf('newauth') !== -1, 'Missing newauth command');
    assert(src.indexOf('book') !== -1, 'Missing book command');
    assert(src.indexOf('confirmno') !== -1, 'Missing confirmno command');
  });

  test('constants.js defines SHORTCUTS with Ctrl+1~7', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var SHORTCUTS') !== -1, 'Missing SHORTCUTS');
    assert(src.indexOf("'Ctrl+1'") !== -1, 'Missing Ctrl+1');
    assert(src.indexOf("'Ctrl+7'") !== -1, 'Missing Ctrl+7');
    assert(src.indexOf("'Ctrl+P'") !== -1, 'Missing Ctrl+P (print)');
  });

  test('constants.js defines DEFAULT_PASSWORD_HASH', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var DEFAULT_PASSWORD_HASH') !== -1, 'Missing DEFAULT_PASSWORD_HASH');
  });

  /* ===== Test: hotels.js defines tree structure ===== */
  test('hotels.js defines PRESET_CASINOS tree structure', function () {
    var src = getSrc('src/data/hotels.js');
    assert(src.indexOf('var PRESET_CASINOS') !== -1, 'Missing PRESET_CASINOS');
    assert(src.indexOf("name: '新濠天地'") !== -1 || src.indexOf("name: '\u65b0\u6f20\u5929\u5730'") !== -1, 'Missing 新濠天地');
    assert(src.indexOf('roomConfig') !== -1, 'Missing roomConfig structure');
    assert(src.indexOf('threshold') !== -1, 'Missing threshold in room config');
  });

  test('hotels.js defines CRUD + query methods', function () {
    var src = getSrc('src/data/hotels.js');
    assert(src.indexOf('loadPresets:') !== -1, 'Missing loadPresets()');
    assert(src.indexOf('addCasino:') !== -1, 'Missing addCasino()');
    assert(src.indexOf('addHotel:') !== -1, 'Missing addHotel()');
    assert(src.indexOf('updateRoomConfig:') !== -1, 'Missing updateRoomConfig()');
    assert(src.indexOf('getCasinos:') !== -1, 'Missing getCasinos()');
    assert(src.indexOf('getHotels:') !== -1, 'Missing getHotels()');
    assert(src.indexOf('getThreshold:') !== -1, 'Missing getThreshold()');
  });

  /* ===== Test: events.js defines Events module ===== */
  test('events.js defines Events with on/emit/off', function () {
    var src = getSrc('src/core/events.js');
    assert(src.indexOf('var Events') !== -1, 'Missing Events');
    assert(src.indexOf('on:') !== -1 || src.indexOf('on =') !== -1, 'Missing on()');
    assert(src.indexOf('emit:') !== -1 || src.indexOf('emit =') !== -1, 'Missing emit()');
  });

  /* ===== Test: state.js defines State module ===== */
  test('state.js defines State with get/set/update', function () {
    var src = getSrc('src/core/state.js');
    assert(src.indexOf('var State') !== -1, 'Missing State');
    assert(src.indexOf('get:') !== -1 || src.indexOf('get =') !== -1, 'Missing get()');
    assert(src.indexOf('set:') !== -1 || src.indexOf('set =') !== -1, 'Missing set()');
  });

  test('state.js defines v8 state fields', function () {
    var src = getSrc('src/core/state.js');
    assert(src.indexOf('bookings') !== -1, 'Missing bookings state');
    assert(src.indexOf('hotelConfig') !== -1, 'Missing hotelConfig state');
    assert(src.indexOf('agentList') !== -1, 'Missing agentList state');
    assert(src.indexOf('employeeList') !== -1, 'Missing employeeList state');
    assert(src.indexOf('archives') !== -1, 'Missing archives state');
    assert(src.indexOf('closedMonths') !== -1, 'Missing closedMonths state');
    assert(src.indexOf('settings') !== -1, 'Missing settings state');
  });

  /* ===== Test: store.js defines Store module ===== */
  test('store.js defines Store with save/load', function () {
    var src = getSrc('src/core/store.js');
    assert(src.indexOf('var Store') !== -1, 'Missing Store');
    assert(src.indexOf('saveBookings') !== -1, 'Missing saveBookings()');
    assert(src.indexOf('loadAll') !== -1, 'Missing loadAll()');
  });

  /* ===== Test: firebase.js defines initFirebase ===== */
  test('firebase.js defines initFirebase', function () {
    var src = getSrc('src/sync/firebase.js');
    assert(src.indexOf('initFirebase') !== -1, 'Missing initFirebase');
    assert(src.indexOf('signInAnonymously') !== -1, 'Missing signInAnonymously');
  });

  test('firebase.js defines syncBookingToFirebase', function () {
    var src = getSrc('src/sync/firebase.js');
    assert(src.indexOf('syncBookingToFirebase') !== -1, 'Missing syncBookingToFirebase');
  });

  test('firebase.js defines removeBookingFromFirebase (tombstone)', function () {
    var src = getSrc('src/sync/firebase.js');
    assert(src.indexOf('removeBookingFromFirebase') !== -1, 'Missing removeBookingFromFirebase');
    assert(src.indexOf('_deleted') !== -1, 'Missing tombstone _deleted flag');
  });

  test('firebase.js defines v8 sync functions', function () {
    var src = getSrc('src/sync/firebase.js');
    assert(src.indexOf('syncHCToFirebase') !== -1, 'Missing syncHCToFirebase');
    assert(src.indexOf('syncEmployeeListToFirebase') !== -1, 'Missing syncEmployeeListToFirebase');
    assert(src.indexOf('syncArchiveToFirebase') !== -1, 'Missing syncArchiveToFirebase');
    assert(src.indexOf('syncClosedMonthsToFirebase') !== -1, 'Missing syncClosedMonthsToFirebase');
    assert(src.indexOf('syncSettingsToFirebase') !== -1, 'Missing syncSettingsToFirebase');
  });

  /* ===== Test: watchers.js defines startWatchers ===== */
  test('watchers.js defines startWatchers', function () {
    var src = getSrc('src/sync/watchers.js');
    assert(src.indexOf('startWatchers') !== -1, 'Missing startWatchers');
    assert(src.indexOf('syncDownloadAll') !== -1, 'Missing syncDownloadAll');
  });

  /* ===== Test: merger.js defines mergeBookings ===== */
  test('merger.js defines mergeBookings', function () {
    var src = getSrc('src/sync/merger.js');
    assert(src.indexOf('mergeBookings') !== -1, 'Missing mergeBookings');
    assert(src.indexOf('_updatedAt') !== -1, 'Missing _updatedAt conflict resolution');
  });

  test('merger.js defines cleanOldTombstones', function () {
    var src = getSrc('src/sync/merger.js');
    assert(src.indexOf('cleanOldTombstones') !== -1, 'Missing cleanOldTombstones');
  });

  /* ===== Test: uploader.js defines syncUploadAll ===== */
  test('uploader.js defines syncUploadAll', function () {
    var src = getSrc('src/sync/uploader.js');
    assert(src.indexOf('syncUploadAll') !== -1, 'Missing syncUploadAll');
    assert(src.indexOf('enqueueUpload') !== -1, 'Missing enqueueUpload');
  });

  /* ===== Test: recently-deleted.js defines RecentlyDeleted ===== */
  test('recently-deleted.js defines RecentlyDeleted', function () {
    var src = getSrc('src/sync/recently-deleted.js');
    assert(src.indexOf('RecentlyDeleted') !== -1, 'Missing RecentlyDeleted');
    assert(src.indexOf('track') !== -1, 'Missing track()');
  });

  /* ===== Test: bookings.js defines CRUD ===== */
  test('bookings.js defines Bookings.create', function () {
    var src = getSrc('src/data/bookings.js');
    assert(src.indexOf('var Bookings') !== -1, 'Missing Bookings');
    assert(src.indexOf('create:') !== -1, 'Missing create()');
    assert(src.indexOf('update:') !== -1, 'Missing update()');
    assert(src.indexOf('delete:') !== -1, 'Missing delete()');
  });

  test('bookings.js defines v8 methods', function () {
    var src = getSrc('src/data/bookings.js');
    assert(src.indexOf('setConfirmNo:') !== -1, 'Missing setConfirmNo()');
    assert(src.indexOf('archive:') !== -1, 'Missing archive()');
    assert(src.indexOf('autoTransitionStatus:') !== -1, 'Missing autoTransitionStatus()');
    assert(src.indexOf('checkDuplicate:') !== -1, 'Missing checkDuplicate()');
    assert(src.indexOf('calcProfit:') !== -1, 'Missing calcProfit()');
    assert(src.indexOf('getBookingsNeedingReminder:') !== -1, 'Missing getBookingsNeedingReminder()');
  });

  test('bookings.js uses v8 fields', function () {
    var src = getSrc('src/data/bookings.js');
    assert(src.indexOf('feeStatus') !== -1, 'Missing feeStatus field');
    assert(src.indexOf('chargeGuest') !== -1, 'Missing chargeGuest field');
    assert(src.indexOf('chargeCompany') !== -1, 'Missing chargeCompany field');
    assert(src.indexOf('smoking') !== -1, 'Missing smoking field');
    assert(src.indexOf('currency') !== -1, 'Missing currency field');
    assert(src.indexOf('pickupName') !== -1, 'Missing pickupName field');
    assert(src.indexOf('confirmNo') !== -1, 'Missing confirmNo field');
    assert(src.indexOf('employee') !== -1, 'Missing employee field');
    assert(src.indexOf('archived') !== -1, 'Missing archived field');
  });

  /* ===== Test: employees.js defines Employee CRUD ===== */
  test('employees.js defines Employees CRUD', function () {
    var src = getSrc('src/data/employees.js');
    assert(src.indexOf('var Employees') !== -1, 'Missing Employees');
    assert(src.indexOf('add:') !== -1, 'Missing add()');
    assert(src.indexOf('remove:') !== -1, 'Missing remove()');
    assert(src.indexOf('setRole:') !== -1, 'Missing setRole()');
    assert(src.indexOf('isAdmin:') !== -1, 'Missing isAdmin()');
  });

  /* ===== Test: archives.js defines Archives ===== */
  test('archives.js defines Archives with search', function () {
    var src = getSrc('src/data/archives.js');
    assert(src.indexOf('var Archives') !== -1, 'Missing Archives');
    assert(src.indexOf('add:') !== -1, 'Missing add()');
    assert(src.indexOf('search:') !== -1, 'Missing search()');
    assert(src.indexOf('getStats:') !== -1, 'Missing getStats()');
  });

  /* ===== Test: stats.js defines pure functions ===== */
  test('stats.js defines Stats with summary()', function () {
    var src = getSrc('src/calc/stats.js');
    assert(src.indexOf('var Stats') !== -1, 'Missing Stats');
    assert(src.indexOf('summary:') !== -1, 'Missing summary()');
    assert(src.indexOf('feeStats:') !== -1, 'Missing feeStats()');
    assert(src.indexOf('profitByAgent:') !== -1, 'Missing profitByAgent()');
  });

  /* ===== Test: filters.js defines filter functions ===== */
  test('filters.js defines filterBookings', function () {
    var src = getSrc('src/calc/filters.js');
    assert(src.indexOf('var Filters') !== -1, 'Missing Filters');
    assert(src.indexOf('filterBookings:') !== -1, 'Missing filterBookings()');
    assert(src.indexOf('filterArchives:') !== -1, 'Missing filterArchives()');
    assert(src.indexOf('sortBookings:') !== -1, 'Missing sortBookings()');
  });

  /* ===== Test: bridge.js defines required global functions ===== */
  test('bridge.js defines navigateTo', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function navigateTo') !== -1, 'Missing navigateTo()');
  });

  test('bridge.js defines openBookingModal', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function openBookingModal') !== -1, 'Missing openBookingModal()');
  });

  test('bridge.js defines saveBookingForm', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function saveBookingForm') !== -1, 'Missing saveBookingForm()');
  });

  test('bridge.js defines handleLogin', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function handleLogin') !== -1, 'Missing handleLogin()');
  });

  test('bridge.js defines manualSync', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function manualSync') !== -1, 'Missing manualSync()');
  });

  test('bridge.js defines viewBookingDetail', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function viewBookingDetail') !== -1, 'Missing viewBookingDetail()');
  });

  test('bridge.js defines editBooking', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function editBooking') !== -1, 'Missing editBooking()');
  });

  test('bridge.js defines deleteBooking', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function deleteBooking') !== -1, 'Missing deleteBooking()');
  });

  test('bridge.js defines agent management functions', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function openAgentModal') !== -1, 'Missing openAgentModal()');
    assert(src.indexOf('function addAgentFromModal') !== -1, 'Missing addAgentFromModal()');
    assert(src.indexOf('function activateAgent') !== -1, 'Missing activateAgent()');
    assert(src.indexOf('function deactivateAgent') !== -1, 'Missing deactivateAgent()');
  });

  test('bridge.js defines backup functions', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function openBackupModal') !== -1, 'Missing openBackupModal()');
    assert(src.indexOf('function createBackup') !== -1, 'Missing createBackup()');
    assert(src.indexOf('function restoreBackup') !== -1, 'Missing restoreBackup()');
  });

  test('bridge.js does NOT have exportJSON/importJSON (v8: removed)', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function exportJSON') === -1, 'Should not have exportJSON()');
    assert(src.indexOf('function importJSON') === -1, 'Should not have importJSON()');
  });

  test('bridge.js defines clearAllData', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('function clearAllData') !== -1, 'Missing clearAllData()');
  });

  test('bridge.js defines v8 booking modal fields', function () {
    var src = getSrc('src/bridge/bridge.js');
    assert(src.indexOf('bk-smoking') !== -1, 'Missing bk-smoking field');
    assert(src.indexOf('bk-feeStatus') !== -1, 'Missing bk-feeStatus field');
    assert(src.indexOf('bk-currency') !== -1, 'Missing bk-currency field');
    assert(src.indexOf('bk-chargeGuest') !== -1, 'Missing bk-chargeGuest field');
    assert(src.indexOf('bk-chargeCompany') !== -1, 'Missing bk-chargeCompany field');
    assert(src.indexOf('bk-pickupName') !== -1, 'Missing bk-pickupName field');
  });

  /* ===== Test: app.js defines App module ===== */
  test('app.js defines App.init', function () {
    var src = getSrc('src/core/app.js');
    assert(src.indexOf('var App') !== -1, 'Missing App');
    assert(src.indexOf('init:') !== -1, 'Missing init()');
    assert(src.indexOf('afterLogin') !== -1 || src.indexOf('afterFirebaseReady') !== -1, 'Missing afterFirebaseReady()');
  });

  /* ===== Test: router.js defines 7-page routing ===== */
  test('router.js defines Router with navigateTo', function () {
    var src = getSrc('src/core/router.js');
    assert(src.indexOf('var Router') !== -1, 'Missing Router');
    assert(src.indexOf('navigateTo:') !== -1, 'Missing navigateTo()');
    assert(src.indexOf('prevMonth:') !== -1, 'Missing prevMonth()');
    assert(src.indexOf('nextMonth:') !== -1, 'Missing nextMonth()');
  });

  /* ===== Test: CSS files have required selectors ===== */
  test('variables.css defines light theme palette', function () {
    var src = getSrc('css/variables.css');
    assert(src.indexOf('--bg-base') !== -1, 'Missing --bg-base');
    assert(src.indexOf('--bg-elevated') !== -1, 'Missing --bg-elevated');
    assert(src.indexOf('--text-primary') !== -1, 'Missing --text-primary');
  });

  test('layout.css defines app-shell layout', function () {
    var src = getSrc('css/layout.css');
    assert(src.indexOf('#app-shell') !== -1, 'Missing #app-shell');
    assert(src.indexOf('#sidebar') !== -1, 'Missing #sidebar');
    assert(src.indexOf('#topbar') !== -1, 'Missing #topbar');
  });

  test('components.css defines KPI cards and data-table', function () {
    var src = getSrc('css/components.css');
    assert(src.indexOf('.kpi-card') !== -1, 'Missing .kpi-card');
    assert(src.indexOf('.btn') !== -1, 'Missing .btn');
    assert(src.indexOf('.data-table') !== -1, 'Missing .data-table');
  });

  test('components.css defines v8 components', function () {
    var src = getSrc('css/components.css');
    assert(src.indexOf('status-badge') !== -1, 'Missing status-badge component');
    assert(src.indexOf('fee-badge') !== -1, 'Missing fee-badge component');
  });

  test('mobile.css defines responsive breakpoints', function () {
    var src = getSrc('css/mobile.css');
    assert(src.indexOf('768px') !== -1, 'Missing 768px breakpoint');
    assert(src.indexOf('480px') !== -1, 'Missing 480px breakpoint');
  });

  /* ===== Test: FB_PATH isolation ===== */
  test('FB_PATH uses booking_data/ prefix (isolated from v13 macau_data/)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('booking_data/') !== -1, 'Should use booking_data/ prefix');
    assert(src.indexOf('macau_data/') === -1, 'Should NOT use macau_data/ prefix');
  });

  /* ===== Test: Syntax check via node -c ===== */
  test('No syntax errors in JS files (node -c)', function () {
    var execSync = require('child_process').execSync;
    for (var i = 0; i < JS_FILES.length; i++) {
      var jsPath = path.join(ROOT, JS_FILES[i]);
      try {
        execSync('node -c "' + jsPath + '"', { stdio: 'pipe' });
      } catch (e) {
        var msg = (e.stderr && e.stderr.toString()) || e.message;
        throw new Error(JS_FILES[i] + ': ' + msg.trim());
      }
    }
  });

  /* ===== Test: All bridge onclick handlers in template have bridge functions ===== */
  test('All onclick handlers in template have bridge functions', function () {
    var tpl = readFile(TEMPLATE);
    var bridge = getSrc('src/bridge/bridge.js');
    var onclickRegex = /onclick="(\w+)\(/g;
    var match;
    while ((match = onclickRegex.exec(tpl)) !== null) {
      var fnName = match[1];
      assert(bridge.indexOf('function ' + fnName) !== -1, 'Missing bridge function: ' + fnName);
    }
  });

  /* ===== Test: Build output was created ===== */
  test('dist/index.html was created', function () {
    var distPath = path.join(DIST_DIR, 'index.html');
    assert(fs.existsSync(distPath), 'dist/index.html not found');
    var dist = readFile(distPath);
    assert(dist.indexOf('<style>') !== -1, 'Missing inlined CSS');
    assert(dist.indexOf('<script>') !== -1, 'Missing inlined JS');
    assert(dist.indexOf('{{CSS}}') === -1, 'CSS placeholder not replaced');
    assert(dist.indexOf('{{JS}}') === -1, 'JS placeholder not replaced');
  });

  test('dist/index.html has all 7 page containers', function () {
    var dist = readFile(path.join(DIST_DIR, 'index.html'));
    assert(dist.indexOf('id="page-overview"') !== -1, 'Missing #page-overview in dist');
    assert(dist.indexOf('id="page-profit"') !== -1, 'Missing #page-profit in dist');
    assert(dist.indexOf('id="page-fees"') !== -1, 'Missing #page-fees in dist');
    assert(dist.indexOf('id="page-agent-performance"') !== -1, 'Missing #page-agent-performance in dist');
    assert(dist.indexOf('id="page-archives"') !== -1, 'Missing #page-archives in dist');
    assert(dist.indexOf('id="page-employees"') !== -1, 'Missing #page-employees in dist');
    assert(dist.indexOf('id="page-hotel-config"') !== -1, 'Missing #page-hotel-config in dist');
  });

  /* ===== Summary ===== */
  console.log('');
  console.log('  ----------------------------------------');
  console.log('  Results: ' + passed + '/' + total + ' passed, ' + failed + ' failed');
  console.log('  ----------------------------------------');

  return { passed: passed, failed: failed, total: total };
}

/* ===== Run ===== */
build();
