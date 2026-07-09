/**
 * bot/bot.js — Telegram Bot for BookingHub
 * VIP 貴賓廳訂房管理系統 — Telegram Bot 後端
 *
 * Features:
 *   - Long-polling (no webhook URL needed)
 *   - InlineKeyboard button-based booking flow
 *   - Direct Firebase RTDB writes via REST API
 *   - Agent registration & authentication
 *   - Bot operation logging
 *
 * Usage:
 *   1. Set environment variables (see config below)
 *   2. node bot/bot.js
 *
 * Zero external npm dependencies — uses Node.js built-in modules only.
 */

var https = require('https');
var crypto = require('crypto');

/* ============================================================
 * Configuration
 * ============================================================ */

var CONFIG = {
  // Telegram Bot Token (get from @BotFather)
  TELEGRAM_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',

  // Firebase config (must match web app constants.js)
  FIREBASE: {
    API_KEY: 'AIzaSyC3NKqEVUpL-9WYvun7pBbJe8P7T8o4Y74',
    DB_URL: 'https://macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    PATHS: {
      BOOKINGS:   'booking_data/bookings',
      AGENT_LIST: 'booking_data/agentList',
      BOT_LOGS:   'booking_data/botLogs',
      HOTEL_CONFIG: 'booking_data/hotelConfig'
    }
  },

  // Polling
  POLL_TIMEOUT: 30,       // long-poll seconds
  POLL_RETRY_DELAY: 3000, // retry on error

  // Session
  SESSION_TIMEOUT: 10 * 60 * 1000, // 10 min idle session expiry

  // Authorized users (Telegram user IDs that can use the bot)
  // Empty array = allow all (not recommended for production)
  AUTHORIZED_USERS: [],

  // Default agent name for bot-created bookings
  DEFAULT_AGENT: 'Bot'
};

/* ============================================================
 * Hotel Preset Data (mirrors src/data/hotels.js PRESET_CONFIG)
 * ============================================================ */

var PRESET_CONFIG = [
  /* 新濠天地 (15) */
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H1',  room:'豪華客房(市景)',     threshold:300000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H2',  room:'豪華客房(表演湖景)', threshold:400000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H3',  room:'皇室豪華客房',       threshold:500000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H4',  room:'天閣',               threshold:800000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H5',  room:'巨星套房',           threshold:1500000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H6',  room:'新濠影滙明星觀景房', threshold:600000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H7',  room:'翠善庭',             threshold:2000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H8',  room:'富豪金鑽套房',       threshold:3000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H9',  room:'御苑豪華別墅',       threshold:5000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H10', room:'別墅',               threshold:8000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H11', room:'環球豪華客房',       threshold:350000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H12', room:'環球高級客房',       threshold:250000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H13', room:'迎尚客房',           threshold:200000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H14', room:'新濠鋒客房',         threshold:450000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H15', room:'新濠鋒套房',         threshold:1200000 },

  /* 新濠影滙 (10) */
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H1',  room:'影滙豪華客房',       threshold:300000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H2',  room:'影滙豪華套房',       threshold:500000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H3',  room:'影滙巨星套房',       threshold:800000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H4',  room:'8字摩天輪觀景房',    threshold:600000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H5',  room:'星級豪華套房',       threshold:700000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H6',  room:'豪華客房',           threshold:200000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H7',  room:'高級客房',           threshold:250000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H8',  room:'精選套房',           threshold:1000000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H9',  room:'至尊套房',           threshold:2000000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H10', room:'別墅',               threshold:5000000 },

  /* 金沙 (10) */
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H1',  room:'豪華客房', threshold:200000 },
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H2',  room:'高級客房', threshold:300000 },
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H3',  room:'豪華套房', threshold:500000 },
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H4',  room:'金沙套房', threshold:800000 },
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H5',  room:'御匾套房', threshold:1500000 },
  { casino:'金沙', hotel:'金沙城中心', code:'SAND-H6',  room:'總統套房', threshold:3000000 },
  { casino:'金沙', hotel:'康萊德',     code:'SAND-H7',  room:'豪華客房', threshold:400000 },
  { casino:'金沙', hotel:'康萊德',     code:'SAND-H8',  room:'豪華套房', threshold:600000 },
  { casino:'金沙', hotel:'瑞吉',       code:'SAND-H9',  room:'豪華客房', threshold:500000 },
  { casino:'金沙', hotel:'瑞吉',       code:'SAND-H10', room:'豪華套房', threshold:1000000 },

  /* 銀河 (25) */
  { casino:'銀河', hotel:'銀河',       code:'GAL-H1',  room:'豪華客房',     threshold:200000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H2',  room:'豪華套房',     threshold:400000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H3',  room:'皇家套房',     threshold:1000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H4',  room:'總統套房',     threshold:3000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H5',  room:'天際套房',     threshold:1500000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H6',  room:'至尊套房',     threshold:2000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H7',  room:'翠綠庭別墅',   threshold:5000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H8',  room:'藍寶石別墅',   threshold:6000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H9',  room:'白金別墅',     threshold:8000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H10', room:'鑽石別墅',     threshold:10000000 },
  { casino:'銀河', hotel:'悅榕庄',     code:'GAL-H11', room:'豪華客房',     threshold:500000 },
  { casino:'銀河', hotel:'悅榕庄',     code:'GAL-H12', room:'豪華套房',     threshold:800000 },
  { casino:'銀河', hotel:'悅榕庄',     code:'GAL-H13', room:'池畔別墅',     threshold:3000000 },
  { casino:'銀河', hotel:'大倉',       code:'GAL-H14', room:'豪華客房',     threshold:300000 },
  { casino:'銀河', hotel:'大倉',       code:'GAL-H15', room:'高級套房',     threshold:500000 },
  { casino:'銀河', hotel:'酒店JW',     code:'GAL-H16', room:'豪華客房',     threshold:400000 },
  { casino:'銀河', hotel:'酒店JW',     code:'GAL-H17', room:'行政套房',     threshold:700000 },
  { casino:'銀河', hotel:'百老匯',     code:'GAL-H18', room:'豪華客房',     threshold:200000 },
  { casino:'銀河', hotel:'百老匯',     code:'GAL-H19', room:'豪華套房',     threshold:400000 },
  { casino:'銀河', hotel:'麗思卡爾頓', code:'GAL-H20', room:'豪華客房',     threshold:600000 },
  { casino:'銀河', hotel:'麗思卡爾頓', code:'GAL-H21', room:'行政套房',     threshold:1000000 },
  { casino:'銀河', hotel:'麗思卡爾頓', code:'GAL-H22', room:'總統套房',     threshold:5000000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H23', room:'星際客房',     threshold:250000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H24', room:'環球客房',     threshold:300000 },
  { casino:'銀河', hotel:'銀河',       code:'GAL-H25', room:'水晶宮套房',   threshold:1800000 },

  /* 永利 (9) */
  { casino:'永利', hotel:'永利澳門',   code:'WYN-H1', room:'豪華客房',     threshold:300000 },
  { casino:'永利', hotel:'永利澳門',   code:'WYN-H2', room:'豪華套房',     threshold:500000 },
  { casino:'永利', hotel:'永利澳門',   code:'WYN-H3', room:'行政套房',     threshold:800000 },
  { casino:'永利', hotel:'永利澳門',   code:'WYN-H4', room:'永利套房',     threshold:1500000 },
  { casino:'永利', hotel:'永利澳門',   code:'WYN-H5', room:'總統套房',     threshold:3000000 },
  { casino:'永利', hotel:'永利皇宮',   code:'WYN-H6', room:'豪華客房',     threshold:400000 },
  { casino:'永利', hotel:'永利皇宮',   code:'WYN-H7', room:'豪華套房',     threshold:700000 },
  { casino:'永利', hotel:'永利皇宮',   code:'WYN-H8', room:'行政套房',     threshold:1200000 },
  { casino:'永利', hotel:'永利皇宮',   code:'WYN-H9', room:'永利皇宮套房', threshold:2500000 },

  /* 上葡京 (4) */
  { casino:'上葡京', hotel:'上葡京',   code:'LIS-H1', room:'豪華客房', threshold:300000 },
  { casino:'上葡京', hotel:'上葡京',   code:'LIS-H2', room:'高級套房', threshold:500000 },
  { casino:'上葡京', hotel:'上葡京',   code:'LIS-H3', room:'行政套房', threshold:1000000 },
  { casino:'上葡京', hotel:'上葡京',   code:'LIS-H4', room:'總統套房', threshold:3000000 }
];

