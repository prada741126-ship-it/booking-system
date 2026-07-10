/**
 * constants.js — Single Source of Truth for all constants
 * Booking System v2.0.0 (v8 spec)
 * Light theme | 7 pages | 6 room types | Chinese bot commands
 */

/* ===== App Info ===== */
var APP = {
  VERSION: '2.0.0',
  TITLE: 'VIP Booking System',
  SYSTEM_NAME: 'BookingHub'
};

/* ===== Config ===== */
var CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,
  TOMBSTONE_TTL_MS: 30 * 24 * 60 * 60 * 1000,
  MAX_UPLOAD_QUEUE: 200,
  SYNC_RECONNECT_DELAY: 2000,
  SYNC_UPLOAD_DELAY: 3000,
  RECENTLY_DELETED_LIMIT: 100,
  DEFAULT_CHECKIN_TIME: 15,  // 15:00 default, can set 11:00
  REMINDER_DAYS_BEFORE: 3,   // remind 3 days before check-in
  DAILY_SCAN_TIME: '09:00',  // daily status scan at 9am
  RECENT_AGENT_LIMIT: 5,     // remember last 5 agents per employee
  ARCHIVE_AUTO_DAYS: 0      // auto-archive immediately on checkout/cancel
};

/* ===== Storage Keys ===== */
var STORAGE_KEYS = {
  BOOKINGS:          'bk_bookings',
  HOTEL_CONFIG:      'bk_hotel_config',
  AGENT_LIST:        'bk_agent_list',
  EMPLOYEE_LIST:     'bk_employee_list',
  ARCHIVES:          'bk_archives',
  DRAFT:             'bk_draft',
  SAVED_FILTERS:     'bk_saved_filters',
  BACKUP_LIST:       'bk_backup_list',
  BACKUP_PREFIX:     'bk_backup_',
  WORKING_MONTH:     'bk_working_month',
  AUTH:              'bk_auth',
  LAST_BACKUP_DATE:  'bk_last_backup_date',
  HC_PRESET_VER:     'bk_hc_preset_version',
  APP_VERSION:       'bk_app_version',
  RECENTLY_DELETED:  'bk_recently_deleted',
  LAST_SYNC_TIME:    'bk_last_sync_time',
  BOT_LOGS:          'bk_bot_logs',
  CLOSED_MONTHS:     'bk_closed_months',
  RECENT_AGENTS:     'bk_recent_agents',
  SETTINGS:          'bk_settings'
};

/* ===== Firebase Config ===== */
var FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC3NKqEVUpL-9WYvun7pBbJe8P7T8o4Y74',
  authDomain: 'macau-app.firebaseapp.com',
  databaseURL: 'https://macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'macau-app',
  storageBucket: 'macau-app.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000000000'
};

/* ===== Firebase Paths (isolated from v13) ===== */
var FB_PATH = {
  BOOKINGS:      'booking_data/bookings',
  HOTEL_CONFIG:  'booking_data/hotelConfig',
  AGENT_LIST:    'booking_data/agentList',
  EMPLOYEE_LIST: 'booking_data/employeeList',
  ARCHIVES:      'booking_data/archives',
  CLEARED_AT:    'booking_data/clearedAt',
  BOT_LOGS:      'booking_data/botLogs',
  CLOSED_MONTHS: 'booking_data/closedMonths',
  SETTINGS:      'booking_data/settings'
};

/* ===== CDN ===== */
var CDN = {
  FIREBASE_APP:           'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-app-compat.min.js',
  FIREBASE_AUTH:          'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-auth-compat.min.js',
  FIREBASE_DATABASE:      'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-database-compat.min.js',
  FIREBASE_APP_FALLBACK:      'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  FIREBASE_AUTH_FALLBACK:     'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  FIREBASE_DATABASE_FALLBACK: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  CRYPTO_JS:   'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js'
};

/* ===== Events ===== */
var EVENTS = {
  /* Booking events */
  BOOKING_CREATED:    'booking:created',
  BOOKING_UPDATED:    'booking:updated',
  BOOKING_DELETED:    'booking:deleted',
  BOOKING_STATUS_CHANGED: 'booking:status_changed',
  BOOKING_ARCHIVED:   'booking:archived',
  BOOKINGS_LOADED:    'bookings:loaded',
  BOOKINGS_SYNCED:    'bookings:synced',
  /* Hotel config events */
  HC_CREATED:         'hc:created',
  HC_UPDATED:         'hc:updated',
  HC_DELETED:         'hc:deleted',
  HC_LOADED:          'hc:loaded',
  HC_RESET:           'hc:reset',
  /* Agent events */
  AGENT_ADDED:        'agent:added',
  AGENT_RENAMED:      'agent:renamed',
  AGENT_REMOVED:      'agent:removed',
  AGENT_LIST_UPDATED: 'agent_list:updated',
  /* Employee events */
  EMPLOYEE_ADDED:     'employee:added',
  EMPLOYEE_UPDATED:   'employee:updated',
  EMPLOYEE_REMOVED:   'employee:removed',
  EMPLOYEE_LIST_UPDATED: 'employee_list:updated',
  /* Archive events */
  ARCHIVE_ADDED:      'archive:added',
  ARCHIVES_LOADED:    'archives:loaded',
  /* Month events */
  MONTH_CHANGED:      'month:changed',
  MONTH_CLOSED:       'month:closed',
  /* Sync events */
  SYNC_CONNECTED:     'sync:connected',
  SYNC_DISCONNECTED:  'sync:disconnected',
  SYNC_UPLOAD_START:  'sync:upload_start',
  SYNC_UPLOAD_DONE:   'sync:upload_done',
  SYNC_DOWNLOAD_DONE: 'sync:download_done',
  SYNC_ERROR:         'sync:error',
  SYNC_STATUS:        'sync:status',
  /* Page events */
  PAGE_CHANGED:       'page:changed',
  /* UI events */
  UI_TOAST:           'ui:toast',
  UI_MODAL_OPEN:      'ui:modal_open',
  UI_MODAL_CLOSE:     'ui:modal_close',
  UI_LOADING:         'ui:loading',
  UI_RENDER:          'ui:render'
};

/* ===== UI Colors — Light Theme (v8: bright, not nightclub style) ===== */
var UI_COLORS = {
  /* Primary accents */
  primary:        '#2563eb',   /* blue-600 */
  primaryLight:   '#3b82f6',   /* blue-500 */
  primaryDark:    '#1d4ed8',   /* blue-700 */
  success:        '#16a34a',   /* green-600 */
  successLight:   '#22c55e',   /* green-500 */
  warning:        '#f59e0b',   /* amber-500 */
  danger:         '#ef4444',   /* red-500 */
  dangerLight:    '#f87171',   /* red-400 */
  info:           '#0ea5e9',   /* sky-500 */
  goldSoft:       '#c9a84c',
  goldLight:      '#D4A844',
  /* Backgrounds */
  bgBase:         '#f0f2f5',   /* light gray */
  bgElevated:     '#ffffff',   /* white */
  bgSurface:      '#ffffff',   /* white */
  bgHover:        '#f8fafc',   /* very light */
  bgOverlay:      'rgba(0,0,0,0.4)',
  /* Text */
  textPrimary:    '#1e293b',   /* slate-800 */
  textSecondary:  '#475569',   /* slate-600 */
  textMuted:      '#94a3b8',   /* slate-400 */
  textInverse:    '#ffffff',
  /* Borders */
  borderDefault:  '#e2e8f0',   /* slate-200 */
  borderHover:    '#cbd5e1',   /* slate-300 */
  borderActive:   '#3b82f6',   /* blue-500 */
  /* Status colors */
  statusPending:     '#f59e0b',   /* amber */
  statusConfirmed:   '#3b82f6',   /* blue */
  statusCheckedIn:   '#16a34a',   /* green */
  statusCheckedOut:  '#64748b',   /* slate */
  statusCancelled:   '#ef4444',   /* red */
  statusArchived:    '#94a3b8',   /* light slate */
  /* Fee type colors */
  feeFree:        '#16a34a',   /* green */
  feePaid:        '#f59e0b',   /* amber */
  /* Smoking */
  smokingYes:     '#ef4444',   /* red */
  smokingNo:      '#22c55e',   /* green */
  smokingUnknown: '#94a3b8'    /* slate */
};

/* ===== Casino / Venue Options (6 systems) ===== */
var VENUE_OPTIONS = [
  { value: 'cityofdreams', label: '新濠天地', short: 'COD' },
  { value: 'studio-city',  label: '新濠影滙', short: 'SC'  },
  { value: 'sandscot',     label: '金沙',     short: 'SAND' },
  { value: 'galaxy',       label: '銀河',     short: 'GAL' },
  { value: 'wynn',         label: '永利',     short: 'WYN' },
  { value: 'lisboa',       label: '上葡京',   short: 'LIS' }
];

var CASINO_ORDER = ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];

/* ===== Room Types (6 types, shared across all hotels) ===== */
var ROOM_TYPES = [
  { value: 'king',        label: '大床房',     short: '大床' },
  { value: 'twin',        label: '雙床房',     short: '雙床' },
  { value: 'mini-suite',  label: '小套房',     short: '小套' },
  { value: 'grand-suite', label: '大套房',     short: '大套' },
  { value: 'two-bedroom', label: '二房一廳',   short: '二房' },
  { value: 'three-bedroom', label: '三房一廳', short: '三房' }
];

/* ===== Pages (7 pages v8) ===== */
var PAGES = {
  OVERVIEW:      'overview',
  PROFIT:        'profit',
  FEES:          'fees',
  AGENT_PERF:    'agent-performance',
  ARCHIVES:      'archives',
  EMPLOYEES:     'employees',
  HOTEL_CONFIG:  'hotel-config'
};

var PAGE_LIST = [
  { id: PAGES.OVERVIEW,      label: '總覽',     icon: 'dashboard', shortcut: 'Ctrl+1' },
  { id: PAGES.PROFIT,        label: '利潤結算', icon: 'profit',    shortcut: 'Ctrl+2' },
  { id: PAGES.FEES,          label: '費用收取', icon: 'fees',      shortcut: 'Ctrl+3' },
  { id: PAGES.AGENT_PERF,    label: '代理業績', icon: 'agents',    shortcut: 'Ctrl+4' },
  { id: PAGES.ARCHIVES,      label: '歷史核帳', icon: 'archive',   shortcut: 'Ctrl+5' },
  { id: PAGES.EMPLOYEES,     label: '員工管理', icon: 'users',     shortcut: 'Ctrl+6' },
  { id: PAGES.HOTEL_CONFIG,  label: '酒店設定', icon: 'hotel',     shortcut: 'Ctrl+7' }
];

/* ===== Booking Status ===== */
var BOOKING_STATUS = {
  PENDING:     'pending',      /* 待確認 */
  CONFIRMED:   'confirmed',    /* 已確認 */
  CHECKED_IN:  'checked-in',   /* 已入住 */
  CHECKED_OUT: 'checked-out',  /* 已退房 */
  CANCELLED:   'cancelled'     /* 已取消 */
};

var BOOKING_STATUS_LABELS = {
  pending:      '待確認',
  confirmed:    '已確認',
  'checked-in': '已入住',
  'checked-out':'已退房',
  cancelled:    '已取消'
};

var BOOKING_STATUS_COLORS = {
  pending:       UI_COLORS.statusPending,
  confirmed:     UI_COLORS.statusConfirmed,
  'checked-in':  UI_COLORS.statusCheckedIn,
  'checked-out': UI_COLORS.statusCheckedOut,
  cancelled:     UI_COLORS.statusCancelled
};

/* Status flow rules (v8: full auto, no No Show) */
var STATUS_RULES = {
  /* pending: can edit all, can cancel */
  pending:     { canEdit: true,  canCancel: true,  canEditDates: true  },
  /* confirmed: can edit dates, can cancel */
  confirmed:   { canEdit: true,  canCancel: true,  canEditDates: true  },
  /* checked-in: can edit check-in date (guest may extend/leave early) */
  'checked-in':{ canEdit: true,  canCancel: false, canEditDates: true  },
  /* checked-out: locked, auto-archive */
  'checked-out':{ canEdit: false, canCancel: false, canEditDates: false },
  /* cancelled: locked, auto-archive */
  cancelled:   { canEdit: false, canCancel: false, canEditDates: false }
};

/* Auto status transition based on dates */
var STATUS_AUTO_TRANSITION = {
  /* If checkIn date <= today and status is pending/confirmed -> checked-in */
  toCheckedIn: ['pending', 'confirmed'],
  /* If checkOut date <= today and status is checked-in -> checked-out */
  toCheckedOut: ['checked-in'],
  /* checked-out & cancelled -> auto archive */
  toArchive: ['checked-out', 'cancelled']
};

/* ===== Fee Type (v8: only free or paid) ===== */
var FEE_TYPES = {
  FREE: 'free',
  PAID: 'paid'
};

var FEE_TYPE_LABELS = {
  free: '免費',
  paid: '收費'
};

/* ===== Smoking Options ===== */
var SMOKING_OPTIONS = [
  { value: 'smoking',        label: '吸菸' },
  { value: 'non-smoking',    label: '禁菸' },
  { value: 'unspecified',    label: '未指定' }
];

var SMOKING_LABELS = {
  smoking:      '吸菸',
  'non-smoking':'禁菸',
  unspecified:  '未指定'
};

/* ===== Currency ===== */
var CURRENCY_OPTIONS = [
  { value: 'HKD', label: '港幣', symbol: 'HK

</body>
</html>
 },
  { value: 'RMB', label: '人民幣', symbol: 'Y' },
  { value: 'TWD', label: '新台幣', symbol: 'NT

</body>
</html>
 }
];

var CURRENCY_DEFAULT = 'HKD';

var CURRENCY_SYMBOLS = {
  HKD: 'HK

</body>
</html>
,
  RMB: 'Y',
  TWD: 'NT

</body>
</html>

};

/* ===== Transfer Options ===== */
var TRANSFER_OPTIONS = [
  { value: 'none',     label: '無' },
  { value: 'airport',  label: '機場接送' },
  { value: 'ferry',    label: '碼頭接送' },
  { value: 'both',     label: '機場+碼頭' },
  { value: 'custom',   label: '自定義' }
];

/* ===== Employee Roles ===== */
var EMPLOYEE_ROLES = {
  ADMIN: 'admin',   /* 管理員: you + accountant + shareholders */
  STAFF: 'staff'    /* 員工: regular staff */
};

var EMPLOYEE_ROLE_LABELS = {
  admin: '管理員',
  staff: '員工'
};

/* ===== Bot Commands (Chinese) ===== */
var BOT_COMMANDS = [
  { command: 'newauth',    label: '/新增授權', desc: '管理員授權新員工', adminOnly: true },
  { command: 'book',       label: '/訂房',     desc: '開始訂房流程',      adminOnly: false },
  { command: 'confirmno',  label: '/確認號',   desc: '填入確認編號',      adminOnly: false },
  { command: 'modify',     label: '/修改',     desc: '修改訂房資料',      adminOnly: false },
  { command: 'cancel',     label: '/取消',     desc: '取消訂房',          adminOnly: false },
  { command: 'query',      label: '/查詢',     desc: '查詢訂房記錄',      adminOnly: false }
];

/* ===== Keyboard Shortcuts ===== */
var SHORTCUTS = [
  { keys: 'Ctrl+1', action: '切換到總覽' },
  { keys: 'Ctrl+2', action: '切換到利潤結算' },
  { keys: 'Ctrl+3', action: '切換到費用收取' },
  { keys: 'Ctrl+4', action: '切換到代理業績' },
  { keys: 'Ctrl+5', action: '切換到歷史核帳' },
  { keys: 'Ctrl+6', action: '切換到員工管理' },
  { keys: 'Ctrl+7', action: '切換到酒店設定' },
  { keys: 'Ctrl+N', action: '新增訂房' },
  { keys: 'Ctrl+S', action: '手動同步' },
  { keys: 'Ctrl+F', action: '搜索' },
  { keys: 'Ctrl+P', action: '列印' },
  { keys: '?',      action: '顯示快捷鍵' },
  { keys: 'Esc',    action: '關閉彈窗' }
];

/* ===== Default Password (SHA-256 hash of 'admin123') ===== */
/* Will be compared via CryptoJS.SHA256 */
var DEFAULT_PASSWORD_HASH = 'dd3a2aecd47cbb7fab47cdbf84a6daf707cc02e8cdf4a4dc63b169056901a598';

/* ===== Terms ===== */
var TERMS = {
  guestName:   '客人姓名',
  agent:       '所屬代理',
  employee:    '登記員工',
  casino:      '酒店體系',
  hotel:       '酒店',
  roomType:    '房型',
  checkIn:     '入住日期',
  checkOut:    '退房日期',
  nights:      '晚數',
  smoking:     '吸菸偏好',
  status:      '狀態',
  confirmNo:   '確認號',
  feeType:     '費用類型',
  chargeGuest: '向客人收',
  chargeCompany: '交公司',
  profit:      '利潤',
  currency:    '幣別',
  pickupName:  '舉牌名稱',
  transfer:    '接送安排',
  remark:      '備註',
  archived:    '已歸檔',
  threshold:   '洗碼門檻',
  defaultPrice:'預設房價'
};

/**
 * events.js — Event Bus (pub/sub)
 * Decouples modules: no direct calls, only events
 * Pattern: faithfully reused from v13.0.5
 */
var Events = (function () {
  var _listeners = {};

  function on(event, callback) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(callback);
    return function () { off(event, callback); };
  }

  function off(event, callback) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(function (fn) {
      return fn !== callback;
    });
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    var list = _listeners[event].slice();
    for (var i = 0; i < list.length; i++) {
      try {
        list[i](data || {});
      } catch (e) {
        console.error('[Events] Error in listener for "' + event + '":', e);
      }
    }
  }

  function once(event, callback) {
    var wrapper = function (data) {
      off(event, wrapper);
      callback(data);
    };
    on(event, wrapper);
  }

  function clear(event) {
    if (event) {
      delete _listeners[event];
    } else {
      _listeners = {};
    }
  }

  return {
    on: on,
    off: off,
    emit: emit,
    once: once,
    clear: clear
  };
})();

/**
 * state.js — Global State Manager
 * Single source of truth for runtime state
 * All mutations go through State.set() which emits events
 */
var State = (function () {
  var _state = {
    /* Data collections */
    bookings: [],
    hotelConfig: null,
    agentList: [],
    employeeList: [],
    archives: [],
    closedMonths: [],
    settings: {},
    /* UI state */
    currentPage: 'overview',
    workingMonth: null,
    isLoggedIn: false,
    /* Sync state */
    syncConnected: false,
    syncInProgress: false,
    lastSyncTime: null,
    /* Draft state */
    draft: null,
    /* Filters */
    activeFilters: {}
  };

  function get(key) {
    if (key === undefined) return _state;
    return _state[key];
  }

  function set(key, value) {
    var old = _state[key];
    _state[key] = value;
    if (old !== value) {
      Events.emit(EVENTS.UI_RENDER, { key: key, oldValue: old, newValue: value });
    }
  }

  function update(key, updater) {
    var current = _state[key];
    var updated = typeof updater === 'function' ? updater(current) : updater;
    set(key, updated);
  }

  /* Convenience getters */
  function getBookings() {
    return _state.bookings.filter(function (b) { return !b._deleted; });
  }

  function getAllBookings() {
    return _state.bookings;
  }

  function getActiveAgents() {
    return _state.agentList.filter(function (a) { return a.active !== false; });
  }

  function getActiveEmployees() {
    return _state.employeeList.filter(function (e) { return e.active !== false; });
  }

  function getArchives() {
    return _state.archives;
  }

  function getHotelConfig() {
    return _state.hotelConfig;
  }

  function getWorkingMonth() {
    return _state.workingMonth;
  }

  function isMonthClosed(monthStr) {
    return _state.closedMonths.indexOf(monthStr) !== -1;
  }

  function getSettings() {
    return _state.settings || {};
  }

  function getRecentAgents(employeeId) {
    var settings = _state.settings || {};
    var recentMap = settings.recentAgents || {};
    return recentMap[employeeId] || [];
  }

  return {
    get: get,
    set: set,
    update: update,
    getBookings: getBookings,
    getAllBookings: getAllBookings,
    getActiveAgents: getActiveAgents,
    getActiveEmployees: getActiveEmployees,
    getArchives: getArchives,
    getHotelConfig: getHotelConfig,
    getWorkingMonth: getWorkingMonth,
    isMonthClosed: isMonthClosed,
    getSettings: getSettings,
    getRecentAgents: getRecentAgents
  };
})();

/**
 * store.js — localStorage persistence layer
 * Encrypts sensitive data, stores all collections
 * Pattern: faithfully reused from v13.0.5
 */
var Store = (function () {

  function _encrypt(data) {
    try {
      var json = JSON.stringify(data);
      if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.AES.encrypt(json, 'bookinghub_v2').toString();
      }
      return json;
    } catch (e) {
      console.error('[Store] Encrypt error:', e);
      return JSON.stringify(data);
    }
  }

  function _decrypt(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    try {
      if (typeof CryptoJS !== 'undefined' && raw.charAt(0) === 'U') {
        var bytes = CryptoJS.AES.decrypt(raw, 'bookinghub_v2');
        var json = bytes.toString(CryptoJS.enc.Utf8);
        if (json) return JSON.parse(json);
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('[Store] Decrypt error:', e);
      try { return JSON.parse(raw); } catch (e2) { return null; }
    }
  }

  function save(key, data) {
    try {
      var raw = _encrypt(data);
      localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      console.error('[Store] Save error for key "' + key + '":', e);
      return false;
    }
  }

  function load(key) {
    try {
      var raw = localStorage.getItem(key);
      return _decrypt(raw);
    } catch (e) {
      console.error('[Store] Load error for key "' + key + '":', e);
      return null;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[Store] Remove error for key "' + key + '":', e);
    }
  }

  /* ===== Collection-specific helpers ===== */

  function saveBookings(bookings) {
    return save(STORAGE_KEYS.BOOKINGS, bookings);
  }

  function loadBookings() {
    return load(STORAGE_KEYS.BOOKINGS) || [];
  }

  function saveHotelConfig(config) {
    return save(STORAGE_KEYS.HOTEL_CONFIG, config);
  }

  function loadHotelConfig() {
    return load(STORAGE_KEYS.HOTEL_CONFIG);
  }

  function saveAgentList(list) {
    return save(STORAGE_KEYS.AGENT_LIST, list);
  }

  function loadAgentList() {
    return load(STORAGE_KEYS.AGENT_LIST) || [];
  }

  function saveEmployeeList(list) {
    return save(STORAGE_KEYS.EMPLOYEE_LIST, list);
  }

  function loadEmployeeList() {
    return load(STORAGE_KEYS.EMPLOYEE_LIST) || [];
  }

  function saveArchives(archives) {
    return save(STORAGE_KEYS.ARCHIVES, archives);
  }

  function loadArchives() {
    return load(STORAGE_KEYS.ARCHIVES) || [];
  }

  function saveClosedMonths(months) {
    return save(STORAGE_KEYS.CLOSED_MONTHS, months);
  }

  function loadClosedMonths() {
    return load(STORAGE_KEYS.CLOSED_MONTHS) || [];
  }

  function saveSettings(settings) {
    return save(STORAGE_KEYS.SETTINGS, settings);
  }

  function loadSettings() {
    return load(STORAGE_KEYS.SETTINGS) || {};
  }

  function saveAuth(auth) {
    return save(STORAGE_KEYS.AUTH, auth);
  }

  function loadAuth() {
    return load(STORAGE_KEYS.AUTH);
  }

  function saveWorkingMonth(month) {
    return save(STORAGE_KEYS.WORKING_MONTH, month);
  }

  function loadWorkingMonth() {
    return load(STORAGE_KEYS.WORKING_MONTH);
  }

  function saveDraft(draft) {
    return save(STORAGE_KEYS.DRAFT, draft);
  }

  function loadDraft() {
    return load(STORAGE_KEYS.DRAFT);
  }

  function clearDraft() {
    remove(STORAGE_KEYS.DRAFT);
  }

  function saveRecentlyDeleted(list) {
    return save(STORAGE_KEYS.RECENTLY_DELETED, list);
  }

  function loadRecentlyDeleted() {
    return load(STORAGE_KEYS.RECENTLY_DELETED) || [];
  }

  function saveBotLogs(logs) {
    return save(STORAGE_KEYS.BOT_LOGS, logs);
  }

  function loadBotLogs() {
    return load(STORAGE_KEYS.BOT_LOGS) || [];
  }

  /* ===== Load all at once ===== */
  function loadAll() {
    return {
      bookings: loadBookings(),
      hotelConfig: loadHotelConfig(),
      agentList: loadAgentList(),
      employeeList: loadEmployeeList(),
      archives: loadArchives(),
      closedMonths: loadClosedMonths(),
      settings: loadSettings(),
      auth: loadAuth(),
      workingMonth: loadWorkingMonth(),
      draft: loadDraft()
    };
  }

  /* ===== Clear all (except agent list per v13 pattern) ===== */
  function clearAll(keepAgentList) {
    var keysToClear = [
      STORAGE_KEYS.BOOKINGS,
      STORAGE_KEYS.HOTEL_CONFIG,
      STORAGE_KEYS.EMPLOYEE_LIST,
      STORAGE_KEYS.ARCHIVES,
      STORAGE_KEYS.DRAFT,
      STORAGE_KEYS.CLOSED_MONTHS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.RECENTLY_DELETED,
      STORAGE_KEYS.WORKING_MONTH,
      STORAGE_KEYS.BOT_LOGS
    ];
    if (!keepAgentList) {
      keysToClear.push(STORAGE_KEYS.AGENT_LIST);
    }
    for (var i = 0; i < keysToClear.length; i++) {
      remove(keysToClear[i]);
    }
  }

  return {
    save: save,
    load: load,
    remove: remove,
    /* Collections */
    saveBookings: saveBookings,
    loadBookings: loadBookings,
    saveHotelConfig: saveHotelConfig,
    loadHotelConfig: loadHotelConfig,
    saveAgentList: saveAgentList,
    loadAgentList: loadAgentList,
    saveEmployeeList: saveEmployeeList,
    loadEmployeeList: loadEmployeeList,
    saveArchives: saveArchives,
    loadArchives: loadArchives,
    saveClosedMonths: saveClosedMonths,
    loadClosedMonths: loadClosedMonths,
    saveSettings: saveSettings,
    loadSettings: loadSettings,
    saveAuth: saveAuth,
    loadAuth: loadAuth,
    saveWorkingMonth: saveWorkingMonth,
    loadWorkingMonth: loadWorkingMonth,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
    saveRecentlyDeleted: saveRecentlyDeleted,
    loadRecentlyDeleted: loadRecentlyDeleted,
    saveBotLogs: saveBotLogs,
    loadBotLogs: loadBotLogs,
    loadAll: loadAll,
    clearAll: clearAll
  };
})();

/**
 * utils.js — Utility functions
 * Date parsing, currency formatting, ID generation, helpers
 */

