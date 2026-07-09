/**
 * utils.js — Utility Functions
 * Pattern: reused from v13.0.5
 */
var Utils = {
  /**
   * Format number with thousands separator
   */
  formatNumber: function (num, decimals) {
    if (isNaN(num) || num === null || num === undefined) return '0';
    decimals = decimals || 0;
    return Number(num).toLocaleString('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Format currency
   */
  formatCurrency: function (num) {
    if (isNaN(num) || num === null || num === undefined) return '¥0';
    return '¥' + Utils.formatNumber(num, 0);
  },

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: function (date) {
    if (!date) return '';
    if (typeof date === 'string') return date;
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  },

  /**
   * Format date for display (YYYY/MM/DD)
   */
  formatDateDisplay: function (dateStr) {
    if (!dateStr) return '-';
    return dateStr.replace(/-/g, '/');
  },

  /**
   * Get current month string (YYYY-MM)
   */
  getCurrentMonth: function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  },

  /**
   * Calculate nights between two dates
   */
  calcNights: function (checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    var d1 = new Date(checkIn);
    var d2 = new Date(checkOut);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    var diff = d2.getTime() - d1.getTime();
    if (diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Generate unique Firebase key
   */
  generateFbKey: function () {
    var timestamp = Date.now().toString(36);
    var random = Math.random().toString(36).substring(2, 10);
    return timestamp + '-' + random;
  },

  /**
   * Encode Firebase key (handle special characters)
   */
  encodeFirebaseKey: function (key) {
    if (!key) return '';
    return key.replace(/\./g, ',')
              .replace(/#/g, '')
              .replace(/\$/g, '')
              .replace(/\[/g, '')
              .replace(/\]/g, '')
              .replace(/\//g, '');
  },

  /**
   * Decode Firebase key
   */
  decodeFirebaseKey: function (key) {
    if (!key) return '';
    return key.replace(/,/g, '.');
  },

  /**
   * Convert Firebase object to array
   */
  fbObjToArray: function (obj) {
    if (!obj) return [];
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
  },

  /**
   * Deep clone an object
   */
  deepClone: function (obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Debounce function
   */
  debounce: function (fn, wait) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  },

  /**
   * Get day of week (Chinese)
   */
  getDayOfWeek: function (dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    var days = ['日', '一', '二', '三', '四', '五', '六'];
    return '星期' + days[d.getDay()];
  },

  /**
   * Check if date is weekend
   */
  isWeekend: function (dateStr) {
    if (!dateStr) return false;
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    var day = d.getDay();
    return day === 0 || day === 6;
  },

  /**
   * Escape HTML
   */
  escapeHtml: function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Get status badge HTML
   */
  statusBadge: function (status) {
    var label = BOOKING_STATUS_LABELS[status] || status;
    var color = BOOKING_STATUS_COLORS[status] || UI_COLORS.textMuted;
    return '<span class="status-badge" style="color:' + color + ';border-color:' + color + ';">' + label + '</span>';
  },

  /**
   * Generate date range array
   */
  dateRange: function (start, end) {
    var arr = [];
    var d = new Date(start);
    var e = new Date(end);
    while (d <= e) {
      arr.push(Utils.formatDate(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  },

  /**
   * Get month days
   */
  getMonthDays: function (year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  /**
   * Pad number
   */
  pad: function (num, len) {
    return String(num).padStart(len || 2, '0');
  }
};