/* Helper: get unique casinos */
function getCasinos() {
  var seen = {};
  var result = [];
  for (var i = 0; i < PRESET_CONFIG.length; i++) {
    if (!seen[PRESET_CONFIG[i].casino]) {
      seen[PRESET_CONFIG[i].casino] = true;
      result.push(PRESET_CONFIG[i].casino);
    }
  }
  return result;
}

/* Helper: get hotels by casino */
function getHotelsByCasino(casino) {
  var seen = {};
  var result = [];
  for (var i = 0; i < PRESET_CONFIG.length; i++) {
    if (PRESET_CONFIG[i].casino === casino && !seen[PRESET_CONFIG[i].hotel]) {
      seen[PRESET_CONFIG[i].hotel] = true;
      result.push(PRESET_CONFIG[i].hotel);
    }
  }
  return result;
}

/* Helper: get rooms by casino + hotel */
function getRooms(casino, hotel) {
  return PRESET_CONFIG.filter(function (r) {
    return r.casino === casino && r.hotel === hotel;
  });
}

/* Helper: get room by code */
function getRoomByCode(code) {
  for (var i = 0; i < PRESET_CONFIG.length; i++) {
    if (PRESET_CONFIG[i].code === code) return PRESET_CONFIG[i];
  }
  return null;
}

/* ============================================================
 * Telegram API Helpers
 * ============================================================ */

var TG_API = 'https://api.telegram.org/bot' + CONFIG.TELEGRAM_TOKEN;

function tgRequest(method, data, callback) {
  var body = JSON.stringify(data);
  var options = {
    hostname: 'api.telegram.org',
    path: '/bot' + CONFIG.TELEGRAM_TOKEN + '/' + method,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  var req = https.request(options, function (res) {
    var chunks = '';
    res.on('data', function (c) { chunks += c; });
    res.on('end', function () {
      try {
        var json = JSON.parse(chunks);
        if (json.ok) {
          if (callback) callback(null, json.result);
        } else {
          console.error('[TG] API error:', json.description);
          if (callback) callback(json.description);
        }
      } catch (e) {
        console.error('[TG] Parse error:', e.message);
        if (callback) callback(e.message);
      }
    });
  });

  req.on('error', function (e) {
    console.error('[TG] Request error:', e.message);
    if (callback) callback(e.message);
  });

  req.write(body);
  req.end();
}

function sendMessage(chatId, text, keyboard, callback) {
  var data = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (keyboard) {
    data.reply_markup = keyboard;
  }
  tgRequest('sendMessage', data, callback);
}

function editMessage(chatId, messageId, text, keyboard, callback) {
  var data = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: 'HTML'
  };
  if (keyboard) {
    data.reply_markup = keyboard;
  }
  tgRequest('editMessageText', data, callback);
}