var Utils = (function () {

  /* ===== ID Generation ===== */
  function generateId(prefix) {
    prefix = prefix || 'BK';
    var ts = Date.now().toString(36);
    var rand = Math.random().toString(36).substring(2, 8);
    return prefix + ts + rand;
  }

  function generateBookingId() {
    return generateId('BK');
  }

  function generateAgentId() {
    return generateId('AG');
  }

  function generateEmployeeId() {
    return generateId('EP');
  }

  function generateArchiveId() {
    return generateId('AR');
  }

  function generateFbKey() {
    return generateId('FB');
  }

  /* Pad number to 2 digits */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /* ===== Date Parsing (v8: supports MM/DD, MMDD, M/D, YYYY-MM-DD) ===== */

  function parseDate(input) {
    if (!input) return null;
    input = String(input).trim();

    /* Already ISO format: YYYY-MM-DD */
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
      var parts = input.split('-');
      return formatDate(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    }

    /* YYYY/MM/DD */
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(input)) {
      var p = input.split('/');
      return formatDate(parseInt(p[0]), parseInt(p[1]), parseInt(p[2]));
    }

    /* MM/DD or M/D (assume current year) */
    if (/^\d{1,2}\/\d{1,2}$/.test(input)) {
      var mp = input.split('/');
      return formatDate(currentYear(), parseInt(mp[0]), parseInt(mp[1]));
    }

    /* MMDD (4 digits, no separator) */
    if (/^\d{4}$/.test(input)) {
      var mm = parseInt(input.substring(0, 2));
      var dd = parseInt(input.substring(2, 4));
      return formatDate(currentYear(), mm, dd);
    }

    /* MM-DD with separator */
    if (/^\d{1,2}-\d{1,2}$/.test(input)) {
      var dp = input.split('-');
      return formatDate(currentYear(), parseInt(dp[0]), parseInt(dp[1]));
    }

    /* Try Date.parse as last resort */
    var d = new Date(input);
    if (!isNaN(d.getTime())) {
      return toISODate(d);
    }

    return null;
  }

  function formatDate(year, month, day) {
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    var d = new Date(year, month - 1, day);
    if (d.getMonth() !== month - 1) return null; /* invalid date rollover */
    return toISODate(d);
  }

  function toISODate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  function currentYear() {
    return new Date().getFullYear();
  }

  /* ===== Date Helpers ===== */

  function today() {
    return toISODate(new Date());
  }

  function daysBetween(dateStr1, dateStr2) {
    var d1 = new Date(dateStr1);
    var d2 = new Date(dateStr2);
    var diff = d2 - d1;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  function calcNights(checkIn, checkOut) {
    var n = daysBetween(checkIn, checkOut);
    return n > 0 ? n : 0;
  }

  function addDays(dateStr, days) {
    var d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return toISODate(d);
  }

  function isPast(dateStr) {
    return dateStr < today();
  }

  function isToday(dateStr) {
    return dateStr === today();
  }

  function daysUntil(dateStr) {
    return daysBetween(today(), dateStr);
  }

  /* Get the month string YYYY-MM for a date */
  function getMonthStr(dateStr) {
    if (!dateStr) return null;
    return dateStr.substring(0, 7);
  }

  /* Get current month string */
  function currentMonth() {
    return getMonthStr(today());
  }

  /* Format date for display: YYYY-MM-DD -> MM/DD */
  function formatDateDisplay(dateStr) {
    if (!dateStr) return '--';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[1] + '/' + parts[2];
  }

  /* Format date for display full: YYYY-MM-DD -> YYYY/MM/DD */
  function formatDateFull(dateStr) {
    if (!dateStr) return '--';
    return dateStr.replace(/-/g, '/');
  }

  /* ===== Currency Formatting ===== */

  function formatCurrency(amount, currency) {
    currency = currency || CURRENCY_DEFAULT;
    var symbol = CURRENCY_SYMBOLS[currency] || '';
    if (amount === null || amount === undefined || isNaN(amount)) {
      return symbol + '0';
    }
    return symbol + formatNumber(amount);
  }

  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  /* ===== Bot Text Parsing (v8: parse 4 fields from pasted text) ===== */
  /* Parses: guest name, check-in date, check-out date, remark (smoking) */
  /* Format example:
     登記人(中英)
     簡玉如CHIEN, YU-JU
     入住日期：08/01
     退房日期：08/04
     酒店 ：摩柏斯大床房
     備註：吸菸
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
      var lower = line.toLowerCase();

      /* Guest name: 登記人(中英) or 姓名 followed by value on same or next line */
      if (line.match(/登記人|姓名|客人|guest/i)) {
        /* Check if value is on same line after colon */
        var colonIdx = line.indexOf(':');
        if (colonIdx === -1) colonIdx = line.indexOf('：');
        if (colonIdx !== -1 && colonIdx < line.length - 1) {
          result.guestName = line.substring(colonIdx + 1).trim();
        } else if (i + 1 < lines.length) {
          /* Value on next line */
          result.guestName = lines[i + 1].trim();
          i++; /* skip next line */
        }
        continue;
      }

      /* Check-in date */
      if (line.match(/入住|check.?in/i)) {
        var ciColon = line.indexOf(':');
        if (ciColon === -1) ciColon = line.indexOf('：');
        if (ciColon !== -1) {
          var datePart = line.substring(ciColon + 1).trim();
          result.checkIn = parseDate(datePart);
        }
        continue;
      }

      /* Check-out date */
      if (line.match(/退房|check.?out/i)) {
        var coColon = line.indexOf(':');
        if (coColon === -1) coColon = line.indexOf('：');
        if (coColon !== -1) {
          var datePart2 = line.substring(coColon + 1).trim();
          result.checkOut = parseDate(datePart2);
        }
        continue;
      }

      /* Remark / smoking */
      if (line.match(/備註|备注|remark|note/i)) {
        var rColon = line.indexOf(':');
        if (rColon === -1) rColon = line.indexOf('：');
        if (rColon !== -1) {
          var remarkPart = line.substring(rColon + 1).trim();
          result.remark = remarkPart;
          /* Detect smoking preference from remark */
          if (remarkPart.match(/抽菸|抽烟|吸菸|吸烟|smoking/i)) {
            result.smoking = 'smoking';
          } else if (remarkPart.match(/禁菸|禁烟|不抽|non.?smoking/i)) {
            result.smoking = 'non-smoking';
          }
        }
        continue;
      }

      /* Also detect smoking in standalone lines */
      if (line.match(/抽菸|抽烟|吸菸|吸烟/) && !result.remark) {
        result.smoking = 'smoking';
        result.remark = line;
      } else if (line.match(/禁菸|禁烟|不抽/) && !result.remark) {
        result.smoking = 'non-smoking';
        result.remark = line;
      }
    }

    /* If no structured parsing found, try to detect dates in raw text */
    if (!result.checkIn || !result.checkOut) {
      var datePattern = /(\d{1,2}[\/\-]\d{1,2}|\d{4})/g;
      var matches = text.match(datePattern);
      if (matches) {
        if (!result.checkIn && matches[0]) result.checkIn = parseDate(matches[0]);
        if (!result.checkOut && matches[1]) result.checkOut = parseDate(matches[1]);
      }
    }

    /* If still no guest name, try first non-empty line that isn't a label */
    if (!result.guestName) {
      for (var j = 0; j < lines.length; j++) {
        var l = lines[j];
        if (!l.match(/登記人|姓名|入住|退房|酒店|備註|备注|日期|客人|guest|check/i)) {
          result.guestName = l;
          break;
        }
      }
    }

    return result;
  }

  /* ===== DOM Helpers ===== */

  function $(id) {
    return document.getElementById(id);
  }

  function $(selector) {
    return document.querySelectorAll(selector);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          if (key === 'className') {
            node.className = attrs[key];
          } else if (key === 'onclick') {
            node.onclick = attrs[key];
          } else if (key === 'innerHTML') {
            node.innerHTML = attrs[key];
          } else if (key === 'textContent') {
            node.textContent = attrs[key];
          } else if (key === 'style') {
            for (var s in attrs.style) {
              node.style[s] = attrs.style[s];
            }
          } else {
            node.setAttribute(key, attrs[key]);
          }
        }
      }
    }
    if (children) {
      if (typeof children === 'string') {
        node.textContent = children;
      } else if (Array.isArray(children)) {
        children.forEach(function (c) {
          if (typeof c === 'string') {
            node.appendChild(document.createTextNode(c));
          } else if (c) {
            node.appendChild(c);
          }
        });
      } else {
        node.appendChild(children);
      }
    }
    return node;
  }

  function clearNode(node) {
    if (node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
  }

  /* ===== Escape HTML ===== */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ===== Debounce ===== */
  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  /* ===== Firebase Helpers ===== */

  function fbObjToArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var item = obj[key];
        if (item && typeof item === 'object') {
          if (!item._fbKey) item._fbKey = key;
          arr.push(item);
        }
      }
    }
    return arr;
  }

  function encodeFirebaseKey(str) {
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

  /* ===== Validate ===== */
  function isValidDate(dateStr) {
    if (!dateStr) return false;
    var d = new Date(dateStr);
    return !isNaN(d.getTime());
  }

  return {
    generateId: generateId,
    generateBookingId: generateBookingId,
    generateAgentId: generateAgentId,
    generateEmployeeId: generateEmployeeId,
    generateArchiveId: generateArchiveId,
    generateFbKey: generateFbKey,
    pad: pad,
    /* Date */
    parseDate: parseDate,
    formatDate: formatDate,
    toISODate: toISODate,
    today: today,
    daysBetween: daysBetween,
    calcNights: calcNights,
    addDays: addDays,
    isPast: isPast,
    isToday: isToday,
    daysUntil: daysUntil,
    getMonthStr: getMonthStr,
    currentMonth: currentMonth,
    formatDateDisplay: formatDateDisplay,
    formatDateFull: formatDateFull,
    /* Currency */
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    /* Bot parsing */
    parseBookingText: parseBookingText,
    /* DOM */
    $: $,
    $: $,
    el: el,
    clearNode: clearNode,
    escapeHtml: escapeHtml,
    debounce: debounce,
    fbObjToArray: fbObjToArray,
    encodeFirebaseKey: encodeFirebaseKey,
    isValidDate: isValidDate
  };
})();

/**
 * auth.js — Authentication (shared password, SHA-256)
 * v8: Web backend uses shared password (you + accountant + shareholders)
 * Bot uses Telegram ID + two-level permissions (admin/staff)
 */
var Auth = (function () {

  function getStoredHash() {
    var auth = Store.loadAuth();
    if (auth && auth.hash) return auth.hash;
    return DEFAULT_PASSWORD_HASH;
  }

  function hashPassword(password) {
    if (typeof CryptoJS !== 'undefined') {
      return CryptoJS.SHA256(password).toString();
    }
    console.error('[Auth] CryptoJS not loaded');
    return null;
  }

  function login(password) {
    if (!password) return false;
    var inputHash = hashPassword(password);
    if (!inputHash) return false;
    var storedHash = getStoredHash();
    if (inputHash === storedHash) {
      var auth = Store.loadAuth() || {};
      auth.loginTime = Date.now();
      auth.isLoggedIn = true;
      Store.saveAuth(auth);
      State.set('isLoggedIn', true);
      return true;
    }
    return false;
  }

  function logout() {
    var auth = Store.loadAuth() || {};
    auth.isLoggedIn = false;
    Store.saveAuth(auth);
    State.set('isLoggedIn', false);
  }

  function isLoggedIn() {
    var auth = Store.loadAuth();
    if (!auth || !auth.isLoggedIn) return false;
    /* Check session timeout */
    if (auth.loginTime) {
      var elapsed = Date.now() - auth.loginTime;
      if (elapsed > CONFIG.SESSION_TIMEOUT) {
        logout();
        return false;
      }
    }
    return true;
  }

  function changePassword(oldPassword, newPassword) {
    var oldHash = hashPassword(oldPassword);
    var storedHash = getStoredHash();
    if (oldHash !== storedHash) {
      return { success: false, message: '舊密碼不正確' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: '新密碼至少4個字符' };
    }
    var newHash = hashPassword(newPassword);
    var auth = Store.loadAuth() || {};
    auth.hash = newHash;
    auth.loginTime = Date.now();
    auth.isLoggedIn = true;
    Store.saveAuth(auth);
    return { success: true, message: '密碼已修改' };
  }

  /* ===== Bot auth (Telegram ID based) ===== */
  function authorizeEmployee(tgId, name, role) {
    role = role || EMPLOYEE_ROLES.STAFF;
    var employees = Store.loadEmployeeList();
    /* Check if already exists */
    var existing = employees.find(function (e) { return e.tgId === tgId; });
    if (existing) {
      existing.active = true;
      existing.name = name || existing.name;
      existing.role = role;
      Store.saveEmployeeList(employees);
      return { success: true, employee: existing, isNew: false };
    }
    var emp = {
      id: Utils.generateEmployeeId(),
      tgId: tgId,
      name: name,
      role: role,
      active: true,
      authorizedAt: new Date().toISOString(),
      authorizedBy: 'admin'
    };
    employees.push(emp);
    Store.saveEmployeeList(employees);
    return { success: true, employee: emp, isNew: true };
  }

  function revokeEmployee(tgId) {
    var employees = Store.loadEmployeeList();
    var emp = employees.find(function (e) { return e.tgId === tgId; });
    if (emp) {
      emp.active = false;
      Store.saveEmployeeList(employees);
      return true;
    }
    return false;
  }

  function getEmployeeByTgId(tgId) {
    var employees = Store.loadEmployeeList();
    return employees.find(function (e) { return e.tgId === tgId && e.active !== false; });
  }

  function isAdmin(tgId) {
    var emp = getEmployeeByTgId(tgId);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN;
  }

  return {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    changePassword: changePassword,
    /* Bot */
    authorizeEmployee: authorizeEmployee,
    revokeEmployee: revokeEmployee,
    getEmployeeByTgId: getEmployeeByTgId,
    isAdmin: isAdmin
  };
})();

/**
 * router.js — Page routing
 * v8: 7 pages (总览/利润结算/费用收取/代理业绩/历史核账/员工管理/酒店设定)
 */
var Router = (function () {

  function navigateTo(pageId) {
    if (!pageId) return;
    /* Hide all pages */
    var pages = document.querySelectorAll('.page-content');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    /* Show target page */
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
    }
    /* Update nav items */
    var navItems = document.querySelectorAll('.nav-item[data-page]');
    for (var n = 0; n < navItems.length; n++) {
      navItems[n].classList.remove('active');
      if (navItems[n].getAttribute('data-page') === pageId) {
        navItems[n].classList.add('active');
      }
    }
    /* Update bottom nav */
    var bottomItems = document.querySelectorAll('.bottom-nav-item[data-page]');
    for (var b = 0; b < bottomItems.length; b++) {
      bottomItems[b].classList.remove('active');
      if (bottomItems[b].getAttribute('data-page') === pageId) {
        bottomItems[b].classList.add('active');
      }
    }
    /* Update topbar title */
    var pageDef = PAGE_LIST.find(function (p) { return p.id === pageId; });
    if (pageDef) {
      var titleEl = document.getElementById('topbar-page-title');
      if (titleEl) titleEl.textContent = pageDef.label;
    }
    /* Update state */
    State.set('currentPage', pageId);
    /* Emit event for pages to render */
    Events.emit(EVENTS.PAGE_CHANGED, { page: pageId });
    /* Close mobile sidebar */
    closeSidebar();
  }

  function getCurrentPage() {
    return State.get('currentPage') || 'overview';
  }

  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('sidebar-backdrop');
    if (sb) sb.classList.remove('open');
    if (bd) bd.classList.remove('show');
  }

  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('sidebar-backdrop');
    if (sb) sb.classList.toggle('open');
    if (bd) bd.classList.toggle('show');
  }

  /* Month navigation */
  function prevMonth() {
    var m = State.get('workingMonth');
    if (!m) m = Utils.currentMonth();
    var parts = m.split('-');
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1;
    if (month < 1) { month = 12; year--; }
    var newMonth = year + '-' + String(month).padStart(2, '0');
    State.set('workingMonth', newMonth);
    Store.saveWorkingMonth(newMonth);
    Events.emit(EVENTS.MONTH_CHANGED, { month: newMonth });
    updateMonthDisplay(newMonth);
  }

  function nextMonth() {
    var m = State.get('workingMonth');
    if (!m) m = Utils.currentMonth();
    var parts = m.split('-');
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) + 1;
    if (month > 12) { month = 1; year++; }
    var newMonth = year + '-' + String(month).padStart(2, '0');
    State.set('workingMonth', newMonth);
    Store.saveWorkingMonth(newMonth);
    Events.emit(EVENTS.MONTH_CHANGED, { month: newMonth });
    updateMonthDisplay(newMonth);
  }

  function updateMonthDisplay(month) {
    if (!month) month = State.get('workingMonth') || Utils.currentMonth();
    var parts = month.split('-');
    var display = parts[0] + ' / ' + parts[1];
    var el = document.getElementById('month-display');
    if (el) el.textContent = display;
  }

  return {
    navigateTo: navigateTo,
    getCurrentPage: getCurrentPage,
    closeSidebar: closeSidebar,
    toggleSidebar: toggleSidebar,
    prevMonth: prevMonth,
    nextMonth: nextMonth,
    updateMonthDisplay: updateMonthDisplay
  };
})();

/**
 * app.js — Application initialization
 * v8: Initializes all layers, sets up event listeners
 */
var App = (function () {

  function init() {
    console.log('[App] Initializing v' + APP.VERSION + '...');

    /* 1. Load all data from localStorage */
    loadFromStore();

    /* 2. Set default working month */
    if (!State.get('workingMonth')) {
      State.set('workingMonth', Utils.currentMonth());
    }
    Router.updateMonthDisplay();

    /* 3. Initialize hotel config with presets if empty */
    initHotelConfig();

    /* 4. Set up event listeners */
    setupEventListeners();

    /* 5. Initialize UI components */
    Keyboard.init();
    Toast.init();

    /* 6. Navigate to default page */
    Router.navigateTo('overview');

    /* 7. Initialize Firebase sync */
    initFirebase(function () {
      console.log('[App] Firebase ready, starting sync...');
      App.afterFirebaseReady();
    });

    console.log('[App] Initialization complete.');
  }

  function loadFromStore() {
    var data = Store.loadAll();
    State.set('bookings', data.bookings || []);
    State.set('hotelConfig', data.hotelConfig);
    State.set('agentList', data.agentList || []);
    State.set('employeeList', data.employeeList || []);
    State.set('archives', data.archives || []);
    State.set('closedMonths', data.closedMonths || []);
    State.set('settings', data.settings || {});
    if (data.workingMonth) {
      State.set('workingMonth', data.workingMonth);
    }
    console.log('[App] Loaded from store:', {
      bookings: (data.bookings || []).length,
      agents: (data.agentList || []).length,
      employees: (data.employeeList || []).length,
      archives: (data.archives || []).length
    });
  }

  function initHotelConfig() {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos || hc.casinos.length === 0) {
      console.log('[App] Hotel config empty, loading presets...');
      Hotels.loadPresets();
    }
  }

  function setupEventListeners() {
    /* Re-render current page when data changes */
    Events.on(EVENTS.BOOKINGS_LOADED, function () {
      var page = Router.getCurrentPage();
      Events.emit(EVENTS.UI_RENDER, { page: page });
    });

    Events.on(EVENTS.BOOKINGS_SYNCED, function () {
      var page = Router.getCurrentPage();
      Events.emit(EVENTS.UI_RENDER, { page: page });
    });

    /* Sync status updates */
    Events.on(EVENTS.SYNC_CONNECTED, function () {
      State.set('syncConnected', true);
      updateSyncIndicator(true);
    });

    Events.on(EVENTS.SYNC_DISCONNECTED, function () {
      State.set('syncConnected', false);
      updateSyncIndicator(false);
    });

    Events.on(EVENTS.SYNC_DOWNLOAD_DONE, function (data) {
      State.set('lastSyncTime', Date.now());
      updateLastSyncTime();
      Events.emit(EVENTS.UI_TOAST, { type: 'success', message: '同步完成' });
    });

    Events.on(EVENTS.SYNC_UPLOAD_DONE, function () {
      State.set('lastSyncTime', Date.now());
      updateLastSyncTime();
    });

    Events.on(EVENTS.SYNC_ERROR, function (data) {
      console.error('[App] Sync error:', data);
    });

    /* Month changed -> re-render */
    Events.on(EVENTS.MONTH_CHANGED, function () {
      Events.emit(EVENTS.UI_RENDER, {});
    });

    /* Update version label */
    var verEl = document.querySelector('.version-label');
    if (verEl) verEl.textContent = 'v' + APP.VERSION;
  }

  function updateSyncIndicator(connected) {
    var dot = document.getElementById('sync-dot');
    var text = document.getElementById('sync-status-text');
    if (dot) {
      dot.className = 'sync-dot ' + (connected ? 'connected' : 'disconnected');
    }
    if (text) {
      text.textContent = connected ? '已連線' : '未連線';
    }
  }

  function updateLastSyncTime() {
    var el = document.getElementById('last-sync-time');
    if (!el) return;
    var t = State.get('lastSyncTime');
    if (!t) {
      el.textContent = '--';
      return;
    }
    var d = new Date(t);
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    el.textContent = hh + ':' + mm;
  }

  /* Called after Firebase auth success */
  function afterFirebaseReady() {
    console.log('[App] Firebase ready, starting watchers + sync...');
    if (typeof startWatchers === 'function') {
      startWatchers();
    }
    if (typeof syncDownloadAll === 'function') {
      syncDownloadAll();
    }
  }

  return {
    init: init,
    afterFirebaseReady: afterFirebaseReady,
    loadFromStore: loadFromStore,
    updateSyncIndicator: updateSyncIndicator,
    updateLastSyncTime: updateLastSyncTime
  };
})();

/**
 * recently-deleted.js — Track recently deleted items for anti-resurrection
 * Prevents deleted items from being "resurrected" by sync download
 */
var RecentlyDeleted = (function () {
  var _list = [];

  function _load() {
    _list = Store.loadRecentlyDeleted() || [];
  }

  function _save() {
    Store.saveRecentlyDeleted(_list);
  }

  function track(type, fbKey) {
    if (!type || !fbKey) return;
    _list.push({
      type: type,
      fbKey: fbKey,
      deletedAt: Date.now()
    });
    if (_list.length > CONFIG.RECENTLY_DELETED_LIMIT) {
      _list = _list.slice(-CONFIG.RECENTLY_DELETED_LIMIT);
    }
    _save();
  }

  function contains(type, fbKey) {
    for (var i = 0; i < _list.length; i++) {
      if (_list[i].type === type && _list[i].fbKey === fbKey) {
        return true;
      }
    }
    return false;
  }

  function remove(fbKey) {
    _list = _list.filter(function (item) {
      return item.fbKey !== fbKey;
    });
    _save();
  }

  function getByType(type) {
    return _list.filter(function (item) {
      return item.type === type;
    });
  }

  function clear() {
    _list = [];
    _save();
  }

  function getAll() {
    return _list.slice();
  }

  function cleanExpired() {
    var now = Date.now();
    var before = _list.length;
    _list = _list.filter(function (item) {
      return (now - item.deletedAt) < CONFIG.TOMBSTONE_TTL_MS;
    });
    if (_list.length !== before) {
      _save();
    }
  }

  _load();

  return {
    track: track,
    contains: contains,
    remove: remove,
    getByType: getByType,
    clear: clear,
    getAll: getAll,
    cleanExpired: cleanExpired
  };
})();

/**
 * merger.js — Conflict Resolution via Timestamp
 * v8: Supports bookings, hotelConfig (object), agentList, employeeList, archives
 * Rule: _updatedAt larger wins (including tombstones)
 * Does NOT filter tombstones — that is the caller's responsibility
 */
var Merger = {

  /**
   * Merge two arrays by _fbKey (generic for bookings, archives, etc.)
   */
  mergeArray: function (local, remote) {
    local = local || [];
    remote = remote || [];
    var map = {};
    var merged = [];
    var i;

    for (i = 0; i < local.length; i++) {
      var item = local[i];
      if (item && item._fbKey) {
        map[item._fbKey] = item;
      }
    }

    for (i = 0; i < remote.length; i++) {
      var rItem = remote[i];
      if (!rItem || !rItem._fbKey) continue;
      var lItem = map[rItem._fbKey];

      if (!lItem) {
        map[rItem._fbKey] = rItem;
      } else {
        var lTs = lItem._updatedAt || 0;
        var rTs = rItem._updatedAt || 0;
        if (rTs > lTs) {
          map[rItem._fbKey] = rItem;
        }
      }
    }

    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        merged.push(map[key]);
      }
    }

    return merged;
  },

  /* Alias for backward compatibility */
  mergeBookings: function (local, remote) {
    return Merger.mergeArray(local, remote);
  },

  /**
   * Merge hotel config (single object, not array)
   * Remote wins if _updatedAt is newer
   */
  mergeHotelConfig: function (local, remote) {
    if (!local && !remote) return null;
    if (!local) return remote;
    if (!remote) return local;

    var lTs = (local._updatedAt || 0);
    var rTs = (remote._updatedAt || 0);

    if (rTs > lTs) {
      return remote;
    }
    return local;
  },

  /**
   * Merge agent list (union by id/name, remote wins on conflict)
   */
  mergeAgentList: function (local, remote) {
    local = local || [];
    remote = remote || [];
    var map = {};
    var merged = [];

    for (var i = 0; i < local.length; i++) {
      var id = local[i].id || local[i].name || String(local[i]);
      map[id] = local[i];
    }

    for (var j = 0; j < remote.length; j++) {
      var rId = remote[j].id || remote[j].name || String(remote[j]);
      if (!map[rId]) {
        map[rId] = remote[j];
      } else {
        var lTs = map[rId]._updatedAt || 0;
        var rTs = remote[j]._updatedAt || 0;
        if (rTs > lTs) {
          map[rId] = remote[j];
        }
      }
    }

    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        merged.push(map[key]);
      }
    }

    return merged;
  },

  /**
   * Merge employee list (same as agent list)
   */
  mergeEmployeeList: function (local, remote) {
    return Merger.mergeAgentList(local, remote);
  },

  /**
   * Clean tombstones older than TTL
   */
  cleanOldTombstones: function (arr, ttlMs) {
    if (!arr || !arr.length) return arr || [];
    var now = Date.now();
    return arr.filter(function (item) {
      if (item && item._deleted) {
        var age = now - (item._updatedAt || 0);
        return age < (ttlMs || CONFIG.TOMBSTONE_TTL_MS);
      }
      return true;
    });
  },

  /**
   * Filter out tombstones (deleted items)
   */
  filterAlive: function (arr) {
    if (!arr) return [];
    return arr.filter(function (item) {
      return item && !item._deleted;
    });
  }
};

/**
 * firebase.js — Firebase Initialization + CRUD Operations
 * v8: Supports bookings, hotelConfig, agentList, employeeList, archives,
 *     closedMonths, settings, botLogs
 * Flow: initFirebase -> signInAnonymously -> _onFirebaseReady -> startWatchers
 */
var _db = null;
var _authInstance = null;
var _initRetried = false;
var _initPollCount = 0;

/* ===== Initialization ===== */

function initFirebase(onReady) {
  _doInitFirebase(onReady);
}

