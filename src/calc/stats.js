/**
 * stats.js — Pure Functions for Statistics
 * Pattern: faithfully reused from v13.0.5 calc/stats.js
 * Zero side effects, 100% testable
 */
var Stats = {

  /**
   * Calculate total bookings count
   */
  totalBookings: function (bookings) {
    return bookings ? bookings.length : 0;
  },

  /**
   * Calculate total room nights
   */
  totalRoomNights: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].nights || 0) * (bookings[i].roomCount || 1);
    }
    return sum;
  },

  /**
   * Calculate total rooms
   */
  totalRooms: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].roomCount || 1);
    }
    return sum;
  },

  /**
   * Calculate total guests
   */
  totalGuests: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].guestCount || 1);
    }
    return sum;
  },

  /**
   * Calculate total threshold (洗碼門檻)
   */
  totalThreshold: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].threshold || 0) * (bookings[i].roomCount || 1);
    }
    return sum;
  },

  /**
   * Calculate total volume (洗碼量)
   */
  totalVolume: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].volume || 0);
    }
    return sum;
  },

  /**
   * Calculate threshold fulfillment rate
   */
  thresholdRate: function (bookings) {
    var threshold = Stats.totalThreshold(bookings);
    var volume = Stats.totalVolume(bookings);
    if (threshold === 0) return 0;
    return (volume / threshold) * 100;
  },

  /**
   * Calculate total cost
   */
  totalCost: function (bookings) {
    if (!bookings) return 0;
    var sum = 0;
    for (var i = 0; i < bookings.length; i++) {
      sum += (bookings[i].totalCost || 0);
    }
    return sum;
  },

  /**
   * Count bookings by status
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
   * Count bookings by casino
   */
  countByCasino: function (bookings) {
    var counts = {};
    if (!bookings) return counts;
    for (var i = 0; i < bookings.length; i++) {
      var c = bookings[i].casino || '未分類';
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
      var a = bookings[i].agent || '未分類';
      counts[a] = (counts[a] || 0) + 1;
    }
    return counts;
  },

  /**
   * Summary by casino (matrix: casino × status)
   */
  casinoMatrix: function (bookings) {
    var matrix = {};
    if (!bookings) return matrix;
    for (var i = 0; i < bookings.length; i++) {
      var casino = bookings[i].casino || '未分類';
      var status = bookings[i].status || 'unknown';
      if (!matrix[casino]) matrix[casino] = {};
      matrix[casino][status] = (matrix[casino][status] || 0) + 1;
      matrix[casino]._total = (matrix[casino]._total || 0) + 1;
    }
    return matrix;
  },

  /**
   * Summary by agent (matrix: agent × casino)
   */
  agentMatrix: function (bookings) {
    var matrix = {};
    if (!bookings) return matrix;
    for (var i = 0; i < bookings.length; i++) {
      var agent = bookings[i].agent || '未分類';
      var casino = bookings[i].casino || '未分類';
      if (!matrix[agent]) matrix[agent] = {};
      matrix[agent][casino] = (matrix[agent][casino] || 0) + 1;
      matrix[agent]._total = (matrix[agent]._total || 0) + 1;
    }
    return matrix;
  },

  /**
   * Daily booking count for a month
   */
  dailyCounts: function (bookings, month) {
    var days = {};
    if (!bookings) return days;
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].month !== month) continue;
      var dateRange = Utils.dateRange(bookings[i].checkIn, bookings[i].checkOut);
      for (var j = 0; j < dateRange.length; j++) {
        days[dateRange[j]] = (days[dateRange[j]] || 0) + 1;
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

  /**
   * Top agents by booking count
   */
  topAgents: function (bookings, limit) {
    var counts = Stats.countByAgent(bookings);
    var arr = [];
    for (var name in counts) {
      arr.push({ agent: name, count: counts[name] });
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    if (limit) arr = arr.slice(0, limit);
    return arr;
  },

  /**
   * Top casinos by booking count
   */
  topCasinos: function (bookings, limit) {
    var counts = Stats.countByCasino(bookings);
    var arr = [];
    for (var name in counts) {
      arr.push({ casino: name, count: counts[name] });
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    if (limit) arr = arr.slice(0, limit);
    return arr;
  }
};