function answerCallback(callbackId, text) {
  tgRequest('answerCallbackQuery', {
    callback_query_id: callbackId,
    text: text || ''
  });
}

/* ============================================================
 * Firebase REST API Helpers
 * ============================================================ */

function fbPut(path, data, callback) {
  var body = JSON.stringify(data);
  var url = CONFIG.FIREBASE.DB_URL + '/' + path + '.json';

  var options = {
    hostname: 'macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    path: '/' + path + '.json',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  var req = https.request(options, function (res) {
    var chunks = '';
    res.on('data', function (c) { chunks += c; });
    res.on('end', function () {
      try {
        var json = JSON.parse(chunks);
        if (callback) callback(null, json);
      } catch (e) {
        console.error('[FB] Parse error:', e.message);
        if (callback) callback(e.message);
      }
    });
  });

  req.on('error', function (e) {
    console.error('[FB] Request error:', e.message);
    if (callback) callback(e.message);
  });

  req.write(body);
  req.end();
}

function fbGet(path, callback) {
  var options = {
    hostname: 'macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    path: '/' + path + '.json',
    method: 'GET'
  };

  var req = https.request(options, function (res) {
    var chunks = '';
    res.on('data', function (c) { chunks += c; });
    res.on('end', function () {
      try {
        var json = JSON.parse(chunks);
        if (callback) callback(null, json);
      } catch (e) {
        console.error('[FB] Parse error:', e.message);
        if (callback) callback(e.message);
      }
    });
  });

  req.on('error', function (e) {
    console.error('[FB] Request error:', e.message);
    if (callback) callback(e.message);
  });

  req.end();
}

/* Generate unique Firebase key */
function generateFbKey() {
  var ts = Date.now().toString(36);
  var rand = crypto.randomBytes(6).toString('hex');
  return ts + '-' + rand;
}

/* Write a booking to Firebase */
function writeBookingToFirebase(booking, callback) {
  var key = booking._fbKey;
  fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(key), booking, function (err, result) {
    if (err) {
      console.error('[FB] Failed to write booking:', key, err);
      if (callback) callback(err);
    } else {
      console.log('[FB] Booking written:', key);
      if (callback) callback(null, result);
    }
  });
}

/* Write a bot log to Firebase */
function writeBotLog(log, callback) {
  var key = log._fbKey || generateFbKey();
  log._fbKey = key;
  fbPut(CONFIG.FIREBASE.PATHS.BOT_LOGS + '/' + encodeURIComponent(key), log, function (err) {
    if (err) {
      console.error('[FB] Failed to write bot log:', err);
    } else {
      console.log('[FB] Bot log written:', key);
    }
    if (callback) callback(err);
  });
}

/* ============================================================
 * Session Management
 * ============================================================ */

var sessions = {};

function getSession(userId) {
  if (sessions[userId]) {
    // Check expiry
    if (Date.now() - sessions[userId].lastActivity > CONFIG.SESSION_TIMEOUT) {
      delete sessions[userId];
      return null;
    }
    sessions[userId].lastActivity = Date.now();
    return sessions[userId];
  }
  return null;
}

function createSession(userId, chatId, agentName) {
  sessions[userId] = {
    chatId: chatId,
    agentName: agentName,
    step: 'menu',
    data: {},
    lastActivity: Date.now()
  };
  return sessions[userId];
}

function clearSession(userId) {
  delete sessions[userId];
}

/* ============================================================
 * Booking Flow — Button-based Conversation
 * ============================================================ */

var STEPS = {
  MENU:           'menu',
  CASINO_SELECT:  'casino_select',
  HOTEL_SELECT:   'hotel_select',
  ROOM_SELECT:    'room_select',
  GUEST_NAME:     'guest_name',
  CHECK_IN:       'check_in',
  CHECK_OUT:      'check_out',
  ROOM_COUNT:     'room_count',
  COMP_TYPE:      'comp_type',
  TRANSFER:       'transfer',
  PHONE:          'phone',
  FLIGHT:         'flight',
  SPECIAL:        'special',
  CONFIRM:        'confirm'
};

/* Build InlineKeyboard */
function kb(rows) {
  return { inline_keyboard: rows };
}

/* Main menu keyboard */
function mainMenuKB() {
  return kb([
    [{ text: '📝 新增訂房', callback_data: 'book_start' }],
    [
      { text: '📋 查詢訂房', callback_data: 'book_list' },
      { text: '📊 本月統計', callback_data: 'book_stats' }
    ],
    [{ text: '❓ 使用說明', callback_data: 'book_help' }]
  ]);
}