function _doInitFirebase(onReady) {
  if (typeof firebase === 'undefined') {
    console.warn('[Firebase] SDK not loaded yet, retrying...');
    if (!_initRetried) {
      _initRetried = true;
      if (typeof window !== 'undefined') {
        window.addEventListener('load', function () {
          _doInitFirebase(onReady);
        });
      }
      _initPollCount = 0;
      var pollTimer = setInterval(function () {
        _initPollCount++;
        if (typeof firebase !== 'undefined') {
          clearInterval(pollTimer);
          _doInitFirebase(onReady);
        } else if (_initPollCount >= 30) {
          clearInterval(pollTimer);
          console.error('[Firebase] SDK failed to load after 30 retries');
          Events.emit(EVENTS.SYNC_ERROR, { error: 'SDK load failed' });
        }
      }, 1000);
    }
    return;
  }

  try {
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('[Firebase] Already initialized');
    } else {
      firebase.initializeApp(FIREBASE_CONFIG);
      console.log('[Firebase] App initialized');
    }

    if (typeof firebase.auth !== 'function') {
      console.warn('[Firebase] Auth SDK not loaded');
      _db = firebase.database();
      _watchConnection();
      if (onReady) onReady();
      return;
    }

    _authInstance = firebase.auth();

    _authInstance.signInAnonymously().then(function () {
      console.log('[Firebase] Anonymous auth successful');
      var tempDb = firebase.database();
      _db = tempDb;
      _watchConnection();
      if (onReady) onReady();
    }).catch(function (err) {
      console.error('[Firebase] Anonymous auth failed:', err);
      _db = null;
      Events.emit(EVENTS.SYNC_ERROR, { error: 'Auth failed: ' + err.message });
      setTimeout(function () {
        _doInitFirebase(onReady);
      }, 5000);
    });

  } catch (e) {
    console.error('[Firebase] Init error:', e);
    Events.emit(EVENTS.SYNC_ERROR, { error: e.message });
    setTimeout(function () {
      _doInitFirebase(onReady);
    }, 3000);
  }
}

/* ===== Connection Watcher ===== */

function _watchConnection() {
  if (!_db) return;
  _db.ref('.info/connected').on('value', function (snap) {
    var connected = snap.val() === true;
    State.set('syncConnected', connected);
    if (connected) {
      console.log('[Firebase] Connected');
      Events.emit(EVENTS.SYNC_CONNECTED);
      setTimeout(function () {
        if (typeof syncDownloadAll === 'function') syncDownloadAll();
      }, CONFIG.SYNC_RECONNECT_DELAY);
      setTimeout(function () {
        if (typeof syncUploadAll === 'function') syncUploadAll();
      }, CONFIG.SYNC_UPLOAD_DELAY);
    } else {
      console.log('[Firebase] Disconnected');
      Events.emit(EVENTS.SYNC_DISCONNECTED);
    }
  });
}

/* ===== CRUD: Bookings ===== */

function syncBookingToFirebase(booking, callback) {
  if (!_db) {
    console.warn('[Firebase] Not ready, enqueuing booking upload');
    enqueueUpload({ type: 'booking', action: 'set', data: booking });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.BOOKINGS + '/' + booking._fbKey);
    ref.set(booking, function (err) {
      if (err) {
        console.error('[Firebase] Booking set error:', err);
        Events.emit(EVENTS.SYNC_ERROR, { error: err.message });
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncBookingToFirebase exception:', e);
    enqueueUpload({ type: 'booking', action: 'set', data: booking });
  }
}

function removeBookingFromFirebase(fbKey, callback) {
  if (!_db) {
    enqueueUpload({ type: 'booking', action: 'remove', data: { _fbKey: fbKey } });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var tombstone = {
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    };
    _db.ref(FB_PATH.BOOKINGS + '/' + fbKey).set(tombstone, function (err) {
      if (err) {
        console.error('[Firebase] Booking tombstone error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] removeBookingFromFirebase exception:', e);
    enqueueUpload({ type: 'booking', action: 'remove', data: { _fbKey: fbKey } });
  }
}

/* ===== CRUD: Hotel Config (single object) ===== */

function syncHCToFirebase(config, callback) {
  if (!_db) {
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: config });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.HOTEL_CONFIG).set(config, function (err) {
      if (err) {
        console.error('[Firebase] HC set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncHCToFirebase exception:', e);
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: config });
  }
}

/* ===== CRUD: Agent List ===== */

function syncAgentListToFirebase(agentList, callback) {
  if (!_db) {
    enqueueUpload({ type: 'agentList', action: 'set', data: agentList });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var data = {};
    for (var i = 0; i < agentList.length; i++) {
      var key = agentList[i].id || Utils.encodeFirebaseKey(agentList[i].name || ('agent_' + i));
      data[key] = agentList[i];
    }
    _db.ref(FB_PATH.AGENT_LIST).set(data, function (err) {
      if (err) {
        console.error('[Firebase] AgentList set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncAgentListToFirebase exception:', e);
  }
}

/* ===== CRUD: Employee List ===== */

function syncEmployeeListToFirebase(employeeList, callback) {
  if (!_db) {
    enqueueUpload({ type: 'employeeList', action: 'set', data: employeeList });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var data = {};
    for (var i = 0; i < employeeList.length; i++) {
      var key = employeeList[i].id || Utils.encodeFirebaseKey(employeeList[i].tgId || ('emp_' + i));
      data[key] = employeeList[i];
    }
    _db.ref(FB_PATH.EMPLOYEE_LIST).set(data, function (err) {
      if (err) {
        console.error('[Firebase] EmployeeList set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncEmployeeListToFirebase exception:', e);
  }
}

/* ===== CRUD: Archives ===== */

function syncArchiveToFirebase(archive, callback) {
  if (!_db) {
    enqueueUpload({ type: 'archive', action: 'set', data: archive });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.ARCHIVES + '/' + archive._fbKey);
    ref.set(archive, function (err) {
      if (err) {
        console.error('[Firebase] Archive set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncArchiveToFirebase exception:', e);
    enqueueUpload({ type: 'archive', action: 'set', data: archive });
  }
}

/* ===== CRUD: Closed Months ===== */

function syncClosedMonthsToFirebase(months, callback) {
  if (!_db) {
    enqueueUpload({ type: 'closedMonths', action: 'set', data: months });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.CLOSED_MONTHS).set(months, function (err) {
      if (err) {
        console.error('[Firebase] ClosedMonths set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncClosedMonthsToFirebase exception:', e);
  }
}

/* ===== CRUD: Settings ===== */

function syncSettingsToFirebase(settings, callback) {
  if (!_db) {
    enqueueUpload({ type: 'settings', action: 'set', data: settings });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.SETTINGS).set(settings, function (err) {
      if (err) {
        console.error('[Firebase] Settings set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncSettingsToFirebase exception:', e);
  }
}

/* ===== CRUD: Bot Logs ===== */

function syncBotLogToFirebase(log, callback) {
  if (!_db) {
    enqueueUpload({ type: 'botLog', action: 'set', data: log });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.BOT_LOGS + '/' + log._fbKey);
    ref.set(log, function (err) {
      if (err) {
        console.error('[Firebase] BotLog set error:', err);
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncBotLogToFirebase exception:', e);
  }
}

/* ===== Clear All (preserve agentList & employeeList) ===== */

function clearFirebaseData(callback) {
  if (!_db) {
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var clearedAt = Date.now();
    _db.ref(FB_PATH.CLEARED_AT).set(clearedAt, function (err) {
      if (err) {
        console.error('[Firebase] Clear error:', err);
        if (callback) callback(err);
        return;
      }
      var paths = [
        FB_PATH.BOOKINGS,
        FB_PATH.HOTEL_CONFIG,
        FB_PATH.ARCHIVES,
        FB_PATH.CLOSED_MONTHS,
        FB_PATH.SETTINGS,
        FB_PATH.BOT_LOGS
      ];
      var pending = paths.length;
      paths.forEach(function (p) {
        _db.ref(p).set({}, function (e) {
          pending--;
          if (e) console.error('[Firebase] Clear path error:', p, e);
          if (pending === 0 && callback) callback(null);
        });
      });
    });
  } catch (e) {
    console.error('[Firebase] clearFirebaseData exception:', e);
    if (callback) callback(e);
  }
}

/* ===== Status ===== */

function isFirebaseReady() {
  return _db !== null;
}

/**
 * uploader.js — Upload Queue + Batch Sync
 * v8: Supports bookings, hotelConfig, agentList, employeeList, archives,
 *     closedMonths, settings, botLogs
 */
var Uploader = (function () {
  var _queue = [];
  var _processing = false;

  function enqueueUpload(task) {
    if (!task) return;
    if (_queue.length >= CONFIG.MAX_UPLOAD_QUEUE) {
      console.warn('[Uploader] Queue overflow, switching to full sync');
      _queue = [];
      syncUploadAll();
      return;
    }
    _queue.push(task);
    if (!_processing) {
      _processQueue();
    }
  }

  function _processQueue() {
    if (_queue.length === 0) {
      _processing = false;
      return;
    }
    _processing = true;
    if (!isFirebaseReady()) {
      setTimeout(function () {
        _processQueue();
      }, 1000);
      return;
    }
    var task = _queue.shift();
    _executeTask(task, function () {
      _processQueue();
    });
  }

  function _executeTask(task, done) {
    try {
      switch (task.type) {
        case 'booking':
          if (task.action === 'set') {
            syncBookingToFirebase(task.data, done);
          } else if (task.action === 'remove') {
            removeBookingFromFirebase(task.data._fbKey, done);
          } else { done(); }
          break;

        case 'hotelConfig':
          if (task.action === 'set') {
            syncHCToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'agentList':
          if (task.action === 'set') {
            syncAgentListToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'employeeList':
          if (task.action === 'set') {
            syncEmployeeListToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'archive':
          if (task.action === 'set') {
            syncArchiveToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'closedMonths':
          if (task.action === 'set') {
            syncClosedMonthsToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'settings':
          if (task.action === 'set') {
            syncSettingsToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'botLog':
          if (task.action === 'set') {
            syncBotLogToFirebase(task.data, done);
          } else { done(); }
          break;

        default:
          console.warn('[Uploader] Unknown task type:', task.type);
          done();
      }
    } catch (e) {
      console.error('[Uploader] Task execution error:', e);
      done();
    }
  }

  /* ===== Full Upload Sync ===== */
  function syncUploadAll(callback) {
    if (!isFirebaseReady()) {
      console.warn('[Uploader] Firebase not ready, skipping full sync');
      if (callback) callback({ error: 'not_ready' });
      return;
    }

    Events.emit(EVENTS.SYNC_UPLOAD_START);
    console.log('[Uploader] Starting full upload sync');

    /* Array-based paths (use transaction merge) */
    var arrayPaths = [
      { path: FB_PATH.BOOKINGS, data: State.get('bookings'), type: 'booking' },
      { path: FB_PATH.ARCHIVES, data: State.get('archives'), type: 'archive' }
    ];

    /* Object-based paths (direct set) */
    var objectPaths = [
      { path: FB_PATH.HOTEL_CONFIG, data: State.get('hotelConfig'), syncFn: syncHCToFirebase },
      { path: FB_PATH.CLOSED_MONTHS, data: State.get('closedMonths'), syncFn: syncClosedMonthsToFirebase },
      { path: FB_PATH.SETTINGS, data: State.get('settings'), syncFn: syncSettingsToFirebase }
    ];

    var pending = arrayPaths.length + objectPaths.length + 2; /* +2 for agent & employee list */
    var hasError = false;

    function _checkDone(err) {
      if (err) hasError = true;
      pending--;
      if (pending === 0) {
        State.set('lastSyncTime', Date.now());
        Events.emit(EVENTS.SYNC_UPLOAD_DONE, { error: hasError });
        console.log('[Uploader] Full upload sync complete');
        if (callback) callback(hasError ? { error: 'partial' } : null);
      }
    }

    /* Array paths */
    arrayPaths.forEach(function (item) {
      _uploadArrayPath(item.path, item.data, item.type, _checkDone);
    });

    /* Object paths */
    objectPaths.forEach(function (item) {
      if (item.data) {
        item.syncFn(item.data, _checkDone);
      } else {
        _checkDone(null);
      }
    });

    /* Agent list */
    var agentList = State.get('agentList');
    if (agentList && agentList.length > 0) {
      syncAgentListToFirebase(agentList, _checkDone);
    } else {
      _checkDone(null);
    }

    /* Employee list */
    var employeeList = State.get('employeeList');
    if (employeeList && employeeList.length > 0) {
      syncEmployeeListToFirebase(employeeList, _checkDone);
    } else {
      _checkDone(null);
    }
  }

  function _uploadArrayPath(path, dataArray, type, done) {
    if (!dataArray || dataArray.length === 0) {
      _db.ref(path).set({}, function (err) {
        if (err) console.error('[Uploader] Clear path error:', path, err);
        done(err);
      });
      return;
    }

    try {
      _db.ref(path).transaction(function (current) {
        var remote = Utils.fbObjToArray(current);
        var merged = Merger.mergeArray(dataArray, remote);

        /* Write tombstones for recently deleted items */
        var recentlyDeleted = RecentlyDeleted.getByType(type);
        for (var i = 0; i < recentlyDeleted.length; i++) {
          var stillExists = remote.some(function (r) {
            return r._fbKey === recentlyDeleted[i].fbKey && !r._deleted;
          });
          if (stillExists) {
            merged.push({
              _fbKey: recentlyDeleted[i].fbKey,
              _deleted: true,
              _updatedAt: recentlyDeleted[i].deletedAt
            });
          }
        }

        merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);

        var obj = {};
        for (var j = 0; j < merged.length; j++) {
          if (merged[j]._fbKey) {
            obj[merged[j]._fbKey] = merged[j];
          }
        }
        return obj;
      }, function (err) {
        if (err) {
          console.error('[Uploader] Transaction error for path:', path, err);
        }
        done(err);
      });
    } catch (e) {
      console.error('[Uploader] _uploadArrayPath exception:', e);
      done(e);
    }
  }

  return {
    enqueueUpload: enqueueUpload,
    syncUploadAll: syncUploadAll,
    getQueueLength: function () { return _queue.length; }
  };
})();

/* Global function aliases */
function enqueueUpload(task) {
  Uploader.enqueueUpload(task);
}

function syncUploadAll(callback) {
  Uploader.syncUploadAll(callback);
}

/**
 * watchers.js — Firebase Real-time Listeners
 * v8: 7 watchers (bookings/hotelConfig/agentList/employeeList/archives/closedMonths/settings)
 *     + clearedAt + connected
 * Each watcher: fetch remote -> merge -> filter tombstones -> save -> emit
 */
var _watchersStarted = false;

function startWatchers() {
  if (_watchersStarted) return;
  if (!isFirebaseReady()) {
    console.warn('[Watchers] Firebase not ready, cannot start');
    return;
  }
  _watchersStarted = true;
  console.log('[Watchers] Starting all watchers');

  _watchBookings();
  _watchHotelConfig();
  _watchAgentList();
  _watchEmployeeList();
  _watchArchives();
  _watchClosedMonths();
  _watchSettings();
  _watchClearedAt();
}

/* ===== Bookings Watcher ===== */
function _watchBookings() {
  _db.ref(FB_PATH.BOOKINGS).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      var changed = _hasChanged(local, alive);
      if (changed) {
        State.set('bookings', alive);
        Store.saveBookings(alive);
        Events.emit(EVENTS.BOOKINGS_SYNCED, alive);
        console.log('[Watchers] Bookings synced:', alive.length, 'items');
      }
    } catch (e) {
      console.error('[Watchers] Bookings watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Bookings listener error:', err);
  });
}

/* ===== Hotel Config Watcher (single object) ===== */
function _watchHotelConfig() {
  _db.ref(FB_PATH.HOTEL_CONFIG).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote) return;
      var local = State.get('hotelConfig');
      var merged = Merger.mergeHotelConfig(local, remote);
      if (merged && merged !== local) {
        State.set('hotelConfig', merged);
        Store.saveHotelConfig(merged);
        Events.emit(EVENTS.HC_LOADED, merged);
        console.log('[Watchers] Hotel config synced');
      }
    } catch (e) {
      console.error('[Watchers] HC watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] HC listener error:', err);
  });
}

/* ===== Agent List Watcher ===== */
function _watchAgentList() {
  _db.ref(FB_PATH.AGENT_LIST).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('agentList');
      var merged = Merger.mergeAgentList(local, remote);
      var changed = _hasChanged(local, merged);
      if (changed) {
        State.set('agentList', merged);
        Store.saveAgentList(merged);
        Events.emit(EVENTS.AGENT_LIST_UPDATED, merged);
        console.log('[Watchers] Agent list synced:', merged.length, 'agents');
      }
    } catch (e) {
      console.error('[Watchers] AgentList watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] AgentList listener error:', err);
  });
}

/* ===== Employee List Watcher ===== */
function _watchEmployeeList() {
  _db.ref(FB_PATH.EMPLOYEE_LIST).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('employeeList');
      var merged = Merger.mergeEmployeeList(local, remote);
      var changed = _hasChanged(local, merged);
      if (changed) {
        State.set('employeeList', merged);
        Store.saveEmployeeList(merged);
        Events.emit(EVENTS.EMPLOYEE_LIST_UPDATED, merged);
        console.log('[Watchers] Employee list synced:', merged.length, 'employees');
      }
    } catch (e) {
      console.error('[Watchers] EmployeeList watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] EmployeeList listener error:', err);
  });
}

/* ===== Archives Watcher ===== */
function _watchArchives() {
  _db.ref(FB_PATH.ARCHIVES).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('archives');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      var changed = _hasChanged(local, alive);
      if (changed) {
        State.set('archives', alive);
        Store.saveArchives(alive);
        Events.emit(EVENTS.ARCHIVES_LOADED, alive);
        console.log('[Watchers] Archives synced:', alive.length, 'items');
      }
    } catch (e) {
      console.error('[Watchers] Archives watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Archives listener error:', err);
  });
}

/* ===== Closed Months Watcher ===== */
function _watchClosedMonths() {
  _db.ref(FB_PATH.CLOSED_MONTHS).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote || !Array.isArray(remote)) return;
      var local = State.get('closedMonths') || [];
      if (JSON.stringify(local) !== JSON.stringify(remote)) {
        State.set('closedMonths', remote);
        Store.saveClosedMonths(remote);
        Events.emit(EVENTS.MONTH_CLOSED, remote);
        console.log('[Watchers] Closed months synced:', remote);
      }
    } catch (e) {
      console.error('[Watchers] ClosedMonths watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] ClosedMonths listener error:', err);
  });
}

/* ===== Settings Watcher ===== */
function _watchSettings() {
  _db.ref(FB_PATH.SETTINGS).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote) return;
      var local = State.get('settings') || {};
      var rTs = remote._updatedAt || 0;
      var lTs = local._updatedAt || 0;
      if (rTs > lTs) {
        State.set('settings', remote);
        Store.saveSettings(remote);
        console.log('[Watchers] Settings synced');
      }
    } catch (e) {
      console.error('[Watchers] Settings watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Settings listener error:', err);
  });
}

/* ===== ClearedAt Watcher ===== */
function _watchClearedAt() {
  _db.ref(FB_PATH.CLEARED_AT).on('value', function (snap) {
    try {
      var clearedAt = snap.val();
      if (!clearedAt) return;
      var localLastClear = Store.load(STORAGE_KEYS.LAST_SYNC_TIME) || 0;
      if (clearedAt > localLastClear) {
        console.log('[Watchers] Remote clear detected, clearing local data');
        Store.clearAll(true); /* keep agent list */
        /* Also keep employee list */
        var employees = State.get('employeeList');
        App.loadFromStore();
        if (employees) {
          State.set('employeeList', employees);
          Store.saveEmployeeList(employees);
        }
        Events.emit(EVENTS.UI_RENDER, {});
        Store.save(STORAGE_KEYS.LAST_SYNC_TIME, clearedAt);
      }
    } catch (e) {
      console.error('[Watchers] ClearedAt watcher error:', e);
    }
  });
}

/* ===== Manual Full Download Sync ===== */
function syncDownloadAll(callback) {
  if (!isFirebaseReady()) {
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  console.log('[Watchers] Starting manual download sync');

  var pending = 6;
  var results = {};

  function _done(key, count) {
    results[key] = count;
    pending--;
    if (pending === 0) {
      State.set('lastSyncTime', Date.now());
      Events.emit(EVENTS.SYNC_DOWNLOAD_DONE, results);
      console.log('[Watchers] Download sync complete', results);
      if (callback) callback(null, results);
    }
  }

  /* Bookings */
  _db.ref(FB_PATH.BOOKINGS).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      State.set('bookings', alive);
      Store.saveBookings(alive);
      _done('bookings', alive.length);
    } catch (e) {
      console.error('[Watchers] Download bookings error:', e);
      _done('bookings', 0);
    }
  });

  /* Hotel config */
  _db.ref(FB_PATH.HOTEL_CONFIG).once('value', function (snap) {
    try {
      var remote = snap.val();
      if (remote) {
        var local = State.get('hotelConfig');
        var merged = Merger.mergeHotelConfig(local, remote);
        State.set('hotelConfig', merged);
        Store.saveHotelConfig(merged);
        Events.emit(EVENTS.HC_LOADED, merged);
      }
      _done('hotelConfig', 1);
    } catch (e) {
      console.error('[Watchers] Download HC error:', e);
      _done('hotelConfig', 0);
    }
  });

  /* Agent list */
  _db.ref(FB_PATH.AGENT_LIST).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('agentList');
      var merged = Merger.mergeAgentList(local, remote);
      State.set('agentList', merged);
      Store.saveAgentList(merged);
      _done('agentList', merged.length);
    } catch (e) {
      console.error('[Watchers] Download agentList error:', e);
      _done('agentList', 0);
    }
  });

  /* Employee list */
  _db.ref(FB_PATH.EMPLOYEE_LIST).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('employeeList');
      var merged = Merger.mergeEmployeeList(local, remote);
      State.set('employeeList', merged);
      Store.saveEmployeeList(merged);
      _done('employeeList', merged.length);
    } catch (e) {
      console.error('[Watchers] Download employeeList error:', e);
      _done('employeeList', 0);
    }
  });

  /* Archives */
  _db.ref(FB_PATH.ARCHIVES).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('archives');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      State.set('archives', alive);
      Store.saveArchives(alive);
      _done('archives', alive.length);
    } catch (e) {
      console.error('[Watchers] Download archives error:', e);
      _done('archives', 0);
    }
  });

  /* Closed months */
  _db.ref(FB_PATH.CLOSED_MONTHS).once('value', function (snap) {
    try {
      var remote = snap.val();
      if (remote && Array.isArray(remote)) {
        State.set('closedMonths', remote);
        Store.saveClosedMonths(remote);
      }
      _done('closedMonths', 1);
    } catch (e) {
      console.error('[Watchers] Download closedMonths error:', e);
      _done('closedMonths', 0);
    }
  });
}

/* ===== Helper ===== */
function _hasChanged(local, remote) {
  if (!local && !remote) return false;
  if (!local || !remote) return true;
  if (local.length !== remote.length) return true;
  var localSum = 0, remoteSum = 0;
  for (var i = 0; i < local.length; i++) {
    localSum += (local[i]._updatedAt || 0);
  }
  for (var j = 0; j < remote.length; j++) {
    remoteSum += (remote[j]._updatedAt || 0);
  }
  return localSum !== remoteSum;
}

/**
 * hotels.js — Hotel Configuration CRUD + Preset Data
 * v8: Tree structure (casino -> hotel -> roomType)
 *     6 casino groups, 15 hotels, 6 room types per hotel
 *     Management can CRUD at all three levels via Web backend
 *     HC is a single object synced via syncHCToFirebase()
 */

var PRESET_VERSION = '4';

/* Default room config for new hotels */
function _defaultRoomConfig(baseThreshold) {
  var t = baseThreshold || 300000;
  var config = {};
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    config[ROOM_TYPES[i].value] = { threshold: t, defaultPrice: 0 };
  }
  return config;
}

var PRESET_CASINOS = [
  /* ===== 新濠天地 ===== */
  {
    name: '新濠天地',
    hotels: [
      {
        name: '新濠天地',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '摩珀斯',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 新濠影滙 ===== */
  {
    name: '新濠影滙',
    hotels: [
      {
        name: '新濠影滙',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 金沙 ===== */
  {
    name: '金沙',
    hotels: [
      {
        name: '金沙城中心',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '康萊德',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 600000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 4000000, defaultPrice: 0 }
        }
      },
      {
        name: '瑞吉',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 銀河 ===== */
  {
    name: '銀河',
    hotels: [
      {
        name: '銀河',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      },
      {
        name: '悅榕庄',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 3000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 6000000, defaultPrice: 0 }
        }
      },
      {
        name: '大倉',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: 'JW萬豪',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 600000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 4000000, defaultPrice: 0 }
        }
      },
      {
        name: '百老匯',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '麗思卡爾頓',
        roomConfig: {
          'king':            { threshold: 600000,  defaultPrice: 0 },
          'twin':            { threshold: 600000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 1000000, defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 3000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 永利 ===== */
  {
    name: '永利',
    hotels: [
      {
        name: '永利澳門',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      },
      {
        name: '永利皇宮',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 700000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 上葡京 ===== */
  {
    name: '上葡京',
    hotels: [
      {
        name: '上葡京',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      }
    ]
  }
];

var Hotels = {

  /* ===== Load / Reset ===== */

  /**
   * Load preset configuration (called by App.initHotelConfig)
   */
  loadPresets: function () {
    var config = {
      version: PRESET_VERSION,
      _updatedAt: Date.now(),
      casinos: JSON.parse(JSON.stringify(PRESET_CASINOS))
    };
    State.set('hotelConfig', config);
    Store.saveHotelConfig(config);
    syncHCToFirebase(config);
    Events.emit(EVENTS.HC_LOADED, config);
    console.log('[Hotels] Presets loaded:', config.casinos.length, 'casinos');
    return config;
  },

  /**
   * Reset to preset (user action via Web backend)
   */
  resetToPreset: function () {
    return Hotels.loadPresets();
  },

  /* ===== Casino CRUD ===== */

  addCasino: function (name) {
    if (!name) return null;
    var hc = State.get('hotelConfig');
    if (!hc) hc = { version: PRESET_VERSION, _updatedAt: Date.now(), casinos: [] };

    /* Check duplicate */
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === name) {
        console.warn('[Hotels] Casino already exists:', name);
        return hc.casinos[i];
      }
    }

    var casino = { name: name, hotels: [] };
    hc.casinos.push(casino);
    hc._updatedAt = Date.now();

    State.set('hotelConfig', hc);
    Store.saveHotelConfig(hc);
    syncHCToFirebase(hc);
    Events.emit(EVENTS.HC_CREATED, { type: 'casino', name: name });
    console.log('[Hotels] Casino added:', name);
    return casino;
  },

  removeCasino: function (name) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    hc.casinos = hc.casinos.filter(function (c) {
      if (c.name === name) { found = true; return false; }
      return true;
    });

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_DELETED, { type: 'casino', name: name });
      console.log('[Hotels] Casino removed:', name);
    }
    return found;
  },

  renameCasino: function (oldName, newName) {
    if (!oldName || !newName) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === oldName) {
        hc.casinos[i].name = newName;
        found = true;
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'casino', oldName: oldName, newName: newName });
    }
    return found;
  },

  /* ===== Hotel CRUD ===== */

  addHotel: function (casinoName, hotelName) {
    if (!casinoName || !hotelName) return null;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return null;

    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        /* Check duplicate */
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            console.warn('[Hotels] Hotel already exists:', hotelName);
            return hc.casinos[i].hotels[j];
          }
        }
        var hotel = {
          name: hotelName,
          roomConfig: _defaultRoomConfig()
        };
        hc.casinos[i].hotels.push(hotel);
        hc._updatedAt = Date.now();

        State.set('hotelConfig', hc);
        Store.saveHotelConfig(hc);
        syncHCToFirebase(hc);
        Events.emit(EVENTS.HC_CREATED, { type: 'hotel', casino: casinoName, name: hotelName });
        console.log('[Hotels] Hotel added:', casinoName, hotelName);
        return hotel;
      }
    }
    console.error('[Hotels] Casino not found:', casinoName);
    return null;
  },

  removeHotel: function (casinoName, hotelName) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        hc.casinos[i].hotels = hc.casinos[i].hotels.filter(function (h) {
          if (h.name === hotelName) { found = true; return false; }
          return true;
        });
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_DELETED, { type: 'hotel', casino: casinoName, name: hotelName });
      console.log('[Hotels] Hotel removed:', casinoName, hotelName);
    }
    return found;
  },

  renameHotel: function (casinoName, oldName, newName) {
    if (!casinoName || !oldName || !newName) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === oldName) {
            hc.casinos[i].hotels[j].name = newName;
            found = true;
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'hotel', casino: casinoName, oldName: oldName, newName: newName });
    }
    return found;
  },

  /* ===== Room Config Update ===== */

  updateRoomConfig: function (casinoName, hotelName, roomType, config) {
    if (!casinoName || !hotelName || !roomType) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            if (!hc.casinos[i].hotels[j].roomConfig) {
              hc.casinos[i].hotels[j].roomConfig = _defaultRoomConfig();
            }
            if (!hc.casinos[i].hotels[j].roomConfig[roomType]) {
              hc.casinos[i].hotels[j].roomConfig[roomType] = { threshold: 0, defaultPrice: 0 };
            }
            if (config.threshold !== undefined) {
              hc.casinos[i].hotels[j].roomConfig[roomType].threshold = config.threshold;
            }
            if (config.defaultPrice !== undefined) {
              hc.casinos[i].hotels[j].roomConfig[roomType].defaultPrice = config.defaultPrice;
            }
            found = true;
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'roomConfig', casino: casinoName, hotel: hotelName, roomType: roomType });
    }
    return found;
  },

  /* ===== Query Methods ===== */

  getCasinos: function () {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return [];
    return hc.casinos.map(function (c) { return c.name; });
  },

  getHotels: function (casinoName) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return [];
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        return hc.casinos[i].hotels.map(function (h) { return h.name; });
      }
    }
    return [];
  },

  getRoomConfig: function (casinoName, hotelName, roomType) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return null;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            var rc = hc.casinos[i].hotels[j].roomConfig || {};
            return rc[roomType] || { threshold: 0, defaultPrice: 0 };
          }
        }
      }
    }
    return null;
  },

  getThreshold: function (casinoName, hotelName, roomType) {
    var rc = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    return rc ? (rc.threshold || 0) : 0;
  },

  getDefaultPrice: function (casinoName, hotelName, roomType) {
    var rc = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    return rc ? (rc.defaultPrice || 0) : 0;
  },

  /* ===== Get All ===== */

  getAll: function () {
    return State.get('hotelConfig');
  },

  getVersion: function () {
    var hc = State.get('hotelConfig');
    return hc ? hc.version : null;
  }
};

