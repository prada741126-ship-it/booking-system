/**
 * firebase.js — Firebase Initialization + CRUD Operations
 * Pattern: faithfully reused from v13.0.5
 * Flow: initFirebase → signInAnonymously → _onFirebaseReady → startWatchers
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
      // Retry on window load
      if (typeof window !== 'undefined') {
        window.addEventListener('load', function () {
          _doInitFirebase(onReady);
        });
      }
      // Retry by polling
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
    firebase.initializeApp(FIREBASE_CONFIG);
    console.log('[Firebase] App initialized');

    // Check if auth SDK is available
    if (typeof firebase.auth !== 'function') {
      console.warn('[Firebase] Auth SDK not loaded');
      _db = firebase.database();
      _watchConnection();
      if (onReady) onReady();
      return;
    }

    _authInstance = firebase.auth();

    // Must sign in anonymously before using database
    _authInstance.signInAnonymously().then(function () {
      console.log('[Firebase] Anonymous auth successful');

      // Only set _db after auth success (critical pattern from v13.0.5)
      var tempDb = firebase.database();
      _db = tempDb;

      // Start connection watcher
      _watchConnection();

      if (onReady) onReady();
    }).catch(function (err) {
      console.error('[Firebase] Anonymous auth failed:', err);
      _db = null;
      Events.emit(EVENTS.SYNC_ERROR, { error: 'Auth failed: ' + err.message });
      // Retry after delay
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
      // Reconnect: download first, then upload
      setTimeout(function () {
        syncDownloadAll();
      }, CONFIG.SYNC_RECONNECT_DELAY);
      setTimeout(function () {
        syncUploadAll();
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
    // Write tombstone instead of removing (anti-resurrection pattern)
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

/* ===== CRUD: Hotel Config ===== */

function syncHCToFirebase(hc, callback) {
  if (!_db) {
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: hc });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var ref = _db.ref(FB_PATH.HOTEL_CONFIG + '/' + hc._fbKey);
    ref.set(hc, function (err) {
      if (err) {
        console.error('[Firebase] HC set error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] syncHCToFirebase exception:', e);
    enqueueUpload({ type: 'hotelConfig', action: 'set', data: hc });
  }
}

function removeHCFromFirebase(fbKey, callback) {
  if (!_db) {
    enqueueUpload({ type: 'hotelConfig', action: 'remove', data: { _fbKey: fbKey } });
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    var tombstone = {
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    };
    _db.ref(FB_PATH.HOTEL_CONFIG + '/' + fbKey).set(tombstone, function (err) {
      if (err) {
        console.error('[Firebase] HC tombstone error:', err);
      } else {
        State.set('lastSyncTime', Date.now());
      }
      if (callback) callback(err);
    });
  } catch (e) {
    console.error('[Firebase] removeHCFromFirebase exception:', e);
    enqueueUpload({ type: 'hotelConfig', action: 'remove', data: { _fbKey: fbKey } });
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
      var key = Utils.encodeFirebaseKey(agentList[i].name || ('agent_' + i));
      data[key] = agentList[i];
    }
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

/* ===== Clear All (preserve agentList) ===== */

function clearFirebaseData(callback) {
  if (!_db) {
    if (callback) callback({ error: 'not_ready' });
    return;
  }
  try {
    // Write clearedAt timestamp
    var clearedAt = Date.now();
    _db.ref(FB_PATH.CLEARED_AT).set(clearedAt, function (err) {
      if (err) {
        console.error('[Firebase] Clear error:', err);
        if (callback) callback(err);
        return;
      }
      // Clear each path EXCEPT agentList (same as v13.0.5)
      var paths = [FB_PATH.BOOKINGS, FB_PATH.HOTEL_CONFIG, FB_PATH.BOT_LOGS];
      var pending = paths.length;
      paths.forEach(function (path) {
        _db.ref(path).set({}, function (e) {
          pending--;
          if (e) console.error('[Firebase] Clear path error:', path, e);
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