/* Casino selection keyboard */
function casinoKB() {
  var casinos = getCasinos();
  var rows = [];
  var row = [];
  for (var i = 0; i < casinos.length; i++) {
    row.push({ text: casinos[i], callback_data: 'casino:' + casinos[i] });
    if (row.length === 2) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) rows.push(row);
  rows.push([{ text: '⬅️ 取消', callback_data: 'book_cancel' }]);
  return kb(rows);
}

/* Hotel selection keyboard */
function hotelKB(casino) {
  var hotels = getHotelsByCasino(casino);
  var rows = [];
  for (var i = 0; i < hotels.length; i++) {
    rows.push([{ text: hotels[i], callback_data: 'hotel:' + hotels[i] }]);
  }
  rows.push([{ text: '⬅️ 返回', callback_data: 'book_back_casino' }]);
  return kb(rows);
}

/* Room selection keyboard */
function roomKB(casino, hotel) {
  var rooms = getRooms(casino, hotel);
  var rows = [];
  for (var i = 0; i < rooms.length; i++) {
    var label = rooms[i].room + ' (門檻: ' + formatNum(rooms[i].threshold) + ')';
    rows.push([{ text: label, callback_data: 'room:' + rooms[i].code }]);
  }
  rows.push([{ text: '⬅️ 返回', callback_data: 'book_back_hotel' }]);
  return kb(rows);
}

/* Comp type keyboard */
function compTypeKB() {
  return kb([
    [
      { text: '免費房', callback_data: 'comp:free-room' },
      { text: '折扣房', callback_data: 'comp:discount' }
    ],
    [{ text: '付費房', callback_data: 'comp:paid' }],
    [{ text: '⬅️ 取消', callback_data: 'book_cancel' }]
  ]);
}

/* Transfer keyboard */
function transferKB() {
  return kb([
    [{ text: '無', callback_data: 'transfer:none' }],
    [
      { text: '機場接送', callback_data: 'transfer:airport' },
      { text: '碼頭接送', callback_data: 'transfer:ferry' }
    ],
    [{ text: '機場+碼頭', callback_data: 'transfer:both' }],
    [{ text: '跳過', callback_data: 'transfer:skip' }]
  ]);
}

/* Confirm keyboard */
function confirmKB() {
  return kb([
    [
      { text: '✅ 確認送出', callback_data: 'book_confirm' },
      { text: '❌ 取消', callback_data: 'book_cancel' }
    ]
  ]);
}

/* ============================================================
 * Formatting Helpers
 * ============================================================ */

