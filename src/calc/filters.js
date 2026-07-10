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
