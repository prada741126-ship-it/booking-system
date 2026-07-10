/**
 * firebase.js — Firebase Initialization + CRUD Operations
 * v8: Supports bookings, hotelConfig, agentList, employeeList, archives,
 *     closedMonths, settings, botLogs
 * Flow: initFirebase -> signInAnonymously -> _onFirebaseReady -> startWatchers
 */
var _db = null;
var _authInstance = null;
var _initRetried = false;
var _initPollCount = 0;

/* ===== Initialization ===== */

function initFirebase(onReady) {
  _doInitFirebase(onReady);
}

function _doInitFirebase(onReady) {
  if (typeof firebase === 'undefined') {
    console.warn('[Firebase] SDK not loaded yet, retrying...');
    if (!_initRetried) {
      _initRetried = true;
      if (typeof window !== 'undefined') {
        window.addEventListener('load', function () {
          _doInitFirebase(onReady);
        });
      }
      _initPollCount = 0;
      var pollTimer = setInterval(function () {
        _initPollCount++;
        if (typeof firebase !== 'undefined') {
          clearInterval(pollTimer);
          _doInitFirebase(onReady);
        } else if (_initPollCount >= 30) {
          clearInterval(pollTimer);
          console.error('[Firebase] SDK failed to load after 30 retries');
          Events.emit(EVENTS.SYNC_ERROR, { error: 'SDK load failed' });
        }
      }, 1000);
    }
    return;
  }

  try {
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('[Firebase] Already initialized');
    } else {
      firebase.initializeApp(FIREBASE_CONFIG);
      console.log('[Firebase] App initialized');
    }

    if (typeof firebase.auth !== 'function') {
      console.warn('[Firebase] Auth SDK not loaded');
      _db = firebase.database();
      _watchConnection();
      if (onReady) onReady();
      return;
    }

    _authInstance = firebase.auth();

    _authInstance.signInAnonymously().then(function () {
      console.log('[Firebase] Anonymous auth successful');
      var tempDb = firebase.database();
      _db = tempDb;
      _watchConnection();
      if (onReady) onReady();
    }).catch(function (err) {
      console.error('[Firebase] Anonymous auth failed:', err);
      _db = null;
      Events.emit(EVENTS.SYNC_ERROR, { error: 'Auth failed: ' + err.message });
      setTimeout(function () {
        _doInitFirebase(onReady);
      }, 5000);
    });

  } catch (e) {
    console.error('[Firebase] Init error:', e);
    Events.emit(EVENTS.SYNC_ERROR, { error: e.message });
    setTimeout(function () {
      _doInitFirebase(onReady);
    }, 3000);
  }
}

/* ===== Connection Watcher ===== */

function _watchConnection() {
  if (!_db) return;
  _db.ref('.info/connected').on('value', function (snap) {
    var connected = snap.val() === true;
    State.set('syncConnected', connected);
    if (connected) {
      console.log('[Firebase] Connected');
      Events.emit(EVENTS.SYNC_CONNECTED);
      setTimeout(function () {
        if (typeof syncDownloadAll === 'function') syncDownloadAll();
      }, CONFIG.SYNC_RECONNECT_DELAY);
      setTimeout(function () {
        if (typeof syncUploadAll === 'function') syncUploadAll();
      }, CONFIG.SYNC_UPLOAD_DELAY);
    } else {
      console.log('[Firebase] Disconnected');
      Events.emit(EVENTS.SYNC_DISCONNECTED);
    }
  });
}

/* ===== CRUD: Bookings ===== */