function formatNum(n) {
  if (!n) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function calcNights(checkIn, checkOut) {
  try {
    var d1 = new Date(checkIn);
    var d2 = new Date(checkOut);
    var diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  } catch (e) {
    return 0;
  }
}

function getCurrentMonth() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function getDisplayName(user) {
  var name = user.first_name || '';
  if (user.last_name) name += ' ' + user.last_name;
  return name.trim() || (user.username || 'Unknown');
}

/* ============================================================
 * Message Handlers
 * ============================================================ */

function handleStart(msg) {
  var chatId = msg.chat.id;
  var user = msg.from;

  // Check authorization
  if (CONFIG.AUTHORIZED_USERS.length > 0 && CONFIG.AUTHORIZED_USERS.indexOf(user.id) === -1) {
    sendMessage(chatId, '⛔ 您沒有權限使用此機器人。', null);
    return;
  }

  var name = getDisplayName(user);
  var text = '歡迎來到 <b>BookingHub</b> 訂房系統！\n\n';
  text += '您好，' + escapeHtml(name) + '！\n';
  text += '我是 VIP 貴賓廳訂房助手，可以幫您快速建立訂房記錄。\n\n';
  text += '請選擇以下操作：';

  sendMessage(chatId, text, mainMenuKB());
}

function handleHelp(msg) {
  var chatId = msg.chat.id;
  var text = '<b>BookingHub Bot 使用說明</b>\n\n';
  text += '📝 <b>新增訂房</b> — 透過按鈕逐步填寫訂房資料\n';
  text += '📋 <b>查詢訂房</b> — 查看本月的訂房列表\n';
  text += '📊 <b>本月統計</b> — 查看本月的訂房統計\n\n';
  text += '<b>訂房流程：</b>\n';
  text += '1. 選擇體系（新濠天地/銀河等）\n';
  text += '2. 選擇酒店\n';
  text += '3. 選擇房型（含洗碼門檻）\n';
  text += '4. 輸入客人姓名\n';
  text += '5. 輸入入住日期（YYYY-MM-DD）\n';
  text += '6. 輸入退房日期\n';
  text += '7. 輸入房間數量\n';
  text += '8. 選擇補償類型\n';
  text += '9. 選擇接送安排\n';
  text += '10. 確認並送出\n\n';
  text += '送出後資料將即時同步到管理系統。';
  sendMessage(chatId, text, mainMenuKB());
}

function handleText(msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var text = msg.text || '';

  // Check authorization
  if (CONFIG.AUTHORIZED_USERS.length > 0 && CONFIG.AUTHORIZED_USERS.indexOf(userId) === -1) {
    return; // Silently ignore
  }

  if (text === '/start' || text === '/help') {
    handleStart(msg);
    return;
  }

  if (text === '/book') {
    startBooking(userId, chatId, msg.from);
    return;
  }

  if (text === '/cancel') {
    clearSession(userId);
    sendMessage(chatId, '已取消操作。', mainMenuKB());
    return;
  }

  // Handle session text input
  var session = getSession(userId);
  if (!session) {
    sendMessage(chatId, '請使用 /book 開始新增訂房，或 /help 查看說明。', mainMenuKB());
    return;
  }

  // Process based on current step
  handleSessionInput(userId, chatId, session, text, msg.from);
}

function handleSessionInput(userId, chatId, session, text, user) {
  switch (session.step) {
    case STEPS.GUEST_NAME:
      session.data.guestName = text.trim();
      session.step = STEPS.CHECK_IN;
      sendMessage(chatId, '✅ 客人姓名：<b>' + escapeHtml(text.trim()) + '</b>\n\n請輸入<b>入住日期</b>（格式：YYYY-MM-DD，例如：2026-07-15）：');
      break;

    case STEPS.CHECK_IN:
      if (!isValidDate(text.trim())) {
        sendMessage(chatId, '❌ 日期格式不正確，請使用 YYYY-MM-DD 格式（例如：2026-07-15）：');
        return;
      }
      session.data.checkIn = text.trim();
      session.step = STEPS.CHECK_OUT;
      sendMessage(chatId, '✅ 入住日期：<b>' + text.trim() + '</b>\n\n請輸入<b>退房日期</b>（YYYY-MM-DD）：');
      break;

    case STEPS.CHECK_OUT:
      if (!isValidDate(text.trim())) {
        sendMessage(chatId, '❌ 日期格式不正確，請使用 YYYY-MM-DD 格式：');
        return;
      }
      if (calcNights(session.data.checkIn, text.trim()) <= 0) {
        sendMessage(chatId, '❌ 退房日期必須在入住日期之後，請重新輸入：');
        return;
      }
      session.data.checkOut = text.trim();
      session.data.nights = calcNights(session.data.checkIn, text.trim());
      session.step = STEPS.ROOM_COUNT;
      sendMessage(chatId, '✅ 退房日期：<b>' + text.trim() + '</b>（共 ' + session.data.nights + ' 晚）\n\n請輸入<b>房間數量</b>（直接輸入數字，如 1）：');
      break;

    case STEPS.ROOM_COUNT:
      var count = parseInt(text.trim(), 10);
      if (!count || count < 1) {
        sendMessage(chatId, '❌ 請輸入有效的房間數量（大於 0 的整數）：');
        return;
      }
      session.data.roomCount = count;
      session.step = STEPS.COMP_TYPE;
      sendMessage(chatId, '✅ 房間數量：<b>' + count + '</b>\n\n請選擇<b>補償類型</b>：', compTypeKB());
      break;

    case STEPS.PHONE:
      session.data.phone = text.trim();
      session.step = STEPS.FLIGHT;
      sendMessage(chatId, '✅ 手機號碼已記錄\n\n請輸入<b>航班號碼</b>（或輸入「無」跳過）：');
      break;

    case STEPS.FLIGHT:
      session.data.flightNo = (text.trim() === '無' || text.trim() === '無'.toLowerCase()) ? '' : text.trim();
      session.step = STEPS.SPECIAL;
      sendMessage(chatId, '✅ 已記錄\n\n請輸入<b>特殊需求/備註</b>（或輸入「無」跳過）：');
      break;

    case STEPS.SPECIAL:
      session.data.specialRequest = (text.trim() === '無') ? '' : text.trim();
      session.step = STEPS.CONFIRM;
      showConfirm(chatId, session);
      break;

    default:
      sendMessage(chatId, '請使用下方按鈕操作，或輸入 /cancel 取消。');
      break;
  }
}

function startBooking(userId, chatId, user) {
  var agentName = getDisplayName(user);
  var session = createSession(userId, chatId, agentName);
  session.step = STEPS.CASINO_SELECT;
  session.data = {
    agent: agentName,
    operator: 'Bot',
    _source: 'bot'
  };

  var text = '<b>📝 新增訂房</b>\n\n';
  text += '請選擇<b>體系</b>：';
  sendMessage(chatId, text, casinoKB());
}

function showConfirm(chatId, session) {
  var d = session.data;
  var room = getRoomByCode(d.roomCode);
  var text = '<b>📋 訂房確認</b>\n\n';
  text += '👤 客人姓名：<b>' + escapeHtml(d.guestName) + '</b>\n';
  text += '🏢 體系：' + (d.casino || '-') + '\n';
  text += '🏨 酒店：' + (d.hotel || '-') + '\n';
  text += '🛏️ 房型：' + (d.roomType || '-') + '\n';
  text += '📅 入住：' + (d.checkIn || '-') + '\n';
  text += '📅 退房：' + (d.checkOut || '-') + '（' + (d.nights || 0) + ' 晚）\n';
  text += '🔢 房間數：' + (d.roomCount || 1) + '\n';
  text += '💼 補償類型：' + (d.compTypeLabel || '-') + '\n';
  text += '🚗 接送：' + (d.transferLabel || '無') + '\n';
  text += '💰 洗碼門檻：' + formatNum(room ? room.threshold : 0) + '\n';
  if (d.phone) text += '📱 手機：' + escapeHtml(d.phone) + '\n';
  if (d.flightNo) text += '✈️ 航班：' + escapeHtml(d.flightNo) + '\n';
  if (d.specialRequest) text += '📝 備註：' + escapeHtml(d.specialRequest) + '\n';
  text += '\n請確認以上資料是否正確？';
  sendMessage(chatId, text, confirmKB());
}

function handleCallback(cb) {
  var userId = cb.from.id;
  var chatId = cb.message.chat.id;
  var data = cb.data;
  var user = cb.from;

  // Check authorization
  if (CONFIG.AUTHORIZED_USERS.length > 0 && CONFIG.AUTHORIZED_USERS.indexOf(userId) === -1) {
    answerCallback(cb.id, '無權限');
    return;
  }

  answerCallback(cb.id);

  // Handle cancel
  if (data === 'book_cancel') {
    clearSession(userId);
    sendMessage(chatId, '❌ 已取消訂房。', mainMenuKB());
    return;
  }

  // Handle back to menu
  if (data === 'book_menu') {
    clearSession(userId);
    sendMessage(chatId, '返回主選單。', mainMenuKB());
    return;
  }

  // Handle help
  if (data === 'book_help') {
    handleHelp({ chat: { id: chatId } });
    return;
  }

  // Handle list
  if (data === 'book_list') {
    showBookingList(chatId, user);
    return;
  }

  // Handle stats
  if (data === 'book_stats') {
    showMonthlyStats(chatId, user);
    return;
  }

  // Start booking
  if (data === 'book_start') {
    startBooking(userId, chatId, user);
    return;
  }

  // Get or create session for multi-step flows
  var session = getSession(userId);
  if (!session) {
    // Restart if session expired
    if (data.indexOf('casino:') === 0) {
      session = createSession(userId, chatId, getDisplayName(user));
      session.data = { agent: getDisplayName(user), operator: 'Bot', _source: 'bot' };
    } else {
      sendMessage(chatId, '操作已逾時，請重新開始。', mainMenuKB());
      return;
    }
  }

  // Casino selection
  if (data.indexOf('casino:') === 0) {
    var casino = data.substring(7);
    session.data.casino = casino;
    session.step = STEPS.HOTEL_SELECT;
    sendMessage(chatId, '✅ 體系：<b>' + escapeHtml(casino) + '</b>\n\n請選擇<b>酒店</b>：', hotelKB(casino));
    return;
  }

  // Back to casino
  if (data === 'book_back_casino') {
    session.step = STEPS.CASINO_SELECT;
    sendMessage(chatId, '請選擇<b>體系</b>：', casinoKB());
    return;
  }

  // Hotel selection
  if (data.indexOf('hotel:') === 0) {
    var hotel = data.substring(6);
    session.data.hotel = hotel;
    session.step = STEPS.ROOM_SELECT;
    sendMessage(chatId, '✅ 酒店：<b>' + escapeHtml(hotel) + '</b>\n\n請選擇<b>房型</b>（含洗碼門檻）：', roomKB(session.data.casino, hotel));
    return;
  }

  // Back to hotel
  if (data === 'book_back_hotel') {
    session.step = STEPS.HOTEL_SELECT;
    sendMessage(chatId, '請選擇<b>酒店</b>：', hotelKB(session.data.casino));
    return;
  }

  // Room selection
  if (data.indexOf('room:') === 0) {
    var code = data.substring(5);
    var room = getRoomByCode(code);
    if (room) {
      session.data.roomCode = code;
      session.data.roomType = room.room;
      session.data.threshold = room.threshold;
      session.step = STEPS.GUEST_NAME;
      sendMessage(chatId, '✅ 房型：<b>' + escapeHtml(room.room) + '</b>\n💰 洗碼門檻：' + formatNum(room.threshold) + '\n\n請輸入<b>客人姓名</b>：');
    }
    return;
  }

  // Comp type
  if (data.indexOf('comp:') === 0) {
    var comp = data.substring(5);
    var compLabels = { 'free-room': '免費房', 'discount': '折扣房', 'paid': '付費房' };
    session.data.compType = comp;
    session.data.compTypeLabel = compLabels[comp] || comp;
    session.step = STEPS.TRANSFER;
    sendMessage(chatId, '✅ 補償類型：<b>' + session.data.compTypeLabel + '</b>\n\n請選擇<b>接送安排</b>：', transferKB());
    return;
  }

  // Transfer
  if (data.indexOf('transfer:') === 0) {
    var transferVal = data.substring(9);
    if (transferVal === 'skip') transferVal = 'none';
    var transferLabels = { none: '無', airport: '機場接送', ferry: '碼頭接送', both: '機場+碼頭' };
    session.data.transfer = transferVal;
    session.data.transferLabel = transferLabels[transferVal] || '無';
    session.step = STEPS.PHONE;
    sendMessage(chatId, '✅ 接送：<b>' + session.data.transferLabel + '</b>\n\n請輸入<b>手機號碼</b>（或輸入「無」跳過）：');
    return;
  }

  // Confirm
  if (data === 'book_confirm') {
    submitBooking(chatId, userId, session, user);
    return;
  }
}

/* ============================================================
 * Submit Booking to Firebase
 * ============================================================ */

function submitBooking(chatId, userId, session, user) {
  var d = session.data;
  var now = Date.now();
  var fbKey = generateFbKey();

  var booking = {
    _fbKey:        fbKey,
    _createdAt:    now,
    _updatedAt:    now,
    _source:       'bot',

    guestName:     d.guestName || '',
    guestCount:    1,
    agent:         d.agent || getDisplayName(user),
    operator:      'Bot',
    phone:         d.phone || '',

    casino:        d.casino || '',
    hotel:         d.hotel || '',
    roomType:      d.roomType || '',
    roomCount:     d.roomCount || 1,
    month:         getCurrentMonth(),

    checkIn:       d.checkIn || '',
    checkOut:      d.checkOut || '',
    nights:        d.nights || calcNights(d.checkIn, d.checkOut),
    status:        'pending',

    compType:      d.compType || 'free-room',
    threshold:     d.threshold || 0,
    volume:        0,
    pricePerNight: 0,
    totalCost:     0,

    transfer:       d.transfer || 'none',
    transferDetail: '',
    flightNo:       d.flightNo || '',
    specialRequest: d.specialRequest || '',
    note:           ''
  };

  sendMessage(chatId, '⏳ 正在送出訂房資料...');

  writeBookingToFirebase(booking, function (err) {
    if (err) {
      sendMessage(chatId, '❌ 訂房送出失敗：' + err + '\n請稍後重試或聯繫管理員。', mainMenuKB());
      return;
    }

    // Write bot log
    var log = {
      _fbKey:     generateFbKey(),
      _createdAt: now,
      agentName:  booking.agent,
      action:     'booking_create',
      message:    'Bot 建立訂房：' + booking.guestName + ' / ' + booking.casino + ' / ' + booking.roomType + ' / ' + booking.checkIn + '~' + booking.checkOut,
      bookingKey: fbKey,
      userId:     user.id,
      userName:   getDisplayName(user)
    };
    writeBotLog(log);

    // Success message
    var text = '✅ <b>訂房已建立！</b>\n\n';
    text += '📋 訂房編號：<code>' + fbKey + '</code>\n';
    text += '👤 客人：' + escapeHtml(booking.guestName) + '\n';
    text += '🏨 ' + booking.casino + ' / ' + booking.hotel + '\n';
    text += '🛏️ ' + booking.roomType + '\n';
    text += '📅 ' + booking.checkIn + ' ~ ' + booking.checkOut + '（' + booking.nights + ' 晚）\n';
    text += '🔢 房間數：' + booking.roomCount + '\n';
    text += '💰 洗碼門檻：' + formatNum(booking.threshold) + '\n';
    text += '\n資料已即時同步到管理系統。';

    clearSession(userId);
    sendMessage(chatId, text, mainMenuKB());
  });
}

/* ============================================================
 * Query Bookings
 * ============================================================ */

function showBookingList(chatId, user) {
  var month = getCurrentMonth();
  sendMessage(chatId, '⏳ 正在查詢本月訂房...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查詢失敗或本月無訂房記錄。', mainMenuKB());
      return;
    }

    var bookings = [];
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && b.month === month) {
          bookings.push(b);
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '本月（' + month + '）暫無訂房記錄。', mainMenuKB());
      return;
    }

    // Sort by checkIn date
    bookings.sort(function (a, b) {
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    });

    var text = '<b>📋 本月訂房列表</b>（' + month + '）\n';
    text += '共 <b>' + bookings.length + '</b> 筆\n\n';

    for (var i = 0; i < Math.min(bookings.length, 15); i++) {
      var b = bookings[i];
      var statusIcons = {
        'pending':     '⏳',
        'confirmed':   '✅',
        'checked-in':  '🟢',
        'checked-out': '⚪',
        'cancelled':   '❌'
      };
      text += statusIcons[b.status] + ' ' + (i + 1) + '. ';
      text += '<b>' + escapeHtml(b.guestName || '-') + '</b>';
      text += ' — ' + (b.casino || '') + ' / ' + (b.roomType || '') + '\n';
      text += '   📅 ' + (b.checkIn || '?') + ' ~ ' + (b.checkOut || '?') + ' (' + (b.nights || 0) + '晚) ' + (b.roomCount || 1) + '房\n';
      if (b.agent) text += '   👤 ' + escapeHtml(b.agent) + '\n';
      text += '\n';
    }

    if (bookings.length > 15) {
      text += '... 還有 ' + (bookings.length - 15) + ' 筆，請至管理系統查看完整列表。';
    }

    sendMessage(chatId, text, mainMenuKB());
  });
}