/**
 * bookings.js — Booking CRUD Module
 * v8: New fields (smoking/currency/confirmNo/feeStatus/profit/pickupName/employee)
 *     Auto-status transition, auto-archive, duplicate check
 * Flow: create/update/delete -> State.update -> Store.save -> syncToFirebase -> Events.emit
 */

var Bookings = {

  /**
   * Create a new booking
   * @param {Object} data - booking fields
   * @returns {Object} the created booking
   */
  create: function (data) {
    var now = Date.now();
    var fbKey = Utils.generateFbKey();

    var checkIn = data.checkIn || '';
    var checkOut = data.checkOut || '';
    var nights = Utils.calcNights(checkIn, checkOut);
    var month = Utils.getMonthStr(checkIn) || State.get('workingMonth') || Utils.currentMonth();

    var booking = {
      /* System fields */
      _fbKey:       fbKey,
      _createdAt:   now,
      _updatedAt:   now,
      _source:      data._source || 'web',

      /* Guest info */
      guestName:    data.guestName || '',
      agent:        data.agent || '',
      employee:     data.employee || '',
      employeeId:   data.employeeId || '',

      /* Hotel & room */
      casino:       data.casino || '',
      hotel:        data.hotel || '',
      roomType:     data.roomType || '',
      month:        month,

      /* Dates */
      checkIn:      checkIn,
      checkOut:     checkOut,
      nights:       nights,

      /* Status */
      status:       data.status || BOOKING_STATUS.PENDING,
      confirmNo:    data.confirmNo || '',

      /* Smoking */
      smoking:      data.smoking || 'unspecified',

      /* Fee (v8: free or paid, floating pricing) */
      feeStatus:    data.feeStatus || FEE_TYPES.FREE,
      chargeGuest:  Number(data.chargeGuest) || 0,
      chargeCompany: Number(data.chargeCompany) || 0,
      profit:       0,  /* calculated below */
      currency:     data.currency || CURRENCY_DEFAULT,

      /* Transfer */
      transfer:     data.transfer || 'none',
      pickupName:   data.pickupName || '',

      /* Threshold (snapshot from hotel config at booking time) */
      threshold:    Number(data.threshold) || 0,

      /* Archive */
      archived:     false,
      archivedAt:   null,

      /* Remark */
      remark:       data.remark || ''
    };

    /* Calculate profit */
    booking.profit = Bookings.calcProfit(booking);

    /* Add to state */
    State.update('bookings', function (list) {
      list.push(booking);
      return list;
    });

    /* Save to localStorage */
    Store.saveBookings(State.get('bookings'));

    /* Sync to Firebase */
    syncBookingToFirebase(booking);

    /* Emit event */
    Events.emit(EVENTS.BOOKING_CREATED, booking);

    console.log('[Bookings] Created:', booking._fbKey, booking.guestName);
    return booking;
  },

  /**
   * Update an existing booking
   * Respects STATUS_RULES for edit permissions
   * @param {string} fbKey - booking key
   * @param {Object} data - fields to update
   * @returns {Object|null} updated booking or null if not found / not editable
   */
  update: function (fbKey, data) {
    var updated = null;

    State.update('bookings', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]._fbKey === fbKey) {
          var booking = list[i];
          var rules = STATUS_RULES[booking.status] || { canEdit: true };

          /* If status doesn't allow editing, skip */
          if (!rules.canEdit) {
            console.warn('[Bookings] Cannot edit booking in status:', booking.status);
            return list;
          }

          /* Merge data into existing */
          for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_') {
              /* Respect canEditDates for date fields */
              if ((key === 'checkIn' || key === 'checkOut') && !rules.canEditDates) {
                continue;
              }
              booking[key] = data[key];
            }
          }

          /* Recalculate derived fields */
          booking.nights = Utils.calcNights(booking.checkIn, booking.checkOut);
          booking.month = Utils.getMonthStr(booking.checkIn) || booking.month;
          booking.profit = Bookings.calcProfit(booking);
          booking._updatedAt = Date.now();
          updated = booking;
          break;
        }
      }
      return list;
    });

    if (updated) {
      Store.saveBookings(State.get('bookings'));
      syncBookingToFirebase(updated);
      Events.emit(EVENTS.BOOKING_UPDATED, updated);
      console.log('[Bookings] Updated:', fbKey);
    }

    return updated;
  },

  /**
   * Delete a booking (tombstone pattern)
   * @param {string} fbKey - booking key
   * @returns {boolean} success
   */
  delete: function (fbKey) {
    var deleted = false;

    State.update('bookings', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i]._fbKey === fbKey) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      return list;
    });

    if (deleted) {
      Store.saveBookings(State.get('bookings'));
      RecentlyDeleted.track('booking', fbKey);
      removeBookingFromFirebase(fbKey);
      Events.emit(EVENTS.BOOKING_DELETED, fbKey);
      console.log('[Bookings] Deleted:', fbKey);
    }

    return deleted;
  },

  /**
   * Update booking status only
   */
  updateStatus: function (fbKey, status) {
    var updated = Bookings.update(fbKey, { status: status });
    if (updated) {
      Events.emit(EVENTS.BOOKING_STATUS_CHANGED, { fbKey: fbKey, status: status });
    }
    return updated;
  },

  /**
   * Set confirmation number
   * Auto-transitions pending -> confirmed
   */
  setConfirmNo: function (fbKey, confirmNo) {
    var booking = Bookings.getByKey(fbKey);
    if (!booking) return null;

    var data = { confirmNo: confirmNo };
    /* Auto-transition to confirmed if currently pending */
    if (booking.status === BOOKING_STATUS.PENDING) {
      data.status = BOOKING_STATUS.CONFIRMED;
    }

    var updated = Bookings.update(fbKey, data);
    if (updated && data.status) {
      Events.emit(EVENTS.BOOKING_STATUS_CHANGED, { fbKey: fbKey, status: data.status, confirmNo: confirmNo });
    }
    return updated;
  },

  /**
   * Archive a booking
   * Creates archive record and marks booking as archived
   */
  archive: function (fbKey) {
    var booking = Bookings.getByKey(fbKey);
    if (!booking) return null;
    if (booking.archived) return booking; /* already archived */

    /* Create archive record */
    if (typeof Archives !== 'undefined') {
      Archives.add(booking);
    }

    /* Mark booking as archived */
    State.update('bookings', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]._fbKey === fbKey) {
          list[i].archived = true;
          list[i].archivedAt = Date.now();
          list[i]._updatedAt = Date.now();
          break;
        }
      }
      return list;
    });

    Store.saveBookings(State.get('bookings'));
    var updated = Bookings.getByKey(fbKey);
    if (updated) {
      syncBookingToFirebase(updated);
    }
    Events.emit(EVENTS.BOOKING_ARCHIVED, fbKey);
    console.log('[Bookings] Archived:', fbKey);
    return updated;
  },

  /**
   * Auto-transition booking statuses based on dates
   * Called by daily scan (Bot) or manual trigger
   * @returns {Array} list of transitions made
   */
  autoTransitionStatus: function () {
    var today = Utils.today();
    var transitions = [];

    var list = State.get('bookings');
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!b || b._deleted || b.archived) continue;

      var changed = false;
      var newStatus = b.status;

      /* pending/confirmed -> checked-in (checkIn date <= today) */
      if (STATUS_AUTO_TRANSITION.toCheckedIn.indexOf(b.status) !== -1) {
        if (b.checkIn && b.checkIn <= today) {
          newStatus = BOOKING_STATUS.CHECKED_IN;
          changed = true;
        }
      }

      /* checked-in -> checked-out (checkOut date <= today) */
      if (!changed && STATUS_AUTO_TRANSITION.toCheckedOut.indexOf(b.status) !== -1) {
        if (b.checkOut && b.checkOut <= today) {
          newStatus = BOOKING_STATUS.CHECKED_OUT;
          changed = true;
        }
      }

      if (changed) {
        var oldStatus = b.status;
        Bookings.updateStatus(b._fbKey, newStatus);
        transitions.push({
          fbKey: b._fbKey,
          guestName: b.guestName,
          oldStatus: oldStatus,
          newStatus: newStatus
        });

        /* Auto-archive if checked-out */
        if (STATUS_AUTO_TRANSITION.toArchive.indexOf(newStatus) !== -1) {
          Bookings.archive(b._fbKey);
        }
      }
    }

    /* Also auto-archive cancelled bookings that haven't been archived */
    list = State.get('bookings');
    for (var j = 0; j < list.length; j++) {
      var b2 = list[j];
      if (!b2 || b2._deleted || b2.archived) continue;
      if (b2.status === BOOKING_STATUS.CANCELLED) {
        Bookings.archive(b2._fbKey);
        transitions.push({
          fbKey: b2._fbKey,
          guestName: b2.guestName,
          oldStatus: 'cancelled',
          newStatus: 'archived'
        });
      }
    }

    if (transitions.length > 0) {
      console.log('[Bookings] Auto-transitioned:', transitions.length, 'bookings');
    }
    return transitions;
  },

  /**
   * Check for potential duplicate booking
   * Same guest + same check-in date + same casino -> warn (not block)
   */
  checkDuplicate: function (guestName, checkIn, casino) {
    if (!guestName || !checkIn) return [];
    var list = State.getBookings();
    return list.filter(function (b) {
      return b.guestName === guestName &&
             b.checkIn === checkIn &&
             b.casino === casino &&
             b.status !== BOOKING_STATUS.CANCELLED;
    });
  },

  /**
   * Calculate profit = chargeGuest - chargeCompany
   */
  calcProfit: function (booking) {
    var guest = Number(booking.chargeGuest) || 0;
    var company = Number(booking.chargeCompany) || 0;
    return guest - company;
  },

  /* ===== Query Methods ===== */

  getByKey: function (fbKey) {
    var list = State.get('bookings');
    for (var i = 0; i < list.length; i++) {
      if (list[i]._fbKey === fbKey) return list[i];
    }
    return null;
  },

  getByMonth: function (month) {
    var list = State.getBookings();
    if (!month) return list;
    return list.filter(function (b) { return b.month === month; });
  },

  getByStatus: function (status) {
    var list = State.getBookings();
    if (!status) return list;
    return list.filter(function (b) { return b.status === status; });
  },

  getByAgent: function (agent) {
    var list = State.getBookings();
    if (!agent) return list;
    return list.filter(function (b) { return b.agent === agent; });
  },

  getByEmployee: function (employeeId) {
    var list = State.getBookings();
    if (!employeeId) return list;
    return list.filter(function (b) { return b.employeeId === employeeId; });
  },

  getByCasino: function (casino) {
    var list = State.getBookings();
    if (!casino) return list;
    return list.filter(function (b) { return b.casino === casino; });
  },

  /**
   * Get bookings needing reminder
   * check-in within REMINDER_DAYS_BEFORE days and confirmNo not yet filled
   */
  getBookingsNeedingReminder: function () {
    var list = State.getBookings();
    var reminderDays = CONFIG.REMINDER_DAYS_BEFORE;
    var today = Utils.today();
    var reminderDate = Utils.addDays(today, reminderDays);

    return list.filter(function (b) {
      return b.status === BOOKING_STATUS.PENDING &&
             !b.confirmNo &&
             b.checkIn &&
             b.checkIn <= reminderDate &&
             b.checkIn >= today;
    });
  },

  search: function (keyword) {
    var list = State.getBookings();
    if (!keyword) return list;
    keyword = keyword.toLowerCase();
    return list.filter(function (b) {
      return (
        (b.guestName || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.agent || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.hotel || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.employee || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.confirmNo || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.pickupName || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.remark || '').toLowerCase().indexOf(keyword) !== -1
      );
    });
  },

  getAll: function () {
    return State.get('bookings');
  }
};

/**
 * agents.js — Agent List Management
 * v8: Added active flag for deactivation (without deletion)
 *     Agent != Employee (agent is the customer's representative)
 * Flow: add/rename/remove/setActive -> State.update -> Store.save -> syncToFirebase -> Events.emit
 */

var Agents = {

  /**
   * Add a new agent
   */
  add: function (name, phone) {
    if (!name) return null;

    /* Check duplicate */
    var existing = Agents.findByName(name);
    if (existing) {
      console.warn('[Agents] Duplicate name:', name);
      return existing;
    }

    var agent = {
      id:         Utils.generateAgentId(),
      _fbKey:     Utils.generateFbKey(),
      _createdAt: Date.now(),
      _updatedAt: Date.now(),
      name:       name,
      phone:      phone || '',
      active:     true
    };

    State.update('agentList', function (list) {
      list.push(agent);
      return list;
    });
    Store.saveAgentList(State.get('agentList'));
    syncAgentListToFirebase(State.get('agentList'));
    Events.emit(EVENTS.AGENT_ADDED, agent);
    console.log('[Agents] Added:', name);
    return agent;
  },

  /**
   * Rename an agent
   * Also updates bookings that reference this agent
   */
  rename: function (oldName, newName) {
    if (!oldName || !newName) return false;

    var renamed = false;
    State.update('agentList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === oldName) {
          list[i].name = newName;
          list[i]._updatedAt = Date.now();
          renamed = true;
          break;
        }
      }
      return list;
    });

    if (renamed) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));

      /* Update bookings that reference this agent */
      var bookings = Bookings.getByAgent(oldName);
      for (var j = 0; j < bookings.length; j++) {
        Bookings.update(bookings[j]._fbKey, { agent: newName });
      }

      Events.emit(EVENTS.AGENT_RENAMED, { oldName: oldName, newName: newName });
      console.log('[Agents] Renamed:', oldName, '->', newName);
    }
    return renamed;
  },

  /**
   * Remove an agent completely
   */
  remove: function (name) {
    var deleted = false;
    State.update('agentList', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].name === name) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      return list;
    });

    if (deleted) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));
      Events.emit(EVENTS.AGENT_REMOVED, name);
      console.log('[Agents] Removed:', name);
    }
    return deleted;
  },

  /**
   * Deactivate an agent (keep history, hide from active list)
   */
  deactivate: function (name) {
    return Agents.setActive(name, false);
  },

  /**
   * Activate a deactivated agent
   */
  activate: function (name) {
    return Agents.setActive(name, true);
  },

  /**
   * Set active flag on an agent
   */
  setActive: function (name, active) {
    var changed = false;
    State.update('agentList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === name) {
          list[i].active = active;
          list[i]._updatedAt = Date.now();
          changed = true;
          break;
        }
      }
      return list;
    });

    if (changed) {
      Store.saveAgentList(State.get('agentList'));
      syncAgentListToFirebase(State.get('agentList'));
      Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
      console.log('[Agents] setActive:', name, active);
    }
    return changed;
  },

  /**
   * Find agent by name
   */
  findByName: function (name) {
    var list = State.get('agentList');
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i];
    }
    return null;
  },

  /**
   * Get active agent names only
   */
  getNames: function () {
    return State.getActiveAgents().map(function (a) { return a.name; });
  },

  /**
   * Get all agent names (including inactive)
   */
  getAllNames: function () {
    var list = State.get('agentList');
    return list.map(function (a) { return a.name; });
  },

  /**
   * Get all agents
   */
  getAll: function () {
    return State.get('agentList');
  }
};

/**
 * employees.js — Employee Management (v8 new)
 * Manages Telegram Bot authorized users with two-level permissions
 *   Admin  (管理員): you + accountant + shareholders
 *   Staff  (員工): regular staff who operate the Bot
 * Employees != Agents (employees operate the Bot, agents are customer representatives)
 * Flow: add/update/remove -> State.update -> Store.save -> syncToFirebase -> Events.emit
 */

var Employees = {

  /**
   * Add a new employee
   * Called by Auth.authorizeEmployee or Web management
   */
  add: function (tgId, name, role) {
    if (!tgId) return null;
    role = role || EMPLOYEE_ROLES.STAFF;

    /* Check if already exists by tgId */
    var existing = Employees.getByTgId(tgId);
    if (existing) {
      console.warn('[Employees] Already exists:', tgId);
      /* Reactivate if deactivated */
      if (existing.active === false) {
        return Employees.update(existing.id, {
          active: true,
          name: name || existing.name,
          role: role
        });
      }
      return existing;
    }

    var employee = {
      id:           Utils.generateEmployeeId(),
      _fbKey:       Utils.generateFbKey(),
      _createdAt:   Date.now(),
      _updatedAt:   Date.now(),
      tgId:         String(tgId),
      name:         name || '',
      role:         role,
      active:       true,
      authorizedAt: new Date().toISOString()
    };

    State.update('employeeList', function (list) {
      list.push(employee);
      return list;
    });
    Store.saveEmployeeList(State.get('employeeList'));
    syncEmployeeListToFirebase(State.get('employeeList'));
    Events.emit(EVENTS.EMPLOYEE_ADDED, employee);
    console.log('[Employees] Added:', employee.name, '(' + role + ')');
    return employee;
  },

  /**
   * Update employee fields
   */
  update: function (id, data) {
    var updated = null;

    State.update('employeeList', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_') {
              list[i][key] = data[key];
            }
          }
          list[i]._updatedAt = Date.now();
          updated = list[i];
          break;
        }
      }
      return list;
    });

    if (updated) {
      Store.saveEmployeeList(State.get('employeeList'));
      syncEmployeeListToFirebase(State.get('employeeList'));
      Events.emit(EVENTS.EMPLOYEE_UPDATED, updated);
    }
    return updated;
  },

  /**
   * Remove an employee completely
   */
  remove: function (id) {
    var deleted = false;
    State.update('employeeList', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].id === id) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      return list;
    });

    if (deleted) {
      Store.saveEmployeeList(State.get('employeeList'));
      syncEmployeeListToFirebase(State.get('employeeList'));
      Events.emit(EVENTS.EMPLOYEE_REMOVED, id);
      console.log('[Employees] Removed:', id);
    }
    return deleted;
  },

  /**
   * Deactivate an employee (revoke Bot access, keep history)
   */
  deactivate: function (id) {
    return Employees.update(id, { active: false });
  },

  /**
   * Activate a deactivated employee
   */
  activate: function (id) {
    return Employees.update(id, { active: true });
  },

  /**
   * Change employee role
   */
  setRole: function (id, role) {
    return Employees.update(id, { role: role });
  },

  /* ===== Query Methods ===== */

  getById: function (id) {
    var list = State.get('employeeList');
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  },

  getByTgId: function (tgId) {
    var list = State.get('employeeList');
    var tid = String(tgId);
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].tgId) === tid) return list[i];
    }
    return null;
  },

  getAdmins: function () {
    return State.get('employeeList').filter(function (e) {
      return e.role === EMPLOYEE_ROLES.ADMIN && e.active !== false;
    });
  },

  getActive: function () {
    return State.getActiveEmployees();
  },

  getAll: function () {
    return State.get('employeeList');
  },

  isAdmin: function (id) {
    var emp = Employees.getById(id);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN;
  },

  isAdminByTgId: function (tgId) {
    var emp = Employees.getByTgId(tgId);
    return emp && emp.role === EMPLOYEE_ROLES.ADMIN && emp.active !== false;
  }
};

/**
 * archives.js — Archive System (v8 new)
 * Auto-archive on checkout/cancel, multi-dimensional query, permanent retention
 * Archives are synced via syncArchiveToFirebase() with _fbKey
 * Archives cannot be deleted (permanent record for auditing)
 */

var Archives = {

  /**
   * Create an archive record from a booking
   * Called by Bookings.archive()
   */
  add: function (booking) {
    if (!booking) return null;

    var now = Date.now();
    var archive = {
      /* System */
      _fbKey:        Utils.generateFbKey(),
      _createdAt:    now,
      _updatedAt:    now,
      _source:       booking._source || 'web',

      /* Original booking reference */
      originalKey:   booking._fbKey,
      archivedAt:    now,

      /* Guest info */
      guestName:     booking.guestName || '',
      agent:         booking.agent || '',
      employee:      booking.employee || '',
      employeeId:    booking.employeeId || '',

      /* Hotel & room */
      casino:        booking.casino || '',
      hotel:         booking.hotel || '',
      roomType:      booking.roomType || '',

      /* Dates */
      checkIn:       booking.checkIn || '',
      checkOut:      booking.checkOut || '',
      nights:        booking.nights || 0,
      month:         booking.month || Utils.getMonthStr(booking.checkIn),

      /* Final status */
      finalStatus:   booking.status || '',

      /* Smoking */
      smoking:       booking.smoking || 'unspecified',

      /* Fee */
      feeStatus:     booking.feeStatus || FEE_TYPES.FREE,
      chargeGuest:   Number(booking.chargeGuest) || 0,
      chargeCompany: Number(booking.chargeCompany) || 0,
      profit:        Number(booking.profit) || 0,
      currency:      booking.currency || CURRENCY_DEFAULT,

      /* Transfer */
      transfer:      booking.transfer || 'none',
      pickupName:    booking.pickupName || '',

      /* Threshold */
      threshold:     Number(booking.threshold) || 0,

      /* Confirm */
      confirmNo:     booking.confirmNo || '',

      /* Remark */
      remark:        booking.remark || ''
    };

    State.update('archives', function (list) {
      list.push(archive);
      return list;
    });
    Store.saveArchives(State.get('archives'));
    syncArchiveToFirebase(archive);
    Events.emit(EVENTS.ARCHIVE_ADDED, archive);
    console.log('[Archives] Added:', archive.guestName, '(' + archive.finalStatus + ')');
    return archive;
  },

  /* ===== Query Methods ===== */

  getById: function (fbKey) {
    var list = State.get('archives');
    for (var i = 0; i < list.length; i++) {
      if (list[i]._fbKey === fbKey) return list[i];
    }
    return null;
  },

  getByOriginalKey: function (originalKey) {
    var list = State.get('archives');
    for (var i = 0; i < list.length; i++) {
      if (list[i].originalKey === originalKey) return list[i];
    }
    return null;
  },

  /**
   * Multi-dimensional search
   * @param {Object} filters - {
   *   month, agent, casino, hotel, employee, status,
   *   dateFrom, dateTo, keyword
   * }
   */
  search: function (filters) {
    var list = State.get('archives');
    if (!filters) return list;

    return list.filter(function (a) {
      if (filters.month && a.month !== filters.month) return false;
      if (filters.agent && a.agent !== filters.agent) return false;
      if (filters.casino && a.casino !== filters.casino) return false;
      if (filters.hotel && a.hotel !== filters.hotel) return false;
      if (filters.employee && a.employeeId !== filters.employee) return false;
      if (filters.status && a.finalStatus !== filters.status) return false;
      if (filters.dateFrom && a.checkIn < filters.dateFrom) return false;
      if (filters.dateTo && a.checkOut > filters.dateTo) return false;
      if (filters.keyword) {
        var kw = filters.keyword.toLowerCase();
        var match = (
          (a.guestName || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.agent || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.confirmNo || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.employee || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.pickupName || '').toLowerCase().indexOf(kw) !== -1
        );
        if (!match) return false;
      }
      return true;
    });
  },

  getByMonth: function (month) {
    var list = State.get('archives');
    if (!month) return list;
    return list.filter(function (a) { return a.month === month; });
  },

  getByAgent: function (agent) {
    var list = State.get('archives');
    if (!agent) return list;
    return list.filter(function (a) { return a.agent === agent; });
  },

  getByDateRange: function (dateFrom, dateTo) {
    var list = State.get('archives');
    return list.filter(function (a) {
      if (dateFrom && a.checkIn < dateFrom) return false;
      if (dateTo && a.checkOut > dateTo) return false;
      return true;
    });
  },

  getByEmployee: function (employeeId) {
    var list = State.get('archives');
    if (!employeeId) return list;
    return list.filter(function (a) { return a.employeeId === employeeId; });
  },

  /**
   * Get statistics for a set of archives
   * @param {Array} archives - optional, defaults to all
   * @returns {Object} stats summary
   */
  getStats: function (archives) {
    var list = archives || State.get('archives');
    var stats = {
      total: list.length,
      checkedOut: 0,
      cancelled: 0,
      totalProfit: 0,
      totalChargeGuest: 0,
      totalChargeCompany: 0,
      byCurrency: {},
      byAgent: {},
      byCasino: {},
      byEmployee: {}
    };

    for (var i = 0; i < list.length; i++) {
      var a = list[i];

      if (a.finalStatus === BOOKING_STATUS.CHECKED_OUT) stats.checkedOut++;
      if (a.finalStatus === BOOKING_STATUS.CANCELLED) stats.cancelled++;

      stats.totalProfit += Number(a.profit) || 0;
      stats.totalChargeGuest += Number(a.chargeGuest) || 0;
      stats.totalChargeCompany += Number(a.chargeCompany) || 0;

      var curr = a.currency || CURRENCY_DEFAULT;
      if (!stats.byCurrency[curr]) stats.byCurrency[curr] = 0;
      stats.byCurrency[curr]++;

      if (a.agent) {
        if (!stats.byAgent[a.agent]) stats.byAgent[a.agent] = { count: 0, profit: 0 };
        stats.byAgent[a.agent].count++;
        stats.byAgent[a.agent].profit += Number(a.profit) || 0;
      }

      if (a.casino) {
        if (!stats.byCasino[a.casino]) stats.byCasino[a.casino] = 0;
        stats.byCasino[a.casino]++;
      }

      if (a.employee) {
        if (!stats.byEmployee[a.employee]) stats.byEmployee[a.employee] = { count: 0, profit: 0 };
        stats.byEmployee[a.employee].count++;
        stats.byEmployee[a.employee].profit += Number(a.profit) || 0;
      }
    }

    return stats;
  },

  getAll: function () {
    return State.get('archives');
  }
};

