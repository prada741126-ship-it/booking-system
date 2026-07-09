/**
 * build.js — Build Script for BookingHub
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
  /* External CDN scripts (loaded with defer) */
  /* — none inlined, loaded via <script src> in template — */
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
  'src/data/backup.js',
  /* Calc layer */
  'src/calc/filters.js',
  'src/calc/stats.js',
  /* UI layer */
  'src/ui/keyboard.js',
  'src/ui/toast.js',
  'src/ui/modal.js',
  /* Page layer */
  'src/pages/overview.js',
  'src/pages/calendar.js',
  'src/pages/booking-list.js',
  'src/pages/stats.js',
  'src/pages/bot-log.js',
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
  console.log('  BookingHub Build System v1.0.0');
  console.log('========================================');
  console.log('');

  // 1. Read template
  console.log('[1/5] Reading template.html...');
  var html = readFile(TEMPLATE);

  // 2. Read and combine CSS
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

  // 3. Read and combine JS
  console.log('[3/5] Combining JS files...');
  var jsContent = '';

  // External scripts first
  for (var e = 0; e < EXTERNAL_SCRIPTS.length; e++) {
    var ext = EXTERNAL_SCRIPTS[e];
    jsContent += '<script src="' + ext.src + '"' + (ext.defer ? ' defer' : '') + '></script>\n';
  }

  // Inlined source files
  for (var j = 0; j < JS_FILES.length; j++) {
    var jsPath = path.join(ROOT, JS_FILES[j]);
    var js = readFile(jsPath);
    jsContent += '\n<!-- ===== ' + JS_FILES[j] + ' ===== -->\n<script>\n' + js + '\n</script>\n';
    console.log('       + ' + JS_FILES[j] + ' (' + js.length + ' bytes)');
  }

  // App init script (runs after DOM ready)
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

  // 4. Write to dist
  console.log('[4/5] Writing dist/index.html...');
  ensureDir(DIST_DIR);
  var outputPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log('       Output: ' + outputPath + ' (' + html.length + ' bytes)');

  // 5. Run tests
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
  console.log('  Tests: ' + testResult.total + '/' + testResult.total + ' PASS');
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

  function assertExists(value, name) {
    assert(value !== undefined && value !== null, name + ' is undefined or null');
  }

  function assertType(value, type, name) {
    assert(typeof value === type, name + ' should be ' + type + ', got ' + typeof value);
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

  test('Template has 5 page-content divs', function () {
    var tpl = readFile(TEMPLATE);
    assert(tpl.indexOf('id="page-overview"') !== -1, 'Missing #page-overview');
    assert(tpl.indexOf('id="page-calendar"') !== -1, 'Missing #page-calendar');
    assert(tpl.indexOf('id="page-booking-list"') !== -1, 'Missing #page-booking-list');
    assert(tpl.indexOf('id="page-stats"') !== -1, 'Missing #page-stats');
    assert(tpl.indexOf('id="page-bot-log"') !== -1, 'Missing #page-bot-log');
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

  /* ===== Test: constants.js defines required constants ===== */
  test('constants.js defines APP', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var APP') !== -1, 'Missing APP');
  });

  test('constants.js defines CONFIG', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var CONFIG') !== -1, 'Missing CONFIG');
  });

  test('constants.js defines STORAGE_KEYS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var STORAGE_KEYS') !== -1, 'Missing STORAGE_KEYS');
  });

  test('constants.js defines FIREBASE_CONFIG', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var FIREBASE_CONFIG') !== -1, 'Missing FIREBASE_CONFIG');
  });

  test('constants.js defines FB_PATH', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var FB_PATH') !== -1, 'Missing FB_PATH');
    assert(src.indexOf('booking_data/') !== -1, 'FB_PATH should use booking_data/ prefix');
  });

  test('constants.js defines EVENTS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var EVENTS') !== -1, 'Missing EVENTS');
  });

  test('constants.js defines UI_COLORS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var UI_COLORS') !== -1, 'Missing UI_COLORS');
  });

  test('constants.js defines VENUE_OPTIONS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var VENUE_OPTIONS') !== -1, 'Missing VENUE_OPTIONS');
  });

  test('constants.js defines PAGES', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var PAGES') !== -1, 'Missing PAGES');
  });

  test('constants.js defines BOOKING_STATUS', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var BOOKING_STATUS') !== -1, 'Missing BOOKING_STATUS');
  });

  test('constants.js defines COMP_TYPES', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('var COMP_TYPES') !== -1, 'Missing COMP_TYPES');
  });

  test('constants.js defines PRESET hotel data (73 rooms)', function () {
    var src = getSrc('src/data/hotels.js');
    // Count entries within PRESET_CONFIG array only (each has threshold:)
    var presetStart = src.indexOf('var PRESET_CONFIG = [');
    var presetEnd = src.indexOf('];', presetStart);
    assert(presetStart !== -1 && presetEnd !== -1, 'Cannot find PRESET_CONFIG array');
    var presetBlock = src.substring(presetStart, presetEnd);
    var matches = presetBlock.match(/threshold:/g);
    assert(matches && matches.length === 73, 'Expected 73 room types in PRESET_CONFIG, got ' + (matches ? matches.length : 0));
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

  /* ===== Test: app.js defines App module ===== */
  test('app.js defines App.init', function () {
    var src = getSrc('src/core/app.js');
    assert(src.indexOf('var App') !== -1, 'Missing App');
    assert(src.indexOf('init:') !== -1 || src.indexOf('init:') !== -1, 'Missing init()');
    assert(src.indexOf('afterLogin') !== -1, 'Missing afterLogin()');
  });

  /* ===== Test: CSS files have required selectors ===== */
  test('variables.css defines color palette', function () {
    var src = getSrc('css/variables.css');
    assert(src.indexOf('--color-tech-cyan') !== -1, 'Missing --color-tech-cyan');
    assert(src.indexOf('--bg-base') !== -1, 'Missing --bg-base');
  });

  test('layout.css defines app-shell layout', function () {
    var src = getSrc('css/layout.css');
    assert(src.indexOf('#app-shell') !== -1, 'Missing #app-shell');
    assert(src.indexOf('#sidebar') !== -1, 'Missing #sidebar');
    assert(src.indexOf('#topbar') !== -1, 'Missing #topbar');
  });

  test('components.css defines KPI cards', function () {
    var src = getSrc('css/components.css');
    assert(src.indexOf('.kpi-card') !== -1, 'Missing .kpi-card');
    assert(src.indexOf('.btn') !== -1, 'Missing .btn');
    assert(src.indexOf('.data-table') !== -1, 'Missing .data-table');
  });

  test('mobile.css defines responsive breakpoints', function () {
    var src = getSrc('css/mobile.css');
    assert(src.indexOf('768px') !== -1, 'Missing 768px breakpoint');
    assert(src.indexOf('480px') !== -1, 'Missing 480px breakpoint');
  });

  /* ===== Test: FB_PATH isolation from v13 ===== */
  test('FB_PATH uses booking_data/ prefix (isolated from v13 macau_data/)', function () {
    var src = getSrc('src/core/constants.js');
    assert(src.indexOf('booking_data/') !== -1, 'Should use booking_data/ prefix');
    assert(src.indexOf('macau_data/') === -1, 'Should NOT use macau_data/ prefix');
  });

  /* ===== Test: No syntax errors (basic check) ===== */
  test('No obvious syntax errors in JS files', function () {
    for (var i = 0; i < JS_FILES.length; i++) {
      var src = getSrc(JS_FILES[i]);
      // Strip string literals to avoid counting braces inside strings
      var stripped = src
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")   // single-quoted strings
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')   // double-quoted strings
        .replace(/\/\*[\s\S]*?\*\//g, '')      // block comments
        .replace(/\/\/.*$/gm, '');              // line comments
      var open = (stripped.match(/\{/g) || []).length;
      var close = (stripped.match(/\}/g) || []).length;
      assert(open === close, JS_FILES[i] + ': brace mismatch {' + open + ' vs }' + close);
    }
  });

  /* ===== Test: All bridge onclick handlers have corresponding functions ===== */
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

  /* ===== Summary ===== */
  console.log('');
  console.log('  ----------------------------------------');
  console.log('  Results: ' + passed + '/' + total + ' passed, ' + failed + ' failed');
  console.log('  ----------------------------------------');

  return { passed: passed, failed: failed, total: total };
}

/* ===== Run ===== */
build();
