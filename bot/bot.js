/**
 * bot/bot.js — Telegram Bot for BookingHub v2.0.0 (v8 spec)
 * VIP 贵宾厅订房管理系统 — Telegram Bot 后端
 *
 * v8 Features:
 *   - Chinese bot commands (/新增授权 /订房 /确认号 /修改 /取消 /查询)
 *   - Paste-text parsing mode (4 items: name/checkIn/checkOut/remark)
 *   - Mixed mode (text parse + button selection for casino/hotel/roomType/agent)
 *   - Two-level permissions (admin / staff)
 *   - Daily scan at 09:00 (auto status transition)
 *   - Reminder 3 days before check-in (for bookings without confirmNo)
 *   - Recent agent memory (5 per employee)
 *   - Direct Firebase RTDB writes via REST API
 *   - Long-polling (no webhook URL needed)
 *
 * Usage:
 *   set TELEGRAM_BOT_TOKEN=your_token_here
 *   node bot/bot.js
 *
 * Zero external npm dependencies — uses Node.js built-in modules only.
 */

var https = require('https');
var crypto = require('crypto');

/* ============================================================
 * Configuration
 * ============================================================ */

/* Try loading config file if env var not set */
var _botToken = process.env.TELEGRAM_BOT_TOKEN || '';
if (!_botToken) {
  try { _botToken = require('./config').TELEGRAM_BOT_TOKEN || ''; } catch (e) { /* config.js not found */ }
}

var CONFIG = {
  TELEGRAM_TOKEN: _botToken,

  FIREBASE: {
    DB_URL: 'https://macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    DB_HOST: 'macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    PATHS: {
      BOOKINGS:      'booking_data/bookings',
      HOTEL_CONFIG:  'booking_data/hotelConfig',
      AGENT_LIST:    'booking_data/agentList',
      EMPLOYEE_LIST: 'booking_data/employeeList',
      ARCHIVES:      'booking_data/archives',
      BOT_LOGS:      'booking_data/botLogs',
      CLOSED_MONTHS: 'booking_data/closedMonths',
      SETTINGS:      'booking_data/settings'
    }
  },

  POLL_TIMEOUT: 30,
  POLL_RETRY_DELAY: 3000,

  SESSION_TIMEOUT: 30 * 60 * 1000,  // 30 min

  REMINDER_DAYS_BEFORE: 3,
  DAILY_SCAN_TIME: '09:00',
  RECENT_AGENT_LIMIT: 5,

  CACHE_REFRESH_MS: 5 * 60 * 1000  // refresh caches every 5 min
};

/* v8 Constants (mirrored from src/core/constants.js) */

var ROOM_TYPES = [
  { value: 'king',          label: '大床房' },
  { value: 'twin',          label: '双床房' },
  { value: 'mini-suite',    label: '小套房' },
  { value: 'grand-suite',   label: '大套房' },
  { value: 'two-bedroom',   label: '二房一厅' },
  { value: 'three-bedroom', label: '三房一厅' }
];

var botUsername = null; /* Set from getMe on startup */

var CASINO_ORDER = ['新濠天地', '新濠影汇', '金沙', '银河', '永利', '上葡京'];

var BOOKING_STATUS = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  CHECKED_IN:  'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED:   'cancelled'
};

var STATUS_LABELS = {
  pending:      '待确认',
  confirmed:    '已确认',
  'checked-in': '已入住',
  'checked-out':'已退房',
  cancelled:    '已取消'
};

var STATUS_ICONS = {
  pending:       '⏳',
  confirmed:     '✅',
  'checked-in':  '🟢',
  'checked-out': '⚪',
  cancelled:     '❌'
};

var STATUS_RULES = {
  pending:       { canEdit: true,  canCancel: true,  canEditDates: true  },
  confirmed:     { canEdit: true,  canCancel: true,  canEditDates: true  },
  'checked-in':  { canEdit: true,  canCancel: false, canEditDates: true  },
  'checked-out': { canEdit: false, canCancel: false, canEditDates: false },
  cancelled:     { canEdit: false, canCancel: false, canEditDates: false }
};

var STATUS_AUTO_TRANSITION = {
  toCheckedIn:  ['pending', 'confirmed'],
  toCheckedOut: ['checked-in'],
  toArchive:    ['checked-out', 'cancelled']
};

var FEE_TYPES = { FREE: 'free', PAID: 'paid' };
var CURRENCY_DEFAULT = 'HKD';
var EMPLOYEE_ROLES = { ADMIN: 'admin', STAFF: 'staff' };

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

/* Set bot commands menu (English commands only, Chinese descriptions) */
function setBotCommands() {
  var commands = [
    { command: 'newauth',   description: '管理员授权新员工 [管理员]' },
    { command: 'book',      description: '开始订房流程' },
    { command: 'confirmno', description: '填入确认编号（支持批量粘贴）' },
    { command: 'modify',    description: '修改订房资料' },
    { command: 'cancel',    description: '取消订房' },
    { command: 'query',     description: '查询订房记录' }
  ];
  tgRequest('setMyCommands', { commands: commands }, function (err) {
    if (err) {
      console.error('[Bot] Failed to set commands:', err);
    } else {
      console.log('[Bot] Commands menu set');
    }
  });
}

/* ============================================================
 * Firebase REST API Helpers
 * ============================================================ */

function fbRequest(method, path, data, callback) {
  var body = data ? JSON.stringify(data) : null;
  var options = {
    hostname: CONFIG.FIREBASE.DB_HOST,
    path: '/' + path + '.json',
    method: method,
    headers: {}
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }

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

  if (body) req.write(body);
  req.end();
}

function fbGet(path, callback) {
  fbRequest('GET', path, null, callback);
}

function fbPut(path, data, callback) {
  fbRequest('PUT', path, data, callback);
}

function fbPatch(path, data, callback) {
  fbRequest('PATCH', path, data, callback);
}

/* Generate unique Firebase key */
function generateFbKey() {
  var ts = Date.now().toString(36);
  var rand = crypto.randomBytes(6).toString('hex');
  return ts + '-' + rand;
}

/* Generate a friendly booking number for display (B + YYMMDD + 4-digit random) */
function generateBookingNo() {
  var now = new Date();
  var yy = String(now.getFullYear()).slice(-2);
  var mm = String(now.getMonth() + 1).padStart(2, '0');
  var dd = String(now.getDate()).padStart(2, '0');
  var r = Math.floor(1000 + Math.random() * 9000);
  return 'B' + yy + mm + dd + '-' + r;
}

/* Encode Firebase key (replace invalid chars) */
function encodeFbKey(str) {
  if (!str) return 'key_' + Date.now();
  return String(str)
    .replace(/\./g, '_')
    .replace(/#/g, '_')
    .replace(/\$/g, '_')
    .replace(/\[/g, '_')
    .replace(/\]/g, '_')
    .replace(/\//g, '_')
    .replace(/@/g, '_');
}

/* Write a booking to Firebase */
function writeBooking(booking, callback) {
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
    }
    if (callback) callback(err);
  });
}

/* ============================================================
 * Cache Management (hotelConfig, agentList, employeeList)
 * ============================================================ */

var cache = {
  hotelConfig: null,
  agentList: null,
  employeeList: null,
  lastRefresh: 0,
  refreshing: false  /* Prevents concurrent refresh calls */
};

function refreshCache(callback) {
  /* Prevent concurrent refresh — if already refreshing, skip */
  if (cache.refreshing) {
    if (callback) callback();
    return;
  }
  cache.refreshing = true;

  var pending = 3;
  var done = false;

  function checkDone() {
    pending--;
    if (pending <= 0 && !done) {
      done = true;
      cache.lastRefresh = Date.now();
      cache.refreshing = false;
      if (callback) callback();
    }
  }

  /* Fetch hotel config */
  fbGet(CONFIG.FIREBASE.PATHS.HOTEL_CONFIG, function (err, data) {
    if (!err && data) {
      cache.hotelConfig = data;
      console.log('[Cache] Hotel config loaded:', getCasinoCount(), 'casinos');
    }
    checkDone();
  });

  /* Fetch agent list */
  fbGet(CONFIG.FIREBASE.PATHS.AGENT_LIST, function (err, data) {
    if (!err && data) {
      cache.agentList = data;
    }
    checkDone();
  });

  /* Fetch employee list */
  fbGet(CONFIG.FIREBASE.PATHS.EMPLOYEE_LIST, function (err, data) {
    if (!err && data) {
      cache.employeeList = data;
    }
    checkDone();
  });
}

/**
 * Stale-while-revalidate: use current cache immediately, refresh in background.
 * This eliminates LAG — messages are never blocked waiting for Firebase.
 */
function ensureCacheFresh(callback) {
  if (Date.now() - cache.lastRefresh > CONFIG.CACHE_REFRESH_MS) {
    /* Cache is stale — refresh in background, but proceed immediately */
    refreshCache();
  }
  /* Always proceed immediately with current (possibly stale) cache */
  if (callback) callback();
}

/* Hotel config helpers (from cache) */
function getCasinos() {
  if (!cache.hotelConfig || !cache.hotelConfig.casinos) return [];
  return cache.hotelConfig.casinos.map(function (c) { return c.name; });
}

function getCasinoCount() {
  if (!cache.hotelConfig || !cache.hotelConfig.casinos) return 0;
  return cache.hotelConfig.casinos.length;
}

function getHotels(casinoName) {
  if (!cache.hotelConfig || !cache.hotelConfig.casinos) return [];
  for (var i = 0; i < cache.hotelConfig.casinos.length; i++) {
    if (cache.hotelConfig.casinos[i].name === casinoName) {
      return cache.hotelConfig.casinos[i].hotels.map(function (h) { return h.name; });
    }
  }
  return [];
}

function getRoomConfig(casinoName, hotelName) {
  if (!cache.hotelConfig || !cache.hotelConfig.casinos) return {};
  for (var i = 0; i < cache.hotelConfig.casinos.length; i++) {
    if (cache.hotelConfig.casinos[i].name === casinoName) {
      for (var j = 0; j < cache.hotelConfig.casinos[i].hotels.length; j++) {
        if (cache.hotelConfig.casinos[i].hotels[j].name === hotelName) {
          return cache.hotelConfig.casinos[i].hotels[j].roomConfig || {};
        }
      }
    }
  }
  return {};
}

function getThreshold(casinoName, hotelName, roomType) {
  var rc = getRoomConfig(casinoName, hotelName);
  return (rc[roomType] && rc[roomType].threshold) ? rc[roomType].threshold : 0;
}

/* Default agent list (fallback when Firebase is empty) */
var DEFAULT_AGENTS = ['王大帥', 'Fifi', 'Ring', 'Yuka', '安', '韓國'];

/* Agent list helpers (from cache) */
function getActiveAgents() {
  if (!cache.agentList) return DEFAULT_AGENTS.slice();
  var agents = [];
  for (var key in cache.agentList) {
    if (cache.agentList.hasOwnProperty(key)) {
      var a = cache.agentList[key];
      if (a && a.active !== false) {
        agents.push(a.name || key);
      }
    }
  }
  /* Fallback to default if Firebase has data but all inactive or empty */
  if (agents.length === 0) return DEFAULT_AGENTS.slice();
  return agents;
}

/* Employee list helpers (from cache) */
function getEmployeeByTgId(tgId) {
  if (!cache.employeeList) return null;
  var tid = String(tgId);
  for (var key in cache.employeeList) {
    if (cache.employeeList.hasOwnProperty(key)) {
      var emp = cache.employeeList[key];
      if (emp && String(emp.tgId) === tid) {
        if (!emp._fbKey) emp._fbKey = key;
        if (!emp.id) emp.id = key;
        return emp;
      }
    }
  }
  return null;
}

function isAdmin(tgId) {
  var emp = getEmployeeByTgId(tgId);
  return emp && emp.role === EMPLOYEE_ROLES.ADMIN && emp.active !== false;
}

function isAuthorized(tgId) {
  var emp = getEmployeeByTgId(tgId);
  return emp && emp.active !== false;
}

/* ============================================================
 * Recent Agent Memory (per employee, in-memory)
 * ============================================================ */

var recentAgents = {};  // { employeeId: ['agent1', 'agent2', ...] }

function getRecentAgents(employeeId) {
  return recentAgents[employeeId] || [];
}

function addRecentAgent(employeeId, agentName) {
  if (!agentName) return;
  if (!recentAgents[employeeId]) {
    recentAgents[employeeId] = [];
  }
  /* Remove if already exists */
  var idx = recentAgents[employeeId].indexOf(agentName);
  if (idx !== -1) {
    recentAgents[employeeId].splice(idx, 1);
  }
  /* Add to front */
  recentAgents[employeeId].unshift(agentName);
  /* Keep only last 5 */
  if (recentAgents[employeeId].length > CONFIG.RECENT_AGENT_LIMIT) {
    recentAgents[employeeId] = recentAgents[employeeId].slice(0, CONFIG.RECENT_AGENT_LIMIT);
  }
}

/* ============================================================
 * Date & Text Parsing (mirrors src/core/utils.js)
 * ============================================================ */

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function today() {
  return toISODate(new Date());
}

