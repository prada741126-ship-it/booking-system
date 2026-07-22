/**
 * watchers.js — Firebase Real-time Listeners
 * v8: 7 watchers (bookings/hotelConfig/agentList/employeeList/archives/closedMonths/settings)
 *     + clearedAt + connected
 * Each watcher: fetch remote -> merge -> filter tombstones -> save -> emit
 */
var _watchersStarted = false;

function startWatchers() {
  if (_watchersStarted) return;
  if (!isFirebaseReady()) {
    console.warn('[Watchers] Firebase not ready, cannot start');
    return;
  }
  _watchersStarted = true;
  console.log('[Watchers] Starting all watchers');

  _watchBookings();
  _watchHotelConfig();
  _watchAgentList();
  _watchEmployeeList();
  _watchArchives();
  _watchClosedMonths();
  _watchSettings();
  _watchClearedAt();
}

/* ===== Bookings Watcher ===== */
function _watchBookings() {
  _db.ref(FB_PATH.BOOKINGS).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      var changed = _hasChanged(local, alive);
      if (changed) {
        /* DEBUG: Log watcher overwrite details */
        console.log('[Watchers._watchBookings] State overwrite — local:', (local||[]).length, 'items, remote:', (remote||[]).length, 'items, merged alive:', alive.length, 'items');
        /* Log specific booking details for known test cases */
        for (var di = 0; di < alive.length; di++) {
          var db = alive[di];
          if (db.guestName && (db.guestName.indexOf('林') !== -1 || db.guestName.indexOf('洪') !== -1)) {
            console.log('[Watchers._watchBookings] After merge:', db.guestName, '| checkIn:', db.checkIn, '| checkOut:', db.checkOut, '| nights:', db.nights, '| _updatedAt:', db._updatedAt);
          }
        }
        State.set('bookings', alive);
        Store.saveBookings(alive);
        Events.emit(EVENTS.BOOKINGS_SYNCED, alive);
        console.log('[Watchers] Bookings synced:', alive.length, 'items');
      }
    } catch (e) {
      console.error('[Watchers] Bookings watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Bookings listener error:', err);
  });
}

/* ===== Hotel Config Watcher (single object) ===== */
function _watchHotelConfig() {
  _db.ref(FB_PATH.HOTEL_CONFIG).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote) return;
      var local = State.get('hotelConfig');
      var merged = Merger.mergeHotelConfig(local, remote);
      if (merged && merged !== local) {
        State.set('hotelConfig', merged);
        Store.saveHotelConfig(merged);
        Events.emit(EVENTS.HC_LOADED, merged);
        console.log('[Watchers] Hotel config synced');
      }
    } catch (e) {
      console.error('[Watchers] HC watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] HC listener error:', err);
  });
}