/* ============================================================
 * Monthly Stats
 * ============================================================ */

function showMonthlyStats(chatId, user) {
  var month = getCurrentMonth();
  sendMessage(chatId, '⏳ 正在統計本月數據...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查詢失敗。', mainMenuKB());
      return;
    }

    var bookings = [];
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && b.month === month) {
          bookings.push(b);
        }
      }
    }

    var totalBookings = bookings.length;
    var totalRooms = 0;
    var totalNights = 0;
    var totalThreshold = 0;
    var totalVolume = 0;
    var statusCounts = { pending: 0, confirmed: 0, 'checked-in': 0, 'checked-out': 0, cancelled: 0 };
    var casinoCounts = {};

    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var rc = b.roomCount || 1;
      var n = b.nights || 0;
      totalRooms += rc;
      totalNights += n * rc;
      totalThreshold += (b.threshold || 0) * rc;
      totalVolume += b.volume || 0;
      if (statusCounts[b.status] !== undefined) statusCounts[b.status]++;
      if (b.casino) {
        casinoCounts[b.casino] = (casinoCounts[b.casino] || 0) + 1;
      }
    }

    var thresholdRate = totalThreshold > 0 ? Math.round(totalVolume / totalThreshold * 100) : 0;

    var text = '<b>📊 本月統計</b>（' + month + '）\n\n';
    text += '📝 訂房總數：<b>' + totalBookings + '</b>\n';
    text += '🛏️ 房間總數：<b>' + totalRooms + '</b>\n';
    text += '🌙 總房晚：<b>' + totalNights + '</b>\n';
    text += '💰 總洗碼門檻：' + formatNum(totalThreshold) + '\n';
    text += '📈 總洗碼量：' + formatNum(totalVolume) + '\n';
    text += '🎯 門檻達成率：<b>' + thresholdRate + '%</b>\n\n';

    text += '<b>狀態分佈：</b>\n';
    text += '⏳ 待確認：' + statusCounts.pending + '\n';
    text += '✅ 已確認：' + statusCounts.confirmed + '\n';
    text += '🟢 已入住：' + statusCounts['checked-in'] + '\n';
    text += '⚪ 已退房：' + statusCounts['checked-out'] + '\n';
    text += '❌ 已取消：' + statusCounts.cancelled + '\n\n';

    if (Object.keys(casinoCounts).length > 0) {
      text += '<b>體系分佈：</b>\n';
      for (var casino in casinoCounts) {
        text += '  ' + casino + '：' + casinoCounts[casino] + '\n';
      }
    }

    sendMessage(chatId, text, mainMenuKB());
  });
}