function parseDate(input) {
  if (!input) return null;
  input = String(input).trim();

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
    var p = input.split('-');
    return formatDateStr(parseInt(p[0]), parseInt(p[1]), parseInt(p[2]));
  }
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(input)) {
    var p2 = input.split('/');
    return formatDateStr(parseInt(p2[0]), parseInt(p2[1]), parseInt(p2[2]));
  }
  if (/^\d{1,2}\/\d{1,2}$/.test(input)) {
    var mp = input.split('/');
    return formatDateStr(new Date().getFullYear(), parseInt(mp[0]), parseInt(mp[1]));
  }
  if (/^\d{4}$/.test(input)) {
    return formatDateStr(new Date().getFullYear(), parseInt(input.substring(0, 2)), parseInt(input.substring(2, 4)));
  }
  if (/^\d{1,2}-\d{1,2}$/.test(input)) {
    var dp = input.split('-');
    return formatDateStr(new Date().getFullYear(), parseInt(dp[0]), parseInt(dp[1]));
  }

  var d = new Date(input);
  if (!isNaN(d.getTime())) return toISODate(d);
  return null;
}

function formatDateStr(year, month, day) {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  var d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1) return null;
  return toISODate(d);
}

function calcNights(checkIn, checkOut) {
  var d1 = new Date(checkIn);
  var d2 = new Date(checkOut);
  var diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function addDays(dateStr, days) {
  var d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function daysUntil(dateStr) {
  var d1 = new Date(today());
  var d2 = new Date(dateStr);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getMonthStr(dateStr) {
  if (!dateStr) return null;
  return dateStr.substring(0, 7);
}

function currentMonth() {
  return getMonthStr(today());
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  var d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Parse pasted booking text (4 items: name, checkIn, checkOut, remark/smoking)
 * Format example:
 *   登记人(中英)
 *   简玉如CHIEN, YU-JU
 *   入住日期：08/01
 *   退房日期：08/04
 *   备注：吸烟
 */
function parseBookingText(text) {
  if (!text) return null;
  var result = {
    guestName: null,
    checkIn: null,
    checkOut: null,
    smoking: 'unspecified',
    remark: ''
  };

  var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; });

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    /* Guest name */
    if (line.match(/登记人|登記人|姓名|客人|guest/i)) {
      var colonIdx = line.indexOf(':');
      if (colonIdx === -1) colonIdx = line.indexOf('：');
      if (colonIdx !== -1 && colonIdx < line.length - 1) {
        result.guestName = line.substring(colonIdx + 1).trim();
      } else if (i + 1 < lines.length) {
        result.guestName = lines[i + 1].trim();
        i++;
      }
      continue;
    }

    /* Check-in date */
    if (line.match(/入住|check.?in/i)) {
      var ciColon = line.indexOf(':');
      if (ciColon === -1) ciColon = line.indexOf('：');
      if (ciColon !== -1) {
        result.checkIn = parseDate(line.substring(ciColon + 1).trim());
      }
      continue;
    }

    /* Check-out date */
    if (line.match(/退房|check.?out/i)) {
      var coColon = line.indexOf(':');
      if (coColon === -1) coColon = line.indexOf('：');
      if (coColon !== -1) {
        result.checkOut = parseDate(line.substring(coColon + 1).trim());
      }
      continue;
    }

    /* Remark / smoking */
    if (line.match(/备注|備註|remark|note/i)) {
      var rColon = line.indexOf(':');
      if (rColon === -1) rColon = line.indexOf('：');
      if (rColon !== -1) {
        var remarkPart = line.substring(rColon + 1).trim();
        result.remark = remarkPart;
        if (remarkPart.match(/抽烟|抽菸|吸烟|吸菸|smoking/i)) {
          result.smoking = 'smoking';
        } else if (remarkPart.match(/禁烟|禁菸|不抽|non.?smoking/i)) {
          result.smoking = 'non-smoking';
        }
      }
      continue;
    }

    /* Standalone smoking detection */
    if (line.match(/抽烟|抽菸|吸烟|吸菸/) && !result.remark) {
      result.smoking = 'smoking';
      result.remark = line;
    } else if (line.match(/禁烟|禁菸|不抽/) && !result.remark) {
      result.smoking = 'non-smoking';
      result.remark = line;
    }
  }

  /* Fallback: detect dates in raw text */
  if (!result.checkIn || !result.checkOut) {
    var datePattern = /(\d{1,2}[\/\-]\d{1,2}|\d{4})/g;
    var matches = text.match(datePattern);
    if (matches) {
      if (!result.checkIn && matches[0]) result.checkIn = parseDate(matches[0]);
      if (!result.checkOut && matches[1]) result.checkOut = parseDate(matches[1]);
    }
  }

  /* Fallback: first non-label line as guest name */
  if (!result.guestName) {
    for (var j = 0; j < lines.length; j++) {
      var l = lines[j];
      if (!l.match(/登记人|登記人|姓名|入住|退房|酒店|备注|備註|日期|客人|guest|check/i)) {
        result.guestName = l;
        break;
      }
    }
  }

  return result;
}

/**
 * Parse bulk confirmation numbers from PR reply text.
 * Handles formats like:
 *   31082710  Huang Yi Lun
 *   31082711  Chang yin ting
 *   31082712  Chien Yu Ju
 *
 * Also handles: mixed alphanumeric, different spacing, forwarded messages.
 * Returns array of { confirmNo, name } objects.
 */
function parseBulkConfirmNumbers(text) {
  if (!text) return [];
  var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; });
  var results = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    /* Skip lines that are obviously headers/labels (no digits at all) */
    if (!/\d/.test(line)) continue;

    var parsed = parseConfirmLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Parse a single line into { confirmNo, name }.
 * Handles BOTH orders:
 *   "31082710  Huang Yi Lun"   → confirm number first
 *   "Huang Yi Lun  31082710"   → name first
 *   "A12345678  Chang yin ting" → alphanumeric confirm number
 * Token-based: finds the confirm-number-like token, everything else is the name.
 */
function parseConfirmLine(line) {
  var tokens = line.split(/\s+/);
  if (tokens.length < 2) return null;

  var confirmNo = null;
  var confirmIdx = -1;

  /* Find the confirm number token: 6-14 alphanumeric, must contain at least one digit */
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i].replace(/^[:\-\.=\|]+|[:\-\.=\|]+$/g, ''); /* strip separators */
    if (tok.length >= 6 && tok.length <= 14 && /^[A-Za-z0-9]+$/.test(tok) && /\d/.test(tok)) {
      confirmNo = tok;
      confirmIdx = i;
      break;
    }
  }

  if (!confirmNo) return null;

  /* Everything else is the name */
  var nameParts = [];
  for (var j = 0; j < tokens.length; j++) {
    if (j === confirmIdx) continue;
    var t = tokens[j].replace(/^[:\-\.=\|]+|[:\-\.=\|]+$/g, '');
    if (t) nameParts.push(t);
  }

  var name = nameParts.join(' ').trim();
  if (!name) return null;

  /* Extract clean name (letters/spaces/hyphens or Chinese chars) */
  var nameMatch = name.match(/([A-Za-z\u4e00-\u9fa5][A-Za-z\s,\-]*[A-Za-z\u4e00-\u9fa5])/);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  if (name.length < 2) return null;

  return { confirmNo: confirmNo, name: name };
}

/**
 * Normalize a name for fuzzy matching (lowercase, remove punctuation and spaces).
 */
function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[,\s\-'.]/g, '');
}

/**
 * Check if two names are fuzzy matches.
 * Handles: case differences, punctuation differences, partial matches.
 */
function isNameMatch(name1, name2) {
  var n1 = normalizeName(name1);
  var n2 = normalizeName(name2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  /* One contains the other (e.g. "changyinting" contains "yinting") */
  if (n1.indexOf(n2) !== -1 || n2.indexOf(n1) !== -1) return true;
  /* Levenshtein-like: allow 1-2 char differences for short names */
  if (Math.abs(n1.length - n2.length) <= 2) {
    var diff = 0;
    var maxLen = Math.max(n1.length, n2.length);
    for (var i = 0; i < maxLen; i++) {
      if (n1[i] !== n2[i]) diff++;
    }
    if (diff <= 2) return true;
  }
  return false;
}

/**
 * Match parsed confirm numbers to pending bookings by guest name.
 * Returns array of { booking, confirmNo, name, matched }.
 */
function matchBookingsByName(bookings, parsedNumbers) {
  var matches = [];
  var usedBookings = [];
  var usedNumbers = [];

  /* First pass: exact/partial name match */
  for (var i = 0; i < parsedNumbers.length; i++) {
    var pn = parsedNumbers[i];
    var bestMatch = null;
    var bestScore = -1;

    for (var j = 0; j < bookings.length; j++) {
      if (usedBookings.indexOf(j) !== -1) continue;
      var b = bookings[j];
      var guestName = b.guestName || '';

      /* Try matching against guest name */
      if (isNameMatch(guestName, pn.name)) {
        var score = 100;
        /* Bonus for exact match */
        if (normalizeName(guestName) === normalizeName(pn.name)) score += 50;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = j;
        }
      }

      /* Also try matching against pickup name if available */
      if (b.pickupName && isNameMatch(b.pickupName, pn.name)) {
        var score2 = 80;
        if (score2 > bestScore) {
          bestScore = score2;
          bestMatch = j;
        }
      }
    }

    if (bestMatch !== null) {
      matches.push({
        booking: bookings[bestMatch],
        confirmNo: pn.confirmNo,
        name: pn.name,
        matched: true
      });
      usedBookings.push(bestMatch);
      usedNumbers.push(i);
    }
  }

  /* Second pass: unmatched — try to fill remaining by order */
  for (var k = 0; k < parsedNumbers.length; k++) {
    if (usedNumbers.indexOf(k) !== -1) continue;
    var pn2 = parsedNumbers[k];

    /* Find first unused booking */
    for (var m = 0; m < bookings.length; m++) {
      if (usedBookings.indexOf(m) !== -1) continue;
      matches.push({
        booking: bookings[m],
        confirmNo: pn2.confirmNo,
        name: pn2.name,
        matched: false /* fallback match by order */
      });
      usedBookings.push(m);
      break;
    }
  }

  /* Sort by booking checkIn date for consistent display */
  matches.sort(function (a, b) {
    return (a.booking.checkIn || '').localeCompare(b.booking.checkIn || '');
  });

  return matches;
}

/* ============================================================
 * Formatting Helpers
 * ============================================================ */

function formatNum(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDisplayName(user) {
  var name = user.first_name || '';
  if (user.last_name) name += ' ' + user.last_name;
  return name.trim() || (user.username || 'Unknown');
}

function getRoomLabel(roomType) {
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    if (ROOM_TYPES[i].value === roomType) return ROOM_TYPES[i].label;
  }
  return roomType;
}

/* ============================================================
 * Session Management
 * ============================================================ */

var sessions = {};

function getSession(userId) {
  if (sessions[userId]) {
    if (Date.now() - sessions[userId].lastActivity > CONFIG.SESSION_TIMEOUT) {
      delete sessions[userId];
      return null;
    }
    sessions[userId].lastActivity = Date.now();
    return sessions[userId];
  }
  return null;
}

function createSession(userId, chatId) {
  sessions[userId] = {
    chatId: chatId,
    userId: userId,
    step: 'idle',
    data: {},
    lastActivity: Date.now()
  };
  return sessions[userId];
}

function clearSession(userId) {
  delete sessions[userId];
}

/* Session steps */
var STEPS = {
  IDLE:              'idle',
  BOOKING_WAIT_TEXT: 'booking_wait_text',
  BOOKING_CASINO:    'booking_casino',
  BOOKING_HOTEL:     'booking_hotel',
  BOOKING_ROOM:      'booking_room',
  BOOKING_AGENT:     'booking_agent',
  BOOKING_GUEST:     'booking_guest',
  BOOKING_CHECKIN:   'booking_checkin',
  BOOKING_CHECKOUT:  'booking_checkout',
  BOOKING_SMOKING:   'booking_smoking',
  BOOKING_REMARK:    'booking_remark',
  BOOKING_FEE_TYPE:  'booking_fee_type',
  BOOKING_PICKUP:    'booking_pickup',
  BOOKING_CONFIRM:   'booking_confirm',
  CONFIRMNO_SELECT:  'confirmno_select',
  CONFIRMNO_INPUT:   'confirmno_input',
  CONFIRMNO_BULK_REVIEW: 'confirmno_bulk_review',  /* 批量确认号审核 */
  MODIFY_SELECT:     'modify_select',
  MODIFY_FIELD:      'modify_field',
  MODIFY_INPUT:      'modify_input',
  CANCEL_SELECT:     'cancel_select',
  CANCEL_CONFIRM:    'cancel_confirm',
  AUTH_TGID:         'auth_tgid',
  AUTH_NAME:         'auth_name',
  AUTH_ROLE:         'auth_role'
};

/* Build InlineKeyboard */
function kb(rows) {
  return { inline_keyboard: rows };
}

/* ============================================================
 * Authorization Check
 * ============================================================ */

