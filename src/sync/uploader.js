/**
 * uploader.js — Upload Queue + Batch Sync
 * v8: Supports bookings, hotelConfig, agentList, employeeList, archives,
 *     closedMonths, settings, botLogs
 */
var Uploader = (function () {
  var _queue = [];
  var _processing = false;

  function enqueueUpload(task) {
    if (!task) return;
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
      setTimeout(function () {
        _processQueue();
      }, 1000);
      return;
    }
    var task = _queue.shift();
    _executeTask(task, function () {
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
          } else { done(); }
          break;

        case 'hotelConfig':
          if (task.action === 'set') {
            syncHCToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'agentList':
          if (task.action === 'set') {
            syncAgentListToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'employeeList':
          if (task.action === 'set') {
            syncEmployeeListToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'archive':
          if (task.action === 'set') {
            syncArchiveToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'closedMonths':
          if (task.action === 'set') {
            syncClosedMonthsToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'settings':
          if (task.action === 'set') {
            syncSettingsToFirebase(task.data, done);
          } else { done(); }
          break;

        case 'botLog':
          if (task.action === 'set') {
            syncBotLogToFirebase(task.data, done);
          } else { done(); }
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

    /* Array-based paths (use transaction merge) */
    var arrayPaths = [
      { path: FB_PATH.BOOKINGS, data: State.get('bookings'), type: 'booking' },
      { path: FB_PATH.ARCHIVES, data: State.get('archives'), type: 'archive' }
    ];

    /* Object-based paths (direct set) */
    var objectPaths = [
      { path: FB_PATH.HOTEL_CONFIG, data: State.get('hotelConfig'), syncFn: syncHCToFirebase },
      { path: FB_PATH.CLOSED_MONTHS, data: State.get('closedMonths'), syncFn: syncClosedMonthsToFirebase },
      { path: FB_PATH.SETTINGS, data: State.get('settings'), syncFn: syncSettingsToFirebase }
    ];

    var pending = arrayPaths.length + objectPaths.length + 2; /* +2 for agent & employee list */
    var hasError = false;

    function _checkDone(err) {
      if (err) hasError = true;
      pending--;
      if (pending === 0) {
        State.set('lastSyncTime', Date.now());
        Events.emit(EVENTS.SYNC_UPLOAD_DONE, { error: hasError });
        console.log('[Uploader] Full upload sync complete');
        if (callback) callback(hasError ? { error: 'partial' } : null);
      }
    }

    /* Array paths */
    arrayPaths.forEach(function (item) {
      _uploadArrayPath(item.path, item.data, item.type, _checkDone);
    });

    /* Object paths */
    objectPaths.forEach(function (item) {
      if (item.data) {
        item.syncFn(item.data, _checkDone);
      } else {
        _checkDone(null);
      }
    });

    /* Agent list */
    var agentList = State.get('agentList');
    if (agentList && agentList.length > 0) {
      syncAgentListToFirebase(agentList, _checkDone);
    } else {
      _checkDone(null);
    }

    /* Employee list */
    var employeeList = State.get('employeeList');
    if (employeeList && employeeList.length > 0) {
      syncEmployeeListToFirebase(employeeList, _checkDone);
    } else {
      _checkDone(null);
    }
  }

  function _uploadArrayPath(path, dataArray, type, done) {
    if (!dataArray || dataArray.length === 0) {
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

        /* Write tombstones for recently deleted items */
        var recentlyDeleted = RecentlyDeleted.getByType(type);
        for (var i = 0; i < recentlyDeleted.length; i++) {
          var stillExists = remote.some(function (r) {
            return r._fbKey === recentlyDeleted[i].fbKey && !r._deleted;
          });
          if (stillExists) {
            merged.push({
              _fbKey: recentlyDeleted[i].fbKey,
              _deleted: true,
              _updatedAt: recentlyDeleted[i].deletedAt
            });
          }
        }

        merged = Merger.cleanOldTombstones(merged, CONFIG.TOMBSTONE_TTL_MS);

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
      console.error('[Uploader] _uploadArrayPath exception:', e);
      done(e);
    }
  }

  return {
    enqueueUpload: enqueueUpload,
    syncUploadAll: syncUploadAll,
    getQueueLength: function () { return _queue.length; }
  };
})();

/* Global function aliases */
function enqueueUpload(task) {
  Uploader.enqueueUpload(task);
}

function syncUploadAll(callback) {
  Uploader.syncUploadAll(callback);
}