/* ============================================================
 * Utility
 * ============================================================ */

function isValidDate(str) {
  if (!str) return false;
  var regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) return false;
  var d = new Date(str);
  return !isNaN(d.getTime());
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ============================================================
 * Long-Polling Loop
 * ============================================================ */

var lastUpdateId = 0;
var polling = false;

function startPolling() {
  if (polling) return;
  polling = true;

  console.log('[Bot] Starting long-polling...');

  function poll() {
    var body = JSON.stringify({
      offset: lastUpdateId + 1,
      timeout: CONFIG.POLL_TIMEOUT,
      allowed_updates: ['message', 'callback_query']
    });

    var options = {
      hostname: 'api.telegram.org',
      path: '/bot' + CONFIG.TELEGRAM_TOKEN + '/getUpdates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: (CONFIG.POLL_TIMEOUT + 10) * 1000
    };

    var req = https.request(options, function (res) {
      var chunks = '';
      res.on('data', function (c) { chunks += c; });
      res.on('end', function () {
        try {
          var json = JSON.parse(chunks);
          if (json.ok && json.result && json.result.length > 0) {
            for (var i = 0; i < json.result.length; i++) {
              var update = json.result[i];
              lastUpdateId = update.update_id;

              if (update.message) {
                handleText(update.message);
              } else if (update.callback_query) {
                handleCallback(update.callback_query);
              }
            }
          }
        } catch (e) {
          console.error('[Poll] Parse error:', e.message);
        }
        // Continue polling
        setTimeout(poll, 100);
      });
    });

    req.on('error', function (e) {
      console.error('[Poll] Error:', e.message);
      console.log('[Poll] Retrying in ' + (CONFIG.POLL_RETRY_DELAY / 1000) + 's...');
      setTimeout(poll, CONFIG.POLL_RETRY_DELAY);
    });

    req.on('timeout', function () {
      req.destroy();
    });

    req.write(body);
    req.end();
  }

  poll();
}