/**
 * backup.js — Backup & Restore
 * v8: Updated for new data model (employees, archives, closedMonths, settings)
 *     Removed exportJSON/importJSON (v8: no export, keep print only)
 *     Fixed: no longer uses non-existent Store.load/save third param or State.batchSet
 */

var Backup = {

  /**
   * Create a backup snapshot
   */
  create: function (label) {
    var now = new Date();
    var timestamp = now.getTime();
    var dateStr = Utils.formatDateFull(Utils.today()) + ' ' +
                  Utils.pad(now.getHours()) + ':' + Utils.pad(now.getMinutes());

    var snapshot = {
      id: timestamp,
      label: label || ('\u5099\u4efd ' + dateStr),
      timestamp: timestamp,
      version: APP.VERSION,
      data: {
        bookings:     State.get('bookings'),
        hotelConfig:  State.get('hotelConfig'),
        agentList:    State.get('agentList'),
        employeeList: State.get('employeeList'),
        archives:     State.get('archives'),
        closedMonths: State.get('closedMonths'),
        settings:     State.get('settings'),
        workingMonth: State.get('workingMonth')
      }
    };

    /* Save to localStorage */
    var backups = Store.load(STORAGE_KEYS.BACKUP_LIST) || [];
    backups.push({ id: timestamp, label: snapshot.label, timestamp: timestamp });
    Store.save(STORAGE_KEYS.BACKUP_LIST, backups);
    Store.save(STORAGE_KEYS.BACKUP_PREFIX + timestamp, snapshot);
    Store.save(STORAGE_KEYS.LAST_BACKUP_DATE, dateStr);

    console.log('[Backup] Created:', snapshot.label);
    return snapshot;
  },

  /**
   * Restore from a backup
   */
  restore: function (backupId) {
    var snapshot = Store.load(STORAGE_KEYS.BACKUP_PREFIX + backupId);
    if (!snapshot || !snapshot.data) {
      console.error('[Backup] Restore failed: snapshot not found');
      return false;
    }

    var d = snapshot.data;
    State.set('bookings',     d.bookings     || []);
    State.set('hotelConfig',  d.hotelConfig  || null);
    State.set('agentList',    d.agentList    || []);
    State.set('employeeList', d.employeeList || []);
    State.set('archives',     d.archives     || []);
    State.set('closedMonths', d.closedMonths || []);
    State.set('settings',     d.settings     || {});
    if (d.workingMonth) {
      State.set('workingMonth', d.workingMonth);
    }

    /* Save all to store */
    Store.saveBookings(State.get('bookings'));
    Store.saveHotelConfig(State.get('hotelConfig'));
    Store.saveAgentList(State.get('agentList'));
    Store.saveEmployeeList(State.get('employeeList'));
    Store.saveArchives(State.get('archives'));
    Store.saveClosedMonths(State.get('closedMonths'));
    Store.saveSettings(State.get('settings'));

    /* Sync to Firebase */
    if (typeof syncUploadAll === 'function') {
      syncUploadAll();
    }

    Events.emit(EVENTS.UI_RENDER, {});
    Events.emit(EVENTS.UI_TOAST, { type: 'success', message: '\u9084\u539f\u6210\u529f' });
    console.log('[Backup] Restored:', snapshot.label);
    return true;
  },

  /**
   * List all backups
   */
  list: function () {
    return Store.load(STORAGE_KEYS.BACKUP_LIST) || [];
  },

  /**
   * Delete a backup
   */
  remove: function (backupId) {
    var backups = Backup.list();
    var filtered = backups.filter(function (b) { return b.id !== backupId; });
    Store.save(STORAGE_KEYS.BACKUP_LIST, filtered);
    Store.remove(STORAGE_KEYS.BACKUP_PREFIX + backupId);
    return true;
  },

  /**
   * Get last backup date string
   */
  getLastBackupDate: function () {
    return Store.load(STORAGE_KEYS.LAST_BACKUP_DATE) || '--';
  }
};

/**
 * filters.js — Pure Functions for Filtering & Sorting (v8)
 * Zero side effects, 100% testable
 *
 * v8 changes:
 * - Removed: compType filter (field no longer exists)
 * - Updated: keyword search fields (removed phone/note/flightNo,
 *   added confirmNo/pickupName/employee/remark)
 * - Added: feeStatus/smoking/currency/employee filters
 * - Added: filterArchives() for archive records (uses finalStatus)
 */

var Filters = {

  /**
   * Filter bookings by criteria
   * @param {Array} bookings - booking array
   * @param {Object} criteria - {
   *   month, casino, hotel, roomType, agent, employee, status,
   *   feeStatus, smoking, currency, transfer,
   *   dateFrom, dateTo, keyword
   * }
   * @returns {Array} filtered bookings
   */
  filterBookings: function (bookings, criteria) {
    if (!bookings) return [];
    if (!criteria) return bookings;

    return bookings.filter(function (b) {
      /* Dimension filters */
      if (criteria.month && b.month !== criteria.month) return false;
      if (criteria.casino && b.casino !== criteria.casino) return false;
      if (criteria.hotel && b.hotel !== criteria.hotel) return false;
      if (criteria.roomType && b.roomType !== criteria.roomType) return false;
      if (criteria.agent && b.agent !== criteria.agent) return false;
      if (criteria.employee && b.employeeId !== criteria.employee) return false;
      if (criteria.status && b.status !== criteria.status) return false;
      if (criteria.feeStatus && b.feeStatus !== criteria.feeStatus) return false;
      if (criteria.smoking && b.smoking !== criteria.smoking) return false;
      if (criteria.currency && b.currency !== criteria.currency) return false;
      if (criteria.transfer && b.transfer !== criteria.transfer) return false;

      /* Exclude archived unless explicitly requested */
      if (!criteria.includeArchived && b.archived) return false;

      /* Date range filters */
      if (criteria.dateFrom && b.checkIn < criteria.dateFrom) return false;
      if (criteria.dateTo && b.checkOut > criteria.dateTo) return false;

      /* Keyword search across multiple fields */
      if (criteria.keyword) {
        var kw = criteria.keyword.toLowerCase();
        var match = (
          (b.guestName || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.agent || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.hotel || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.casino || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.roomType || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.employee || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.confirmNo || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.pickupName || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.remark || '').toLowerCase().indexOf(kw) !== -1
        );
        if (!match) return false;
      }

      return true;
    });
  },

  /**
   * Filter archive records by criteria (v8 new)
   * Archives use finalStatus instead of status
   * @param {Array} archives - archive array
   * @param {Object} criteria - {
   *   month, casino, hotel, roomType, agent, employee, status (finalStatus),
   *   feeStatus, smoking, currency, transfer,
   *   dateFrom, dateTo, keyword
   * }
   * @returns {Array} filtered archives
   */
  filterArchives: function (archives, criteria) {
    if (!archives) return [];
    if (!criteria) return archives;

    return archives.filter(function (a) {
      /* Dimension filters */
      if (criteria.month && a.month !== criteria.month) return false;
      if (criteria.casino && a.casino !== criteria.casino) return false;
      if (criteria.hotel && a.hotel !== criteria.hotel) return false;
      if (criteria.roomType && a.roomType !== criteria.roomType) return false;
      if (criteria.agent && a.agent !== criteria.agent) return false;
      if (criteria.employee && a.employeeId !== criteria.employee) return false;
      /* Archives use finalStatus; accept either 'status' or 'finalStatus' in criteria */
      var statusFilter = criteria.status || criteria.finalStatus;
      if (statusFilter && a.finalStatus !== statusFilter) return false;
      if (criteria.feeStatus && a.feeStatus !== criteria.feeStatus) return false;
      if (criteria.smoking && a.smoking !== criteria.smoking) return false;
      if (criteria.currency && a.currency !== criteria.currency) return false;
      if (criteria.transfer && a.transfer !== criteria.transfer) return false;

      /* Date range filters */
      if (criteria.dateFrom && a.checkIn < criteria.dateFrom) return false;
      if (criteria.dateTo && a.checkOut > criteria.dateTo) return false;

      /* Keyword search */
      if (criteria.keyword) {
        var kw = criteria.keyword.toLowerCase();
        var match = (
          (a.guestName || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.agent || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.hotel || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.casino || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.employee || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.confirmNo || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.pickupName || '').toLowerCase().indexOf(kw) !== -1 ||
          (a.remark || '').toLowerCase().indexOf(kw) !== -1
        );
        if (!match) return false;
      }

      return true;
    });
  },

  /**
   * Sort bookings (or any array of objects) by field
   * @param {Array} arr - array to sort
   * @param {string} field - sort field
   * @param {boolean} ascending - sort direction (default: true)
   * @returns {Array} new sorted array (does not mutate original)
   */
  sortBookings: function (arr, field, ascending) {
    if (!arr) return [];
    var copy = arr.slice();
    ascending = ascending !== false;

    copy.sort(function (a, b) {
      var aVal = a[field];
      var bVal = b[field];

      /* Handle undefined/null */
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      /* Numeric comparison */
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ascending ? aVal - bVal : bVal - aVal;
      }

      /* Date string comparison (YYYY-MM-DD sorts correctly as string) */
      if (field === 'checkIn' || field === 'checkOut' || field === 'archivedAt' || field === '_updatedAt') {
        var aStr = String(aVal);
        var bStr = String(bVal);
        return ascending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }

      /* General string comparison */
      var aStr2 = String(aVal);
      var bStr2 = String(bVal);
      if (aStr2 < bStr2) return ascending ? -1 : 1;
      if (aStr2 > bStr2) return ascending ? 1 : -1;
      return 0;
    });

    return copy;
  },

  /**
   * Get bookings overlapping a date range
   * Booking overlaps if: checkIn <= dateTo AND checkOut >= dateFrom
   */
  filterByDateRange: function (bookings, dateFrom, dateTo) {
    if (!bookings) return [];
    return bookings.filter(function (b) {
      if (!b.checkIn || !b.checkOut) return false;
      return b.checkIn <= dateTo && b.checkOut >= dateFrom;
    });
  },

  /**
   * Get bookings active on a specific date
   * (checked-in but not yet checked-out)
   */
  filterByDate: function (bookings, date) {
    if (!bookings || !date) return [];
    return bookings.filter(function (b) {
      if (!b.checkIn || !b.checkOut) return false;
      return b.checkIn <= date && b.checkOut > date;
    });
  },

  /**
   * Paginate results
   * @param {Array} arr - array to paginate
   * @param {number} page - page number (1-based)
   * @param {number} perPage - items per page
   * @returns {Array} slice for the requested page
   */
  paginate: function (arr, page, perPage) {
    if (!arr) return [];
    page = page || 1;
    perPage = perPage || 20;
    var start = (page - 1) * perPage;
    return arr.slice(start, start + perPage);
  },

  /**
   * Group items by a field
   * @param {Array} arr - array of objects
   * @param {string} field - field to group by
   * @returns {Object} { fieldValue: [items], ... }
   */
  groupBy: function (arr, field) {
    if (!arr) return {};
    var groups = {};
    for (var i = 0; i < arr.length; i++) {
      var key = arr[i][field] || '\u672A\u5206\u985E';
      if (!groups[key]) groups[key] = [];
      groups[key].push(arr[i]);
    }
    return groups;
  },

  /**
   * Multi-sort: sort by multiple fields with different directions
   * @param {Array} arr - array to sort
   * @param {Array} sortFields - [{ field: 'status', ascending: true }, { field: 'checkIn', ascending: true }]
   * @returns {Array} new sorted array
   */
  multiSort: function (arr, sortFields) {
    if (!arr || !sortFields || sortFields.length === 0) return arr ? arr.slice() : [];
    var copy = arr.slice();

    copy.sort(function (a, b) {
      for (var i = 0; i < sortFields.length; i++) {
        var sf = sortFields[i];
        var field = sf.field;
        var ascending = sf.ascending !== false;

        var aVal = a[field];
        var bVal = b[field];
        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          if (aVal !== bVal) return ascending ? aVal - bVal : bVal - aVal;
        } else {
          var aStr = String(aVal);
          var bStr = String(bVal);
          if (aStr !== bStr) {
            return ascending ? (aStr < bStr ? -1 : 1) : (aStr > bStr ? -1 : 1);
          }
        }
      }
      return 0;
    });

    return copy;
  }
};

/**
 * stats.js — Pure Functions for Statistics (v8)
 * Zero side effects, 100% testable
 *
 * v8 changes:
 * - Removed: totalRoomNights/totalRooms/totalGuests/totalVolume/thresholdRate/totalCost
 *   (roomCount/guestCount/volume/totalCost fields no longer exist)
 * - Added: totalNights/totalProfit/totalChargeGuest/totalChargeCompany
 * - Added: countByFeeStatus/countBySmoking/countByCurrency/countByEmployee
 * - Added: profitByAgent/profitByCasino/profitByEmployee/chargeByCurrency
 * - Added: employeeMatrix/topEmployees/feeStats/summary/bookingTrend
 * - Updated: totalThreshold (no roomCount multiplier, one booking = one room)
 */

var Stats = {

  /* ===== Basic Counts ===== */

  /**
   * Total bookings count
   */
  totalBookings: function (bookings) {
    return bookings ? bookings.length : 0;
  },

  /**
   * Total nights (sum of booking.nights)
   * v8: one booking = one room, no roomCount multiplier
   */
  totalNights: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].nights || 0);
    }
    return sum;
  },

  /**
   * Total threshold (sum of booking.threshold)
   * v8: threshold is a snapshot from hotel config at booking time
   */
  totalThreshold: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += Number(bookings[i].threshold) || 0;
    }
    return sum;
  },

  /* ===== Financial Stats (v8 new) ===== */

  /**
   * Total profit (sum of booking.profit)
   * profit = chargeGuest - chargeCompany
   */
  totalProfit: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += Number(bookings[i].profit) || 0;
    }
    return sum;
  },

  /**
   * Total charged to guests
   */
  totalChargeGuest: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += Number(bookings[i].chargeGuest) || 0;
    }
    return sum;
  },

  /**
   * Total charged to company (casino)
   */
  totalChargeCompany: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += Number(bookings[i].chargeCompany) || 0;
    }
    return sum;
  },

  /* ===== Count By Dimensions ===== */

  /**
   * Count bookings by status
   * @returns {Object} { pending: N, confirmed: N, 'checked-in': N, ... }
   */
  countByStatus: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var s = bookings[i].status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by casino (hotel system)
   */
  countByCasino: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var c = bookings[i].casino || '\u672A\u5206\u985E';
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by agent
   */
  countByAgent: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var a = bookings[i].agent || '\u672A\u5206\u985E';
      counts[a] = (counts[a] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by employee (v8 new)
   */
  countByEmployee: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var e = bookings[i].employee || '\u672A\u5206\u985E';
      counts[e] = (counts[e] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by fee status (free/paid) (v8 new)
   */
  countByFeeStatus: function (bookings) {
    var counts = { free: 0, paid: 0 };
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var f = bookings[i].feeStatus || 'free';
      counts[f] = (counts[f] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by smoking preference (v8 new)
   */
  countBySmoking: function (bookings) {
    var counts = { smoking: 0, 'non-smoking': 0, unspecified: 0 };
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var s = bookings[i].smoking || 'unspecified';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by currency (v8 new)
   */
  countByCurrency: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var c = bookings[i].currency || CURRENCY_DEFAULT;
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  },

  /**
   * Count bookings by room type (v8 new)
   */
  countByRoomType: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var r = bookings[i].roomType || 'unknown';
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  },

  /* ===== Matrix (cross-dimension) ===== */

  /**
   * Casino x Status matrix
   * @returns {Object} { '新濠天地': { pending: N, confirmed: N, _total: N }, ... }
   */
  casinoMatrix: function (bookings) {
    var matrix = {};
    if (!bookings) return matrix;
    for (var i = 0; i < bookings.length; i++) {
      var casino = bookings[i].casino || '\u672A\u5206\u985E';
      var status = bookings[i].status || 'unknown';
      if (!matrix[casino]) matrix[casino] = {};
      matrix[casino][status] = (matrix[casino][status] || 0) + 1;
      matrix[casino]._total = (matrix[casino]._total || 0) + 1;
    }
    return matrix;
  },

  /**
   * Agent x Casino matrix
   * @returns {Object} { '王大帥': { '新濠天地': N, '銀河': N, _total: N }, ... }
   */
  agentMatrix: function (bookings) {
    var matrix = {};
    if (!bookings) return matrix;
    for (var i = 0; i < bookings.length; i++) {
      var agent = bookings[i].agent || '\u672A\u5206\u985E';
      var casino = bookings[i].casino || '\u672A\u5206\u985E';
      if (!matrix[agent]) matrix[agent] = {};
      matrix[agent][casino] = (matrix[agent][casino] || 0) + 1;
      matrix[agent]._total = (matrix[agent]._total || 0) + 1;
    }
    return matrix;
  },

  /**
   * Employee x Casino matrix (v8 new)
   */
  employeeMatrix: function (bookings) {
    var matrix = {};
    if (!bookings) return matrix;
    for (var i = 0; i < bookings.length; i++) {
      var emp = bookings[i].employee || '\u672A\u5206\u985E';
      var casino = bookings[i].casino || '\u672A\u5206\u985E';
      if (!matrix[emp]) matrix[emp] = {};
      matrix[emp][casino] = (matrix[emp][casino] || 0) + 1;
      matrix[emp]._total = (matrix[emp]._total || 0) + 1;
    }
    return matrix;
  },

  /* ===== Profit Breakdown (v8 new) ===== */

  /**
   * Profit grouped by agent
   * @returns {Object} { '王大帥': { count: N, profit: N, chargeGuest: N, chargeCompany: N }, ... }
   */
  profitByAgent: function (bookings) {
    var result = {};
    if (!bookings) return result;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var agent = b.agent || '\u672A\u5206\u985E';
      if (!result[agent]) result[agent] = { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0 };
      result[agent].count++;
      result[agent].profit += Number(b.profit) || 0;
      result[agent].chargeGuest += Number(b.chargeGuest) || 0;
      result[agent].chargeCompany += Number(b.chargeCompany) || 0;
    }
    return result;
  },

  /**
   * Profit grouped by casino
   * @returns {Object} { '新濠天地': { count: N, profit: N, chargeGuest: N, chargeCompany: N }, ... }
   */
  profitByCasino: function (bookings) {
    var result = {};
    if (!bookings) return result;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var casino = b.casino || '\u672A\u5206\u985E';
      if (!result[casino]) result[casino] = { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0 };
      result[casino].count++;
      result[casino].profit += Number(b.profit) || 0;
      result[casino].chargeGuest += Number(b.chargeGuest) || 0;
      result[casino].chargeCompany += Number(b.chargeCompany) || 0;
    }
    return result;
  },

  /**
   * Profit grouped by employee
   * @returns {Object} { '張小明': { count: N, profit: N, chargeGuest: N, chargeCompany: N }, ... }
   */
  profitByEmployee: function (bookings) {
    var result = {};
    if (!bookings) return result;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var emp = b.employee || '\u672A\u5206\u985E';
      if (!result[emp]) result[emp] = { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0 };
      result[emp].count++;
      result[emp].profit += Number(b.profit) || 0;
      result[emp].chargeGuest += Number(b.chargeGuest) || 0;
      result[emp].chargeCompany += Number(b.chargeCompany) || 0;
    }
    return result;
  },

  /**
   * Financial breakdown by currency (v8 new)
   * Important: profit across different currencies should NOT be naively summed
   * @returns {Object} { HKD: { count: N, chargeGuest: N, chargeCompany: N, profit: N }, ... }
   */
  chargeByCurrency: function (bookings) {
    var result = {};
    if (!bookings) return result;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var curr = b.currency || CURRENCY_DEFAULT;
      if (!result[curr]) result[curr] = { count: 0, chargeGuest: 0, chargeCompany: 0, profit: 0 };
      result[curr].count++;
      result[curr].chargeGuest += Number(b.chargeGuest) || 0;
      result[curr].chargeCompany += Number(b.chargeCompany) || 0;
      result[curr].profit += Number(b.profit) || 0;
    }
    return result;
  },

  /* ===== Fee Statistics (v8 new) ===== */

  /**
   * Fee type breakdown with financial details
   * @returns {Object} { free: { count: N, profit: 0 }, paid: { count: N, profit: N, chargeGuest: N, chargeCompany: N } }
   */
  feeStats: function (bookings) {
    var stats = {
      free: { count: 0, profit: 0 },
      paid: { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0 }
    };
    if (!bookings) return stats;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var fee = b.feeStatus || 'free';
      if (!stats[fee]) stats[fee] = { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0 };
      stats[fee].count++;
      stats[fee].profit += Number(b.profit) || 0;
      if (fee === 'paid') {
        stats[fee].chargeGuest += Number(b.chargeGuest) || 0;
        stats[fee].chargeCompany += Number(b.chargeCompany) || 0;
      }
    }
    return stats;
  },

  /* ===== Top N Rankings ===== */

  /**
   * Top agents by booking count
   * @returns {Array} [{ agent: 'name', count: N, profit: N }, ...]
   */
  topAgents: function (bookings, limit) {
    var profitMap = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in profitMap) {
      arr.push({ agent: name, count: profitMap[name].count, profit: profitMap[name].profit });
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    if (limit) arr = arr.slice(0, limit);
    return arr;
  },

  /**
   * Top casinos by booking count
   * @returns {Array} [{ casino: 'name', count: N, profit: N }, ...]
   */
  topCasinos: function (bookings, limit) {
    var profitMap = Stats.profitByCasino(bookings);
    var arr = [];
    for (var name in profitMap) {
      arr.push({ casino: name, count: profitMap[name].count, profit: profitMap[name].profit });
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    if (limit) arr = arr.slice(0, limit);
    return arr;
  },

  /**
   * Top employees by booking count (v8 new)
   * @returns {Array} [{ employee: 'name', count: N, profit: N }, ...]
   */
  topEmployees: function (bookings, limit) {
    var profitMap = Stats.profitByEmployee(bookings);
    var arr = [];
    for (var name in profitMap) {
      arr.push({ employee: name, count: profitMap[name].count, profit: profitMap[name].profit });
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    if (limit) arr = arr.slice(0, limit);
    return arr;
  },

  /* ===== Trend / Time-based ===== */

  /**
   * Daily booking trend for a specific month
   * Counts how many bookings are active (checked-in but not checked-out) on each day
   * @param {Array} bookings
   * @param {string} month - YYYY-MM
   * @returns {Object} { 'YYYY-MM-01': N, 'YYYY-MM-02': N, ... }
   */
  bookingTrend: function (bookings, month) {
    var days = {};
    if (!bookings || !month) return days;

    /* Generate all days in the month */
    var parts = month.split('-');
    var year = parseInt(parts[0]);
    var mon = parseInt(parts[1]);
    var daysInMonth = new Date(year, mon, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = month + '-' + String(d).padStart(2, '0');
      days[dateStr] = 0;
    }

    /* Count active bookings per day */
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      if (!b.checkIn || !b.checkOut) continue;
      if (b.status === BOOKING_STATUS.CANCELLED) continue;

      /* Walk through each day the booking spans */
      var cur = b.checkIn;
      while (cur && cur < b.checkOut) {
        if (cur.indexOf(month) === 0) {
          days[cur] = (days[cur] || 0) + 1;
        }
        /* Advance one day */
        var dt = new Date(cur);
        dt.setDate(dt.getDate() + 1);
        var y = dt.getFullYear();
        var m = String(dt.getMonth() + 1).padStart(2, '0');
        var dd = String(dt.getDate()).padStart(2, '0');
        cur = y + '-' + m + '-' + dd;
      }
    }

    return days;
  },

  /**
   * Transfer statistics
   */
  transferStats: function (bookings) {
    var stats = { none: 0, airport: 0, ferry: 0, both: 0, custom: 0 };
    if (!bookings) return stats;
    for (var i = 0; i < bookings.length; i++) {
      var t = bookings[i].transfer || 'none';
      stats[t] = (stats[t] || 0) + 1;
    }
    return stats;
  },

  /* ===== Summary (v8 new) ===== */

  /**
   * Overall summary for a set of bookings
   * Combines key stats into one object for quick dashboard rendering
   * @param {Array} bookings
   * @returns {Object} comprehensive summary
   */
  summary: function (bookings) {
    if (!bookings) bookings = [];
    return {
      totalBookings:      bookings.length,
      totalNights:        Stats.totalNights(bookings),
      totalThreshold:     Stats.totalThreshold(bookings),
      totalProfit:        Stats.totalProfit(bookings),
      totalChargeGuest:   Stats.totalChargeGuest(bookings),
      totalChargeCompany: Stats.totalChargeCompany(bookings),
      byStatus:           Stats.countByStatus(bookings),
      byFeeStatus:        Stats.countByFeeStatus(bookings),
      bySmoking:          Stats.countBySmoking(bookings),
      byCurrency:         Stats.countByCurrency(bookings),
      byCasino:           Stats.countByCasino(bookings),
      byAgent:            Stats.countByAgent(bookings),
      byEmployee:         Stats.countByEmployee(bookings),
      byRoomType:         Stats.countByRoomType(bookings),
      feeStats:           Stats.feeStats(bookings),
      chargeByCurrency:   Stats.chargeByCurrency(bookings),
      transferStats:      Stats.transferStats(bookings)
    };
  }
};

/**
 * keyboard.js — Keyboard Shortcuts Manager
 * Booking System v2.0.0 (v8 spec)
 * 7 pages: Ctrl+1~7 | Ctrl+N new | Ctrl+S sync | Ctrl+F search | Ctrl+P print
 */
