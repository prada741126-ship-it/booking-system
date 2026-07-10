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
