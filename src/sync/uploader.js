/**
 * uploader.js — Upload Queue + Batch Sync
 * Pattern: faithfully reused from v13.0.5
 * Features: serial queue, overflow protection, delayed retry, batch upload
 */
var Uploader = (function () {
  var _queue = [];
  var _processing = false;

  function enqueueUpload(task) {
    if (!task) return;

    // Overflow protection
    if (_queue.length >= CONFIG.MAX_UPLOAD_QUEUE) {
      console.warn('[Uploader] Queue overflow, switching to full sync');
      _queue = [];
      syncUploadAll();
      return;
    }

    _queue.push(task);

    if (!_processing) {
      _processQueue();
    }
  }

  function _processQueue() {
    if (_queue.length === 0) {
      _processing = false;
      return;
    }

    _processing = true;

    if (!isFirebaseReady()) {
      // Firebase not ready — delay and retry
      setTimeout(function () {
        _processQueue();
      }, 1000);
      return;
    }

    var task = _queue.shift();
    _executeTask(task, function () {
      // Process next task
      _processQueue();
    });
  }

  function _executeTask(task, done) {
    try {
      switch (task.type) {
        case 'booking':
          if (task.action === 'set') {
            syncBookingToFirebase(task.data, done);
          } else if (task.action === 'remove') {
            removeBookingFromFirebase(task.data._fbKey, done);
          } else {
            done();
          }
          break;

        case 'hotelConfig':
          if (task.action === 'set') {
            syncHCToFirebase(task.data, done);
          } else if (task.action === 'remove') {
            removeHCFromFirebase(task.data._fbKey, done);
          } else {
            done();
          }
          break;

        case 'agentList':
          if (task.action === 'set') {
            syncAgentListToFirebase(task.data, done);
          } else {
            done();
          }
          break;

        case 'botLog':
          if (task.action === 'set') {
            syncBotLogToFirebase(task.data, done);
          } else {
            done();
          }
          break;

        default:
          console.warn('[Uploader] Unknown task type:', task.type);
          done();
      }
    } catch (e) {
      console.error('[Uploader] Task execution error:', e);
      done();
    }
  }

  /* ===== Full Upload Sync ===== */

  function syncUploadAll(callback) {
    if (!isFirebaseReady()) {
      console.warn('[Uploader] Firebase not ready, skipping full sync');
      if (callback) callback({ error: 'not_ready' });
      return;
    }

    Events.emit(EVENTS.SYNC_UPLOAD_START);
    console.log('[Uploader] Starting full upload sync');

    var paths = [
      { path: FB_PATH.BOOKINGS,     data: State.get('bookings'),     type: 'booking' },
      { path: FB_PATH.HOTEL_CONFIG, data: State.get('hotelConfig'),  type: 'hotelConfig' },
      { path: FB_PATH.BOT_LOGS,     data: State.get('botLogs'),      type: 'botLog' }
    ];

    var pending = paths.length;
    var hasError = false;

    paths.forEach(function (item) {
      _uploadPathData(item.path, item.data, item.type, function (err) {
        if (err) hasError = true;
        pending--;
        if (pending === 0) {
          // Upload agent list separately
          _uploadAgentList(function () {
            State.set('lastSyncTime', Date.now());
            Events.emit(EVENTS.SYNC_UPLOAD_DONE, { error: hasError });
            console.log('[Uploader] Full upload sync complete');
            if (callback) callback(hasError ? { error: 'partial' } : null);
          });
        }
      });
    });
  }

  function _uploadPathData(path, dataArray, type, done) {
    if (!dataArray || dataArray.length === 0) {
      // Write empty object
      _db.ref(path).set({}, function (err) {
        if (err) console.error('[Uploader] Clear path error:', path, err);
        done(err);
      });
      return;
    }

    try {
      _db.ref(path).transaction(function (current) {
        var remote = Utils.fbObjToArray(current);
        var merged = Merger.mergeArray(dataArray, remote);

        // Write tombstones for recently deleted items that still exist remotely
        var recentlyDeleted = RecentlyDeleted.getByType(type);
        for (var i = 0; i < recentlyDeleted.length; i++) {
          var stillExists = remote.some(function (r) {
            return r._fbKey === recentlyDeleted[i].fbKey && !r._deleted;
          });
          if (stillExists) {
            var tombstone = {
              _fbKey: recentlyDeleted[i].fbKey,
              _deleted: true,
              _updatedAt: recentlyDeleted[i].deletedAt
            };
            merged.push(tombstone);
          }
        }

        // Clean old tombstones
        merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);

        // Convert to object for Firebase
        var obj = {};
        for (var j = 0; j < merged.length; j++) {
          if (merged[j]._fbKey) {
            obj[merged[j]._fbKey] = merged[j];
          }
        }
        return obj;
      }, function (err) {
        if (err) {
          console.error('[Uploader] Transaction error for path:', path, err);
        }
        done(err);
      });
    } catch (e) {
      console.error('[Uploader] _uploadPathData exception:', e);
      done(e);
    }
  }

  function _uploadAgentList(done) {
    var agentList = State.get('agentList');
    if (!agentList || agentList.length === 0) {
      done();
      return;
    }
    syncAgentListToFirebase(agentList, done);
  }

  return {
    enqueueUpload: enqueueUpload,
    syncUploadAll: syncUploadAll,
    getQueueLength: function () { return _queue.length; }
  };
})();

/* Global function aliases (for app.js calls) */
function enqueueUpload(task) {
  Uploader.enqueueUpload(task);
}

function syncUploadAll(callback) {
  Uploader.syncUploadAll(callback);
}
