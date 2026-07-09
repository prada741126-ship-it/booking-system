/**
 * state.js — Central State Manager
 * Pattern: faithfully reused from v13.0.5
 * Features: single source of truth, auto-emit on set, batchSet, update, nextId
 */
var State = (function () {
  var _state = {
    bookings: [],
    hotelConfig: [],
    agentList: [],
    botLogs: [],
    workingMonth: null,
    currentPage: 'overview',
    syncConnected: false,
    lastSyncTime: null,
    auth: null
  };

  var _nextId = 1;

  /* Map state paths to events for auto-emit */
  var _pathEvents = {
    'bookings':       EVENTS.BOOKINGS_LOADED,
    'hotelConfig':    EVENTS.HC_LOADED,
    'agentList':      EVENTS.AGENT_LIST_UPDATED,
    'botLogs':        EVENTS.UI_RENDER,
    'workingMonth':   EVENTS.MONTH_CHANGED,
    'currentPage':    EVENTS.PAGE_CHANGED,
    'syncConnected':  EVENTS.SYNC_STATUS,
    'lastSyncTime':   EVENTS.SYNC_STATUS
  };

  function get(key) {
    return key ? _state[key] : _state;
  }

  function set(key, value) {
    _state[key] = value;
    var evt = _pathEvents[key];
    if (evt) {
      Events.emit(evt, value);
    }
  }

  function batchSet(pairs) {
    var eventsToEmit = [];
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      _state[pair.key] = pair.value;
      var evt = _pathEvents[pair.key];
      if (evt && eventsToEmit.indexOf(evt) === -1) {
        eventsToEmit.push(evt);
      }
    }
    // Emit deduplicated events after all sets
    for (var j = 0; j < eventsToEmit.length; j++) {
      Events.emit(eventsToEmit[j]);
    }
  }

  function update(key, fn) {
    var current = _state[key];
    if (current === undefined) {
      console.error('[State] Unknown key:', key);
      return;
    }
    var updated = fn(current);
    if (updated !== undefined) {
      _state[key] = updated;
    }
    var evt = _pathEvents[key];
    if (evt) {
      Events.emit(evt, _state[key]);
    }
  }

  function nextId() {
    return 'BK' + String(Date.now()).slice(-8) + String(_nextId++).padStart(3, '0');
  }

  function resetNextId() {
    _nextId = 1;
  }

  function reset() {
    _state = {
      bookings: [],
      hotelConfig: [],
      agentList: [],
      botLogs: [],
      workingMonth: null,
      currentPage: 'overview',
      syncConnected: false,
      lastSyncTime: null,
      auth: null
    };
    _nextId = 1;
  }

  return {
    get: get,
    set: set,
    batchSet: batchSet,
    update: update,
    nextId: nextId,
    resetNextId: resetNextId,
    reset: reset
  };
})();
