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

  function $$(selector) {
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
    $$: $$,
    el: el,
    clearNode: clearNode,
    escapeHtml: escapeHtml,
    debounce: debounce,
    fbObjToArray: fbObjToArray,
    encodeFirebaseKey: encodeFirebaseKey,
    isValidDate: isValidDate
  };
})();