/* ============================================================
 * Startup
 * ============================================================ */

function start() {
  if (!CONFIG.TELEGRAM_TOKEN) {
    console.error('========================================');
    console.error('  ERROR: TELEGRAM_BOT_TOKEN is not set!');
    console.error('');
    console.error('  Set it via environment variable:');
    console.error('    set TELEGRAM_BOT_TOKEN=your_token_here');
    console.error('    node bot/bot.js');
    console.error('');
    console.error('  Or get a token from @BotFather on Telegram.');
    console.error('========================================');
    process.exit(1);
  }

  console.log('');
  console.log('========================================');
  console.log('  BookingHub Telegram Bot');
  console.log('  v1.0.0');
  console.log('========================================');
  console.log('');
  console.log('[Bot] Token: ' + CONFIG.TELEGRAM_TOKEN.substring(0, 10) + '...');
  console.log('[Bot] Firebase DB: ' + CONFIG.FIREBASE.DB_URL);
  console.log('[Bot] FB Path prefix: booking_data/');
  console.log('[Bot] Hotel presets: ' + PRESET_CONFIG.length + ' rooms');
  console.log('[Bot] Casinos: ' + getCasinos().join(', '));
  console.log('');

  // Test bot connection
  tgRequest('getMe', {}, function (err, result) {
    if (err) {
      console.error('[Bot] Connection test failed:', err);
      console.error('[Bot] Please check your TELEGRAM_BOT_TOKEN');
      process.exit(1);
    }

    console.log('[Bot] Connected as @' + result.username + ' (' + result.first_name + ')');
    console.log('[Bot] Bot ID: ' + result.id);
    console.log('');

    // Start polling
    startPolling();

    console.log('');
    console.log('[Bot] Bot is now running. Press Ctrl+C to stop.');
    console.log('[Bot] Send /start to your bot on Telegram to begin.');
    console.log('');
  });
}

/* Handle graceful shutdown */
process.on('SIGINT', function () {
  console.log('\n[Bot] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', function () {
  console.log('\n[Bot] Received SIGTERM, shutting down...');
  process.exit(0);
});

/* Start the bot */
start();