function checkAuth(msg, callback) {
  var userId = msg.from.id;

  ensureCacheFresh(function () {
    if (!isAuthorized(userId)) {
      /* v8: First user auto-registers as admin */
      if (_isFirstUser()) {
        _autoRegisterAdmin(msg.from);
        setTimeout(function () {
          checkAuth(msg, callback);
        }, 500);
        return;
      }

      sendMessage(msg.chat.id,
        '⛔ 您尚未授权使用此机器人。\n\n' +
        '请联络管理员进行授权。\n' +
        '您的 Telegram ID: <code>' + userId + '</code>'
      );
      if (callback) callback(false);
      return;
    }
    if (callback) callback(true);
  });
}

/* ============================================================
 * Command Handlers
 * ============================================================ */

function handleStart(msg) {
  var chatId = msg.chat.id;
  var user = msg.from;

  ensureCacheFresh(function () {
    if (!isAuthorized(user.id)) {
      /* v8: First user to contact the bot becomes admin automatically */
      if (_isFirstUser()) {
        _autoRegisterAdmin(user);
        /* Re-check auth after auto-registration */
        setTimeout(function () {
          handleStart(msg);
        }, 500);
        return;
      }

      sendMessage(chatId,
        '👋 欢迎来到 <b>BookingHub 订房系统</b>！\n\n' +
        '您尚未授权使用此机器人。\n' +
        '请联络管理员进行授权。\n\n' +
        '您的 Telegram ID: <code>' + user.id + '</code>'
      );
      return;
    }

    var emp = getEmployeeByTgId(user.id);
    var name = emp ? emp.name : getDisplayName(user);
    var roleLabel = (emp && emp.role === EMPLOYEE_ROLES.ADMIN) ? ' 🔑管理员' : '';

    var text = '👋 欢迎来到 <b>BookingHub 订房系统</b>！\n\n';
    text += '您好，<b>' + escapeHtml(name) + '</b>' + roleLabel + '\n\n';
    text += '请选择以下操作：';

    sendMessage(chatId, text, mainMenuKB(emp));
  });
}

/* Check if this is the first user (no employees exist yet) */
function _isFirstUser() {
  if (!cache.employeeList) return true;
  /* Check if any active employees exist */
  for (var key in cache.employeeList) {
    if (cache.employeeList.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

/* Auto-register the first user as admin */
function _autoRegisterAdmin(user) {
  var now = Date.now();
  var fbKey = generateFbKey();

  var employee = {
    id: 'EP' + now.toString(36) + crypto.randomBytes(3).toString('hex'),
    _fbKey: fbKey,
    _createdAt: now,
    _updatedAt: now,
    tgId: String(user.id),
    name: getDisplayName(user),
    role: EMPLOYEE_ROLES.ADMIN,
    active: true,
    authorizedAt: new Date().toISOString()
  };

  /* Write to Firebase employeeList */
  fbPut(CONFIG.FIREBASE.PATHS.EMPLOYEE_LIST + '/' + encodeURIComponent(fbKey), employee, function (err) {
    if (err) {
      console.error('[Auth] Failed to auto-register first admin:', err);
      return;
    }

    /* Update cache */
    if (!cache.employeeList) cache.employeeList = {};
    cache.employeeList[fbKey] = employee;

    /* Write bot log */
    writeBotLog({
      _fbKey:     generateFbKey(),
      _createdAt: now,
      action:     'first_admin_auto',
      message:    '首个用户自动授权为管理员：' + getDisplayName(user) + ' (TG ID: ' + user.id + ')',
      userId:     user.id
    });

    console.log('[Auth] First user auto-registered as admin: ' + getDisplayName(user) + ' (TG ID: ' + user.id + ')');
  });
}

function mainMenuKB(emp) {
  var rows = [
    [{ text: '📝 订房', callback_data: 'cmd_book' }],
    [
      { text: '✅ 确认号', callback_data: 'cmd_confirmno' },
      { text: '📋 查询', callback_data: 'cmd_query' }
    ],
    [
      { text: '✏️ 修改', callback_data: 'cmd_modify' },
      { text: '❌ 取消', callback_data: 'cmd_cancel' }
    ]
  ];
  if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
    rows.push([{ text: '🔑 新增授权 [管理员]', callback_data: 'cmd_newauth' }]);
  }
  return kb(rows);
}

function handleHelp(msg) {
  var chatId = msg.chat.id;
  var text = '<b>BookingHub Bot 使用说明</b>\n\n';
  text += '📝 <b>/订房</b> — 贴上订房文字或逐步按钮选择\n';
  text += '✅ <b>/确认号</b> — 填入公关回复的确认编号\n';
  text += '  💡 批量确认号：直接把公关的统一回复粘贴/转发给 Bot，会自动识别并匹配\n';
  text += '✏️ <b>/修改</b> — 修改订房资料（日期/备注等）\n';
  text += '❌ <b>/取消</b> — 取消订房\n';
  text += '📋 <b>/查询</b> — 查询订房记录\n';
  text += '🔑 <b>/新增授权</b> — 管理员授权新员工 [管理员]\n\n';
  text += '<b>订房流程：</b>\n';
  text += '1. 贴上订房文字（姓名/入住/退房/备注）\n';
  text += '2. 按钮选择酒店体系 → 酒店 → 房型\n';
  text += '3. 按钮选择所属代理\n';
  text += '4. 确认送出\n\n';
  text += '<b>批量确认号：</b>\n';
  text += '公关统一回复多个确认号时，直接把消息转发或粘贴给 Bot，系统会自动按姓名匹配并填入。\n\n';
  text += '系统会自动同步到管理后台。';
  sendMessage(chatId, text, null);
}

/* ============================================================
 * /订房 — Booking Flow (Mixed Mode)
 * ============================================================ */

function startBooking(userId, chatId, user) {
  var session = createSession(userId, chatId);
  session.step = STEPS.BOOKING_WAIT_TEXT;

  var emp = getEmployeeByTgId(user.id);
  session.data.employee = emp ? emp.name : getDisplayName(user);
  session.data.employeeId = emp ? emp.id : '';
  session.data.employeeTgId = String(user.id);

  var text = '<b>📝 新增订房</b>\n\n';
  text += '请贴上订房文字，例如：\n\n';
  text += '<code>登记人(中英)\n简玉如CHIEN, YU-JU\n入住日期：08/01\n退房日期：08/04\n备注：吸烟</code>\n\n';
  text += '系统会自动解析：客人姓名、入住日期、退房日期、吸烟偏好\n';
  text += '之后再通过按钮选择酒店和代理。';

  sendMessage(chatId, text, kb([
    [{ text: '⬅️ 取消', callback_data: 'book_cancel' }]
  ]));
}

function handleBookingText(userId, chatId, text, user) {
  var session = getSession(userId);
  if (!session || session.step !== STEPS.BOOKING_WAIT_TEXT) return;

  var parsed = parseBookingText(text);
  if (!parsed || (!parsed.guestName && !parsed.checkIn && !parsed.checkOut)) {
    sendMessage(chatId,
      '❌ 无法解析订房文字，请确保包含姓名、入住日期、退房日期。\n\n' +
      '请重新贴上，或按取消。',
      kb([{ text: '⬅️ 取消', callback_data: 'book_cancel' }])
    );
    return;
  }

  /* Store parsed data */
  session.data.guestName = parsed.guestName || '';
  session.data.checkIn = parsed.checkIn || '';
  session.data.checkOut = parsed.checkOut || '';
  session.data.smoking = parsed.smoking || 'unspecified';
  session.data.remark = parsed.remark || '';

  /* Validate dates */
  if (!parsed.checkIn || !parsed.checkOut) {
    session.step = STEPS.BOOKING_CASINO;
    sendMessage(chatId,
      '⚠️ 部分日期未能解析，稍后可补填。\n\n' +
      '已解析：\n' +
      '👤 客人：<b>' + escapeHtml(parsed.guestName || '(待填)') + '</b>\n' +
      '📅 入住：' + (parsed.checkIn || '(待填)') + '\n' +
      '📅 退房：' + (parsed.checkOut || '(待填)') + '\n' +
      '🚬 吸烟：' + (parsed.smoking === 'smoking' ? '吸烟' : parsed.smoking === 'non-smoking' ? '禁烟' : '未指定') + '\n\n' +
      '请选择<b>酒店体系</b>：',
      casinoKB()
    );
    return;
  }

  var nights = calcNights(parsed.checkIn, parsed.checkOut);
  if (nights <= 0) {
    sendMessage(chatId,
      '❌ 退房日期必须在入住日期之后。\n' +
      '入住：' + parsed.checkIn + ' / 退房：' + parsed.checkOut + '\n\n' +
      '请重新贴上订房文字。',
      kb([{ text: '⬅️ 取消', callback_data: 'book_cancel' }])
    );
    return;
  }

  session.data.nights = nights;

  var text2 = '✅ 已解析订房资料：\n\n';
  text2 += '👤 客人：<b>' + escapeHtml(parsed.guestName || '(待填)') + '</b>\n';
  text2 += '📅 入住：' + parsed.checkIn + '\n';
  text2 += '📅 退房：' + parsed.checkOut + '（' + nights + ' 晚）\n';
  text2 += '🚬 吸烟：' + (parsed.smoking === 'smoking' ? '吸烟' : parsed.smoking === 'non-smoking' ? '禁烟' : '未指定') + '\n';
  if (parsed.remark) text2 += '📝 备注：' + escapeHtml(parsed.remark) + '\n';
  text2 += '\n请选择<b>酒店体系</b>：';

  session.step = STEPS.BOOKING_CASINO;
  sendMessage(chatId, text2, casinoKB());
}

/* Casino selection keyboard */
function casinoKB() {
  var casinos = getCasinos();
  if (casinos.length === 0) {
    /* Fallback to hardcoded if cache not ready */
    casinos = CASINO_ORDER.slice();
  }
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
  var hotels = getHotels(casino);
  var rows = [];
  for (var i = 0; i < hotels.length; i++) {
    rows.push([{ text: hotels[i], callback_data: 'hotel:' + hotels[i] }]);
  }
  rows.push([{ text: '⬅️ 返回', callback_data: 'book_back_casino' }]);
  return kb(rows);
}

/* Room type selection keyboard */
function roomTypeKB(casino, hotel) {
  var rc = getRoomConfig(casino, hotel);
  var rows = [];
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    var rt = ROOM_TYPES[i];
    var threshold = (rc[rt.value] && rc[rt.value].threshold) ? rc[rt.value].threshold : 0;
    var label = rt.label + ' (门槛: ' + formatNum(Math.round(threshold / 10000)) + '万)';
    rows.push([{ text: label, callback_data: 'room:' + rt.value }]);
  }
  rows.push([{ text: '⬅️ 返回', callback_data: 'book_back_hotel' }]);
  return kb(rows);
}

/* Agent selection keyboard (with recent agents) */
function agentKB(employeeId) {
  var recent = getRecentAgents(employeeId);
  var allAgents = getActiveAgents();
  var rows = [];

  /* Recent agents first */
  if (recent.length > 0) {
    rows.push([{ text: '📌 最近使用', callback_data: 'noop' }]);
    for (var i = 0; i < recent.length; i++) {
      rows.push([{ text: recent[i], callback_data: 'agent:' + recent[i] }]);
    }
  }

  /* All active agents */
  rows.push([{ text: '📋 全部代理', callback_data: 'noop' }]);
  var row = [];
  for (var j = 0; j < allAgents.length; j++) {
    /* Skip if already in recent */
    if (recent.indexOf(allAgents[j]) !== -1) continue;
    row.push({ text: allAgents[j], callback_data: 'agent:' + allAgents[j] });
    if (row.length === 2) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) rows.push(row);

  rows.push([{ text: '⬅️ 返回', callback_data: 'book_back_room' }]);
  return kb(rows);
}

/* After agent selected, check missing info and guide user */
function proceedAfterAgent(chatId, session) {
  var d = session.data;
  if (!d.guestName) {
    session.step = STEPS.BOOKING_GUEST;
    sendMessage(chatId,
      '✅ 代理：<b>' + escapeHtml(d.agent) + '</b>\n\n' +
      '请输入<b>客人姓名</b>：'
    );
    return;
  }
  if (!d.checkIn) {
    session.step = STEPS.BOOKING_CHECKIN;
    sendMessage(chatId,
      '✅ 客人：<b>' + escapeHtml(d.guestName) + '</b>\n\n' +
      '请输入<b>入住日期</b>（MM/DD 或 YYYY-MM-DD）：'
    );
    return;
  }
  if (!d.checkOut) {
    session.step = STEPS.BOOKING_CHECKOUT;
    sendMessage(chatId,
      '✅ 入住：<b>' + d.checkIn + '</b>\n\n' +
      '请输入<b>退房日期</b>（MM/DD 或 YYYY-MM-DD）：'
    );
    return;
  }
  if (!d.nights) {
    d.nights = calcNights(d.checkIn, d.checkOut);
  }
  /* Smoking preference — if already set, skip to remark */
  if (!d.smoking || d.smoking === 'unspecified') {
    session.step = STEPS.BOOKING_SMOKING;
    sendMessage(chatId,
      '请选择<b>吸烟偏好</b>：',
      kb([
        [
          { text: '🚬 吸烟', callback_data: 'book_smoke:smoking' },
          { text: '🚭 禁烟', callback_data: 'book_smoke:non-smoking' },
          { text: '❓ 未指定', callback_data: 'book_smoke:unspecified' }
        ],
        [{ text: '⬅️ 返回', callback_data: 'book_back_agent' }]
      ])
    );
    return;
  }
  /* Remark — if already set, skip to fee type */
  if (!d.remark && d.remark !== '') {
    session.step = STEPS.BOOKING_REMARK;
    sendMessage(chatId,
      '✅ 吸烟：<b>' + (d.smoking === 'smoking' ? '吸烟' : d.smoking === 'non-smoking' ? '禁烟' : '未指定') + '</b>\n\n' +
      '请输入<b>备注</b>（或输入「无」跳过）：'
    );
    return;
  }
  /* Fee type selection */
  if (!d.feeStatus) {
    session.step = STEPS.BOOKING_FEE_TYPE;
    sendMessage(chatId,
      '请选择<b>费用类型</b>：',
      kb([
        [
          { text: '🆓 免费订房', callback_data: 'book_fee:free' },
          { text: '💰 收费订房', callback_data: 'book_fee:paid' }
        ],
        [{ text: '⬅️ 返回', callback_data: 'book_back_smoking' }]
      ])
    );
    return;
  }
  /* All info complete → show confirmation summary */
  showBookingConfirm(chatId, session);
}

/* Confirm keyboard */
function confirmKB() {
  return kb([
    [
      { text: '✅ 确认送出', callback_data: 'book_submit' },
      { text: '❌ 取消', callback_data: 'book_cancel' }
    ]
  ]);
}

/* Show booking confirmation summary */
function showBookingConfirm(chatId, session) {
  var d = session.data;
  var text = '<b>📋 订房确认</b>\n\n';
  text += '👤 客人：<b>' + escapeHtml(d.guestName || '(待填)') + '</b>\n';
  text += '🏢 体系：' + (d.casino || '-') + '\n';
  text += '🏨 酒店：' + (d.hotel || '-') + '\n';
  text += '🛏️ 房型：' + getRoomLabel(d.roomType) + '\n';
  text += '📅 入住：' + (d.checkIn || '-') + '\n';
  text += '📅 退房：' + (d.checkOut || '-') + '（' + (d.nights || 0) + ' 晚）\n';
  text += '🚬 吸烟：' + (d.smoking === 'smoking' ? '吸烟' : d.smoking === 'non-smoking' ? '禁烟' : '未指定') + '\n';
  text += '👤 代理：' + (d.agent || '-') + '\n';
  text += '💰 洗码门槛：' + formatNum(Math.round((d.threshold || 0) / 10000)) + '万\n';
  text += '💵 费用类型：' + (d.feeStatus === 'paid' ? '收费订房' : '免费订房') + '\n';
  text += '📝 备注：' + (d.remark || '-') + '\n';
  text += '👤 登记员工：' + escapeHtml(d.employee || '-') + '\n';
  text += '\n确认以上资料是否正确？';

  session.step = STEPS.BOOKING_CONFIRM;
  sendMessage(chatId, text, confirmKB());
}

/* Submit booking to Firebase */
function submitBooking(chatId, userId, session, user) {
  var d = session.data;
  var now = Date.now();
  var fbKey = generateFbKey();

  var nights = d.nights || calcNights(d.checkIn, d.checkOut);
  var month = getMonthStr(d.checkIn) || currentMonth();
  var bookingNo = generateBookingNo();

  var emp = getEmployeeByTgId(userId);
  var createdBy = emp ? emp.name : (user ? (user.first_name || user.username || '') : '');

  var booking = {
    _fbKey:        fbKey,
    _createdAt:    now,
    _updatedAt:    now,
    _source:       'bot',

    bookingNo:     bookingNo,
    createdBy:   createdBy,

    guestName:     d.guestName || '',
    agent:         d.agent || '',
    employee:      d.employee || '',
    employeeId:    d.employeeId || '',

    casino:        d.casino || '',
    hotel:         d.hotel || '',
    roomType:      d.roomType || '',
    month:         month,

    checkIn:       d.checkIn || '',
    checkOut:      d.checkOut || '',
    nights:        nights,

    status:        BOOKING_STATUS.PENDING,
    confirmNo:     '',

    smoking:       d.smoking || 'unspecified',

    feeStatus:     d.feeStatus || FEE_TYPES.FREE,
    chargeGuest:   0,
    chargeCompany: 0,
    profit:        0,
    currency:      CURRENCY_DEFAULT,

    transfer:      'none',
    pickupName:    d.pickupName || '',

    threshold:     d.threshold || 0,

    archived:      false,
    archivedAt:    null,

    remark:        d.remark || ''
  };

  sendMessage(chatId, '⏳ 正在送出订房资料...');

  writeBooking(booking, function (err) {
    if (err) {
      sendMessage(chatId,
        '❌ 订房送出失败：' + err + '\n请稍后重试或联络管理员。',
        mainMenuKB(getEmployeeByTgId(user.id))
      );
      return;
    }

    /* Update recent agents */
    addRecentAgent(d.employeeId || String(user.id), d.agent);

    /* Write bot log */
    writeBotLog({
      _fbKey:     generateFbKey(),
      _createdAt: now,
      employee:   d.employee,
      employeeId: d.employeeId,
      action:     'booking_create',
      message:    'Bot 订房：' + booking.guestName + ' / ' + booking.casino + ' / ' + getRoomLabel(booking.roomType) + ' / ' + booking.checkIn + '~' + booking.checkOut,
      bookingKey: fbKey,
      userId:     user.id
    });

    /* Success message */
    var text = '✅ <b>订房已建立！</b>\n\n';
    text += '📋 訂單編號：<code>' + bookingNo + '</code>\n';
    text += '👤 客人：' + escapeHtml(booking.guestName) + '\n';
    text += '🏨 ' + booking.casino + ' / ' + booking.hotel + '\n';
    text += '🛏️ ' + getRoomLabel(booking.roomType) + '\n';
    text += '📅 ' + booking.checkIn + ' ~ ' + booking.checkOut + '（' + booking.nights + ' 晚）\n';
    text += '💰 洗码门槛：' + formatNum(Math.round((booking.threshold || 0) / 10000)) + '万\n';
    text += '💵 费用类型：' + (booking.feeStatus === 'paid' ? '收费订房' : '免费订房') + '\n';
    text += '\n⏳ 状态：<b>待确认</b>\n';
    text += '收到公关确认号后，请使用 /确认号 填入。\n';
    text += '💡 如公关一次回复多个确认号，直接把消息粘贴或转发给 Bot 即可自动识别。';

    clearSession(userId);
    sendMessage(chatId, text, mainMenuKB(getEmployeeByTgId(user.id)));
  });
}

/* ============================================================
 * /确认号 — Confirm Number Flow
 * ============================================================ */

function startConfirmNo(userId, chatId, user) {
  var session = createSession(userId, chatId);
  session.step = STEPS.CONFIRMNO_SELECT;

  sendMessage(chatId, '⏳ 正在查询您的待确认订房...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查询失败或暂无订房记录。', mainMenuKB(getEmployeeByTgId(user.id)));
      clearSession(userId);
      return;
    }

    var emp = getEmployeeByTgId(user.id);
    var empId = emp ? emp.id : '';
    var bookings = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && !b.archived &&
            b.status === BOOKING_STATUS.PENDING &&
            (!b.confirmNo)) {
          /* Show bookings by this employee, or all if admin */
          if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
            bookings.push(b);
          } else if (b.employeeId === empId) {
            bookings.push(b);
          }
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '暂无待确认的订房记录。', mainMenuKB(emp));
      clearSession(userId);
      return;
    }

    /* Sort by checkIn date */
    bookings.sort(function (a, b) {
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    });

    var text = '<b>✅ 填入确认号</b>\n\n';
    text += '请选择要填入确认号的订房：\n\n';

    var rows = [];
    for (var i = 0; i < Math.min(bookings.length, 10); i++) {
      var b = bookings[i];
      text += (i + 1) + '. <b>' + escapeHtml(b.guestName) + '</b> — ' + b.casino + ' / ' + getRoomLabel(b.roomType) + '\n';
      text += '   📅 ' + (b.checkIn || '?') + ' ~ ' + (b.checkOut || '?') + '\n';
      rows.push([{ text: (i + 1) + '. ' + b.guestName, callback_data: 'cno:' + b._fbKey }]);
    }

    rows.push([{ text: '⬅️ 取消', callback_data: 'book_cancel' }]);

    text += '\n点击下方按钮选择：\n\n';
    text += '💡 <b>批量确认号</b>：直接把公关的统一回复粘贴或转发给 Bot，系统会自动识别多个确认号并匹配。';
    sendMessage(chatId, text, kb(rows));
  });
}