var Keyboard = (function () {
  var _initialized = false;
  var _helpModalOpen = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    document.addEventListener('keydown', _handleKeyDown);
    console.log('[Keyboard] Shortcuts initialized');
  }

  function _handleKeyDown(e) {
    var tag = e.target.tagName.toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

    /* Ctrl/Cmd combos work even in inputs */
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case '1':
          e.preventDefault();
          Router.switchTo(PAGES.OVERVIEW);
          break;
        case '2':
          e.preventDefault();
          Router.switchTo(PAGES.PROFIT);
          break;
        case '3':
          e.preventDefault();
          Router.switchTo(PAGES.FEES);
          break;
        case '4':
          e.preventDefault();
          Router.switchTo(PAGES.AGENT_PERF);
          break;
        case '5':
          e.preventDefault();
          Router.switchTo(PAGES.ARCHIVES);
          break;
        case '6':
          e.preventDefault();
          Router.switchTo(PAGES.EMPLOYEES);
          break;
        case '7':
          e.preventDefault();
          Router.switchTo(PAGES.HOTEL_CONFIG);
          break;
        case 'n':
          e.preventDefault();
          _openBookingModal();
          break;
        case 's':
          e.preventDefault();
          _triggerSync();
          break;
        case 'f':
          if (!isInput) {
            e.preventDefault();
            _focusSearch();
          }
          break;
        case 'p':
          e.preventDefault();
          window.print();
          break;
      }
      return;
    }

    /* Non-ctrl shortcuts (only when not typing) */
    if (isInput) return;

    switch (e.key) {
      case '?':
        e.preventDefault();
        _toggleHelpModal();
        break;
      case 'Escape':
        _closeAllModals();
        break;
    }
  }

  function _openBookingModal() {
    if (typeof openBookingModal === 'function') {
      openBookingModal();
    } else {
      Events.emit(EVENTS.UI_MODAL_OPEN, { type: 'booking' });
    }
  }

  function _triggerSync() {
    if (typeof syncUploadAll === 'function') {
      syncUploadAll(function () {
        Toast.success('同步完成');
      });
    }
  }

  function _focusSearch() {
    var searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  function _toggleHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (!modal) {
      _createHelpModal();
      modal = document.getElementById('shortcut-help-modal');
    }
    if (_helpModalOpen) {
      _closeHelpModal();
    } else {
      _openHelpModal();
    }
  }

  function _createHelpModal() {
    var overlay = document.createElement('div');
    overlay.id = 'shortcut-help-modal';
    overlay.className = 'modal-overlay';

    var items = SHORTCUTS.map(function (s) {
      return '<div class="shortcut-item">' +
        '<span class="shortcut-action">' + Utils.escapeHtml(s.action) + '</span>' +
        '<span class="shortcut-key">' + Utils.escapeHtml(s.keys) + '</span>' +
        '</div>';
    }).join('');

    overlay.innerHTML =
      '<div class="modal modal-sm">' +
      '  <div class="modal-header">' +
      '    <h3>快捷鍵一覽</h3>' +
      '    <button class="modal-close" onclick="Keyboard.closeHelp()">' +
      '      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="modal-body">' +
      '    <div class="shortcut-list">' + items + '</div>' +
      '  </div>' +
      '</div>';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _closeHelpModal();
    });

    document.body.appendChild(overlay);
  }

  function _openHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (modal) {
      modal.classList.add('visible');
      _helpModalOpen = true;
    }
  }

  function _closeHelpModal() {
    var modal = document.getElementById('shortcut-help-modal');
    if (modal) {
      modal.classList.remove('visible');
      _helpModalOpen = false;
    }
  }

  function _closeAllModals() {
    _closeHelpModal();

    /* Close any open modal-overlay */
    var modals = document.querySelectorAll('.modal-overlay.visible');
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.remove('visible');
    }

    /* Close sidebar on mobile */
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    var backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('visible');

    Events.emit(EVENTS.UI_MODAL_CLOSE);
  }

  return {
    init: init,
    closeHelp: _closeHelpModal
  };
})();

/**
 * toast.js — Toast Notification System
 * Booking System v2.0.0 (v8 spec)
 * Types: success / error / warning / info
 */
var Toast = (function () {
  var _container = null;
  var _toastCount = 0;
  var MAX_TOASTS = 5;
  var DEFAULT_DURATION = 3000;

  function _ensureContainer() {
    if (_container) return _container;
    _container = document.getElementById('toast-container');
    if (!_container) {
      _container = document.createElement('div');
      _container.id = 'toast-container';
      document.body.appendChild(_container);
    }
    return _container;
  }

  function _getIcon(type) {
    var icons = {
      success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
      error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
      warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
      info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
    };
    return icons[type] || icons.info;
  }

  function show(message, type, duration) {
    type = type || 'info';
    duration = duration || DEFAULT_DURATION;

    var container = _ensureContainer();

    // Limit number of toasts
    while (container.children.length >= MAX_TOASTS) {
      container.removeChild(container.firstChild);
    }

    // Create toast element
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<div class="toast-icon">' +
      '  <svg viewBox="0 0 24 24">' + _getIcon(type) + '</svg>' +
      '</div>' +
      '<div class="toast-message">' + Utils.escapeHtml(message) + '</div>';

    container.appendChild(toast);
    _toastCount++;

    // Auto dismiss
    var timer = setTimeout(function () {
      _dismiss(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', function () {
      clearTimeout(timer);
      _dismiss(toast);
    });

    return toast;
  }

  function _dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-out');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  function success(message, duration) {
    return show(message, 'success', duration);
  }

  function error(message, duration) {
    return show(message, 'error', duration || 5000);
  }

  function warning(message, duration) {
    return show(message, 'warning', duration);
  }

  function info(message, duration) {
    return show(message, 'info', duration);
  }

  function clear() {
    var container = _ensureContainer();
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  return {
    show: show,
    success: success,
    error: error,
    warning: warning,
    info: info,
    clear: clear
  };
})();

// Global alias for convenience
function showToast(message, type, duration) {
  Toast.show(message, type, duration);
}

/**
 * modal.js — Modal Dialog System
 * Booking System v2.0.0 (v8 spec)
 * Features: open/close, form hosting, backdrop click, escape, confirm dialog
 */
var Modal = (function () {
  var _activeModal = null;

  /**
   * Open a modal with given HTML content
   * @param {Object} opts - { title, body, footer, size, onClose }
   */
  function open(opts) {
    opts = opts || {};

    // Close any existing modal first
    close();

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var sizeClass = opts.size === 'lg' ? ' modal-lg' :
                    opts.size === 'sm' ? ' modal-sm' : '';

    overlay.innerHTML =
      '<div class="modal' + sizeClass + '">' +
      '  <div class="modal-header">' +
      '    <h3>' + Utils.escapeHtml(opts.title || '') + '</h3>' +
      '    <button class="modal-close" data-modal-close>' +
      '      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-footer">' + opts.footer + '</div>' : '') +
      '</div>';

    document.body.appendChild(overlay);
    _activeModal = { el: overlay, onClose: opts.onClose };

    // Trigger animation
    requestAnimationFrame(function () {
      overlay.classList.add('visible');
    });

    // Close handlers
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-modal-close]')) {
        close();
      }
    });

    Events.emit(EVENTS.UI_MODAL_OPEN, { title: opts.title });
    return overlay;
  }

  /**
   * Close the active modal
   */
  function close() {
    if (!_activeModal) return;
    var overlay = _activeModal.el;
    var onClose = _activeModal.onClose;

    overlay.classList.remove('visible');
    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 200);

    _activeModal = null;

    if (typeof onClose === 'function') {
      try { onClose(); } catch (e) { console.error('[Modal] onClose error:', e); }
    }

    Events.emit(EVENTS.UI_MODAL_CLOSE);
  }

  /**
   * Update modal body content
   */
  function setBody(html) {
    if (!_activeModal) return;
    var body = _activeModal.el.querySelector('.modal-body');
    if (body) body.innerHTML = html;
  }

  /**
   * Update modal footer content
   */
  function setFooter(html) {
    if (!_activeModal) return;
    var footer = _activeModal.el.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = html;
    } else {
      var modal = _activeModal.el.querySelector('.modal');
      footer = document.createElement('div');
      footer.className = 'modal-footer';
      footer.innerHTML = html;
      modal.appendChild(footer);
    }
  }

  /**
   * Check if a modal is currently open
   */
  function isOpen() {
    return _activeModal !== null;
  }

  /**
   * Confirm dialog (promise-free, callback-based)
   */
  function confirm(message, onConfirm, opts) {
    opts = opts || {};
    open({
      title: opts.title || '確認',
      size: 'sm',
      body: '<p style="font-size:var(--fs-md);color:var(--text-secondary);padding:var(--sp-2) 0;">' +
            Utils.escapeHtml(message) + '</p>',
      footer:
        '<button class="btn btn-secondary" data-modal-close>取消</button>' +
        '<button class="btn btn-danger" id="modal-confirm-btn">' +
        Utils.escapeHtml(opts.confirmText || '確認') + '</button>'
    });

    var btn = document.getElementById('modal-confirm-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        close();
        if (typeof onConfirm === 'function') onConfirm();
      });
    }
  }

  return {
    open: open,
    close: close,
    setBody: setBody,
    setFooter: setFooter,
    isOpen: isOpen,
    confirm: confirm
  };
})();

// Global aliases
function closeModal() { Modal.close(); }

/**
 * overview.js — Overview / Dashboard Page
 * Booking System v2.0.0 (v8 spec)
 * Renders: KPI cards (bookings/nights/threshold/profit) + status distribution + recent bookings + fee breakdown
 */
var OverviewPage = (function () {

  function render() {
    var container = document.getElementById('page-overview');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var allBookings = Bookings.getAll();
    var monthBookings = Filters.filterBookings(allBookings, { month: month });

    var summ = Stats.summary(monthBookings);
    var total = summ.totalBookings;

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>總覽 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '    <button class="btn btn-primary" onclick="openBookingModal()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增訂房';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';

    html += _kpiCard('kpi-blue', '本月訂房數', total, '間', '所有訂房記錄',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');

    html += _kpiCard('kpi-green', '總房晚數', summ.totalNights, '晚', '一訂房 = 一房',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>');

    html += _kpiCard('kpi-gold', '總洗碼門檻', Utils.formatNumber(summ.totalThreshold), '', '所有訂房門檻總和',
      '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>');

    html += _kpiCard('kpi-amber', '總利潤', Utils.formatCurrency(summ.totalProfit, CURRENCY_DEFAULT), '', '向客人收 - 交公司',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');

    html += '</div>';

    /* Second row: status distribution + recent bookings */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-4);">';

    /* Status distribution */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>';
    html += '    狀態分佈';
    html += '  </div>';
    var sc = summ.byStatus;
    html += _statusRow('待確認', sc.pending || 0, total, UI_COLORS.statusPending);
    html += _statusRow('已確認', sc.confirmed || 0, total, UI_COLORS.statusConfirmed);
    html += _statusRow('已入住', sc['checked-in'] || 0, total, UI_COLORS.statusCheckedIn);
    html += _statusRow('已退房', sc['checked-out'] || 0, total, UI_COLORS.statusCheckedOut);
    html += _statusRow('已取消', sc.cancelled || 0, total, UI_COLORS.statusCancelled);
    html += '</div>';

    /* Fee breakdown */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>';
    html += '    費用分佈';
    html += '  </div>';
    var fs = summ.feeStats;
    html += _statRow('免費房', fs.free.count + ' 間', 'fee-badge free');
    html += _statRow('收費房', fs.paid.count + ' 間', 'fee-badge paid');
    if (fs.paid.count > 0) {
      html += '<div style="border-top:1px solid var(--border-default);margin-top:var(--sp-2);padding-top:var(--sp-2);">';
      html += _statRow('向客人收', Utils.formatCurrency(fs.paid.chargeGuest, CURRENCY_DEFAULT), '');
      html += _statRow('交公司', Utils.formatCurrency(fs.paid.chargeCompany, CURRENCY_DEFAULT), '');
      html += _statRow('利潤', Utils.formatCurrency(fs.paid.profit, CURRENCY_DEFAULT), '');
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';

    /* Recent bookings */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>';
    html += '    最近訂房';
    html += '  </div>';

    var recent = Filters.sortBookings(monthBookings, '_createdAt', false).slice(0, 8);
    if (recent.length === 0) {
      html += _emptyStateMini('暫無訂房記錄，點擊「新增訂房」開始');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint' + (recent.length > 0 ? ' scrollable' : '') + '">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>客人</th><th>體系</th><th>入住</th><th>退房</th><th>晚</th><th>代理</th><th>費用</th><th>狀態</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < recent.length; i++) {
        html += _recentRow(recent[i]);
      }
      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header">';
    html += '    <span class="kpi-label">' + Utils.escapeHtml(label) + '</span>';
    html += '    <div class="kpi-icon">' + iconSvg + '</div>';
    html += '  </div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _statusRow(label, count, total, color) {
    var pct = total > 0 ? (count / total * 100) : 0;
    var html = '<div class="stat-row">';
    html += '  <span class="stat-label" style="display:flex;align-items:center;gap:6px;">';
    html += '    <span style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></span>';
    html += '    ' + Utils.escapeHtml(label);
    html += '  </span>';
    html += '  <span class="stat-value">' + count + ' <span style="color:var(--text-muted);font-weight:400;font-size:var(--fs-xs);">(' + pct.toFixed(0) + '%)</span></span>';
    html += '</div>';
    return html;
  }

  function _statRow(label, value, badgeClass) {
    var valHtml = badgeClass ? '<span class="' + badgeClass + '">' + value + '</span>' : value;
    return '<div class="stat-row"><span class="stat-label">' + Utils.escapeHtml(label) + '</span><span class="stat-value">' + valHtml + '</span></div>';
  }

  function _recentRow(b) {
    var html = '<tr style="cursor:pointer;" onclick="viewBookingDetail(\'' + b._fbKey + '\')">';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkOut) + '</td>';
    html += '<td class="num-cell">' + (b.nights || 0) + '</td>';
    html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td><span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span></td>';
    html += '<td>' + _statusBadge(b.status) + '</td>';
    html += '</tr>';
    return html;
  }

  function _statusBadge(status) {
    return '<span class="status-badge status-' + status + '">' + Utils.escapeHtml(BOOKING_STATUS_LABELS[status] || status) + '</span>';
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' +
           Utils.escapeHtml(text) + '</div>';
  }

  return { render: render };
})();

function renderOverview() { OverviewPage.render(); }

/**
 * profit.js — Profit Settlement Page (Ctrl+2)
 * Booking System v2.0.0 (v8 spec)
 * Renders: KPI (profit/chargeGuest/chargeCompany) + profit by agent + profit by casino + by currency + detail table
 */
var ProfitPage = (function () {

  var _sortField = 'profit';
  var _sortAsc = false;

  function render() {
    var container = document.getElementById('page-profit');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var paidBookings = monthBookings.filter(function (b) {
      return b.feeStatus === FEE_TYPES.PAID;
    });

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>利潤結算 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    var totalProfit = Stats.totalProfit(paidBookings);
    var totalGuest = Stats.totalChargeGuest(paidBookings);
    var totalCompany = Stats.totalChargeCompany(paidBookings);

    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-amber', '總利潤', Utils.formatCurrency(totalProfit, CURRENCY_DEFAULT), '', '向客人收 - 交公司',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += _kpiCard('kpi-blue', '向客人收', Utils.formatCurrency(totalGuest, CURRENCY_DEFAULT), '', '收費房合計',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>');
    html += _kpiCard('kpi-green', '交公司', Utils.formatCurrency(totalCompany, CURRENCY_DEFAULT), '', '交賭場合計',
      '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>');
    html += _kpiCard('kpi-gold', '收費房數', paidBookings.length, '間', '本月收費訂房',
      '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>');
    html += '</div>';

    /* Profit by currency (important: don't mix currencies) */
    var byCurrency = Stats.chargeByCurrency(paidBookings);
    var currencyKeys = Object.keys(byCurrency);
    if (currencyKeys.length > 0) {
      html += '<div class="card" style="margin-bottom:var(--sp-4);">';
      html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M7 15h2v2H7zm0 4h2v-2H7zm4-4h2v2h-2zm0 4h2v-2h-2zm4-4h2v2h-2zm0 4h2v-2h-2z"/><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg></div>分幣別結算</div>';
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>幣別</th><th class="num-cell">筆數</th><th class="num-cell">向客人收</th><th class="num-cell">交公司</th><th class="num-cell">利潤</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < currencyKeys.length; i++) {
        var curr = currencyKeys[i];
        var c = byCurrency[curr];
        html += '<tr>';
        html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
        html += '<td class="num-cell">' + c.count + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(c.chargeGuest, curr) + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(c.chargeCompany, curr) + '</td>';
        html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(c.profit, curr) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      html += '</div>';
    }

    /* Two columns: by agent + by casino */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-4);">';

    /* Profit by agent */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>代理利潤</div>';
    html += _profitByAgentTable(paidBookings);
    html += '</div>';

    /* Profit by casino */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>體系利潤</div>';
    html += _profitByCasinoTable(paidBookings);
    html += '</div>';

    html += '</div>';

    /* Detail table */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>收費明細</div>';
    html += _detailTable(paidBookings);
    html += '</div>';

    container.innerHTML = html;
  }

  function _profitByAgentTable(bookings) {
    var map = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in map) {
      arr.push({ agent: name, count: map[name].count, profit: map[name].profit, chargeGuest: map[name].chargeGuest, chargeCompany: map[name].chargeCompany });
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無收費記錄');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>代理</th><th class="num-cell">筆</th><th class="num-cell">利潤</th></tr></thead><tbody>';
    for (var i = 0; i < arr.length; i++) {
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(arr[i].agent) + '</td>';
      html += '<td class="num-cell">' + arr[i].count + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }
    html += '</tbody></table></div></div>';
    return html;
  }

  function _profitByCasinoTable(bookings) {
    var map = Stats.profitByCasino(bookings);
    var arr = [];
    for (var name in map) {
      arr.push({ casino: name, count: map[name].count, profit: map[name].profit });
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無收費記錄');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>體系</th><th class="num-cell">筆</th><th class="num-cell">利潤</th></tr></thead><tbody>';
    for (var i = 0; i < arr.length; i++) {
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(arr[i].casino) + '</td>';
      html += '<td class="num-cell">' + arr[i].count + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }
    html += '</tbody></table></div></div>';
    return html;
  }

  function _detailTable(bookings) {
    if (bookings.length === 0) return _emptyStateMini('暫無收費記錄');

    var sorted = Filters.sortBookings(bookings, _sortField, _sortAsc);

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr>';
    html += _th('客人', 'guestName');
    html += _th('代理', 'agent');
    html += _th('體系', 'casino');
    html += _th('入住', 'checkIn');
    html += _th('晚', 'nights', 'num-cell');
    html += _th('幣別', 'currency');
    html += '<th class="num-cell">向客人收</th>';
    html += '<th class="num-cell">交公司</th>';
    html += '<th class="num-cell">利潤</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < sorted.length; i++) {
      var b = sorted[i];
      var curr = b.currency || CURRENCY_DEFAULT;
      html += '<tr style="cursor:pointer;" onclick="viewBookingDetail(\'' + b._fbKey + '\')">';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
      html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
      html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
      html += '<td class="num-cell">' + (b.nights || 0) + '</td>';
      html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
      html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeGuest, curr) + '</td>';
      html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeCompany, curr) + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(b.profit, curr) + '</td>';
      html += '</tr>';
    }

    /* Totals row */
    html += '<tr style="background:var(--bg-base);font-weight:700;"><td colspan="5">合計 ' + sorted.length + ' 筆</td>';
    html += '<td></td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(Stats.totalChargeGuest(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(Stats.totalChargeCompany(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '<td class="num-cell" style="color:var(--color-warning);">' + Utils.formatCurrency(Stats.totalProfit(sorted), CURRENCY_DEFAULT) + '</td>';
    html += '</tr>';

    html += '</tbody></table></div></div>';
    return html;
  }

  function _th(label, field, extraClass) {
    var cls = extraClass || '';
    var sortIcon = '';
    if (field === _sortField) {
      sortIcon = _sortAsc ? ' \u25B2' : ' \u25BC';
    }
    return '<th class="' + cls + '" style="cursor:pointer;" onclick="ProfitPage.sortBy(\'' + field + '\')">' + label + sortIcon + '</th>';
  }

  function sortBy(field) {
    if (field === _sortField) {
      _sortAsc = !_sortAsc;
    } else {
      _sortField = field;
      _sortAsc = true;
    }
    render();
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    sortBy: sortBy
  };
})();

function renderProfit() { ProfitPage.render(); }

/**
 * fees.js — Fee Collection Page (Ctrl+3)
 * Booking System v2.0.0 (v8 spec)
 * Accountant fills in charge amounts; employees only select free/paid
 * Renders: KPI (free/paid counts) + fee status table + inline edit for amounts
 */