/* ===== Agent List Watcher ===== */
function _watchAgentList() {
  _db.ref(FB_PATH.AGENT_LIST).on('value', function (snap) {
    try {
      var raw = snap.val();
      var local = State.get('agentList');
      var localTs = local && local._updatedAt ? local._updatedAt : 0;
      var remoteTs = raw && raw._updatedAt ? raw._updatedAt : 0;
      if (localTs > remoteTs) {
        console.log('[Watchers] AgentList local is newer, skip remote');
        return;
      }
      var remote = Utils.fbObjToArray(raw);
      var merged = Merger.mergeAgentList(local, remote);
      var changed = _hasChanged(local, merged);
      if (changed) {
        State.set('agentList', merged);
        Store.saveAgentList(merged);
        Events.emit(EVENTS.AGENT_LIST_UPDATED, merged);
        console.log('[Watchers] Agent list synced:', merged.length, 'agents');
      }
    } catch (e) {
      console.error('[Watchers] AgentList watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] AgentList listener error:', err);
  });
}

/* ===== Employee List Watcher ===== */
function _watchEmployeeList() {
  _db.ref(FB_PATH.EMPLOYEE_LIST).on('value', function (snap) {
    try {
      var raw = snap.val();
      var local = State.get('employeeList');
      var localTs = local && local._updatedAt ? local._updatedAt : 0;
      var remoteTs = raw && raw._updatedAt ? raw._updatedAt : 0;
      if (localTs > remoteTs) {
        console.log('[Watchers] EmployeeList local is newer, skip remote');
        return;
      }
      var remote = Utils.fbObjToArray(raw);
      var merged = Merger.mergeEmployeeList(local, remote);
      var changed = _hasChanged(local, merged);
      if (changed) {
        State.set('employeeList', merged);
        Store.saveEmployeeList(merged);
        Events.emit(EVENTS.EMPLOYEE_LIST_UPDATED, merged);
        console.log('[Watchers] Employee list synced:', merged.length, 'employees');
      }
    } catch (e) {
      console.error('[Watchers] EmployeeList watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] EmployeeList listener error:', err);
  });
}

/* ===== Archives Watcher ===== */
function _watchArchives() {
  _db.ref(FB_PATH.ARCHIVES).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('archives');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      var changed = _hasChanged(local, alive);
      if (changed) {
        State.set('archives', alive);
        Store.saveArchives(alive);
        Events.emit(EVENTS.ARCHIVES_LOADED, alive);
        console.log('[Watchers] Archives synced:', alive.length, 'items');
      }
    } catch (e) {
      console.error('[Watchers] Archives watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Archives listener error:', err);
  });
}

/* ===== Closed Months Watcher ===== */
function _watchClosedMonths() {
  _db.ref(FB_PATH.CLOSED_MONTHS).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote || !Array.isArray(remote)) return;
      var local = State.get('closedMonths') || [];
      if (JSON.stringify(local) !== JSON.stringify(remote)) {
        State.set('closedMonths', remote);
        Store.saveClosedMonths(remote);
        Events.emit(EVENTS.MONTH_CLOSED, remote);
        console.log('[Watchers] Closed months synced:', remote);
      }
    } catch (e) {
      console.error('[Watchers] ClosedMonths watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] ClosedMonths listener error:', err);
  });
}