function handleConfirmNoInput(userId, chatId, text) {
  var session = getSession(userId);
  if (!session || session.step !== STEPS.CONFIRMNO_INPUT) return;

  var confirmNo = text.trim();
  if (!confirmNo) {
    sendMessage(chatId, '❌ 确认号不能为空，请重新输入：');
    return;
  }

  var fbKey = session.data.selectedBookingKey;

  /* Read booking from Firebase, update, write back */
  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), function (err, booking) {
    if (err || !booking) {
      sendMessage(chatId, '❌ 找不到该订房记录。', mainMenuKB(getEmployeeByTgId(session.userId)));
      clearSession(userId);
      return;
    }

    /* Update fields */
    booking.confirmNo = confirmNo;
    booking.status = BOOKING_STATUS.CONFIRMED;
    booking._updatedAt = Date.now();

    /* Write back */
    fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), booking, function (err2) {
      if (err2) {
        sendMessage(chatId, '❌ 更新失败：' + err2, mainMenuKB(getEmployeeByTgId(userId)));
        clearSession(userId);
        return;
      }

      /* Write bot log */
      writeBotLog({
        _fbKey:     generateFbKey(),
        _createdAt: Date.now(),
        employee:   booking.employee,
        employeeId: booking.employeeId,
        action:     'confirm_no',
        message:    '确认号填入：' + booking.guestName + ' -> ' + confirmNo,
        bookingKey: fbKey,
        userId:     userId
      });

      var text2 = '✅ <b>确认号已填入！</b>\n\n';
      text2 += '👤 客人：' + escapeHtml(booking.guestName) + '\n';
      text2 += '🏨 ' + booking.casino + ' / ' + booking.hotel + '\n';
      text2 += '📅 ' + booking.checkIn + ' ~ ' + booking.checkOut + '\n';
      text2 += '🔢 确认号：<code>' + escapeHtml(confirmNo) + '</code>\n';
      text2 += '✅ 状态已变更为：<b>已确认</b>';

      clearSession(userId);
      sendMessage(chatId, text2, mainMenuKB(getEmployeeByTgId(userId)));
    });
  });
}

/* ============================================================
 * /确认号 — Bulk Confirm Number Flow (Smart Recognition)
 * ============================================================ */

/**
 * Auto-detect and handle bulk confirmation numbers from PR reply.
 * Called when user pastes/forwards a PR reply containing multiple confirm numbers.
 */
function handleBulkConfirmNo(userId, chatId, text, user) {
  var parsed = parseBulkConfirmNumbers(text);
  if (parsed.length === 0) {
    /* Not a bulk confirm number message — show menu */
    sendMessage(chatId, '👋 操作菜单：', mainMenuKB(getEmployeeByTgId(userId)));
    return;
  }

  sendMessage(chatId, '⏳ 正在识别批量确认号，请稍候...');

  /* Fetch bookings for this employee */
  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查询失败，请稍后重试。', mainMenuKB(getEmployeeByTgId(userId)));
      return;
    }

    var emp = getEmployeeByTgId(userId);
    var empId = emp ? emp.id : '';
    var bookings = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && !b.archived &&
            b.status === BOOKING_STATUS.PENDING &&
            (!b.confirmNo)) {
          /* Show bookings by this employee, or all if admin */
          if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
            bookings.push(b);
          } else if (b.employeeId === empId) {
            bookings.push(b);
          }
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '暂无待确认的订房记录。', mainMenuKB(emp));
      return;
    }

    /* Match parsed numbers to bookings */
    var matches = matchBookingsByName(bookings, parsed);

    if (matches.length === 0) {
      sendMessage(chatId, '❌ 无法匹配到任何待确认的订房。\n\n' +
        '请确认公关回复中的姓名与订房客人姓名一致。', mainMenuKB(emp));
      return;
    }

    /* Store in session for confirmation */
    var session = createSession(userId, chatId);
    session.step = STEPS.CONFIRMNO_BULK_REVIEW;
    session.data.bulkMatches = matches;

    sendBulkReview(chatId, userId, matches);
  });
}

/**
 * Send the bulk confirm number review message with inline keyboard.
 */
