/**
 * bookings.js — Booking CRUD Module
 * Pattern: faithfully reused from v13.0.5 bookings.js
 * Flow: create/update/delete → State.update → Store.save → syncToFirebase → Events.emit
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

    var booking = {
      // System fields
      _fbKey:     fbKey,
      _createdAt: now,
      _updatedAt: now,
      _source:    data._source || 'web',

      // Guest info
      guestName:     data.guestName || '',
      guestCount:    data.guestCount || 1,
      agent:         data.agent || '',
      operator:      data.operator || '',
      phone:         data.phone || '',

      // Hotel & room
      casino:        data.casino || '',
      hotel:         data.hotel || '',
      roomType:      data.roomType || '',
      roomCount:     data.roomCount || 1,
      month:         data.month || State.get('workingMonth') || Utils.getCurrentMonth(),

      // Dates & status
      checkIn:       data.checkIn || '',
      checkOut:      data.checkOut || '',
      nights:        Utils.calcNights(data.checkIn, data.checkOut),
      status:        data.status || BOOKING_STATUS.PENDING,

      // Comp & threshold
      compType:      data.compType || COMP_TYPES.FREE_ROOM,
      threshold:     data.threshold || 0,
      volume:        data.volume || 0,
      pricePerNight: data.pricePerNight || 0,
      totalCost:     0,  // calculated below

      // Transfer & notes
      transfer:       data.transfer || 'none',
      transferDetail: data.transferDetail || '',
      flightNo:       data.flightNo || '',
      specialRequest: data.specialRequest || '',
      note:           data.note || ''
    };

    // Calculate total cost
    booking.totalCost = booking.pricePerNight * booking.nights * booking.roomCount;

    // Add to state
    State.update('bookings', function (list) {
      list.push(booking);
      return list;
    });

    // Save to localStorage
    Store.saveBookings(State.get('bookings'));

    // Sync to Firebase
    syncBookingToFirebase(booking);

    // Emit event
    Events.emit(EVENTS.BOOKING_CREATED, booking);

    console.log('[Bookings] Created:', booking._fbKey, booking.guestName);
    return booking;
  },

  /**
   * Update an existing booking
   * @param {string} fbKey - booking key
   * @param {Object} data - fields to update
   * @returns {Object|null} updated booking or null if not found
   */
  update: function (fbKey, data) {
    var updated = null;

    State.update('bookings', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]._fbKey === fbKey) {
          // Merge data into existing
          for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_') {
              list[i][key] = data[key];
            }
          }
          // Recalculate derived fields
          list[i].nights = Utils.calcNights(list[i].checkIn, list[i].checkOut);
          list[i].totalCost = (list[i].pricePerNight || 0) * list[i].nights * (list[i].roomCount || 1);
          list[i]._updatedAt = Date.now();
          updated = list[i];
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
      // Track for anti-resurrection
      RecentlyDeleted.track('booking', fbKey);
      // Write tombstone to Firebase
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
    return Bookings.update(fbKey, { status: status });
  },

  /**
   * Get booking by fbKey
   */
  getByKey: function (fbKey) {
    var list = State.get('bookings');
    for (var i = 0; i < list.length; i++) {
      if (list[i]._fbKey === fbKey) return list[i];
    }
    return null;
  },

  /**
   * Get bookings by month
   */
  getByMonth: function (month) {
    var list = State.get('bookings');
    if (!month) return list;
    return list.filter(function (b) {
      return b.month === month;
    });
  },

  /**
   * Get bookings by status
   */
  getByStatus: function (status) {
    var list = State.get('bookings');
    if (!status) return list;
    return list.filter(function (b) {
      return b.status === status;
    });
  },

  /**
   * Get bookings by casino
   */
  getByCasino: function (casino) {
    var list = State.get('bookings');
    if (!casino) return list;
    return list.filter(function (b) {
      return b.casino === casino;
    });
  },

  /**
   * Get bookings by agent
   */
  getByAgent: function (agent) {
    var list = State.get('bookings');
    if (!agent) return list;
    return list.filter(function (b) {
      return b.agent === agent;
    });
  },

  /**
   * Search bookings by keyword
   */
  search: function (keyword) {
    var list = State.get('bookings');
    if (!keyword) return list;
    keyword = keyword.toLowerCase();
    return list.filter(function (b) {
      return (
        (b.guestName || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.agent || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.hotel || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.roomType || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.phone || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.note || '').toLowerCase().indexOf(keyword) !== -1 ||
        (b.flightNo || '').toLowerCase().indexOf(keyword) !== -1
      );
    });
  },

  /**
   * Get all bookings
   */
  getAll: function () {
    return State.get('bookings');
  }
};