/* ===== Settings Watcher ===== */
function _watchSettings() {
  _db.ref(FB_PATH.SETTINGS).on('value', function (snap) {
    try {
      var remote = snap.val();
      if (!remote) return;
      var local = State.get('settings') || {};
      var rTs = remote._updatedAt || 0;
      var lTs = local._updatedAt || 0;
      if (rTs > lTs) {
        State.set('settings', remote);
        Store.saveSettings(remote);
        console.log('[Watchers] Settings synced');
      }
    } catch (e) {
      console.error('[Watchers] Settings watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] Settings listener error:', err);
  });
}

/* ===== ClearedAt Watcher ===== */
function _watchClearedAt() {
  _db.ref(FB_PATH.CLEARED_AT).on('value', function (snap) {
    try {
      var clearedAt = snap.val();
      if (!clearedAt) return;
      var localLastClear = Store.load(STORAGE_KEYS.LAST_SYNC_TIME) || 0;
      if (clearedAt > localLastClear) {
        console.log('[Watchers] Remote clear detected, clearing local data');
        Store.clearAll(true); /* keep agent list */
        /* Also keep employee list */
        var employees = State.get('employeeList');
        App.loadFromStore();
        if (employees) {
          State.set('employeeList', employees);
          Store.saveEmployeeList(employees);
        }
        Events.emit(EVENTS.UI_RENDER, {});
        Store.save(STORAGE_KEYS.LAST_SYNC_TIME, clearedAt);
      }
    } catch (e) {
      console.error('[Watchers] ClearedAt watcher error:', e);
    }
  });
}

/* ===== Manual Full Download Sync ===== */
function syncDownloadAll(callback) {
  if (!isFirebaseReady()) {
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  console.log('[Watchers] Starting manual download sync');

  var pending = 6;
  var results = {};

  function _done(key, count) {
    results[key] = count;
    pending--;
    if (pending === 0) {
      State.set('lastSyncTime', Date.now());
      Events.emit(EVENTS.SYNC_DOWNLOAD_DONE, results);
      console.log('[Watchers] Download sync complete', results);
      if (callback) callback(null, results);
    }
  }

  /* Bookings */
  _db.ref(FB_PATH.BOOKINGS).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      State.set('bookings', alive);
      Store.saveBookings(alive);
      _done('bookings', alive.length);
    } catch (e) {
      console.error('[Watchers] Download bookings error:', e);
      _done('bookings', 0);
    }
  });

  /* Hotel config */
  _db.ref(FB_PATH.HOTEL_CONFIG).once('value', function (snap) {
    try {
      var remote = snap.val();
      if (remote) {
        var local = State.get('hotelConfig');
        var merged = Merger.mergeHotelConfig(local, remote);
        State.set('hotelConfig', merged);
        Store.saveHotelConfig(merged);
        Events.emit(EVENTS.HC_LOADED, merged);
      }
      _done('hotelConfig', 1);
    } catch (e) {
      console.error('[Watchers] Download HC error:', e);
      _done('hotelConfig', 0);
    }
  });

  /* Agent list */
  _db.ref(FB_PATH.AGENT_LIST).once('value', function (snap) {
    try {
      var raw = snap.val();
      var local = State.get('agentList');
      var localTs = local && local._updatedAt ? local._updatedAt : 0;
      var remoteTs = raw && raw._updatedAt ? raw._updatedAt : 0;
      if (localTs > remoteTs) {
        console.log('[Watchers] Download agentList: local newer, skip');
        _done('agentList', local.length);
        return;
      }
      var remote = Utils.fbObjToArray(raw);
      var merged = Merger.mergeAgentList(local, remote);
      State.set('agentList', merged);
      Store.saveAgentList(merged);
      _done('agentList', merged.length);
    } catch (e) {
      console.error('[Watchers] Download agentList error:', e);
      _done('agentList', 0);
    }
  });

  /* Employee list */
  _db.ref(FB_PATH.EMPLOYEE_LIST).once('value', function (snap) {
    try {
      var raw = snap.val();
      var local = State.get('employeeList');
      var localTs = local && local._updatedAt ? local._updatedAt : 0;
      var remoteTs = raw && raw._updatedAt ? raw._updatedAt : 0;
      if (localTs > remoteTs) {
        console.log('[Watchers] Download employeeList: local newer, skip');
        _done('employeeList', local.length);
        return;
      }
      var remote = Utils.fbObjToArray(raw);
      var merged = Merger.mergeEmployeeList(local, remote);
      State.set('employeeList', merged);
      Store.saveEmployeeList(merged);
      _done('employeeList', merged.length);
    } catch (e) {
      console.error('[Watchers] Download employeeList error:', e);
      _done('employeeList', 0);
    }
  });

  /* Archives */
  _db.ref(FB_PATH.ARCHIVES).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('archives');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      State.set('archives', alive);
      Store.saveArchives(alive);
      _done('archives', alive.length);
    } catch (e) {
      console.error('[Watchers] Download archives error:', e);
      _done('archives', 0);
    }
  });

  /* Closed months */
  _db.ref(FB_PATH.CLOSED_MONTHS).once('value', function (snap) {
    try {
      var remote = snap.val();
      if (remote && Array.isArray(remote)) {
        State.set('closedMonths', remote);
        Store.saveClosedMonths(remote);
      }
      _done('closedMonths', 1);
    } catch (e) {
      console.error('[Watchers] Download closedMonths error:', e);
      _done('closedMonths', 0);
    }
  });
}

/* ===== Helper ===== */
function _hasChanged(local, remote) {
  if (!local && !remote) return false;
  if (!local || !remote) return true;
  if (local.length !== remote.length) return true;
  var localSum = 0, remoteSum = 0;
  for (var i = 0; i < local.length; i++) {
    localSum += (local[i]._updatedAt || 0);
  }
  for (var j = 0; j < remote.length; j++) {
    remoteSum += (remote[j]._updatedAt || 0);
  }
  return localSum !== remoteSum;
}