function sendBulkReview(chatId, userId, matches) {
  var text = '<b>✅ 批量确认号识别结果</b>\n\n';
  text += '识别到 <b>' + matches.length + '</b> 笔确认号，匹配结果如下：\n\n';

  var rows = [];
  for (var i = 0; i < matches.length; i++) {
    var m = matches[i];
    var icon = m.matched ? '✅' : '⚠️';
    text += icon + ' <b>' + escapeHtml(m.booking.guestName) + '</b>\n';
    text += '   🔢 确认号：<code>' + escapeHtml(m.confirmNo) + '</code>\n';
    text += '   📅 ' + (m.booking.checkIn || '?') + ' ~ ' + (m.booking.checkOut || '?') + '\n';
    if (!m.matched) {
      text += '   ⚠️ 按顺序匹配，请核对\n';
    }
    text += '\n';
  }

  text += '请确认以上匹配是否正确：';

  rows.push([
    { text: '✅ 全部确认', callback_data: 'bulkcnf:yes' },
    { text: '❌ 取消', callback_data: 'book_cancel' }
  ]);

  sendMessage(chatId, text, kb(rows));
}

/**
 * Execute bulk confirm number writes to Firebase.
 */
function executeBulkConfirmNo(userId, chatId, matches) {
  if (!matches || matches.length === 0) {
    sendMessage(chatId, '❌ 没有可确认的订房。', mainMenuKB(getEmployeeByTgId(userId)));
    clearSession(userId);
    return;
  }

  sendMessage(chatId, '⏳ 正在写入确认号...');

  var completed = 0;
  var failed = 0;
  var results = [];

  function processOne(idx) {
    if (idx >= matches.length) {
      /* All done — send summary */
      var text = '<b>✅ 批量确认号完成</b>\n\n';
      text += '成功：' + completed + ' / ' + matches.length + '\n';
      if (failed > 0) text += '失败：' + failed + '\n';
      text += '\n';
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        text += (r.ok ? '✅' : '❌') + ' ' + escapeHtml(r.guestName) +
                ' → <code>' + escapeHtml(r.confirmNo) + '</code>\n';
      }

      clearSession(userId);
      sendMessage(chatId, text, mainMenuKB(getEmployeeByTgId(userId)));
      return;
    }

    var m = matches[idx];
    var fbKey = m.booking._fbKey;

    fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), function (err, booking) {
      if (err || !booking) {
        failed++;
        results.push({ ok: false, guestName: m.booking.guestName, confirmNo: m.confirmNo });
        processOne(idx + 1);
        return;
      }

      booking.confirmNo = m.confirmNo;
      booking.status = BOOKING_STATUS.CONFIRMED;
      booking._updatedAt = Date.now();

      fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), booking, function (err2) {
        if (err2) {
          failed++;
          results.push({ ok: false, guestName: m.booking.guestName, confirmNo: m.confirmNo });
        } else {
          completed++;
          results.push({ ok: true, guestName: m.booking.guestName, confirmNo: m.confirmNo });

          writeBotLog({
            _fbKey:     generateFbKey(),
            _createdAt: Date.now(),
            employee:   booking.employee,
            employeeId: booking.employeeId,
            action:     'confirm_no_bulk',
            message:    '批量确认号：' + booking.guestName + ' -> ' + m.confirmNo,
            bookingKey: fbKey,
            userId:     userId
          });
        }
        processOne(idx + 1);
      });
    });
  }

  processOne(0);
}

/* ============================================================
 * /修改 — Modify Flow
 * ============================================================ */

function startModify(userId, chatId, user) {
  var session = createSession(userId, chatId);
  session.step = STEPS.MODIFY_SELECT;

  sendMessage(chatId, '⏳ 正在查询可修改的订房...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查询失败或暂无订房记录。', mainMenuKB(getEmployeeByTgId(user.id)));
      clearSession(userId);
      return;
    }

    var emp = getEmployeeByTgId(user.id);
    var empId = emp ? emp.id : '';
    var bookings = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && !b.archived) {
          var rules = STATUS_RULES[b.status] || { canEdit: true };
          if (rules.canEdit) {
            if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
              bookings.push(b);
            } else if (b.employeeId === empId) {
              bookings.push(b);
            }
          }
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '暂无可修改的订房记录。\n\n（已退房/已取消的订房不可修改）', mainMenuKB(emp));
      clearSession(userId);
      return;
    }

    bookings.sort(function (a, b) {
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    });

    var text = '<b>✏️ 修改订房</b>\n\n请选择要修改的订房：\n\n';
    var rows = [];
    for (var i = 0; i < Math.min(bookings.length, 10); i++) {
      var b = bookings[i];
      text += (i + 1) + '. ' + STATUS_ICONS[b.status] + ' <b>' + escapeHtml(b.guestName) + '</b> — ' + b.casino + ' / ' + getRoomLabel(b.roomType) + '\n';
      text += '   📅 ' + (b.checkIn || '?') + ' ~ ' + (b.checkOut || '?') + '\n';
      rows.push([{ text: (i + 1) + '. ' + b.guestName, callback_data: 'mod:' + b._fbKey }]);
    }
    rows.push([{ text: '⬅️ 取消', callback_data: 'book_cancel' }]);

    text += '\n点击下方按钮选择：';
    sendMessage(chatId, text, kb(rows));
  });
}

function showModifyOptions(chatId, userId, fbKey) {
  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), function (err, booking) {
    if (err || !booking) {
      sendMessage(chatId, '❌ 找不到该订房记录。', mainMenuKB(getEmployeeByTgId(userId)));
      clearSession(userId);
      return;
    }

    var rules = STATUS_RULES[booking.status] || { canEdit: true };
    var rows = [];

    var text = '<b>✏️ 修改订房</b>\n\n';
    text += '👤 客人：<b>' + escapeHtml(booking.guestName) + '</b>\n';
    text += '📅 入住：' + (booking.checkIn || '-') + '\n';
    text += '📅 退房：' + (booking.checkOut || '-') + '\n';
    text += '🚬 吸烟：' + (booking.smoking === 'smoking' ? '吸烟' : booking.smoking === 'non-smoking' ? '禁烟' : '未指定') + '\n';
    text += '🪧 举牌：' + (booking.pickupName || '-') + '\n';
    text += '📝 备注：' + (booking.remark || '-') + '\n';
    text += '📊 状态：' + STATUS_LABELS[booking.status] + '\n\n';
    text += '请选择要修改的字段：';

    rows.push([{ text: '📅 入住日期', callback_data: 'modfield:checkIn' }]);
    if (rules.canEditDates) {
      rows.push([{ text: '📅 退房日期', callback_data: 'modfield:checkOut' }]);
    }
    rows.push([{ text: '🚬 吸烟偏好', callback_data: 'modfield:smoking' }]);
    rows.push([{ text: '🪧 举牌名称', callback_data: 'modfield:pickupName' }]);
    rows.push([{ text: '📝 备注', callback_data: 'modfield:remark' }]);
    rows.push([{ text: '⬅️ 返回', callback_data: 'cmd_modify' }]);
    rows.push([{ text: '❌ 取消', callback_data: 'book_cancel' }]);

    var session = getSession(userId);
    if (session) {
      session.step = STEPS.MODIFY_FIELD;
      session.data.selectedBookingKey = fbKey;
      session.data.bookingSnapshot = booking;
    }

    sendMessage(chatId, text, kb(rows));
  });
}

function handleModifyInput(userId, chatId, text) {
  var session = getSession(userId);
  if (!session || session.step !== STEPS.MODIFY_INPUT) return;

  var field = session.data.modifyField;
  var fbKey = session.data.selectedBookingKey;
  var booking = session.data.bookingSnapshot;
  var value = text.trim();

  var updateData = {};

  switch (field) {
    case 'checkIn':
      var ci = parseDate(value);
      if (!ci) {
        sendMessage(chatId, '❌ 日期格式不正确，请使用 MM/DD 或 YYYY-MM-DD 格式：');
        return;
      }
      updateData.checkIn = ci;
      updateData.nights = calcNights(ci, booking.checkOut);
      updateData.month = getMonthStr(ci) || booking.month;
      break;

    case 'checkOut':
      var co = parseDate(value);
      if (!co) {
        sendMessage(chatId, '❌ 日期格式不正确，请使用 MM/DD 或 YYYY-MM-DD 格式：');
        return;
      }
      if (calcNights(booking.checkIn, co) <= 0) {
        sendMessage(chatId, '❌ 退房日期必须在入住日期之后，请重新输入：');
        return;
      }
      updateData.checkOut = co;
      updateData.nights = calcNights(booking.checkIn, co);
      break;

    case 'smoking':
      if (value.match(/抽烟|抽菸|吸烟|吸菸|smoking|是|y/i)) {
        updateData.smoking = 'smoking';
      } else if (value.match(/禁烟|禁菸|不抽|non|no|否/i)) {
        updateData.smoking = 'non-smoking';
      } else {
        updateData.smoking = 'unspecified';
      }
      break;

    case 'pickupName':
      updateData.pickupName = value;
      break;

    case 'remark':
      updateData.remark = value;
      break;

    default:
      sendMessage(chatId, '❌ 未知字段。', mainMenuKB(getEmployeeByTgId(userId)));
      clearSession(userId);
      return;
  }

  /* Merge into booking */
  for (var k in updateData) {
    if (updateData.hasOwnProperty(k)) {
      booking[k] = updateData[k];
    }
  }
  booking._updatedAt = Date.now();

  /* Write back to Firebase */
  fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), booking, function (err) {
    if (err) {
      sendMessage(chatId, '❌ 更新失败：' + err, mainMenuKB(getEmployeeByTgId(userId)));
      clearSession(userId);
      return;
    }

    writeBotLog({
      _fbKey:     generateFbKey(),
      _createdAt: Date.now(),
      employee:   booking.employee,
      employeeId: booking.employeeId,
      action:     'booking_modify',
      message:    '修改 ' + field + ' -> ' + value,
      bookingKey: fbKey,
      userId:     userId
    });

    var label = '';
    if (field === 'checkIn') label = '入住日期';
    else if (field === 'checkOut') label = '退房日期';
    else if (field === 'smoking') label = '吸烟偏好';
    else if (field === 'pickupName') label = '举牌名称';
    else if (field === 'remark') label = '备注';

    var text2 = '✅ <b>' + label + '</b> 已更新！\n\n';
    text2 += '👤 客人：' + escapeHtml(booking.guestName) + '\n';
    if (field === 'checkIn' || field === 'checkOut') {
      text2 += '📅 入住：' + booking.checkIn + '\n';
      text2 += '📅 退房：' + booking.checkOut + '（' + booking.nights + ' 晚）\n';
    } else if (field === 'smoking') {
      text2 += '🚬 吸烟：' + (booking.smoking === 'smoking' ? '吸烟' : booking.smoking === 'non-smoking' ? '禁烟' : '未指定') + '\n';
    } else if (field === 'pickupName') {
      text2 += '🪧 举牌：' + escapeHtml(booking.pickupName || '-') + '\n';
    } else if (field === 'remark') {
      text2 += '📝 备注：' + escapeHtml(booking.remark || '-') + '\n';
    }

    clearSession(userId);
    sendMessage(chatId, text2, mainMenuKB(getEmployeeByTgId(userId)));
  });
}

/* ============================================================
 * /取消 — Cancel Booking Flow
 * ============================================================ */

function startCancel(userId, chatId, user) {
  var session = createSession(userId, chatId);
  session.step = STEPS.CANCEL_SELECT;

  sendMessage(chatId, '⏳ 正在查询可取消的订房...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查询失败或暂无订房记录。', mainMenuKB(getEmployeeByTgId(user.id)));
      clearSession(userId);
      return;
    }

    var emp = getEmployeeByTgId(user.id);
    var empId = emp ? emp.id : '';
    var bookings = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && !b.archived) {
          var rules = STATUS_RULES[b.status] || { canCancel: false };
          if (rules.canCancel) {
            if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
              bookings.push(b);
            } else if (b.employeeId === empId) {
              bookings.push(b);
            }
          }
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '暂无可取消的订房记录。\n\n（已入住/已退房/已取消的订房不可取消）', mainMenuKB(emp));
      clearSession(userId);
      return;
    }

    bookings.sort(function (a, b) {
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    });

    var text = '<b>❌ 取消订房</b>\n\n请选择要取消的订房：\n\n';
    var rows = [];
    for (var i = 0; i < Math.min(bookings.length, 10); i++) {
      var b = bookings[i];
      text += (i + 1) + '. ' + STATUS_ICONS[b.status] + ' <b>' + escapeHtml(b.guestName) + '</b> — ' + b.casino + ' / ' + getRoomLabel(b.roomType) + '\n';
      text += '   📅 ' + (b.checkIn || '?') + ' ~ ' + (b.checkOut || '?') + '\n';
      rows.push([{ text: (i + 1) + '. ' + b.guestName, callback_data: 'cnl:' + b._fbKey }]);
    }
    rows.push([{ text: '⬅️ 取消操作', callback_data: 'book_cancel' }]);

    text += '\n点击下方按钮选择：';
    sendMessage(chatId, text, kb(rows));
  });
}

