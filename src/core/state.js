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

  function getSettings() {
    return _state.settings || {};
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
    getSettings: getSettings,
    getRecentAgents: getRecentAgents
  };
})();
