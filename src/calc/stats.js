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

  /**
   * Total threshold weighted by nights (sum of booking.threshold × booking.nights)
   * 1 room = 1 night; a 2-night booking contributes threshold × 2
   */
  totalThresholdNights: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      var th = Number(bookings[i].threshold) || 0;
      var n = Number(bookings[i].nights) || 0;
      sum += th * n;
    }
    return sum;
  },

  /**
   * Count nights and threshold-nights that fall within a specific month.
   * For cross-month bookings (e.g., 7/30-8/2), only counts the nights
   * that fall within the given month.
   *   Example: 7/30-8/2, threshold=80 -> July: 2 nights, 160; August: 1 night, 80
   *   Example: 7/31-8/1, threshold=80 -> July: 1 night, 80; August: 0 nights, 0
   * @param {Array} bookings
   * @param {string} month - YYYY-MM
   * @returns {Object} { nights: N, thresholdNights: N }
   */
  calcMonthlyNights: function (bookings, month) {
    if (!bookings || !month) return { nights: 0, thresholdNights: 0 };
    var nights = 0;
    var thresholdNights = 0;

    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var checkIn = b.checkIn;
      var checkOut = b.checkOut;
      var th = Number(b.threshold) || 0;

      if (!checkIn || !checkOut) {
        /* Fallback: if dates missing, use booking's month field */
        if (b.month === month) {
          var n = Number(b.nights) || 0;
          nights += n;
          thresholdNights += th * n;
        }
        continue;
      }

      /* Walk through each day from checkIn to checkOut-1 */
      var cur = checkIn;
      while (cur < checkOut) {
        if (cur.indexOf(month) === 0) {
          nights++;
          thresholdNights += th;
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

    return { nights: nights, thresholdNights: thresholdNights };
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
   * @returns {Object} { '王大帥': { count: N, profit: N, chargeGuest: N, chargeCompany: N, requiredVolume: N }, ... }
   */
  profitByAgent: function (bookings) {
    var result = {};
    if (!bookings) return result;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var agent = b.agent || '\u672A\u5206\u985E';
      if (!result[agent]) result[agent] = { count: 0, profit: 0, chargeGuest: 0, chargeCompany: 0, requiredVolume: 0 };
      result[agent].count++;
      result[agent].profit += Number(b.profit) || 0;
      result[agent].chargeGuest += Number(b.chargeGuest) || 0;
      result[agent].chargeCompany += Number(b.chargeCompany) || 0;
      result[agent].requiredVolume += (Number(b.threshold) || 0) * (Number(b.nights) || 0);
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
   * @returns {Array} [{ agent: 'name', count: N, profit: N, requiredVolume: N }, ...]
   */
  topAgents: function (bookings, limit) {
    var profitMap = Stats.profitByAgent(bookings);
    var arr = [];
    for (var name in profitMap) {
      arr.push({ agent: name, count: profitMap[name].count, profit: profitMap[name].profit, requiredVolume: profitMap[name].requiredVolume });
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
      totalBookings:        bookings.length,
      totalNights:          Stats.totalNights(bookings),
      totalThreshold:       Stats.totalThreshold(bookings),
      totalThresholdNights: Stats.totalThresholdNights(bookings),
      totalProfit:          Stats.totalProfit(bookings),
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