function confirmCancel(chatId, userId, fbKey) {
  var session = getSession(userId);
  if (session) {
    session.step = STEPS.CANCEL_CONFIRM;
    session.data.selectedBookingKey = fbKey;
  }

  sendMessage(chatId,
    '<b>⚠️ 确认取消订房？</b>\n\n取消后订房将自动归档，不可恢复。\n\n确定要取消吗？',
    kb([
      [
        { text: '✅ 确认取消', callback_data: 'cnl_yes:' + fbKey },
        { text: '❌ 不取消', callback_data: 'book_cancel' }
      ]
    ])
  );
}

function executeCancel(chatId, userId, fbKey) {
  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), function (err, booking) {
    if (err || !booking) {
      sendMessage(chatId, '❌ 找不到该订房记录。', mainMenuKB(getEmployeeByTgId(userId)));
      clearSession(userId);
      return;
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.archived = true;
    booking.archivedAt = Date.now();
    booking._updatedAt = Date.now();

    fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(fbKey), booking, function (err2) {
      if (err2) {
        sendMessage(chatId, '❌ 取消失败：' + err2, mainMenuKB(getEmployeeByTgId(userId)));
        clearSession(userId);
        return;
      }

      /* Create archive record */
      var archiveKey = generateFbKey();
      var archive = {
        _fbKey: archiveKey,
        _createdAt: Date.now(),
        originalKey: fbKey,
        archivedAt: Date.now(),
        finalStatus: BOOKING_STATUS.CANCELLED,
        guestName: booking.guestName,
        agent: booking.agent,
        employee: booking.employee,
        employeeId: booking.employeeId,
        casino: booking.casino,
        hotel: booking.hotel,
        roomType: booking.roomType,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        smoking: booking.smoking,
        feeStatus: booking.feeStatus,
        chargeGuest: booking.chargeGuest,
        chargeCompany: booking.chargeCompany,
        profit: booking.profit,
        currency: booking.currency,
        confirmNo: booking.confirmNo,
        pickupName: booking.pickupName,
        transfer: booking.transfer,
        threshold: booking.threshold,
        remark: booking.remark
      };
      fbPut(CONFIG.FIREBASE.PATHS.ARCHIVES + '/' + encodeURIComponent(archiveKey), archive);

      /* Write bot log */
      writeBotLog({
        _fbKey:     generateFbKey(),
        _createdAt: Date.now(),
        employee:   booking.employee,
        employeeId: booking.employeeId,
        action:     'booking_cancel',
        message:    '取消订房：' + booking.guestName,
        bookingKey: fbKey,
        userId:     userId
      });

      var text = '✅ <b>订房已取消并归档</b>\n\n';
      text += '👤 客人：' + escapeHtml(booking.guestName) + '\n';
      text += '🏨 ' + booking.casino + ' / ' + booking.hotel + '\n';
      text += '📅 ' + booking.checkIn + ' ~ ' + booking.checkOut + '\n';
      text += '📊 状态：已取消（已归档）';

      clearSession(userId);
      sendMessage(chatId, text, mainMenuKB(getEmployeeByTgId(userId)));
    });
  });
}

/* ============================================================
 * /查询 — Query Bookings
 * ============================================================ */

function startQuery(userId, chatId, user) {
  var emp = getEmployeeByTgId(user.id);

  sendMessage(chatId, '⏳ 正在查询订房记录...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      sendMessage(chatId, '查询失败或暂无订房记录。', mainMenuKB(emp));
      return;
    }

    var empId = emp ? emp.id : '';
    var month = currentMonth();
    var bookings = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var b = data[key];
        if (!b._deleted && !b.archived) {
          if (emp && emp.role === EMPLOYEE_ROLES.ADMIN) {
            bookings.push(b);
          } else if (b.employeeId === empId) {
            bookings.push(b);
          }
        }
      }
    }

    if (bookings.length === 0) {
      sendMessage(chatId, '暂无订房记录。', mainMenuKB(emp));
      return;
    }

    /* Sort by checkIn date */
    bookings.sort(function (a, b) {
      return (b._createdAt || 0) - (a._createdAt || 0);
    });

    /* Count by status */
    var counts = { pending: 0, confirmed: 0, 'checked-in': 0, 'checked-out': 0, cancelled: 0 };
    for (var i = 0; i < bookings.length; i++) {
      if (counts[bookings[i].status] !== undefined) counts[bookings[i].status]++;
    }

    var text = '<b>📋 订房查询</b>\n\n';
    text += '总计 <b>' + bookings.length + '</b> 笔\n\n';
    text += '<b>状态分布：</b>\n';
    text += '⏳ 待确认：' + counts.pending + '\n';
    text += '✅ 已确认：' + counts.confirmed + '\n';
    text += '🟢 已入住：' + counts['checked-in'] + '\n';
    text += '⚪ 已退房：' + counts['checked-out'] + '\n';
    text += '❌ 已取消：' + counts.cancelled + '\n\n';
    text += '<b>最近 10 笔：</b>\n\n';

    for (var j = 0; j < Math.min(bookings.length, 10); j++) {
      var b = bookings[j];
      text += STATUS_ICONS[b.status] + ' <b>' + escapeHtml(b.guestName || '-') + '</b>';
      text += ' — ' + (b.casino || '') + ' / ' + getRoomLabel(b.roomType) + '\n';
      text += '   📅 ' + (b.checkIn || '?') + ' ~ ' + (b.checkOut || '?');
      text += ' (' + (b.nights || 0) + '晚)\n';
      if (b.confirmNo) text += '   🔢 确认号：' + escapeHtml(b.confirmNo) + '\n';
      if (b.agent) text += '   👤 代理：' + escapeHtml(b.agent) + '\n';
      text += '\n';
    }

    if (bookings.length > 10) {
      text += '... 还有 ' + (bookings.length - 10) + ' 笔记录。';
    }

    sendMessage(chatId, text, mainMenuKB(emp));
  });
}

/* ============================================================
 * /新增授权 — Admin Authorize New Employee
 * ============================================================ */

function startNewAuth(userId, chatId, user) {
  if (!isAdmin(user.id)) {
    sendMessage(chatId, '⛔ 此功能仅限管理员使用。', mainMenuKB(getEmployeeByTgId(user.id)));
    return;
  }

  var session = createSession(userId, chatId);
  session.step = STEPS.AUTH_TGID;

  var text = '<b>🔑 新增员工授权</b>\n\n';
  text += '请输入新员工的 <b>Telegram ID</b>：\n\n';
  text += '💡 获取方式：请对方向 @userinfobot 发送任意消息，即可获取其 Telegram ID。';

  sendMessage(chatId, text, kb([
    [{ text: '⬅️ 取消', callback_data: 'book_cancel' }]
  ]));
}

function handleAuthFlow(userId, chatId, text, user) {
  var session = getSession(userId);
  if (!session) return;

  switch (session.step) {
    case STEPS.AUTH_TGID:
      var tgId = text.trim();
      if (!tgId.match(/^\d+$/)) {
        sendMessage(chatId, '❌ Telegram ID 应为纯数字，请重新输入：');
        return;
      }
      /* Check if already exists */
      var existing = getEmployeeByTgId(tgId);
      if (existing) {
        sendMessage(chatId,
          '⚠️ 该 Telegram ID 已存在：\n' +
          '姓名：' + escapeHtml(existing.name) + '\n' +
          '角色：' + (existing.role === EMPLOYEE_ROLES.ADMIN ? '管理员' : '员工') + '\n' +
          '状态：' + (existing.active !== false ? '在职' : '停用') + '\n\n' +
          '如需修改请到管理后台操作。',
          mainMenuKB(getEmployeeByTgId(user.id))
        );
        clearSession(userId);
        return;
      }
      session.data.newAuthTgId = tgId;
      session.step = STEPS.AUTH_NAME;
      sendMessage(chatId, '✅ Telegram ID：<code>' + tgId + '</code>\n\n请输入员工<b>姓名</b>：');
      break;

    case STEPS.AUTH_NAME:
      var name = text.trim();
      if (!name) {
        sendMessage(chatId, '❌ 姓名不能为空，请重新输入：');
        return;
      }
      session.data.newAuthName = name;
      session.step = STEPS.AUTH_ROLE;
      sendMessage(chatId,
        '✅ 姓名：<b>' + escapeHtml(name) + '</b>\n\n请选择<b>角色</b>：',
        kb([
          [
            { text: '🔑 管理员', callback_data: 'authrole:admin' },
            { text: '👤 员工', callback_data: 'authrole:staff' }
          ],
          [{ text: '⬅️ 取消', callback_data: 'book_cancel' }]
        ])
      );
      break;
  }
}

function executeAuth(chatId, userId, role) {
  var session = getSession(userId);
  if (!session) return;

  var tgId = session.data.newAuthTgId;
  var name = session.data.newAuthName;
  var now = Date.now();
  var fbKey = generateFbKey();

  var employee = {
    id: 'EP' + now.toString(36) + crypto.randomBytes(3).toString('hex'),
    _fbKey: fbKey,
    _createdAt: now,
    _updatedAt: now,
    tgId: String(tgId),
    name: name,
    role: role,
    active: true,
    authorizedAt: new Date().toISOString()
  };

  /* Write to Firebase employeeList */
  fbPut(CONFIG.FIREBASE.PATHS.EMPLOYEE_LIST + '/' + encodeURIComponent(fbKey), employee, function (err) {
    if (err) {
      sendMessage(chatId, '❌ 授权失败：' + err, mainMenuKB(getEmployeeByTgId(userId)));
      clearSession(userId);
      return;
    }

    /* Update cache */
    if (!cache.employeeList) cache.employeeList = {};
    cache.employeeList[fbKey] = employee;

    /* Write bot log */
    writeBotLog({
      _fbKey:     generateFbKey(),
      _createdAt: now,
      action:     'employee_auth',
      message:    '新增授权：' + name + ' (' + role + ') TG ID: ' + tgId,
      userId:     userId
    });

    var roleLabel = role === EMPLOYEE_ROLES.ADMIN ? '🔑 管理员' : '👤 员工';
    var text = '✅ <b>授权成功！</b>\n\n';
    text += '👤 姓名：<b>' + escapeHtml(name) + '</b>\n';
    text += '🔢 Telegram ID：<code>' + tgId + '</code>\n';
    text += '🎭 角色：' + roleLabel + '\n\n';
    text += '该员工现在可以使用此机器人了。';

    clearSession(userId);
    sendMessage(chatId, text, mainMenuKB(getEmployeeByTgId(userId)));
  });
}

/* ============================================================
 * Callback Query Handler
 * ============================================================ */

