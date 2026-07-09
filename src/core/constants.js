/**
 * constants.js — Single Source of Truth for all constants
 * Booking System v1.0.0
 * Pattern: faithfully reused from v13.0.5
 */

/* ===== App Info ===== */
var APP = {
  VERSION: '1.0.0',
  TITLE: 'VIP Booking System',
  SYSTEM_NAME: 'BookingHub'
};

/* ===== Config ===== */
var CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,
  TOMBSTONE_TTL_MS: 30 * 24 * 60 * 60 * 1000,  // 30 days
  MAX_UPLOAD_QUEUE: 200,
  SYNC_RECONNECT_DELAY: 2000,
  SYNC_UPLOAD_DELAY: 3000,
  RECENTLY_DELETED_LIMIT: 100
};

/* ===== Storage Keys ===== */
var STORAGE_KEYS = {
  BOOKINGS:        'bk_bookings',
  HOTEL_CONFIG:    'bk_hotel_config',
  AGENT_LIST:      'bk_agent_list',
  DRAFT:           'bk_draft',
  ARCHIVES:        'bk_archives',
  SAVED_FILTERS:   'bk_saved_filters',
  BACKUP_LIST:     'bk_backup_list',
  BACKUP_PREFIX:   'bk_backup_',
  WORKING_MONTH:   'bk_working_month',
  AUTH:            'bk_auth',
  LAST_BACKUP_DATE:'bk_last_backup_date',
  HC_PRESET_VER:   'bk_hc_preset_version',
  APP_VERSION:     'bk_app_version',
  RECENTLY_DELETED:'bk_recently_deleted',
  LAST_SYNC_TIME:  'bk_last_sync_time',
  BOT_LOGS:        'bk_bot_logs'
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
  BOOKINGS:     'booking_data/bookings',
  HOTEL_CONFIG: 'booking_data/hotelConfig',
  AGENT_LIST:   'booking_data/agentList',
  CLEARED_AT:   'booking_data/clearedAt',
  BOT_LOGS:     'booking_data/botLogs'
};

/* ===== CDN ===== */
var CDN = {
  FIREBASE_APP:      'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-app-compat.min.js',
  FIREBASE_AUTH:     'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-auth-compat.min.js',
  FIREBASE_DATABASE: 'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-database-compat.min.js',
  FIREBASE_APP_FALLBACK:      'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  FIREBASE_AUTH_FALLBACK:     'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  FIREBASE_DATABASE_FALLBACK: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  CHART_JS:    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  CRYPTO_JS:   'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js'
};

/* ===== Events ===== */
var EVENTS = {
  /* Booking events */
  BOOKING_CREATED:   'booking:created',
  BOOKING_UPDATED:   'booking:updated',
  BOOKING_DELETED:   'booking:deleted',
  BOOKINGS_LOADED:   'bookings:loaded',
  BOOKINGS_SYNCED:   'bookings:synced',
  /* Hotel config events */
  HC_CREATED:        'hc:created',
  HC_UPDATED:        'hc:updated',
  HC_DELETED:        'hc:deleted',
  HC_LOADED:         'hc:loaded',
  HC_RESET:          'hc:reset',
  /* Agent events */
  AGENT_ADDED:       'agent:added',
  AGENT_RENAMED:     'agent:renamed',
  AGENT_REMOVED:     'agent:removed',
  AGENT_LIST_UPDATED:'agent_list:updated',
  /* Month events */
  MONTH_CHANGED:     'month:changed',
  /* Sync events */
  SYNC_CONNECTED:    'sync:connected',
  SYNC_DISCONNECTED: 'sync:disconnected',
  SYNC_UPLOAD_START: 'sync:upload_start',
  SYNC_UPLOAD_DONE:  'sync:upload_done',
  SYNC_DOWNLOAD_DONE:'sync:download_done',
  SYNC_ERROR:        'sync:error',
  SYNC_STATUS:       'sync:status',
  /* Page events */
  PAGE_CHANGED:      'page:changed',
  /* UI events */
  UI_TOAST:          'ui:toast',
  UI_MODAL_OPEN:     'ui:modal_open',
  UI_MODAL_CLOSE:    'ui:modal_close',
  UI_LOADING:        'ui:loading',
  UI_RENDER:         'ui:render'
};

/* ===== UI Colors — Dark Tech Theme ===== */
var UI_COLORS = {
  techCyan:       '#00d4ff',
  skyBlue:        '#0095ff',
  electricViolet: '#7c3aed',
  goldSoft:       '#c9a84c',
  goldLight:      '#D4A844',
  vermilion:      '#c0392b',
  success:        '#2dd4a0',
  warning:        '#f0a500',
  danger:         '#f85149',
  info:           '#58a6ff',
  cashOrange:     '#e67e22',
  /* Backgrounds */
  bgBase:         '#0a0a0f',
  bgElevated:     '#161b22',
  bgSurface:      '#0d1117',
  bgOverlay:      'rgba(10,10,15,0.85)',
  /* Text */
  textPrimary:    '#e6edf3',
  textSecondary:  '#8b949e',
  textMuted:      '#6e7681',
  /* Borders */
  borderDefault:  '#30363d',
  borderHover:    '#484f58',
  /* Status colors */
  statusPending:  '#f0a500',
  statusConfirmed:'#00d4ff',
  statusCheckedIn:'#2dd4a0',
  statusCheckedOut:'#6e7681',
  statusCancelled:'#f85149'
};

