/**
 * filters.js — Pure Functions for Filtering & Sorting
 * Pattern: faithfully reused from v13.0.5 calc/filters.js
 * Zero side effects, 100% testable
 */
var Filters = {

  /**
   * Filter bookings by criteria
   * @param {Array} bookings - booking array
   * @param {Object} criteria - { month, casino, hotel, agent, status, keyword, dateFrom, dateTo }
   * @returns {Array} filtered bookings
   */
  filterBookings: function (bookings, criteria) {
    if (!bookings) return [];
    if (!criteria) return bookings;

    return bookings.filter(function (b) {
      if (criteria.month && b.month !== criteria.month) return false;
      if (criteria.casino && b.casino !== criteria.casino) return false;
      if (criteria.hotel && b.hotel !== criteria.hotel) return false;
      if (criteria.agent && b.agent !== criteria.agent) return false;
      if (criteria.status && b.status !== criteria.status) return false;
      if (criteria.compType && b.compType !== criteria.compType) return false;

      if (criteria.dateFrom && b.checkIn < criteria.dateFrom) return false;
      if (criteria.dateTo && b.checkOut > criteria.dateTo) return false;

      if (criteria.keyword) {
        var kw = criteria.keyword.toLowerCase();
        var match = (
          (b.guestName || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.agent || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.hotel || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.roomType || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.phone || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.note || '').toLowerCase().indexOf(kw) !== -1 ||
          (b.flightNo || '').toLowerCase().indexOf(kw) !== -1
        );
        if (!match) return false;
      }

      return true;
    });
  },

  /**
   * Sort bookings by field
   * @param {Array} bookings - booking array
   * @param {string} field - sort field
   * @param {boolean} ascending - sort direction
   * @returns {Array} sorted bookings (new array)
   */
  sortBookings: function (bookings, field, ascending) {
    if (!bookings) return [];
    var arr = bookings.slice();
    ascending = ascending !== false;

    arr.sort(function (a, b) {
      var aVal = a[field];
      var bVal = b[field];

      // Handle undefined/null
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ascending ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      var aStr = String(aVal);
      var bStr = String(bVal);
      if (aStr < bStr) return ascending ? -1 : 1;
      if (aStr > bStr) return ascending ? 1 : -1;
      return 0;
    });

    return arr;
  },

  /**
   * Get bookings overlapping a date range
   */
  filterByDateRange: function (bookings, dateFrom, dateTo) {
    if (!bookings) return [];
    return bookings.filter(function (b) {
      if (!b.checkIn || !b.checkOut) return false;
      // Overlap: checkIn <= dateTo && checkOut >= dateFrom
      return b.checkIn <= dateTo && b.checkOut >= dateFrom;
    });
  },

  /**
   * Get bookings for a specific date (check-in or staying)
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
   */
  paginate: function (arr, page, perPage) {
    if (!arr) return [];
    page = page || 1;
    perPage = perPage || 20;
    var start = (page - 1) * perPage;
    return arr.slice(start, start + perPage);
  },

  /**
   * Group bookings by field
   */
  groupBy: function (bookings, field) {
    if (!bookings) return {};
    var groups = {};
    for (var i = 0; i < bookings.length; i++) {
      var key = bookings[i][field] || '未分類';
      if (!groups[key]) groups[key] = [];
      groups[key].push(bookings[i]);
    }
    return groups;
  }
};