var FeesPage = (function () {

  var _filterFee = '';  /* '', 'free', 'paid' */

  function render() {
    var container = document.getElementById('page-fees');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>費用收取 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-green', '免費房', feeCounts.free, '間', '無需收費',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-amber', '收費房', feeCounts.paid, '間', '需填入金額',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    if (feeStatsData.paid.count > 0) {
      html += _kpiCard('kpi-blue', '向客人收合計', Utils.formatCurrency(feeStatsData.paid.chargeGuest, CURRENCY_DEFAULT), '', '收費房',
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>');
      html += _kpiCard('kpi-gold', '利潤合計', Utils.formatCurrency(feeStatsData.paid.profit, CURRENCY_DEFAULT), '', '客人收 - 公司',
        '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>');
    }
    html += '</div>';

    /* Quick filter */
    html += '<div class="quick-filters" style="margin-bottom:var(--sp-4);">';
    html += '<button class="quick-filter' + (_filterFee === '' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'\')">全部 (' + monthBookings.length + ')</button>';
    html += '<button class="quick-filter' + (_filterFee === 'free' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'free\')">免費 (' + feeCounts.free + ')</button>';
    html += '<button class="quick-filter' + (_filterFee === 'paid' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'paid\')">收費 (' + feeCounts.paid + ')</button>';
    html += '</div>';

    /* Fee table */
    var filtered = _filterFee ? monthBookings.filter(function (b) { return b.feeStatus === _filterFee; }) : monthBookings;
    var sorted = Filters.sortBookings(filtered, 'checkIn', true);

    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>費用明細</div>';

    if (sorted.length === 0) {
      html += _emptyStateMini('暫無記錄');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>客人</th><th>代理</th><th>體系</th><th>酒店/房型</th><th>入住</th><th>退房</th>';
      html += '<th>費用</th><th>幣別</th><th class="num-cell">向客人收</th><th class="num-cell">交公司</th><th class="num-cell">利潤</th><th>操作</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < sorted.length; i++) {
        html += _feeRow(sorted[i]);
      }

      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function _feeRow(b) {
    var curr = b.currency || CURRENCY_DEFAULT;
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var rules = STATUS_RULES[b.status] || { canEdit: true };

    var html = '<tr>';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
    html += '<td><div style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.hotel || '-') + '</div><div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(_roomTypeLabel(b.roomType)) + '</div></td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkOut) + '</td>';
    html += '<td><span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span></td>';
    html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';

    if (isPaid) {
      /* Editable amounts for paid bookings */
      if (rules.canEdit) {
        html += '<td class="num-cell"><input type="number" class="fee-input" value="' + (b.chargeGuest || 0) + '" onchange="FeesPage.updateAmount(\'' + b._fbKey + '\',\'chargeGuest\',this.value)" style="width:80px;"></td>';
        html += '<td class="num-cell"><input type="number" class="fee-input" value="' + (b.chargeCompany || 0) + '" onchange="FeesPage.updateAmount(\'' + b._fbKey + '\',\'chargeCompany\',this.value)" style="width:80px;"></td>';
      } else {
        html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeGuest, curr) + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeCompany, curr) + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(b.profit, curr) + '</td>';
    } else {
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
    }

    /* Action: toggle free/paid */
    html += '<td>';
    if (rules.canEdit) {
      if (isPaid) {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + b._fbKey + '\',\'free\')">改免費</button>';
      } else {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + b._fbKey + '\',\'paid\')">改收費</button>';
      }
    } else {
      html += '<span style="color:var(--text-muted);font-size:var(--fs-xs);">已鎖定</span>';
    }
    html += '</td>';

    html += '</tr>';
    return html;
  }

  function updateAmount(fbKey, field, value) {
    var num = Number(value) || 0;
    var data = {};
    data[field] = num;
    var updated = Bookings.update(fbKey, data);
    if (updated) {
      Toast.success('已更新 ' + (field === 'chargeGuest' ? '向客人收' : '交公司') + ': ' + Utils.formatCurrency(num, updated.currency));
      render();
    }
  }

  function toggleFee(fbKey, newFee) {
    var data = { feeStatus: newFee };
    if (newFee === FEE_TYPES.FREE) {
      data.chargeGuest = 0;
      data.chargeCompany = 0;
    }
    var updated = Bookings.update(fbKey, data);
    if (updated) {
      Toast.success('已更改為' + (FEE_TYPE_LABELS[newFee] || newFee));
      render();
    }
  }

  function setFilter(fee) {
    _filterFee = fee;
    render();
  }

  function _roomTypeLabel(value) {
    for (var i = 0; i < ROOM_TYPES.length; i++) {
      if (ROOM_TYPES[i].value === value) return ROOM_TYPES[i].label;
    }
    return value || '';
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    updateAmount: updateAmount,
    toggleFee: toggleFee,
    setFilter: setFilter
  };
})();

function renderFees() { FeesPage.render(); }

/**
 * agent-performance.js — Agent Performance Page (Ctrl+4)
 * Booking System v2.0.0 (v8 spec)
 * Renders: KPI + agent × casino matrix + agent ranking + per-agent breakdown
 * Note: Agents != Employees (agents represent customers, employees operate the Bot)
 */
var AgentPerfPage = (function () {

  function render() {
    var container = document.getElementById('page-agent-performance');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var activeAgents = Agents.getAllNames();

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>代理業績 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    var totalProfit = Stats.totalProfit(monthBookings.filter(function (b) { return b.feeStatus === 'paid'; }));
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '活躍代理', activeAgents.length, '位', '本月有訂房代理',
      '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>');
    html += _kpiCard('kpi-green', '總訂房數', monthBookings.length, '間', '本月所有訂房',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');
    html += _kpiCard('kpi-amber', '收費房利潤', Utils.formatCurrency(totalProfit, CURRENCY_DEFAULT), '', '收費房合計',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += _kpiCard('kpi-gold', '總房晚', Stats.totalNights(monthBookings), '晚', '一訂房 = 一房',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>');
    html += '</div>';

    /* Agent × Casino matrix */
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>代理 × 體系 矩陣</div>';
    html += _agentMatrixTable(monthBookings);
    html += '</div>';

    /* Two columns: ranking + profit breakdown */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);">';

    /* Agent ranking by count */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></div>訂房排行</div>';
    html += _rankingTable(Stats.topAgents(monthBookings, 10), 'agent', '訂房數');
    html += '</div>';

    /* Agent profit ranking */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>利潤排行</div>';
    html += _profitRankingTable(monthBookings);
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
  }

  function _agentMatrixTable(bookings) {
    var matrix = Stats.agentMatrix(bookings);
    var agents = [];
    for (var a in matrix) {
      agents.push({ name: a, total: matrix[a]._total || 0 });
    }
    agents.sort(function (x, y) { return y.total - x.total; });

    /* Collect all casinos from data + preset */
    var casinos = CASINO_ORDER.slice();
    for (var ag in matrix) {
      for (var ck in matrix[ag]) {
        if (ck !== '_total' && casinos.indexOf(ck) === -1) casinos.push(ck);
      }
    }

    if (agents.length === 0) return _emptyStateMini('暫無數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="matrix-table"><thead><tr><th>代理</th>';
    for (var i = 0; i < casinos.length; i++) {
      html += '<th class="num-cell">' + Utils.escapeHtml(casinos[i]) + '</th>';
    }
    html += '<th class="num-cell">合計</th></tr></thead><tbody>';

    var grandTotal = 0;
    for (var j = 0; j < agents.length; j++) {
      var row = matrix[agents[j].name];
      html += '<tr><td style="font-weight:600;">' + Utils.escapeHtml(agents[j].name) + '</td>';
      for (var ci = 0; ci < casinos.length; ci++) {
        var count = row[casinos[ci]] || 0;
        html += '<td class="num-cell">' + (count || '-') + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-primary);">' + (row._total || 0) + '</td></tr>';
      grandTotal += (row._total || 0);
    }

    /* Totals row */
    html += '<tr style="background:var(--bg-base);font-weight:700;"><td>合計</td>';
    for (var ck2 = 0; ck2 < casinos.length; ck2++) {
      var colTotal = 0;
      for (var ai = 0; ai < agents.length; ai++) {
        colTotal += (matrix[agents[ai].name][casinos[ck2]] || 0);
      }
      html += '<td class="num-cell">' + (colTotal || '-') + '</td>';
    }
    html += '<td class="num-cell" style="color:var(--color-primary);">' + grandTotal + '</td></tr>';

    html += '</tbody></table></div></div>';
    return html;
  }

  function _rankingTable(items, field, label) {
    if (!items || items.length === 0) return _emptyStateMini('暫無數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>#</th><th>代理</th><th class="num-cell">' + label + '</th></tr></thead><tbody>';

    for (var i = 0; i < items.length; i++) {
      var rank = i + 1;
      var rankIcon = rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : rank === 3 ? '\uD83E\uDD49' : rank;
      html += '<tr><td style="text-align:center;">' + rankIcon + '</td>';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(items[i][field]) + '</td>';
      html += '<td class="num-cell">' + items[i].count + '</td></tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  }

  function _profitRankingTable(bookings) {
    var map = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in map) {
      if (map[name].profit > 0) {
        arr.push({ agent: name, profit: map[name].profit, count: map[name].count });
      }
    }
    arr.sort(function (a, b) { return b.profit - a.profit; });

    if (arr.length === 0) return _emptyStateMini('暫無利潤數據');

    var html = '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
    html += '<table class="data-table"><thead><tr><th>#</th><th>代理</th><th class="num-cell">利潤</th></tr></thead><tbody>';

    for (var i = 0; i < arr.length; i++) {
      var rank = i + 1;
      var rankIcon = rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : rank === 3 ? '\uD83E\uDD49' : rank;
      html += '<tr><td style="text-align:center;">' + rankIcon + '</td>';
      html += '<td style="font-weight:600;">' + Utils.escapeHtml(arr[i].agent) + '</td>';
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(arr[i].profit, CURRENCY_DEFAULT) + '</td></tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return { render: render };
})();

function renderAgentPerformance() { AgentPerfPage.render(); }

/**
 * archives.js — History & Audit Page (Ctrl+5)
 * Booking System v2.0.0 (v8 spec)
 * Auto-archive on checkout/cancel. Permanent retention, multi-dimensional query.
 * Renders: KPI + filters + archive records table + summary
 */
var ArchivesPage = (function () {

  var _filters = {};
  var _sortField = 'archivedAt';
  var _sortAsc = false;
  var _currentPage = 1;
  var _perPage = 20;

  function render() {
    var container = document.getElementById('page-archives');
    if (!container) return;

    var allArchives = Archives.getAll();
    var stats = Archives.getStats(allArchives);

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>歷史核帳</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '歸檔總數', stats.total, '筆', '永久保留',
      '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>');
    html += _kpiCard('kpi-green', '已退房', stats.checkedOut, '筆', '正常退房歸檔',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-red', '已取消', stats.cancelled, '筆', '取消訂房歸檔',
      '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>');
    html += _kpiCard('kpi-amber', '總利潤', Utils.formatCurrency(stats.totalProfit, CURRENCY_DEFAULT), '', '所有歸檔利潤',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    html += '</div>';

    /* Filter bar */
    html += '<div class="filter-bar">';
    html += '  <div class="filter-item"><label>月份</label><input type="month" id="ar-filter-month" value="' + (_filters.month || '') + '" onchange="ArchivesPage.onFilterChange()"></div>';

    html += '  <div class="filter-item"><label>體系</label><select id="ar-filter-casino" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    var casinos = Hotels.getCasinos();
    for (var i = 0; i < casinos.length; i++) {
      html += '<option value="' + Utils.escapeHtml(casinos[i]) + '"' + (_filters.casino === casinos[i] ? ' selected' : '') + '>' + Utils.escapeHtml(casinos[i]) + '</option>';
    }
    html += '  </select></div>';

    html += '  <div class="filter-item"><label>代理</label><select id="ar-filter-agent" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    var agentNames = Agents.getAllNames();
    for (var a = 0; a < agentNames.length; a++) {
      html += '<option value="' + Utils.escapeHtml(agentNames[a]) + '"' + (_filters.agent === agentNames[a] ? ' selected' : '') + '>' + Utils.escapeHtml(agentNames[a]) + '</option>';
    }
    html += '  </select></div>';

    html += '  <div class="filter-item"><label>狀態</label><select id="ar-filter-status" onchange="ArchivesPage.onFilterChange()"><option value="">全部</option>';
    html += '<option value="checked-out"' + (_filters.status === 'checked-out' ? ' selected' : '') + '>已退房</option>';
    html += '<option value="cancelled"' + (_filters.status === 'cancelled' ? ' selected' : '') + '>已取消</option>';
    html += '  </select></div>';

    html += '  <div class="filter-spacer"></div>';

    html += '  <div class="search-box" style="width:200px;">';
    html += '    <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
    html += '    <input type="text" id="ar-search" placeholder="搜索..." value="' + Utils.escapeHtml(_filters.keyword || '') + '" oninput="ArchivesPage.onSearchChange(this.value)">';
    html += '  </div>';

    html += '  <button class="btn btn-ghost btn-sm" onclick="ArchivesPage.clearFilters()">清除</button>';
    html += '</div>';

    /* Apply filters and render table */
    var filtered = Archives.search(_filters);
    var sorted = Filters.sortBookings(filtered, _sortField, _sortAsc);
    var total = sorted.length;
    var totalPages = Math.max(1, Math.ceil(total / _perPage));
    if (_currentPage > totalPages) _currentPage = totalPages;
    var pageData = Filters.paginate(sorted, _currentPage, _perPage);

    /* Summary for filtered results */
    if (total > 0) {
      var filteredStats = Archives.getStats(sorted);
      html += '<div class="card" style="margin-bottom:var(--sp-4);">';
      html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg></div>篩選結果匯總</div>';
      html += '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sp-3);">';
      html += '    <div class="stat-row"><span class="stat-label">筆數</span><span class="stat-value">' + filteredStats.total + '</span></div>';
      html += '    <div class="stat-row"><span class="stat-label">退房</span><span class="stat-value">' + filteredStats.checkedOut + '</span></div>';
      html += '    <div class="stat-row"><span class="stat-label">取消</span><span class="stat-value">' + filteredStats.cancelled + '</span></div>';
      html += '    <div class="stat-row"><span class="stat-label">利潤</span><span class="stat-value" style="color:var(--color-warning);font-weight:700;">' + Utils.formatCurrency(filteredStats.totalProfit, CURRENCY_DEFAULT) + '</span></div>';
      html += '  </div>';
      html += '</div>';
    }

    /* Archive table */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>歸檔記錄 (' + total + ' 筆)</div>';

    if (pageData.length === 0) {
      html += _emptyState();
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += _th('客人', 'guestName');
      html += _th('代理', 'agent');
      html += _th('體系', 'casino');
      html += _th('入住', 'checkIn');
      html += _th('退房', 'checkOut');
      html += _th('晚', 'nights', 'num-cell');
      html += _th('最終狀態', 'finalStatus');
      html += _th('幣別', 'currency');
      html += _th('費用', 'feeStatus');
      html += _th('利潤', 'profit', 'num-cell');
      html += _th('歸檔時間', 'archivedAt');
      html += '</tr></thead><tbody>';

      for (var i = 0; i < pageData.length; i++) {
        html += _archiveRow(pageData[i]);
      }

      html += '</tbody></table></div></div>';

      /* Pagination */
      if (total > _perPage) {
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-3);">';
        html += '<span style="font-size:var(--fs-sm);color:var(--text-muted);">共 ' + total + ' 筆，第 ' + _currentPage + '/' + totalPages + ' 頁</span>';
        html += '<div style="display:flex;gap:var(--sp-2);">';
        html += '<button class="btn btn-secondary btn-sm" ' + (_currentPage <= 1 ? 'disabled' : '') + ' onclick="ArchivesPage.goPage(' + (_currentPage - 1) + ')">上一頁</button>';
        html += '<button class="btn btn-secondary btn-sm" ' + (_currentPage >= totalPages ? 'disabled' : '') + ' onclick="ArchivesPage.goPage(' + (_currentPage + 1) + ')">下一頁</button>';
        html += '</div></div>';
      }
    }

    html += '</div>';

    container.innerHTML = html;
  }

  function _archiveRow(a) {
    var curr = a.currency || CURRENCY_DEFAULT;
    var html = '<tr>';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(a.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(a.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(a.casino || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(a.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(a.checkOut) + '</td>';
    html += '<td class="num-cell">' + (a.nights || 0) + '</td>';
    /* Use finalStatus for archive badge */
    var fsLabel = BOOKING_STATUS_LABELS[a.finalStatus] || a.finalStatus || '-';
    html += '<td><span class="status-badge status-' + a.finalStatus + '">' + Utils.escapeHtml(fsLabel) + '</span></td>';
    html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';
    html += '<td><span class="fee-badge ' + (a.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[a.feeStatus] || '免費') + '</span></td>';
    html += '<td class="num-cell" style="' + (a.profit > 0 ? 'font-weight:700;color:var(--color-warning);' : '') + '">' + Utils.formatCurrency(a.profit, curr) + '</td>';
    /* Archived time */
    var archTime = a.archivedAt ? new Date(a.archivedAt).toLocaleDateString('zh-TW') : '--';
    html += '<td style="font-size:var(--fs-xs);color:var(--text-muted);">' + archTime + '</td>';
    html += '</tr>';
    return html;
  }

  function _th(label, field, extraClass) {
    var cls = extraClass || '';
    var sortIcon = '';
    if (field === _sortField) {
      sortIcon = _sortAsc ? ' \u25B2' : ' \u25BC';
    }
    return '<th class="' + cls + '" style="cursor:pointer;" onclick="ArchivesPage.sortBy(\'' + field + '\')">' + label + sortIcon + '</th>';
  }

  function onFilterChange() {
    _currentPage = 1;
    _filters = {};
    var monthEl = document.getElementById('ar-filter-month');
    var casinoEl = document.getElementById('ar-filter-casino');
    var agentEl = document.getElementById('ar-filter-agent');
    var statusEl = document.getElementById('ar-filter-status');
    if (monthEl && monthEl.value) _filters.month = monthEl.value;
    if (casinoEl && casinoEl.value) _filters.casino = casinoEl.value;
    if (agentEl && agentEl.value) _filters.agent = agentEl.value;
    if (statusEl && statusEl.value) _filters.status = statusEl.value;
    render();
  }

  function onSearchChange(val) {
    _filters.keyword = val || '';
    _currentPage = 1;
    render();
    var search = document.getElementById('ar-search');
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }

  function clearFilters() {
    _filters = {};
    _currentPage = 1;
    render();
  }

  function sortBy(field) {
    if (field === _sortField) {
      _sortAsc = !_sortAsc;
    } else {
      _sortField = field;
      _sortAsc = true;
    }
    render();
  }

  function goPage(page) {
    _currentPage = page;
    render();
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyState() {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>' +
      '<div class="empty-title">暫無歸檔記錄</div>' +
      '<div class="empty-desc">退房或取消的訂房將自動歸檔至此</div>' +
      '</div>';
  }

  return {
    render: render,
    onFilterChange: onFilterChange,
    onSearchChange: onSearchChange,
    clearFilters: clearFilters,
    sortBy: sortBy,
    goPage: goPage
  };
})();

function renderArchives() { ArchivesPage.render(); }

/**
 * employees.js — Employee Management Page (Ctrl+6)
 * Booking System v2.0.0 (v8 spec)
 * Employees != Agents. Employees operate the Telegram Bot.
 * Two-level permissions: Admin (management) / Staff (regular)
 * Renders: KPI + employee cards + add form
 */
var EmployeesPage = (function () {

  function render() {
    var container = document.getElementById('page-employees');
    if (!container) return;

    var allEmployees = Employees.getAll();
    var activeEmployees = allEmployees.filter(function (e) { return e.active !== false; });
    var admins = allEmployees.filter(function (e) { return e.role === EMPLOYEE_ROLES.ADMIN; });

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>員工管理</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-primary" onclick="EmployeesPage.showAddForm()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增員工';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '員工總數', allEmployees.length, '人', '所有授權員工',
      '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>');
    html += _kpiCard('kpi-green', '在職員工', activeEmployees.length, '人', '目前可使用Bot',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-gold', '管理員', admins.length, '人', '最高權限',
      '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>');
    html += _kpiCard('kpi-slate', '停用員工', allEmployees.length - activeEmployees.length, '人', '保留歷史記錄',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>');
    html += '</div>';

    /* Bot commands reference */
    html += '<div class="card" style="margin-bottom:var(--sp-4);">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg></div>Bot 指令一覽</div>';
    html += '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-2);">';
    for (var ci = 0; ci < BOT_COMMANDS.length; ci++) {
      var cmd = BOT_COMMANDS[ci];
      html += '<div style="padding:var(--sp-2) var(--sp-3);background:var(--bg-base);border-radius:var(--radius-md);">';
      html += '<div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-primary);">' + Utils.escapeHtml(cmd.label) + '</div>';
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(cmd.desc) + '</div>';
      if (cmd.adminOnly) {
        html += '<span style="font-size:var(--fs-xs);color:var(--color-warning);">[管理員]</span>';
      }
      html += '</div>';
    }
    html += '  </div>';
    html += '</div>';

    /* Employee cards */
    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>員工列表</div>';

    if (allEmployees.length === 0) {
      html += _emptyState();
    } else {
      /* Sort: active first, then admins first, then by name */
      var sorted = allEmployees.slice().sort(function (a, b) {
        if ((a.active !== false) !== (b.active !== false)) return a.active !== false ? -1 : 1;
        if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--sp-3);">';
      for (var i = 0; i < sorted.length; i++) {
        html += _employeeCard(sorted[i]);
      }
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function _employeeCard(emp) {
    var isActive = emp.active !== false;
    var isAdmin = emp.role === EMPLOYEE_ROLES.ADMIN;
    var initial = (emp.name || '?').charAt(0).toUpperCase();

    var html = '<div class="employee-card' + (!isActive ? ' inactive' : '') + '">';
    html += '  <div class="emp-avatar"' + (isAdmin ? ' style="background:var(--grad-primary);"' : '') + '>' + Utils.escapeHtml(initial) + '</div>';
    html += '  <div class="emp-info">';
    html += '    <div class="emp-name">' + Utils.escapeHtml(emp.name || '未知') + '</div>';
    html += '    <div class="emp-meta">';
    html += '      <span class="badge badge-' + (isAdmin ? 'blue' : 'slate') + '">' + Utils.escapeHtml(EMPLOYEE_ROLE_LABELS[emp.role] || emp.role) + '</span>';
    html += '      <span style="color:var(--text-muted);font-size:var(--fs-xs);">TG: ' + Utils.escapeHtml(emp.tgId) + '</span>';
    html += '    </div>';
    if (emp.authorizedAt) {
      var authDate = new Date(emp.authorizedAt).toLocaleDateString('zh-TW');
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted);">授權: ' + authDate + '</div>';
    }
    html += '  </div>';
    html += '  <div class="emp-actions">';

    /* Toggle active */
    if (isActive) {
      html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.toggleActive(\'' + emp.id + '\',false)" data-tooltip="停用">停用</button>';
    } else {
      html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.toggleActive(\'' + emp.id + '\',true)" data-tooltip="啟用">啟用</button>';
    }

    /* Toggle role */
    if (isActive) {
      if (isAdmin) {
        html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.setRole(\'' + emp.id + '\',\'staff\')" data-tooltip="降為員工">降為員工</button>';
      } else {
        html += '<button class="btn btn-ghost btn-sm" onclick="EmployeesPage.setRole(\'' + emp.id + '\',\'admin\')" data-tooltip="升為管理員">升管理員</button>';
      }
    }

    /* Remove (complete delete) */
    html += '<button class="btn btn-danger btn-sm" onclick="EmployeesPage.remove(\'' + emp.id + '\')" data-tooltip="刪除">刪除</button>';

    html += '  </div>';
    html += '</div>';
    return html;
  }

  function showAddForm() {
    var body =
      '<div class="form-group">' +
      '  <label>Telegram ID</label>' +
      '  <input type="text" id="emp-tg-id" placeholder="員工的 Telegram ID" autocomplete="off">' +
      '</div>' +
      '<div class="form-group">' +
      '  <label>姓名</label>' +
      '  <input type="text" id="emp-name" placeholder="員工姓名" autocomplete="off">' +
      '</div>' +
      '<div class="form-group">' +
      '  <label>角色</label>' +
      '  <select id="emp-role">' +
      '    <option value="staff">員工</option>' +
      '    <option value="admin">管理員</option>' +
      '  </select>' +
      '</div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:var(--sp-2);">' +
      '  員工授權後可使用 Telegram Bot 進行訂房操作。管理員可使用 /新增授權 指令。' +
      '</p>';

    Modal.open({
      title: '新增員工',
      body: body,
      footer:
        '<button class="btn btn-secondary" data-modal-close>取消</button>' +
        '<button class="btn btn-primary" onclick="EmployeesPage.confirmAdd()">確認新增</button>'
    });
  }

  function confirmAdd() {
    var tgId = document.getElementById('emp-tg-id').value.trim();
    var name = document.getElementById('emp-name').value.trim();
    var role = document.getElementById('emp-role').value;

    if (!tgId) {
      Toast.error('請輸入 Telegram ID');
      return;
    }
    if (!name) {
      Toast.error('請輸入姓名');
      return;
    }

    var existing = Employees.getByTgId(tgId);
    if (existing) {
      Toast.warning('此 Telegram ID 已存在: ' + existing.name);
      return;
    }

    var emp = Employees.add(tgId, name, role);
    if (emp) {
      Toast.success('已新增員工: ' + name);
      Modal.close();
      render();
    } else {
      Toast.error('新增失敗');
    }
  }

  function toggleActive(id, active) {
    if (active) {
      Employees.activate(id);
      Toast.success('已啟用員工');
    } else {
      Modal.confirm('確認停用此員工？停用後將無法使用Bot。', function () {
        Employees.deactivate(id);
        Toast.success('已停用員工');
        render();
      }, { confirmText: '確認停用' });
    }
    if (active) render();
  }

  function setRole(id, role) {
    Employees.setRole(id, role);
    Toast.success('已更改角色為: ' + EMPLOYEE_ROLE_LABELS[role]);
    render();
  }

  function remove(id) {
    Modal.confirm('確認完全刪除此員工？此操作不可復原，歷史記錄將保留但員工帳號將被移除。', function () {
      Employees.remove(id);
      Toast.success('已刪除員工');
      render();
    }, { confirmText: '確認刪除', title: '危險操作' });
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function _emptyState() {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>' +
      '<div class="empty-title">暫無員工</div>' +
      '<div class="empty-desc">點擊「新增員工」授權 Telegram Bot 使用者</div>' +
      '</div>';
  }

  return {
    render: render,
    showAddForm: showAddForm,
    confirmAdd: confirmAdd,
    toggleActive: toggleActive,
    setRole: setRole,
    remove: remove
  };
})();

function renderEmployees() { EmployeesPage.render(); }

/**
 * hotel-config.js — Hotel Configuration Page (Ctrl+7)
 * Booking System v2.0.0 (v8 spec)
 * Tree: casino -> hotel -> roomConfig (6 room types)
 * Management can add/edit/delete at all three levels via Web backend
 * HC synced as single object via syncHCToFirebase()
 */
var HotelConfigPage = (function () {

  function render() {
    var container = document.getElementById('page-hotel-config');
    if (!container) return;

    var hc = Hotels.getAll();
    if (!hc || !hc.casinos) {
      container.innerHTML = '<div class="empty-state"><div class="empty-title">酒店配置未載入</div><button class="btn btn-primary" onclick="HotelConfigPage.loadPresets()">載入預設</button></div>';
      return;
    }

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>酒店設定 <span style="font-size:var(--fs-sm);color:var(--text-muted);font-weight:400;">v' + Utils.escapeHtml(hc.version || '?') + '</span></h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="HotelConfigPage.showAddCasino()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增體系';
    html += '    </button>';
    html += '    <button class="btn btn-ghost" onclick="HotelConfigPage.confirmReset()" data-tooltip="重置為預設">重置預設</button>';
    html += '  </div>';
    html += '</div>';

    /* Summary KPI */
    var totalHotels = 0;
    for (var i = 0; i < hc.casinos.length; i++) {
      totalHotels += hc.casinos[i].hotels.length;
    }
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-blue', '酒店體系', hc.casinos.length, '個', '新濠/金沙/銀河等',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');
    html += _kpiCard('kpi-green', '酒店總數', totalHotels, '間', '各體系下酒店',
      '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>');
    html += _kpiCard('kpi-gold', '房型種類', ROOM_TYPES.length, '種', '所有酒店共用',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>');
    html += '</div>';

    /* Tree view */
    html += '<div class="hc-tree">';

    for (var ci = 0; ci < hc.casinos.length; ci++) {
      var casino = hc.casinos[ci];
      html += _casinoBlock(casino);
    }

    html += '</div>';

    container.innerHTML = html;
  }

  function _casinoBlock(casino) {
    var html = '<div class="hc-casino-block">';
    html += '  <div class="hc-casino-header">';
    html += '    <div style="display:flex;align-items:center;gap:var(--sp-2);">';
    html += '      <svg viewBox="0 0 24 24" style="width:20px;height:20px;color:var(--color-primary);"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    html += '      <h4 style="margin:0;font-size:var(--fs-lg;">' + Utils.escapeHtml(casino.name) + '</h4>';
    html += '      <span class="badge badge-slate">' + casino.hotels.length + ' 間酒店</span>';
    html += '    </div>';
    html += '    <div>';
    html += '      <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.showAddHotel(\'' + Utils.escapeHtml(casino.name) + '\')">新增酒店</button>';
    html += '      <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.renameCasino(\'' + Utils.escapeHtml(casino.name) + '\')">改名</button>';
    html += '      <button class="btn btn-danger btn-sm" onclick="HotelConfigPage.removeCasino(\'' + Utils.escapeHtml(casino.name) + '\')">刪除</button>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="hc-hotel-list">';
    for (var hi = 0; hi < casino.hotels.length; hi++) {
      html += _hotelRow(casino.name, casino.hotels[hi]);
    }
    if (casino.hotels.length === 0) {
      html += '<div style="padding:var(--sp-3);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">此體系下無酒店，點擊「新增酒店」</div>';
    }
    html += '  </div>';

    html += '</div>';
    return html;
  }

  function _hotelRow(casinoName, hotel) {
    var html = '<div class="hc-hotel-row">';
    html += '  <div class="hc-hotel-name">';
    html += '    <svg viewBox="0 0 24 24" style="width:16px;height:16px;color:var(--text-muted);"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>';
    html += '    <span style="font-weight:600;">' + Utils.escapeHtml(hotel.name) + '</span>';
    html += '  </div>';
    html += '  <div class="hc-room-grid">';
    for (var ri = 0; ri < ROOM_TYPES.length; ri++) {
      var rt = ROOM_TYPES[ri];
      var config = (hotel.roomConfig && hotel.roomConfig[rt.value]) || { threshold: 0, defaultPrice: 0 };
      html += _roomCell(casinoName, hotel.name, rt, config);
    }
    html += '  </div>';
    html += '  <div class="hc-hotel-actions">';
    html += '    <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.renameHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotel.name) + '\')">改名</button>';
    html += '    <button class="btn btn-danger btn-sm" onclick="HotelConfigPage.removeHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotel.name) + '\')">刪除</button>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function _roomCell(casinoName, hotelName, roomType, config) {
    var html = '<div class="hc-room-cell">';
    html += '  <div class="hc-room-label">' + Utils.escapeHtml(roomType.short) + '</div>';
    html += '  <div class="hc-room-threshold" onclick="HotelConfigPage.editThreshold(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotelName) + '\',\'' + roomType.value + '\')" title="點擊編輯門檻">';
    html += '    <span style="font-size:var(--fs-xs);color:var(--text-muted);">門檻</span>';
    html += '    <span style="font-weight:600;color:var(--color-primary);">' + Utils.formatNumber(config.threshold || 0) + '</span>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  /* ===== Casino CRUD ===== */

  function showAddCasino() {
    var body =
      '<div class="form-group"><label>體系名稱</label>' +
      '<input type="text" id="hc-casino-name" placeholder="例如：新濠天地" autocomplete="off"></div>';
    Modal.open({
      title: '新增酒店體系',
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmAddCasino()">確認</button>'
    });
  }

  function confirmAddCasino() {
    var name = document.getElementById('hc-casino-name').value.trim();
    if (!name) { Toast.error('請輸入體系名稱'); return; }
    Hotels.addCasino(name);
    Toast.success('已新增體系: ' + name);
    Modal.close();
    render();
  }

  function renameCasino(oldName) {
    var body =
      '<div class="form-group"><label>新名稱</label>' +
      '<input type="text" id="hc-casino-newname" value="' + Utils.escapeHtml(oldName) + '"></div>';
    Modal.open({
      title: '改名體系: ' + oldName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmRenameCasino(\'' + Utils.escapeHtml(oldName) + '\')">確認</button>'
    });
  }

  function confirmRenameCasino(oldName) {
    var newName = document.getElementById('hc-casino-newname').value.trim();
    if (!newName) { Toast.error('請輸入新名稱'); return; }
    Hotels.renameCasino(oldName, newName);
    Toast.success('已改名為: ' + newName);
    Modal.close();
    render();
  }

  function removeCasino(name) {
    Modal.confirm('確認刪除體系「' + name + '」及其所有酒店？此操作將影響訂房功能。', function () {
      Hotels.removeCasino(name);
      Toast.success('已刪除體系: ' + name);
      render();
    }, { confirmText: '確認刪除', title: '危險操作' });
  }

  /* ===== Hotel CRUD ===== */

  function showAddHotel(casinoName) {
    var body =
      '<div class="form-group"><label>酒店名稱</label>' +
      '<input type="text" id="hc-hotel-name" placeholder="例如：摩珀斯" autocomplete="off"></div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);">新酒店將自動生成6種房型預設門檻。</p>';
    Modal.open({
      title: '新增酒店 — ' + casinoName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmAddHotel(\'' + Utils.escapeHtml(casinoName) + '\')">確認</button>'
    });
  }

  function confirmAddHotel(casinoName) {
    var name = document.getElementById('hc-hotel-name').value.trim();
    if (!name) { Toast.error('請輸入酒店名稱'); return; }
    var hotel = Hotels.addHotel(casinoName, name);
    if (hotel) {
      Toast.success('已新增酒店: ' + name);
      Modal.close();
      render();
    }
  }

  function renameHotel(casinoName, oldName) {
    var body =
      '<div class="form-group"><label>新名稱</label>' +
      '<input type="text" id="hc-hotel-newname" value="' + Utils.escapeHtml(oldName) + '"></div>';
    Modal.open({
      title: '改名酒店: ' + oldName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmRenameHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(oldName) + '\')">確認</button>'
    });
  }

  function confirmRenameHotel(casinoName, oldName) {
    var newName = document.getElementById('hc-hotel-newname').value.trim();
    if (!newName) { Toast.error('請輸入新名稱'); return; }
    Hotels.renameHotel(casinoName, oldName, newName);
    Toast.success('已改名為: ' + newName);
    Modal.close();
    render();
  }

  function removeHotel(casinoName, hotelName) {
    Modal.confirm('確認刪除酒店「' + hotelName + '」？', function () {
      Hotels.removeHotel(casinoName, hotelName);
      Toast.success('已刪除酒店: ' + hotelName);
      render();
    }, { confirmText: '確認刪除' });
  }

  /* ===== Room Config Edit ===== */

  function editThreshold(casinoName, hotelName, roomType) {
    var current = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    var rtLabel = '';
    for (var i = 0; i < ROOM_TYPES.length; i++) {
      if (ROOM_TYPES[i].value === roomType) { rtLabel = ROOM_TYPES[i].label; break; }
    }

    var body =
      '<div class="form-group"><label>洗碼門檻</label>' +
      '<input type="number" id="hc-threshold" value="' + (current.threshold || 0) + '" placeholder="0"></div>' +
      '<div class="form-group"><label>預設房價</label>' +
      '<input type="number" id="hc-default-price" value="' + (current.defaultPrice || 0) + '" placeholder="0"></div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(casinoName + ' / ' + hotelName + ' / ' + rtLabel) + '</p>';

    Modal.open({
      title: '編輯房型配置',
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmEditThreshold(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotelName) + '\',\'' + roomType + '\')">確認</button>'
    });
  }

  function confirmEditThreshold(casinoName, hotelName, roomType) {
    var threshold = Number(document.getElementById('hc-threshold').value) || 0;
    var defaultPrice = Number(document.getElementById('hc-default-price').value) || 0;

    Hotels.updateRoomConfig(casinoName, hotelName, roomType, {
      threshold: threshold,
      defaultPrice: defaultPrice
    });

    Toast.success('已更新房型配置');
    Modal.close();
    render();
  }

  /* ===== Reset ===== */

  function confirmReset() {
    Modal.confirm('確認重置所有酒店配置為預設值？所有自定義修改將被覆蓋。', function () {
      Hotels.resetToPreset();
      Toast.success('已重置為預設配置');
      render();
    }, { confirmText: '確認重置', title: '重置預設' });
  }

  function loadPresets() {
    Hotels.loadPresets();
    Toast.success('已載入預設配置');
    render();
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  return {
    render: render,
    showAddCasino: showAddCasino,
    confirmAddCasino: confirmAddCasino,
    renameCasino: renameCasino,
    confirmRenameCasino: confirmRenameCasino,
    removeCasino: removeCasino,
    showAddHotel: showAddHotel,
    confirmAddHotel: confirmAddHotel,
    renameHotel: renameHotel,
    confirmRenameHotel: confirmRenameHotel,
    removeHotel: removeHotel,
    editThreshold: editThreshold,
    confirmEditThreshold: confirmEditThreshold,
    confirmReset: confirmReset,
    loadPresets: loadPresets
  };
})();

function renderHotelConfig() { HotelConfigPage.render(); }

/**
 * bridge.js — HTML <-> JS Bridge (Global Functions)
 * Booking System v2.0.0 (v8 spec)
 * All onclick handlers referenced in HTML and page-generated content are defined here.
 * Page-level modules (FeesPage, ArchivesPage, EmployeesPage, HotelConfigPage, ProfitPage)
 * expose their own methods on their module objects, not here.
 */

/* ============================================================
 * Navigation — delegate to Router
 * ============================================================ */

function navigateTo(pageId) {
  if (typeof Router !== 'undefined') Router.navigateTo(pageId);
}

function prevMonth() {
  if (typeof Router !== 'undefined') Router.prevMonth();
}

function nextMonth() {
  if (typeof Router !== 'undefined') Router.nextMonth();
}

/* ============================================================
 * Sidebar toggle — delegate to Router
 * ============================================================ */

function toggleSidebar() {
  if (typeof Router !== 'undefined') Router.toggleSidebar();
}

function closeSidebar() {
  if (typeof Router !== 'undefined') Router.closeSidebar();
}

/* ============================================================
 * Booking Modal — Create / Edit / View / Delete
 * v8 fields: guestName, agent, employee, casino, hotel, roomType,
 *            checkIn, checkOut, smoking, feeStatus, currency,
 *            chargeGuest, chargeCompany, transfer, pickupName, remark
 * ============================================================ */

var _editingBookingKey = null;

function openBookingModal(presetDate) {
  _editingBookingKey = null;

  var casinos = Hotels.getCasinos();
  var agentNames = Agents.getNames();
  var today = Utils.formatDate(new Date());

  var body = '';
  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.guestName) + ' <span class="required">*</span></label><input type="text" class="form-control" id="bk-guestName" placeholder="\u8f38\u5165\u5ba2\u4eba\u59d3\u540d"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.agent) + ' <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-agent">';
  body += '      <option value="">\u8acb\u9078\u64c7</option>';
  for (var i = 0; i < agentNames.length; i++) {
    body += '      <option value="' + Utils.escapeHtml(agentNames[i]) + '">' + Utils.escapeHtml(agentNames[i]) + '</option>';
  }
  body += '    </select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.casino) + ' <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-casino" onchange="onCasinoChange()">';
  body += '      <option value="">\u8acb\u9078\u64c7</option>';
  for (var c = 0; c < casinos.length; c++) {
    body += '      <option value="' + Utils.escapeHtml(casinos[c]) + '">' + Utils.escapeHtml(casinos[c]) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.hotel) + '</label>';
  body += '    <select class="form-control" id="bk-hotel" onchange="onHotelChange()" disabled><option value="">\u8acb\u5148\u9078\u64c7\u9ad4\u7cfb</option></select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.roomType) + '</label>';
  body += '    <select class="form-control" id="bk-roomType" onchange="onRoomTypeChange()" disabled><option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option></select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.checkIn) + ' <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkIn" value="' + (presetDate || today) + '" onchange="onCheckInChange()"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.checkOut) + ' <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkOut" onchange="onCheckInChange()"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.nights) + '</label><input type="text" class="form-control" id="bk-nights" value="0" readonly style="opacity:0.6;"></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.smoking) + '</label>';
  body += '    <select class="form-control" id="bk-smoking">';
  for (var s = 0; s < SMOKING_OPTIONS.length; s++) {
    body += '      <option value="' + SMOKING_OPTIONS[s].value + '"' + (SMOKING_OPTIONS[s].value === 'unspecified' ? ' selected' : '') + '>' + Utils.escapeHtml(SMOKING_OPTIONS[s].label) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.feeType) + '</label>';
  body += '    <select class="form-control" id="bk-feeStatus" onchange="onFeeStatusChange()">';
  body += '      <option value="free">' + Utils.escapeHtml(FEE_TYPE_LABELS.free) + '</option>';
  body += '      <option value="paid">' + Utils.escapeHtml(FEE_TYPE_LABELS.paid) + '</option>';
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.currency) + '</label>';
  body += '    <select class="form-control" id="bk-currency">';
  for (var cu = 0; cu < CURRENCY_OPTIONS.length; cu++) {
    body += '      <option value="' + CURRENCY_OPTIONS[cu].value + '"' + (CURRENCY_OPTIONS[cu].value === CURRENCY_DEFAULT ? ' selected' : '') + '>' + Utils.escapeHtml(CURRENCY_OPTIONS[cu].label) + '</option>';
  }
  body += '    </select></div>';
  body += '</div>';

  body += '<div class="form-row-3" id="bk-fee-row" style="display:none;">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.chargeGuest) + '</label><input type="number" class="form-control" id="bk-chargeGuest" value="0" min="0"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.chargeCompany) + '</label><input type="number" class="form-control" id="bk-chargeCompany" value="0" min="0"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.threshold) + '</label><input type="number" class="form-control" id="bk-threshold" value="0" readonly style="opacity:0.6;"></div>';
  body += '</div>';

  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.transfer) + '</label>';
  body += '    <select class="form-control" id="bk-transfer">';
  for (var t = 0; t < TRANSFER_OPTIONS.length; t++) {
    body += '      <option value="' + TRANSFER_OPTIONS[t].value + '">' + Utils.escapeHtml(TRANSFER_OPTIONS[t].label) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.pickupName) + '</label><input type="text" class="form-control" id="bk-pickupName" placeholder="\u8209\u724c\u540d\u7a31"></div>';
  body += '</div>';

  body += '<div class="form-group"><label>' + Utils.escapeHtml(TERMS.remark) + '</label><textarea class="form-control" id="bk-remark" rows="2" placeholder="\u5099\u8a3b"></textarea>';

  var footer = '<button class="btn btn-secondary" data-modal-close>\u53d6\u6d88</button>';
  footer += '<button class="btn btn-primary" onclick="saveBookingForm()">\u5132\u5b58\u8a02\u623f</button>';

  Modal.open({
    title: '\u65b0\u589e\u8a02\u623f',
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function onCasinoChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotelSelect = document.getElementById('bk-hotel');
  var roomSelect = document.getElementById('bk-roomType');

  roomSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option>';
  roomSelect.disabled = true;

  if (!casino) {
    hotelSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9ad4\u7cfb</option>';
    hotelSelect.disabled = true;
    return;
  }

  var hotelNames = Hotels.getHotels(casino);
  hotelSelect.innerHTML = '<option value="">\u8acb\u9078\u64c7</option>';
  for (var i = 0; i < hotelNames.length; i++) {
    hotelSelect.innerHTML += '<option value="' + Utils.escapeHtml(hotelNames[i]) + '">' + Utils.escapeHtml(hotelNames[i]) + '</option>';
  }
  hotelSelect.disabled = false;
}

function onHotelChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotel = document.getElementById('bk-hotel').value;
  var roomSelect = document.getElementById('bk-roomType');

  if (!casino || !hotel) {
    roomSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option>';
    roomSelect.disabled = true;
    return;
  }

  roomSelect.innerHTML = '<option value="">\u8acb\u9078\u64c7</option>';
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    var threshold = Hotels.getThreshold(casino, hotel, ROOM_TYPES[i].value);
    roomSelect.innerHTML += '<option value="' + ROOM_TYPES[i].value + '" data-threshold="' + threshold + '">' +
      Utils.escapeHtml(ROOM_TYPES[i].label) + ' (\u9580\u6abbi ' + Utils.formatNumber(threshold) + ')</option>';
  }
  roomSelect.disabled = false;
}

function onRoomTypeChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotel = document.getElementById('bk-hotel').value;
  var roomType = document.getElementById('bk-roomType').value;
  var thresholdInput = document.getElementById('bk-threshold');

  if (casino && hotel && roomType) {
    var threshold = Hotels.getThreshold(casino, hotel, roomType);
    if (thresholdInput) thresholdInput.value = threshold || 0;
  }
}

function onCheckInChange() {
  var checkIn = document.getElementById('bk-checkIn').value;
  var checkOut = document.getElementById('bk-checkOut').value;
  if (checkIn && checkOut) {
    var nights = Utils.calcNights(checkIn, checkOut);
    document.getElementById('bk-nights').value = nights;
  }
}

function onFeeStatusChange() {
  var feeStatus = document.getElementById('bk-feeStatus').value;
  var feeRow = document.getElementById('bk-fee-row');
  if (feeRow) {
    feeRow.style.display = (feeStatus === 'paid') ? '' : 'none';
  }
}

function saveBookingForm() {
  var data = {
    guestName:      document.getElementById('bk-guestName').value.trim(),
    agent:          document.getElementById('bk-agent').value,
    casino:         document.getElementById('bk-casino').value,
    hotel:          document.getElementById('bk-hotel').value,
    roomType:       document.getElementById('bk-roomType').value,
    checkIn:        document.getElementById('bk-checkIn').value,
    checkOut:       document.getElementById('bk-checkOut').value,
    smoking:        document.getElementById('bk-smoking').value,
    feeStatus:      document.getElementById('bk-feeStatus').value,
    currency:       document.getElementById('bk-currency').value,
    transfer:       document.getElementById('bk-transfer').value,
    pickupName:     document.getElementById('bk-pickupName').value.trim(),
    remark:         document.getElementById('bk-remark').value.trim()
  };

  /* Only include fee amounts if paid */
  if (data.feeStatus === 'paid') {
    data.chargeGuest   = Number(document.getElementById('bk-chargeGuest').value) || 0;
    data.chargeCompany = Number(document.getElementById('bk-chargeCompany').value) || 0;
  }

  /* Get threshold from hidden field */
  var thresholdInput = document.getElementById('bk-threshold');
  if (thresholdInput) {
    data.threshold = Number(thresholdInput.value) || 0;
  }

  /* Validation */
  if (!data.guestName) { Toast.error('\u8acb\u8f38\u5165\u5ba2\u4eba\u59d3\u540d'); return; }
  if (!data.agent) { Toast.error('\u8acb\u9078\u64c7\u4ee3\u7406'); return; }
  if (!data.casino) { Toast.error('\u8acb\u9078\u64c7\u9ad4\u7cfb'); return; }
  if (!data.checkIn || !data.checkOut) { Toast.error('\u8acb\u9078\u64c7\u5165\u4f4f\u548c\u9000\u623f\u65e5\u671f'); return; }

  /* Check for duplicate (warn only) */
  var dups = Bookings.checkDuplicate(data.guestName, data.checkIn, data.casino);
  if (dups.length > 0 && !_editingBookingKey) {
    if (!confirm('\u8b66\u544ai \u540c\u4e00\u5ba2\u4eba + \u540c\u4e00\u65e5\u671f + \u540c\u4e00\u9ad4\u7cfb \u5df2\u6709\u8a02\u623f\u8a18\u9304\uff0c\u662f\u5426\u7e7c\u7e8c\uff1f')) {
      return;
    }
  }

  if (_editingBookingKey) {
    Bookings.update(_editingBookingKey, data);
    Toast.success('\u8a02\u623f\u5df2\u66f4\u65b0');
  } else {
    Bookings.create(data);
    Toast.success('\u8a02\u623f\u5df2\u5efa\u7acb');
  }

  Modal.close();
  Events.emit(EVENTS.UI_RENDER);
}

function editBooking(fbKey) {
  var booking = Bookings.getByKey(fbKey);
  if (!booking) { Toast.error('\u627e\u4e0d\u5230\u8a02\u623f\u8a18\u9304'); return; }

  /* Check edit permission */
  var rules = STATUS_RULES[booking.status] || { canEdit: true };
  if (!rules.canEdit) {
    Toast.warning('\u6b64\u8a02\u623f\u5df2\u9396\u5b9a\uff0c\u4e0d\u53ef\u7de8\u8f2f');
    return;
  }

  _editingBookingKey = fbKey;
  openBookingModal();

  /* Fill form with existing data */
  setTimeout(function () {
    document.getElementById('bk-guestName').value = booking.guestName || '';
    document.getElementById('bk-agent').value = booking.agent || '';
    document.getElementById('bk-casino').value = booking.casino || '';
    onCasinoChange();
    document.getElementById('bk-hotel').value = booking.hotel || '';
    onHotelChange();
    document.getElementById('bk-roomType').value = booking.roomType || '';
    onRoomTypeChange();
    document.getElementById('bk-checkIn').value = booking.checkIn || '';
    document.getElementById('bk-checkOut').value = booking.checkOut || '';
    onCheckInChange();
    document.getElementById('bk-smoking').value = booking.smoking || 'unspecified';
    document.getElementById('bk-feeStatus').value = booking.feeStatus || 'free';
    onFeeStatusChange();
    document.getElementById('bk-currency').value = booking.currency || 'HKD';
    if (booking.feeStatus === 'paid') {
      document.getElementById('bk-chargeGuest').value = booking.chargeGuest || 0;
      document.getElementById('bk-chargeCompany').value = booking.chargeCompany || 0;
    }
    document.getElementById('bk-transfer').value = booking.transfer || 'none';
    document.getElementById('bk-pickupName').value = booking.pickupName || '';
    document.getElementById('bk-remark').value = booking.remark || '';
  }, 50);
}

function viewBookingDetail(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) { Toast.error('\u627e\u4e0d\u5230\u8a02\u623f\u8a18\u9304'); return; }

  var body = '';
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);">';

  body += _detailField(TERMS.guestName, b.guestName);
  body += _detailField(TERMS.agent, b.agent);
  body += _detailField(TERMS.casino, b.casino);
  body += _detailField(TERMS.hotel, b.hotel);
  body += _detailField(TERMS.roomType, _roomTypeLabel(b.roomType));
  body += _detailField(TERMS.checkIn, Utils.formatDateDisplay(b.checkIn));
  body += _detailField(TERMS.checkOut, Utils.formatDateDisplay(b.checkOut));
  body += _detailField(TERMS.nights, b.nights + ' \u665a');
  body += _detailField(TERMS.smoking, _smokingLabel(b.smoking));
  body += _detailField(TERMS.status, BOOKING_STATUS_LABELS[b.status] || b.status);
  body += _detailField(TERMS.confirmNo, b.confirmNo || '--');
  body += _detailField(TERMS.feeType, FEE_TYPE_LABELS[b.feeStatus] || b.feeStatus);
  body += _detailField(TERMS.currency, b.currency || 'HKD');
  body += _detailField(TERMS.chargeGuest, b.feeStatus === 'paid' ? Utils.formatCurrency(b.chargeGuest, b.currency) : '--');
  body += _detailField(TERMS.chargeCompany, b.feeStatus === 'paid' ? Utils.formatCurrency(b.chargeCompany, b.currency) : '--');
  body += _detailField(TERMS.profit, b.feeStatus === 'paid' ? Utils.formatCurrency(b.profit, b.currency) : '--');
  body += _detailField(TERMS.threshold, Utils.formatNumber(b.threshold));
  body += _detailField(TERMS.transfer, _transferLabel(b.transfer));
  body += _detailField(TERMS.pickupName, b.pickupName || '--');
  body += _detailField(TERMS.employee, b.employee || '--');

  body += '</div>';

  if (b.remark) {
    body += '<div class="form-group" style="margin-top:var(--sp-4);"><label>' + Utils.escapeHtml(TERMS.remark) + '</label>';
    body += '<div style="padding:var(--sp-3);background:var(--bg-input);border-radius:var(--radius-md);">' + Utils.escapeHtml(b.remark) + '</div></div>';
  }

  var footer = '<button class="btn btn-secondary" data-modal-close>\u95dc\u9589</button>';
  var rules = STATUS_RULES[b.status] || { canEdit: true };
  if (rules.canEdit) {
    footer += '<button class="btn btn-danger" onclick="deleteBooking(\'' + fbKey + '\')">\u522a\u9664</button>';
    footer += '<button class="btn btn-primary" onclick="Modal.close();editBooking(\'' + fbKey + '\')">\u7de8\u8f2f</button>';
  }

  Modal.open({
    title: '\u8a02\u623f\u8a73\u60c5 \u2014 ' + (b.guestName || ''),
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function deleteBooking(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) return;

  Modal.confirm(
    '\u78ba\u8a8d\u522a\u9664\u300c' + (b.guestName || '') + '\u300d\u7684\u8a02\u623f\u8a18\u9304\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u92b7\u3002',
    function () {
      Bookings.delete(fbKey);
      Toast.success('\u8a02\u623f\u5df2\u522a\u9664');
      Modal.close();
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '\u522a\u9664\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u522a\u9664' }
  );
}

/* ----- helpers ----- */

function _detailField(label, value) {
  return '<div><div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:2px;">' + Utils.escapeHtml(label) + '</div>' +
         '<div style="font-size:var(--fs-sm);font-weight:500;">' + (value !== undefined && value !== null && value !== '' ? Utils.escapeHtml(String(value)) : '--') + '</div></div>';
}

function _roomTypeLabel(val) {
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    if (ROOM_TYPES[i].value === val) return ROOM_TYPES[i].label;
  }
  return val || '--';
}

function _smokingLabel(val) {
  return SMOKING_LABELS[val] || '\u672a\u6307\u5b9a';
}

function _transferLabel(val) {
  for (var i = 0; i < TRANSFER_OPTIONS.length; i++) {
    if (TRANSFER_OPTIONS[i].value === val) return TRANSFER_OPTIONS[i].label;
  }
  return val || '\u7121';
}

/* ============================================================
 * Agent Management — v8: active/deactivate support
 * ============================================================ */

function openAgentModal() {
  var agents = Agents.getAll();
  var body = '<div id="agent-list-container">';

  if (agents.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">\u66ab\u7121\u4ee3\u7406</div><div class="empty-desc">\u9ede\u64ca\u4e0b\u65b9\u6309\u9215\u65b0\u589e\u4ee3\u7406</div></div>';
  } else {
    body += '<div class="data-table-wrap"><div class="data-table-scroll"><table class="data-table"><thead><tr><th>\u4ee3\u7406\u540d\u7a31</th><th>\u72c0\u614b</th><th>\u64cd\u4f5c</th></tr></thead><tbody>';
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var name = a.name || '';
      var isActive = a.active !== false;
      body += '<tr><td>' + Utils.escapeHtml(name) + '</td>';
      body += '<td>' + (isActive ? '<span class="status-badge status-active">\u5553\u7528</span>' : '<span class="status-badge status-inactive">\u505c\u7528</span>') + '</td>';
      body += '<td class="action-cell">';
      if (isActive) {
        body += '<button class="btn btn-ghost btn-sm" onclick="deactivateAgent(\'' + Utils.escapeHtml(name) + '\')">\u505c\u7528</button>';
      } else {
        body += '<button class="btn btn-ghost btn-sm" onclick="activateAgent(\'' + Utils.escapeHtml(name) + '\')">\u5553\u7528</button>';
      }
      body += '<button class="btn btn-danger btn-sm" onclick="removeAgent(\'' + Utils.escapeHtml(name) + '\')">\u522a\u9664</button>';
      body += '</td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  body += '</div>';
  body += '<div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2);">';
  body += '<input type="text" class="form-control" id="new-agent-name" placeholder="\u4ee3\u7406\u540d\u7a31" style="flex:1;">';
  body += '<input type="text" class="form-control" id="new-agent-phone" placeholder="\u624b\u6a5f\u865f\u78bc" style="flex:1;">';
  body += '<button class="btn btn-primary" onclick="addAgentFromModal()">\u65b0\u589e</button>';
  body += '</div>';

  Modal.open({
    title: '\u4ee3\u7406\u540d\u55ae\u7ba1\u7406',
    body: body,
    size: 'md'
  });
}

function addAgentFromModal() {
  var name = document.getElementById('new-agent-name').value.trim();
  var phone = document.getElementById('new-agent-phone').value.trim();
  if (!name) { Toast.error('\u8acb\u8f38\u5165\u4ee3\u7406\u540d\u7a31'); return; }
  Agents.add(name, phone);
  Toast.success('\u4ee3\u7406\u5df2\u65b0\u589e: ' + name);
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

function removeAgent(name) {
  Modal.confirm('\u78ba\u8a8d\u522a\u9664\u4ee3\u7406\u300c' + name + '\u300d\uff1f', function () {
    Agents.remove(name);
    Toast.success('\u4ee3\u7406\u5df2\u522a\u9664');
    Modal.close();
    openAgentModal();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '\u522a\u9664\u4ee3\u7406', confirmText: '\u78ba\u8a8d\u522a\u9664' });
}

function activateAgent(name) {
  Agents.activate(name);
  Toast.success('\u4ee3\u7406\u5df2\u5553\u7528');
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

function deactivateAgent(name) {
  Agents.deactivate(name);
  Toast.success('\u4ee3\u7406\u5df2\u505c\u7528');
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

/* ============================================================
 * Sync Actions
 * ============================================================ */

function manualSync() {
  Toast.info('\u6b63\u5728\u540c\u6b65...');
  if (typeof syncUploadAll === 'function') {
    syncUploadAll(function () {
      Toast.success('\u540c\u6b65\u5b8c\u6210');
    });
  }
}

/* ============================================================
 * Backup Actions — v8: no export/import JSON
 * ============================================================ */

function openBackupModal() {
  var backups = Backup.list();
  var body = '';

  body += '<div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-4);">';
  body += '<button class="btn btn-primary" onclick="createBackup()">\u5efa\u7acb\u5099\u4efd</button>';
  body += '</div>';

  if (backups.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">\u66ab\u7121\u5099\u4efd</div></div>';
  } else {
    body += '<div class="data-table-wrap"><div class="data-table-scroll"><table class="data-table"><thead><tr><th>\u6a19\u7c64</th><th>\u6642\u9593</th><th>\u64cd\u4f5c</th></tr></thead><tbody>';
    for (var i = 0; i < backups.length; i++) {
      body += '<tr><td>' + Utils.escapeHtml(backups[i].label) + '</td>';
      body += '<td>' + new Date(backups[i].timestamp).toLocaleString('zh-TW') + '</td>';
      body += '<td class="action-cell">';
      body += '<button class="btn btn-secondary btn-sm" onclick="restoreBackup(\'' + backups[i].id + '\')">\u9084\u539f</button>';
      body += '<button class="btn btn-danger btn-sm" onclick="deleteBackup(\'' + backups[i].id + '\')">\u522a\u9664</button>';
      body += '</td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  Modal.open({ title: '\u5099\u4efd\u8207\u9084\u539f', body: body, size: 'md' });
}

function createBackup() {
  var label = '\u5099\u4efd ' + new Date().toLocaleString('zh-TW');
  Backup.create(label);
  Toast.success('\u5099\u4efd\u5df2\u5efa\u7acb');
  Modal.close();
  openBackupModal();
}

function restoreBackup(id) {
  Modal.confirm('\u78ba\u8a8d\u9084\u539f\u6b64\u5099\u4efd\uff1f\u7576\u524d\u8cc7\u6599\u5c07\u88ab\u8986\u84cb\u3002', function () {
    Backup.restore(id);
    Toast.success('\u5099\u4efd\u5df2\u9084\u539f');
    Modal.close();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '\u9084\u539f\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u9084\u539f' });
}

function deleteBackup(id) {
  Modal.confirm('\u78ba\u8a8d\u522a\u9664\u6b64\u5099\u4efd\uff1f', function () {
    Backup.remove(id);
    Toast.success('\u5099\u4efd\u5df2\u522a\u9664');
    Modal.close();
    openBackupModal();
  }, { title: '\u522a\u9664\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u522a\u9664' });
}

/* ============================================================
 * Auth Actions
 * ============================================================ */

function handleLogin(event) {
  if (event && event.key !== 'Enter') return;
  var input = document.getElementById('login-password');
  var errorEl = document.getElementById('login-error');
  var password = input ? input.value : '';

  if (!password) {
    if (errorEl) errorEl.textContent = '\u8acb\u8f38\u5165\u5bc6\u78bc';
    return;
  }

  if (Auth.login(password)) {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
    if (typeof App !== 'undefined') App.init();
  } else {
    if (errorEl) errorEl.textContent = '\u5bc6\u78bc\u932f\u8aa4';
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function handleLogout() {
  Auth.logout();
  location.reload();
}

/* ============================================================
 * Clear Data — v8: keep agentList + employeeList
 * ============================================================ */

function clearAllData() {
  Modal.confirm(
    '\u78ba\u8a8d\u6e05\u9664\u6240\u6709\u8a02\u623f\u8cc7\u6599\uff1f\u6b64\u64cd\u4f5c\u5c07\u522a\u9664\u6240\u6709\u8a02\u623f\u8a18\u9304\uff08\u4fdd\u7559\u4ee3\u7406\u540d\u55ae\u53ca\u54e1\u5de5\u540d\u55ae\uff09\uff0c\u4e0d\u53ef\u64a4\u92b7\uff01',
    function () {
      if (typeof Store !== 'undefined' && Store.clearLocalData) {
        Store.clearLocalData();
      }
      if (typeof clearFirebaseData === 'function') {
        clearFirebaseData();
      }
      Toast.success('\u6240\u6709\u8cc7\u6599\u5df2\u6e05\u9664');
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '\u26a0\ufe0f \u5371\u96aa\u64cd\u4f5c', confirmText: '\u78ba\u8a8d\u6e05\u9664\u5168\u90e8' }
  );
}

document.addEventListener("DOMContentLoaded", function() {
  if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {
    var overlay = document.getElementById("login-overlay");
    if (overlay) overlay.classList.add("hidden");
    App.init();
  }
  var pwdInput = document.getElementById("login-password");
  if (pwdInput) pwdInput.focus();
});