/* ===== Casino / Venue Options ===== */
var VENUE_OPTIONS = [
  { value: 'cityofdreams', label: '新濠天地', short: 'COD' },
  { value: 'studio-city',  label: '新濠影滙', short: 'SC'  },
  { value: 'sandscot',     label: '金沙',     short: 'SAND' },
  { value: 'galaxy',       label: '銀河',     short: 'GAL' },
  { value: 'wynn',         label: '永利',     short: 'WYN' },
  { value: 'lisboa',       label: '上葡京',   short: 'LIS' }
];

var CASINO_ORDER = ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];

/* ===== Pages ===== */
var PAGES = {
  OVERVIEW:     'overview',
  CALENDAR:     'calendar',
  BOOKING_LIST: 'booking-list',
  STATS:        'stats',
  BOT_LOG:      'bot-log'
};

var PAGE_LIST = [
  { id: PAGES.OVERVIEW,     label: '總覽',     icon: 'dashboard', shortcut: 'Ctrl+1' },
  { id: PAGES.CALENDAR,     label: '日曆',     icon: 'calendar',  shortcut: 'Ctrl+2' },
  { id: PAGES.BOOKING_LIST, label: '訂房列表', icon: 'list',      shortcut: 'Ctrl+3' },
  { id: PAGES.STATS,        label: '統計',     icon: 'chart',     shortcut: 'Ctrl+4' },
  { id: PAGES.BOT_LOG,      label: 'Bot日誌',  icon: 'bot',       shortcut: 'Ctrl+5' }
];

/* ===== Booking Status ===== */
var BOOKING_STATUS = {
  PENDING:    'pending',     // 待確認
  CONFIRMED:  'confirmed',   // 已確認
  CHECKED_IN: 'checked-in',  // 已入住
  CHECKED_OUT:'checked-out', // 已退房
  CANCELLED:  'cancelled'    // 已取消
};

var BOOKING_STATUS_LABELS = {
  pending:     '待確認',
  confirmed:   '已確認',
  'checked-in':'已入住',
  'checked-out':'已退房',
  cancelled:   '已取消'
};

var BOOKING_STATUS_COLORS = {
  pending:      UI_COLORS.warning,
  confirmed:    UI_COLORS.techCyan,
  'checked-in': UI_COLORS.success,
  'checked-out':UI_COLORS.textMuted,
  cancelled:    UI_COLORS.danger
};

/* ===== Comp Type (Compensation Type) ===== */
var COMP_TYPES = {
  FREE_ROOM:   'free-room',    // 免費房
  DISCOUNT:    'discount',     // 折扣房
  PAID:        'paid'          // 付費房
};

var COMP_TYPE_LABELS = {
  'free-room': '免費房',
  'discount':  '折扣房',
  'paid':      '付費房'
};

/* ===== Transfer Options ===== */
var TRANSFER_OPTIONS = [
  { value: 'none',     label: '無' },
  { value: 'airport',  label: '機場接送' },
  { value: 'ferry',    label: '碼頭接送' },
  { value: 'both',     label: '機場+碼頭' },
  { value: 'custom',   label: '自定義' }
];

/* ===== Keyboard Shortcuts ===== */
var SHORTCUTS = [
  { keys: 'Ctrl+1', action: '切換到總覽頁' },
  { keys: 'Ctrl+2', action: '切換到日曆頁' },
  { keys: 'Ctrl+3', action: '切換到訂房列表' },
  { keys: 'Ctrl+4', action: '切換到統計頁' },
  { keys: 'Ctrl+5', action: '切換到Bot日誌' },
  { keys: 'Ctrl+N', action: '新增訂房' },
  { keys: 'Ctrl+S', action: '手動同步' },
  { keys: 'Ctrl+F', action: '搜索' },
  { keys: '?',      action: '顯示快捷鍵' },
  { keys: 'Esc',    action: '關閉彈窗' }
];

/* ===== Terms ===== */
var TERMS = {
  volume:     '洗碼量',
  threshold:  '洗碼門檻',
  rate:       '碼佣率',
  comm:       '佣金',
  bonus:      '碼糧',
  fund:       '公基金',
  drawn:      '已提領',
  undrawn:    '未提領',
  compType:   '補償類型',
  checkIn:    '入住日期',
  checkOut:   '退房日期',
  nights:     '晚數',
  roomType:   '房型',
  roomCount:  '房間數',
  guestName:  '客人姓名',
  guestCount: '客人數量',
  agent:      '代理',
  operator:   '操作人員',
  pricePerNight: '每晚房價',
  totalCost:  '總費用',
  transfer:   '接送安排',
  flightNo:   '航班號碼',
  specialRequest: '特殊需求'
};