function handleCallback(cb) {
  var userId = cb.from.id;
  var chatId = cb.message.chat.id;
  var data = cb.data;
  var user = cb.from;

  answerCallback(cb.id);

  /* Ensure authorized */
  ensureCacheFresh(function () {
    if (!isAuthorized(userId)) {
      if (_isFirstUser()) {
        _autoRegisterAdmin(user);
        sendMessage(chatId, '🔑 您已成为首位管理员！请重新发送 /start。');
      } else {
        sendMessage(chatId, '⛔ 您尚未授权。您的 TG ID: <code>' + userId + '</code>');
      }
      return;
    }

    /* Handle cancel */
    if (data === 'book_cancel') {
      clearSession(userId);
      sendMessage(chatId, '❌ 已取消操作。', mainMenuKB(getEmployeeByTgId(userId)));
      return;
    }

    /* Handle noop (section headers) */
    if (data === 'noop') return;

    /* Menu commands */
    if (data === 'cmd_book') { startBooking(userId, chatId, user); return; }
    if (data === 'cmd_confirmno') { startConfirmNo(userId, chatId, user); return; }
    if (data === 'cmd_modify') { startModify(userId, chatId, user); return; }
    if (data === 'cmd_cancel') { startCancel(userId, chatId, user); return; }
    if (data === 'cmd_query') { startQuery(userId, chatId, user); return; }
    if (data === 'cmd_newauth') { startNewAuth(userId, chatId, user); return; }

    /* Booking flow callbacks */
    var session = getSession(userId);

    /* Casino selection */
    if (data.indexOf('casino:') === 0) {
      var casino = data.substring(7);
      if (!session) session = createSession(userId, chatId);
      session.data.casino = casino;
      session.step = STEPS.BOOKING_HOTEL;
      sendMessage(chatId, '✅ 体系：<b>' + escapeHtml(casino) + '</b>\n\n请选择<b>酒店</b>：', hotelKB(casino));
      return;
    }

    /* Back to casino */
    if (data === 'book_back_casino') {
      if (session) {
        session.step = STEPS.BOOKING_CASINO;
        sendMessage(chatId, '请选择<b>酒店体系</b>：', casinoKB());
      }
      return;
    }

    /* Hotel selection */
    if (data.indexOf('hotel:') === 0) {
      var hotel = data.substring(6);
      if (session) {
        session.data.hotel = hotel;
        session.step = STEPS.BOOKING_ROOM;
        sendMessage(chatId, '✅ 酒店：<b>' + escapeHtml(hotel) + '</b>\n\n请选择<b>房型</b>（含洗码门槛）：', roomTypeKB(session.data.casino, hotel));
      }
      return;
    }

    /* Back to hotel */
    if (data === 'book_back_hotel') {
      if (session) {
        session.step = STEPS.BOOKING_HOTEL;
        sendMessage(chatId, '请选择<b>酒店</b>：', hotelKB(session.data.casino));
      }
      return;
    }

    /* Room type selection */
    if (data.indexOf('room:') === 0) {
      var roomType = data.substring(5);
      if (session) {
        session.data.roomType = roomType;
        session.data.threshold = getThreshold(session.data.casino, session.data.hotel, roomType);
        session.step = STEPS.BOOKING_AGENT;
        var emp = getEmployeeByTgId(userId);
        var empId = emp ? emp.id : String(userId);
        sendMessage(chatId,
          '✅ 房型：<b>' + getRoomLabel(roomType) + '</b>\n' +
          '💰 洗码门槛：' + formatNum(Math.round((session.data.threshold || 0) / 10000)) + '万\n\n' +
          '请选择<b>所属代理</b>：',
          agentKB(empId)
        );
      }
      return;
    }

    /* Back to room */
    if (data === 'book_back_room') {
      if (session) {
        session.step = STEPS.BOOKING_ROOM;
        sendMessage(chatId, '请选择<b>房型</b>：', roomTypeKB(session.data.casino, session.data.hotel));
      }
      return;
    }

    /* Agent selection */
    if (data.indexOf('agent:') === 0) {
      var agent = data.substring(6);
      if (session) {
        session.data.agent = agent;
        proceedAfterAgent(chatId, session);
      }
      return;
    }

    /* Back to agent */
    if (data === 'book_back_agent') {
      if (session) {
        session.step = STEPS.BOOKING_AGENT;
        var emp2 = getEmployeeByTgId(userId);
        var empId2 = emp2 ? emp2.id : String(userId);
        sendMessage(chatId, '请选择<b>所属代理</b>：', agentKB(empId2));
      }
      return;
    }

    /* Booking smoking preference */
    if (data.indexOf('book_smoke:') === 0) {
      var smokeVal = data.substring(11);
      if (session) {
        session.data.smoking = smokeVal;
        proceedAfterAgent(chatId, session);
      }
      return;
    }

    /* Booking fee type selection */
    if (data.indexOf('book_fee:') === 0) {
      var feeVal = data.substring(9);
      if (session) {
        session.data.feeStatus = feeVal;
        showBookingConfirm(chatId, session);
      }
      return;
    }

    /* Back to smoking */
    if (data === 'book_back_smoking') {
      if (session) {
        session.data.feeStatus = null;
        session.step = STEPS.BOOKING_SMOKING;
        sendMessage(chatId,
          '请选择<b>吸烟偏好</b>：',
          kb([
            [
              { text: '🚬 吸烟', callback_data: 'book_smoke:smoking' },
              { text: '🚭 禁烟', callback_data: 'book_smoke:non-smoking' },
              { text: '❓ 未指定', callback_data: 'book_smoke:unspecified' }
            ],
            [{ text: '⬅️ 返回', callback_data: 'book_back_agent' }]
          ])
        );
      }
      return;
    }

    /* Booking submit */
    if (data === 'book_submit') {
      if (session) {
        submitBooking(chatId, userId, session, user);
      }
      return;
    }

    /* Confirm number flow */
    if (data.indexOf('cno:') === 0) {
      var fbKey = data.substring(4);
      if (session) {
        session.data.selectedBookingKey = fbKey;
        session.step = STEPS.CONFIRMNO_INPUT;
      }
      sendMessage(chatId, '请输入<b>确认编号</b>（公关回复的订房编号）：');
      return;
    }

    /* Bulk confirm number flow */
    if (data === 'bulkcnf:yes') {
      var session2 = getSession(userId);
      if (session2 && session2.data.bulkMatches) {
        executeBulkConfirmNo(userId, chatId, session2.data.bulkMatches);
      } else {
        sendMessage(chatId, '❌ 会话已过期，请重新操作。', mainMenuKB(getEmployeeByTgId(userId)));
      }
      return;
    }

    /* Modify flow */
    if (data.indexOf('mod:') === 0) {
      var modKey = data.substring(4);
      showModifyOptions(chatId, userId, modKey);
      return;
    }

    /* Modify field selection */
    if (data.indexOf('modfield:') === 0) {
      var field = data.substring(9);
      if (session) {
        session.data.modifyField = field;
        session.step = STEPS.MODIFY_INPUT;

        var prompt = '';
        switch (field) {
          case 'checkIn':  prompt = '请输入新的<b>入住日期</b>（MM/DD 或 YYYY-MM-DD）：'; break;
          case 'checkOut': prompt = '请输入新的<b>退房日期</b>（MM/DD 或 YYYY-MM-DD）：'; break;
          case 'smoking':  prompt = '请选择吸烟偏好：'; 
            sendMessage(chatId, prompt, kb([
              [
                { text: '🚬 吸烟', callback_data: 'modval:smoking' },
                { text: '🚭 禁烟', callback_data: 'modval:non-smoking' },
                { text: '❓ 未指定', callback_data: 'modval:unspecified' }
              ],
              [{ text: '⬅️ 返回', callback_data: 'cmd_modify' }]
            ]));
            return;
          case 'pickupName': prompt = '请输入新的<b>举牌名称</b>：'; break;
          case 'remark':    prompt = '请输入新的<b>备注</b>：'; break;
        }
        sendMessage(chatId, prompt);
      }
      return;
    }

    /* Modify smoking value (button) */
    if (data.indexOf('modval:') === 0) {
      var smokeVal = data.substring(7);
      if (session) {
        session.data.modifyField = 'smoking';
        /* Simulate text input */
        var smokeText = smokeVal === 'smoking' ? '吸烟' : smokeVal === 'non-smoking' ? '禁烟' : '未指定';
        handleModifyInput(userId, chatId, smokeText);
      }
      return;
    }

    /* Cancel booking flow */
    if (data.indexOf('cnl:') === 0) {
      var cancelKey = data.substring(4);
      confirmCancel(chatId, userId, cancelKey);
      return;
    }

    if (data.indexOf('cnl_yes:') === 0) {
      var yesKey = data.substring(8);
      executeCancel(chatId, userId, yesKey);
      return;
    }

    /* Auth role selection */
    if (data.indexOf('authrole:') === 0) {
      var role = data.substring(9);
      executeAuth(chatId, userId, role);
      return;
    }
  });
}

/* Check if a message @mentions this bot */
function isBotMentioned(msg) {
  if (!msg || !botUsername) return false;

  /* Check entities for mention type pointing to our bot */
  var entities = msg.entities;
  if (entities && entities.length > 0) {
    var text = msg.text || msg.caption || '';
    for (var i = 0; i < entities.length; i++) {
      var e = entities[i];
      if (e.type === 'mention') {
        var mentioned = text.substring(e.offset, e.offset + e.length);
        if (mentioned === '@' + botUsername) return true;
      }
    }
  }

  /* Fallback: check text for @botname (in case entities not sent) */
  var raw = msg.text || msg.caption || '';
  if (raw.indexOf('@' + botUsername) !== -1) return true;

  return false;
}

/* ============================================================
 * Text Message Handler
 * ============================================================ */

function handleText(msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var text = msg.text || '';

  /* /start or /help */
  if (text === '/start' || text === '/help' || text === '/start@' || text.indexOf('/start ') === 0) {
    handleStart(msg);
    return;
  }

  /* Chinese commands (Telegram may append @botname) */
  var cmd = text.split(' ')[0].split('@')[0];

  if (cmd === '/新增授权' || cmd === '/newauth') {
    checkAuth(msg, function (ok) {
      if (ok) startNewAuth(userId, chatId, msg.from);
    });
    return;
  }

  if (cmd === '/订房' || cmd === '/book') {
    checkAuth(msg, function (ok) {
      if (ok) {
        /* Check if text was sent with the command */
        var textAfterCmd = text.substring(cmd.length).trim();
        if (textAfterCmd) {
          /* Parse the text directly */
          var session = createSession(userId, chatId);
          var emp = getEmployeeByTgId(userId);
          session.data.employee = emp ? emp.name : getDisplayName(msg.from);
          session.data.employeeId = emp ? emp.id : '';
          session.data.employeeTgId = String(userId);
          handleBookingText(userId, chatId, textAfterCmd, msg.from);
        } else {
          startBooking(userId, chatId, msg.from);
        }
      }
    });
    return;
  }

  if (cmd === '/确认号' || cmd === '/confirmno') {
    checkAuth(msg, function (ok) {
      if (ok) startConfirmNo(userId, chatId, msg.from);
    });
    return;
  }

  if (cmd === '/修改' || cmd === '/modify') {
    checkAuth(msg, function (ok) {
      if (ok) startModify(userId, chatId, msg.from);
    });
    return;
  }

  if (cmd === '/取消' || cmd === '/cancel') {
    checkAuth(msg, function (ok) {
      if (ok) startCancel(userId, chatId, msg.from);
    });
    return;
  }

  if (cmd === '/查询' || cmd === '/query') {
    checkAuth(msg, function (ok) {
      if (ok) startQuery(userId, chatId, msg.from);
    });
    return;
  }

  if (cmd === '/help') {
    handleHelp(msg);
    return;
  }

  /* Not a command — handle based on chat type */
  var chatType = msg.chat.type;
  var mentioned = isBotMentioned(msg);
  var isGroup = (chatType === 'group' || chatType === 'supergroup');

  checkAuth(msg, function (ok) {
    if (!ok) return;

    var session = getSession(userId);

    /* In groups: ignore non-mention messages (unless user is in a session) */
    if (isGroup && !mentioned && !session) {
      /* Don't respond — avoid noise in group chats */
      return;
    }

    /* In groups with @mention or in private chat: show main menu */
    if (!session) {
      /* Check if message looks like a bulk confirm number reply from PR */
      var bulkParsed = parseBulkConfirmNumbers(text);
      if (bulkParsed.length >= 2) {
        /* Auto-detect bulk confirm numbers */
        handleBulkConfirmNo(userId, chatId, text, msg.from);
        return;
      }

      var emp = getEmployeeByTgId(userId);
      var name = emp ? emp.name : getDisplayName(msg.from);
      var roleLabel = (emp && emp.role === EMPLOYEE_ROLES.ADMIN) ? ' 🔑管理员' : '';

      var greet = '👋 您好，<b>' + escapeHtml(name) + '</b>' + roleLabel + '\n\n';
      greet += '请选择以下操作：';

      sendMessage(chatId, greet, mainMenuKB(emp));
      return;
    }

    /* Route to appropriate handler based on step */
    switch (session.step) {
      case STEPS.BOOKING_WAIT_TEXT:
        /* Check if this is a bulk confirm number message (user forwarded PR reply while in booking flow) */
        var bulkParsed2 = parseBulkConfirmNumbers(text);
        if (bulkParsed2.length >= 2) {
          handleBulkConfirmNo(userId, chatId, text, msg.from);
          return;
        }
        handleBookingText(userId, chatId, text, msg.from);
        break;

      case STEPS.BOOKING_GUEST:
        session.data.guestName = text.trim();
        if (!session.data.guestName) {
          sendMessage(chatId, '❌ 客人姓名不能为空，请重新输入：');
          break;
        }
        proceedAfterAgent(chatId, session);
        break;

      case STEPS.BOOKING_CHECKIN:
        var ci = parseDate(text.trim());
        if (!ci) {
          sendMessage(chatId, '❌ 日期格式错误，请重新输入（MM/DD 或 YYYY-MM-DD）：');
          break;
        }
        session.data.checkIn = ci;
        proceedAfterAgent(chatId, session);
        break;

      case STEPS.BOOKING_CHECKOUT:
        var co = parseDate(text.trim());
        if (!co) {
          sendMessage(chatId, '❌ 日期格式错误，请重新输入（MM/DD 或 YYYY-MM-DD）：');
          break;
        }
        if (co <= session.data.checkIn) {
          sendMessage(chatId, '❌ 退房日期必须在入住日期之后，请重新输入：');
          break;
        }
        session.data.checkOut = co;
        session.data.nights = calcNights(session.data.checkIn, session.data.checkOut);
        proceedAfterAgent(chatId, session);
        break;

      case STEPS.BOOKING_REMARK:
        var remark = text.trim();
        session.data.remark = (remark === '无' || remark === '無' || remark.toLowerCase() === 'none') ? '' : remark;
        proceedAfterAgent(chatId, session);
        break;

      case STEPS.CONFIRMNO_SELECT:
        /* User may have pasted a bulk confirm number reply instead of clicking buttons */
        var bulkParsed3 = parseBulkConfirmNumbers(text);
        if (bulkParsed3.length >= 2) {
          clearSession(userId); /* Clear the old confirmNo select session */
          handleBulkConfirmNo(userId, chatId, text, msg.from);
          return;
        }
        /* Unknown text in confirmNo select — show menu */
        clearSession(userId);
        sendMessage(chatId, '👋 操作菜单：', mainMenuKB(getEmployeeByTgId(userId)));
        break;

      case STEPS.CONFIRMNO_INPUT:
        handleConfirmNoInput(userId, chatId, text);
        break;

      case STEPS.CONFIRMNO_BULK_REVIEW:
        /* User is reviewing bulk matches — any text cancels and shows menu */
        clearSession(userId);
        sendMessage(chatId, '❌ 已取消批量确认号操作。', mainMenuKB(getEmployeeByTgId(userId)));
        break;

      case STEPS.MODIFY_INPUT:
        handleModifyInput(userId, chatId, text);
        break;

      case STEPS.AUTH_TGID:
      case STEPS.AUTH_NAME:
        handleAuthFlow(userId, chatId, text, msg.from);
        break;

      default:
        var emp2 = getEmployeeByTgId(userId);
        sendMessage(chatId, '👋 操作菜单：', mainMenuKB(emp2));
        break;
    }
  });
}

