/**
 * watchers.js — Firebase Real-time Listeners
 * Pattern: faithfully reused from v13.0.5
 * Features: 4 watchers (bookings/hotelConfig/agentList/botLogs) + clearedAt + connected
 * Each watcher: fetch remote → merge → filter tombstones → save → emit
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
  _watchBotLogs();
  _watchClearedAt();
}

/* ===== Bookings Watcher ===== */
function _watchBookings() {
  _db.ref(FB_PATH.BOOKINGS).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeBookings(local, remote);

      // Clean old tombstones
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);

      // Filter tombstones for display
      var alive = Merger.filterAlive(merged);

      // Check if anything changed
      var changed = _hasChanged(local, alive);
      if (changed) {
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

/* ===== Hotel Config Watcher ===== */
function _watchHotelConfig() {
  _db.ref(FB_PATH.HOTEL_CONFIG).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('hotelConfig');
      var merged = Merger.mergeHotelConfig(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);

      var changed = _hasChanged(local, alive);
      if (changed) {
        State.set('hotelConfig', alive);
        Store.saveHotelConfig(alive);
        Events.emit(EVENTS.HC_LOADED, alive);
        console.log('[Watchers] Hotel config synced:', alive.length, 'items');
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
      var remoteObj = snap.val();
      var remote = [];
      if (remoteObj) {
        for (var key in remoteObj) {
          if (remoteObj.hasOwnProperty(key)) {
            var item = remoteObj[key];
            if (item && typeof item === 'object') {
              remote.push(item);
            }
          }
        }
      }

      var local = State.get('agentList');
      // Agent list: merge by name (simple union, remote wins if conflict)
      var merged = _mergeAgentList(local, remote);

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

/* ===== Bot Logs Watcher ===== */
function _watchBotLogs() {
  _db.ref(FB_PATH.BOT_LOGS).on('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('botLogs');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);

      // Sort by createdAt descending
      alive.sort(function (a, b) {
        return (b._createdAt || 0) - (a._createdAt || 0);
      });

      var changed = _hasChanged(local, alive);
      if (changed) {
        State.set('botLogs', alive);
        Store.saveBotLogs(alive);
        Events.emit(EVENTS.UI_RENDER);
        console.log('[Watchers] Bot logs synced:', alive.length, 'logs');
      }
    } catch (e) {
      console.error('[Watchers] BotLogs watcher error:', e);
    }
  }, function (err) {
    console.error('[Watchers] BotLogs listener error:', err);
  });
}

/* ===== ClearedAt Watcher (cross-device "clear all" sync) ===== */
function _watchClearedAt() {
  _db.ref(FB_PATH.CLEARED_AT).on('value', function (snap) {
    try {
      var clearedAt = snap.val();
      if (!clearedAt) return;

      var localLastClear = Store.load(STORAGE_KEYS.LAST_SYNC_TIME) || 0;
      if (clearedAt > localLastClear) {
        console.log('[Watchers] Remote clear detected, clearing local data');
        Store.clearLocalData();
        var fresh = Store.loadAll();
        State.batchSet([
          { key: 'bookings',    value: fresh.bookings    },
          { key: 'hotelConfig', value: fresh.hotelConfig },
          { key: 'botLogs',     value: fresh.botLogs     }
        ]);
        // Preserve agent list
        State.set('agentList', Store.loadAgentList());
        Events.emit(EVENTS.UI_RENDER);
        Store.save(STORAGE_KEYS.LAST_SYNC_TIME, clearedAt, false);
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

  var pending = 4;
  var results = {};

  function _done(key, data) {
    results[key] = data;
    pending--;
    if (pending === 0) {
      State.set('lastSyncTime', Date.now());
      Events.emit(EVENTS.SYNC_DOWNLOAD_DONE, results);
      console.log('[Watchers] Download sync complete');
      if (callback) callback(null, results);
    }
  }

  // Bookings
  _db.ref(FB_PATH.BOOKINGS).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('bookings');
      var merged = Merger.mergeBookings(local, remote);
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

  // Hotel config
  _db.ref(FB_PATH.HOTEL_CONFIG).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('hotelConfig');
      var merged = Merger.mergeHotelConfig(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      State.set('hotelConfig', alive);
      Store.saveHotelConfig(alive);
      _done('hotelConfig', alive.length);
    } catch (e) {
      console.error('[Watchers] Download HC error:', e);
      _done('hotelConfig', 0);
    }
  });

  // Agent list
  _db.ref(FB_PATH.AGENT_LIST).once('value', function (snap) {
    try {
      var remoteObj = snap.val();
      var remote = [];
      if (remoteObj) {
        for (var key in remoteObj) {
          if (remoteObj.hasOwnProperty(key)) {
            remote.push(remoteObj[key]);
          }
        }
      }
      var local = State.get('agentList');
      var merged = _mergeAgentList(local, remote);
      State.set('agentList', merged);
      Store.saveAgentList(merged);
      _done('agentList', merged.length);
    } catch (e) {
      console.error('[Watchers] Download agentList error:', e);
      _done('agentList', 0);
    }
  });

  // Bot logs
  _db.ref(FB_PATH.BOT_LOGS).once('value', function (snap) {
    try {
      var remote = Utils.fbObjToArray(snap.val());
      var local = State.get('botLogs');
      var merged = Merger.mergeArray(local, remote);
      merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);
      var alive = Merger.filterAlive(merged);
      alive.sort(function (a, b) {
        return (b._createdAt || 0) - (a._createdAt || 0);
      });
      State.set('botLogs', alive);
      Store.saveBotLogs(alive);
      _done('botLogs', alive.length);
    } catch (e) {
      console.error('[Watchers] Download botLogs error:', e);
      _done('botLogs', 0);
    }
  });
}

/* ===== Helper Functions ===== */

function _hasChanged(local, remote) {
  if (!local && !remote) return false;
  if (!local || !remote) return true;
  if (local.length !== remote.length) return true;
  // Quick check: compare _updatedAt sums
  var localSum = 0, remoteSum = 0;
  for (var i = 0; i < local.length; i++) {
    localSum += (local[i]._updatedAt || 0);
  }
  for (var j = 0; j < remote.length; j++) {
    remoteSum += (remote[j]._updatedAt || 0);
  }
  return localSum !== remoteSum;
}

function _mergeAgentList(local, remote) {
  local = local || [];
  remote = remote || [];
  var map = {};
  var merged = [];

  // Index local by name
  for (var i = 0; i < local.length; i++) {
    var name = local[i].name || local[i];
    map[name] = local[i];
  }

  // Merge remote (union, remote wins on conflict)
  for (var j = 0; j < remote.length; j++) {
    var rName = remote[j].name || remote[j];
    if (!map[rName]) {
      map[rName] = remote[j];
    }
  }

  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      merged.push(map[key]);
    }
  }

  return merged;
}
