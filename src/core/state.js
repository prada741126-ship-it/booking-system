/**
 * state.js — Global State Manager
 * Single source of truth for runtime state
 * All mutations go through State.set() which emits events
 */
var State = (function () {
  var _state = {
    /* Data collections */
    bookings: [],
    hotelConfig: null,
    agentList: [],
    employeeList: [],
    archives: [],
    closedMonths: [],
    settings: {},
    /* UI state */
    currentPage: 'overview',
    workingMonth: null,
    isLoggedIn: false,
    /* Sync state */
    syncConnected: false,
    syncInProgress: false,
    lastSyncTime: null,
    /* Draft state */
    draft: null,
    /* Filters */
    activeFilters: {}
  };

  function get(key) {
    if (key === undefined) return _state;
    return _state[key];
  }

  function set(key, value) {
    var old = _state[key];
    _state[key] = value;
    if (old !== value) {
      Events.emit(EVENTS.UI_RENDER, { key: key, oldValue: old, newValue: value });
    }
  }

  function update(key, updater) {
    var current = _state[key];
    var updated = typeof updater === 'function' ? updater(current) : updater;
    set(key, updated);
    /* Always emit UI_RENDER after update — even if the reference is unchanged
       (e.g., array mutated in-place), the data may have changed. This is critical
       for booking edits where the updater modifies array items in-place. */
    Events.emit(EVENTS.UI_RENDER, { key: key });
  }

  /* Convenience getters */
  function getBookings() {
    return _state.bookings.filter(function (b) { return !b._deleted; });
  }

  function getAllBookings() {
    return _state.bookings;
  }

  function getActiveAgents() {
    return _state.agentList.filter(function (a) { return a.active !== false; });
  }

  function getActiveEmployees() {
    return _state.employeeList.filter(function (e) { return e.active !== false; });
  }

  function getArchives() {
    return _state.archives;
  }

  function getHotelConfig() {
    return _state.hotelConfig;
  }

  function getWorkingMonth() {
    return _state.workingMonth;
  }

  function isMonthClosed(monthStr) {
    return _state.closedMonths.indexOf(monthStr) !== -1;
  }

  /* ===== 月結封存 ===== */

  function sealMonth(monthStr) {
    if (!monthStr) return false;
    if (_state.closedMonths.indexOf(monthStr) !== -1) return false;
    _state.closedMonths.push(monthStr);
    _state.closedMonths.sort();
    Store.saveClosedMonths(_state.closedMonths);
    Events.emit(EVENTS.MONTH_CLOSED, _state.closedMonths);
    console.log('[State] Month sealed:', monthStr);
    /* Sync to Firebase */
    if (typeof syncClosedMonthsToFirebase === 'function') {
      syncClosedMonthsToFirebase(_state.closedMonths, function (err) {
        if (err) console.error('[State] syncClosedMonthsToFirebase error:', err);
      });
    }
    return true;
  }

  function unsealMonth(monthStr) {
    if (!monthStr) return false;
    var idx = _state.closedMonths.indexOf(monthStr);
    if (idx === -1) return false;
    _state.closedMonths.splice(idx, 1);
    Store.saveClosedMonths(_state.closedMonths);
    Events.emit(EVENTS.MONTH_CLOSED, _state.closedMonths);
    console.log('[State] Month unsealed:', monthStr);
    /* Sync to Firebase */
    if (typeof syncClosedMonthsToFirebase === 'function') {
      syncClosedMonthsToFirebase(_state.closedMonths, function (err) {
        if (err) console.error('[State] syncClosedMonthsToFirebase error:', err);
      });
    }
    return true;
  }

  function getSettings() {
    return _state.settings || {};
  }

  function getRoomFeeRate() {
    var s = _state.settings || {};
    var rate = Number(s.roomFeeRate);
    if (!rate || rate <= 0) return ROOM_FEE_RATE_DEFAULT;
    return rate;
  }

  function setRoomFeeRate(rate) {
    var num = Number(rate) || 0;
    if (num <= 0) num = ROOM_FEE_RATE_DEFAULT;
    var settings = _state.settings || {};
    settings.roomFeeRate = num;
    settings._updatedAt = Date.now();
    _state.settings = settings;
    Store.saveSettings(settings);
    Events.emit(EVENTS.SYNC_SETTINGS, settings);
  }

  function getRecentAgents(employeeId) {
    var settings = _state.settings || {};
    var recentMap = settings.recentAgents || {};
    return recentMap[employeeId] || [];
  }

  return {
    get: get,
    set: set,
    update: update,
    getBookings: getBookings,
    getAllBookings: getAllBookings,
    getActiveAgents: getActiveAgents,
    getActiveEmployees: getActiveEmployees,
    getArchives: getArchives,
    getHotelConfig: getHotelConfig,
    getWorkingMonth: getWorkingMonth,
    isMonthClosed: isMonthClosed,
    sealMonth: sealMonth,
    unsealMonth: unsealMonth,
    getSettings: getSettings,
    getRoomFeeRate: getRoomFeeRate,
    setRoomFeeRate: setRoomFeeRate,
    getRecentAgents: getRecentAgents
  };
})();
