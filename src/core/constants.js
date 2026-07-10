/**
 * constants.js — Single Source of Truth for all constants
 * Booking System v2.0.0 (v8 spec)
 * Light theme | 7 pages | 6 room types | Chinese bot commands
 */

/* ===== App Info ===== */
var APP = {
  VERSION: '2.1.0',
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
  { value: 'HKD', label: '港幣', symbol: 'HK$' },
  { value: 'RMB', label: '人民幣', symbol: 'Y' },
  { value: 'TWD', label: '新台幣', symbol: 'NT$' }
];

var CURRENCY_DEFAULT = 'HKD';

var CURRENCY_SYMBOLS = {
  HKD: 'HK$',
  RMB: 'Y',
  TWD: 'NT$'
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