function syncBookingToFirebase(booking, callback) {
  if (!_db) {
    console.warn('[Firebase] Not ready, enqueuing booking upload');
    enqueueUpload({ type: 'booking', action: 'set', data: booking });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.BOOKINGS + '/' + booking._fbKey);
    ref.set(booking, function (err) {
      if (err) {
        console.error('[Firebase] Booking set error:', err);
        Events.emit(EVENTS.SYNC_ERROR, { error: err.message });
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncBookingToFirebase exception:', e);
    enqueueUpload({ type: 'booking', action: 'set', data: booking });
  }
}

function removeBookingFromFirebase(fbKey, callback) {
  if (!_db) {
    enqueueUpload({ type: 'booking', action: 'remove', data: { _fbKey: fbKey } });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var tombstone = {
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    };
    _db.ref(FB_PATH.BOOKINGS + '/' + fbKey).set(tombstone, function (err) {
      if (err) {
        console.error('[Firebase] Booking tombstone error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] removeBookingFromFirebase exception:', e);
    enqueueUpload({ type: 'booking', action: 'remove', data: { _fbKey: fbKey } });
  }
}

/* ===== CRUD: Hotel Config (single object) ===== */

function syncHCToFirebase(config, callback) {
  if (!_db) {
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: config });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.HOTEL_CONFIG).set(config, function (err) {
      if (err) {
        console.error('[Firebase] HC set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncHCToFirebase exception:', e);
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: config });
  }
}

/* ===== CRUD: Agent List ===== */

function syncAgentListToFirebase(agentList, callback) {
  if (!_db) {
    enqueueUpload({ type: 'agentList', action: 'set', data: agentList });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var data = {};
    for (var i = 0; i < agentList.length; i++) {
      var key = agentList[i].id || Utils.encodeFirebaseKey(agentList[i].name || ('agent_' + i));
      data[key] = agentList[i];
    }
    data._updatedAt = agentList._updatedAt || Date.now();
    _db.ref(FB_PATH.AGENT_LIST).set(data, function (err) {
      if (err) {
        console.error('[Firebase] AgentList set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncAgentListToFirebase exception:', e);
  }
}

/* ===== CRUD: Employee List ===== */

function syncEmployeeListToFirebase(employeeList, callback) {
  if (!_db) {
    enqueueUpload({ type: 'employeeList', action: 'set', data: employeeList });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var data = {};
    for (var i = 0; i < employeeList.length; i++) {
      var key = employeeList[i].id || Utils.encodeFirebaseKey(employeeList[i].tgId || ('emp_' + i));
      data[key] = employeeList[i];
    }
    data._updatedAt = employeeList._updatedAt || Date.now();
    _db.ref(FB_PATH.EMPLOYEE_LIST).set(data, function (err) {
      if (err) {
        console.error('[Firebase] EmployeeList set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncEmployeeListToFirebase exception:', e);
  }
}

/* ===== CRUD: Archives ===== */

function syncArchiveToFirebase(archive, callback) {
  if (!_db) {
    enqueueUpload({ type: 'archive', action: 'set', data: archive });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.ARCHIVES + '/' + archive._fbKey);
    ref.set(archive, function (err) {
      if (err) {
        console.error('[Firebase] Archive set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncArchiveToFirebase exception:', e);
    enqueueUpload({ type: 'archive', action: 'set', data: archive });
  }
}

/* ===== CRUD: Closed Months ===== */

function syncClosedMonthsToFirebase(months, callback) {
  if (!_db) {
    enqueueUpload({ type: 'closedMonths', action: 'set', data: months });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.CLOSED_MONTHS).set(months, function (err) {
      if (err) {
        console.error('[Firebase] ClosedMonths set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncClosedMonthsToFirebase exception:', e);
  }
}

/* ===== CRUD: Settings ===== */

function syncSettingsToFirebase(settings, callback) {
  if (!_db) {
    enqueueUpload({ type: 'settings', action: 'set', data: settings });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    _db.ref(FB_PATH.SETTINGS).set(settings, function (err) {
      if (err) {
        console.error('[Firebase] Settings set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncSettingsToFirebase exception:', e);
  }
}

/* ===== CRUD: Bot Logs ===== */

function syncBotLogToFirebase(log, callback) {
  if (!_db) {
    enqueueUpload({ type: 'botLog', action: 'set', data: log });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.BOT_LOGS + '/' + log._fbKey);
    ref.set(log, function (err) {
      if (err) {
        console.error('[Firebase] BotLog set error:', err);
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncBotLogToFirebase exception:', e);
  }
}

/* ===== Clear All (preserve agentList & employeeList) ===== */

function clearFirebaseData(callback) {
  if (!_db) {
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var clearedAt = Date.now();
    _db.ref(FB_PATH.CLEARED_AT).set(clearedAt, function (err) {
      if (err) {
        console.error('[Firebase] Clear error:', err);
        if (callback) callback(err);
        return;
      }
      var paths = [
        FB_PATH.BOOKINGS,
        FB_PATH.HOTEL_CONFIG,
        FB_PATH.ARCHIVES,
        FB_PATH.CLOSED_MONTHS,
        FB_PATH.SETTINGS,
        FB_PATH.BOT_LOGS
      ];
      var pending = paths.length;
      paths.forEach(function (p) {
        _db.ref(p).set({}, function (e) {
          pending--;
          if (e) console.error('[Firebase] Clear path error:', p, e);
          if (pending === 0 && callback) callback(null);
        });
      });
    });
  } catch (e) {
    console.error('[Firebase] clearFirebaseData exception:', e);
    if (callback) callback(e);
  }
}

/* ===== Status ===== */

function isFirebaseReady() {
  return _db !== null;
}