/* ============================================================
 * Daily Scan — Auto Status Transition
 * ============================================================ */

function dailyScan() {
  console.log('[Scan] Starting daily status scan...');

  fbGet(CONFIG.FIREBASE.PATHS.BOOKINGS, function (err, data) {
    if (err || !data) {
      console.error('[Scan] Failed to fetch bookings:', err);
      return;
    }

    var todayStr = today();
    var transitions = [];
    var updates = 0;

    for (var key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var b = data[key];
      if (!b || b._deleted || b.archived) continue;

      var changed = false;
      var newStatus = b.status;

      /* pending/confirmed -> checked-in */
      if (STATUS_AUTO_TRANSITION.toCheckedIn.indexOf(b.status) !== -1) {
        if (b.checkIn && b.checkIn <= todayStr) {
          newStatus = BOOKING_STATUS.CHECKED_IN;
          changed = true;
        }
      }

      /* checked-in -> checked-out */
      if (!changed && STATUS_AUTO_TRANSITION.toCheckedOut.indexOf(b.status) !== -1) {
        if (b.checkOut && b.checkOut <= todayStr) {
          newStatus = BOOKING_STATUS.CHECKED_OUT;
          changed = true;
        }
      }

      if (changed) {
        b.status = newStatus;
        b._updatedAt = Date.now();

        /* Auto-archive if checked-out */
        if (STATUS_AUTO_TRANSITION.toArchive.indexOf(newStatus) !== -1) {
          b.archived = true;
          b.archivedAt = Date.now();

          /* Create archive record */
          var archiveKey = generateFbKey();
          var archive = {
            _fbKey: archiveKey,
            _createdAt: Date.now(),
            originalKey: b._fbKey,
            archivedAt: Date.now(),
            finalStatus: newStatus,
            guestName: b.guestName,
            agent: b.agent,
            employee: b.employee,
            employeeId: b.employeeId,
            casino: b.casino,
            hotel: b.hotel,
            roomType: b.roomType,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            nights: b.nights,
            smoking: b.smoking,
            feeStatus: b.feeStatus,
            chargeGuest: b.chargeGuest,
            chargeCompany: b.chargeCompany,
            profit: b.profit,
            currency: b.currency,
            confirmNo: b.confirmNo,
            pickupName: b.pickupName,
            transfer: b.transfer,
            threshold: b.threshold,
            remark: b.remark
          };
          fbPut(CONFIG.FIREBASE.PATHS.ARCHIVES + '/' + encodeURIComponent(archiveKey), archive);
        }

        /* Write updated booking back */
        fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(b._fbKey), b);

        transitions.push({
          fbKey: b._fbKey,
          guestName: b.guestName,
          oldStatus: b.status,
          newStatus: newStatus,
          archived: b.archived
        });
        updates++;
      }
    }

    /* Also auto-archive cancelled bookings */
    for (var key2 in data) {
      if (!data.hasOwnProperty(key2)) continue;
      var b2 = data[key2];
      if (!b2 || b2._deleted || b2.archived) continue;
      if (b2.status === BOOKING_STATUS.CANCELLED) {
        b2.archived = true;
        b2.archivedAt = Date.now();
        b2._updatedAt = Date.now();
        fbPut(CONFIG.FIREBASE.PATHS.BOOKINGS + '/' + encodeURIComponent(b2._fbKey), b2);

        var archKey2 = generateFbKey();
        var arch2 = {
          _fbKey: archKey2,
          _createdAt: Date.now(),
          originalKey: b2._fbKey,
          archivedAt: Date.now(),
          finalStatus: BOOKING_STATUS.CANCELLED,
          guestName: b2.guestName,
          agent: b2.agent,
          employee: b2.employee,
          employeeId: b2.employeeId,
          casino: b2.casino,
          hotel: b2.hotel,
          roomType: b2.roomType,
          checkIn: b2.checkIn,
          checkOut: b2.checkOut,
          nights: b2.nights,
          smoking: b2.smoking,
          feeStatus: b2.feeStatus,
          chargeGuest: b2.chargeGuest,
          chargeCompany: b2.chargeCompany,
          profit: b2.profit,
          currency: b2.currency,
          confirmNo: b2.confirmNo,
          pickupName: b2.pickupName,
          transfer: b2.transfer,
          threshold: b2.threshold,
          remark: b2.remark
        };
        fbPut(CONFIG.FIREBASE.PATHS.ARCHIVES + '/' + encodeURIComponent(archKey2), arch2);

        transitions.push({
          fbKey: b2._fbKey,
          guestName: b2.guestName,
          oldStatus: 'cancelled',
          newStatus: 'archived',
          archived: true
        });
        updates++;
      }
    }

    if (transitions.length > 0) {
      console.log('[Scan] Transitioned', transitions.length, 'bookings:');
      for (var i = 0; i < transitions.length; i++) {
        var t = transitions[i];
        console.log('  -', t.guestName, ':', t.oldStatus, '->', t.newStatus, t.archived ? '(archived)' : '');
      }

      /* Write scan log */
      writeBotLog({
        _fbKey: generateFbKey(),
        _createdAt: Date.now(),
        action: 'daily_scan',
        message: 'Daily scan: ' + transitions.length + ' transitions'
      });
    } else {
      console.log('[Scan] No transitions needed.');
    }

    /* After scan, check reminders */
    checkReminders(data);
  });
}

/* ============================================================
 * Reminder Check — 3 Days Before Check-in
 * ============================================================ */

function checkReminders(bookingsData) {
  console.log('[Reminder] Checking reminders...');

  var todayStr = today();
  var reminderDate = addDays(todayStr, CONFIG.REMINDER_DAYS_BEFORE);
  var reminders = [];

  for (var key in bookingsData) {
    if (!bookingsData.hasOwnProperty(key)) continue;
    var b = bookingsData[key];
    if (!b || b._deleted || b.archived) continue;

    if (b.status === BOOKING_STATUS.PENDING &&
        !b.confirmNo &&
        b.checkIn &&
        b.checkIn <= reminderDate &&
        b.checkIn >= todayStr) {

      var daysLeft = daysUntil(b.checkIn);
      reminders.push({
        booking: b,
        daysLeft: daysLeft
      });

      /* Send reminder to the employee who created the booking */
      if (b.employeeId) {
        var emp = null;
        if (cache.employeeList) {
          for (var empKey in cache.employeeList) {
            if (cache.employeeList[empKey] && cache.employeeList[empKey].id === b.employeeId) {
              emp = cache.employeeList[empKey];
              break;
            }
          }
        }

        if (emp && emp.tgId) {
          var text = '⏰ <b>订房提醒</b>\n\n';
          text += '以下订房即将入住，但尚未填入确认号：\n\n';
          text += '👤 客人：<b>' + escapeHtml(b.guestName) + '</b>\n';
          text += '🏨 ' + (b.casino || '') + ' / ' + (b.hotel || '') + ' / ' + getRoomLabel(b.roomType) + '\n';
          text += '📅 入住日期：' + b.checkIn + '\n';
          text += '⏳ 剩余：' + daysLeft + ' 天\n\n';
          text += '请尽快向公关确认并使用 /确认号 填入确认编号。';

          sendMessage(emp.tgId, text);
        }
      }
    }
  }

  if (reminders.length > 0) {
    console.log('[Reminder] Sent', reminders.length, 'reminders');
    writeBotLog({
      _fbKey: generateFbKey(),
      _createdAt: Date.now(),
      action: 'reminder_check',
      message: 'Sent ' + reminders.length + ' reminders'
    });
  } else {
    console.log('[Reminder] No reminders needed.');
  }
}

/* ============================================================
 * Daily Scan Scheduler
 * ============================================================ */

var lastScanDate = null;

function checkDailyScan() {
  var now = new Date();
  var todayStr = today();
  var timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());

  /* Run once per day at or after DAILY_SCAN_TIME */
  if (todayStr !== lastScanDate && timeStr >= CONFIG.DAILY_SCAN_TIME) {
    lastScanDate = todayStr;
    console.log('[Scheduler] Running daily scan at', timeStr);
    dailyScan();
  }
}

/* ============================================================
 * Long-Polling Loop
 * ============================================================ */

var lastUpdateId = 0;
var polling = false;
var pollInFlight = false;     /* Prevents concurrent poll() calls */
var pollScheduled = false;    /* Prevents duplicate poll() scheduling */
var pollEnded = false;        /* Track if 'end' already fired for this request */

/* Deduplication: track recently processed update IDs */
var processedUpdates = {};
var dedupQueue = [];
var MAX_DEDUP = 200;

function isAlreadyProcessed(updateId) {
  if (processedUpdates[updateId]) return true;
  processedUpdates[updateId] = true;
  dedupQueue.push(updateId);
  if (dedupQueue.length > MAX_DEDUP) {
    var old = dedupQueue.shift();
    delete processedUpdates[old];
  }
  return false;
}

/* Schedule next poll — guaranteed to only schedule once */
function schedulePoll(delay) {
  if (pollScheduled) return;
  pollScheduled = true;
  setTimeout(function () {
    pollScheduled = false;
    poll();
  }, delay);
}

/* Single poll request — module-level so schedulePoll can reach it */
function poll() {
  /* Guard against concurrent polls */
  if (pollInFlight) return;
  pollInFlight = true;
  pollEnded = false;

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
      /* Prevent double-handling: if already ended (e.g. timeout destroyed) skip */
      if (pollEnded) return;
      pollEnded = true;

      try {
        var json = JSON.parse(chunks);
        if (json.ok && json.result && json.result.length > 0) {
          for (var i = 0; i < json.result.length; i++) {
            var update = json.result[i];
            lastUpdateId = update.update_id;

            /* Skip already-processed updates (dedup) */
            if (isAlreadyProcessed(update.update_id)) {
              continue;
            }

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

      pollInFlight = false;
      schedulePoll(50);
    });
  });

  req.on('error', function (e) {
    /* Prevent double-handling with 'end' event */
    if (pollEnded) return;
    pollEnded = true;

    console.error('[Poll] Error:', e.message);
    console.log('[Poll] Retrying in ' + (CONFIG.POLL_RETRY_DELAY / 1000) + 's...');
    pollInFlight = false;
    schedulePoll(CONFIG.POLL_RETRY_DELAY);
  });

  req.on('timeout', function () {
    /* Timeout is expected during long-polling — just destroy the request */
    /* The 'end' or 'error' handler will take care of scheduling the next poll */
    req.destroy();
  });

  req.write(body);
  req.end();
}

function startPolling() {
  if (polling) return;
  polling = true;

  console.log('[Bot] Starting long-polling...');

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
  console.log('  v2.0.0 (v8 spec)');
  console.log('========================================');
  console.log('');
  console.log('[Bot] Token: ' + CONFIG.TELEGRAM_TOKEN.substring(0, 10) + '...');
  console.log('[Bot] Firebase DB: ' + CONFIG.FIREBASE.DB_URL);
  console.log('[Bot] FB Path prefix: booking_data/');
  console.log('[Bot] Daily scan time: ' + CONFIG.DAILY_SCAN_TIME);
  console.log('[Bot] Reminder days before: ' + CONFIG.REMINDER_DAYS_BEFORE);
  console.log('');

  /* Test bot connection */
  tgRequest('getMe', {}, function (err, result) {
    if (err) {
      console.error('[Bot] Connection test failed:', err);
      console.error('[Bot] Please check your TELEGRAM_BOT_TOKEN');
      process.exit(1);
    }

    botUsername = result.username;
    console.log('[Bot] Connected as @' + botUsername + ' (' + result.first_name + ')');
    console.log('[Bot] Bot ID: ' + result.id);
    console.log('');

    /* Set bot commands menu */
    setBotCommands();

    /* Initial cache refresh */
    console.log('[Bot] Refreshing caches...');
    refreshCache(function () {
      console.log('[Bot] Caches ready.');
      console.log('[Bot] Casinos:', getCasinos().join(', '));
      console.log('');

      /* Start polling */
      startPolling();

      /* Start daily scan scheduler (check every minute) */
      setInterval(checkDailyScan, 60 * 1000);
      /* Also run an initial scan check */
      checkDailyScan();

      console.log('');
      console.log('[Bot] Bot is now running. Press Ctrl+C to stop.');
      console.log('[Bot] Send /start to your bot on Telegram to begin.');
      console.log('');

      /* Periodic cache refresh */
      setInterval(function () {
        console.log('[Bot] Refreshing caches...');
        refreshCache();
      }, CONFIG.CACHE_REFRESH_MS);
    });
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
