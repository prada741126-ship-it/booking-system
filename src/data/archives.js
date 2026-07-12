/**
 * archives.js — Archive System (v8 new)
 * Only checked-out (settled) bookings are archived. Cancelled bookings are deleted directly.
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

    /* Defensive: cancelled bookings should never be archived (v2.2.1+) */
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      console.warn('[Archives] Refused to archive cancelled booking:', booking._fbKey);
      return null;
    }

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
      if (filters.month && !Filters.overlapsMonth(a.checkIn, a.checkOut, a.month, filters.month)) return false;
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
