/**
 * app.js — Main Application Entry Point
 * Pattern: reused from v13.0.5
 * Flow: loadAll → initAuth → initFirebase → startWatchers → renderAll
 */
var App = (function () {
  var _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    console.log('[App] Initializing ' + APP.TITLE + ' v' + APP.VERSION);

    // 1. Load all data from localStorage
    var stats = Store.loadAll();
    console.log('[App] Loaded from localStorage:', stats);

    // 2. Initialize auth
    Auth.init();

    // 3. Set default working month
    if (!State.get('workingMonth')) {
      State.set('workingMonth', Utils.getCurrentMonth());
    }

    // 4. Load hotel config preset if empty
    if (State.get('hotelConfig').length === 0) {
      Hotels.resetToPreset();
    }

    // 5. Register keyboard shortcuts
    Keyboard.init();

    // 6. Register event listeners
    _registerEventListeners();

    // 7. Render initial page
    _renderAll();

    // 8. Initialize Firebase sync
    initFirebase(_onFirebaseReady);

    console.log('[App] Initialization complete');
  }

  function _onFirebaseReady() {
    console.log('[App] Firebase ready, starting watchers');
    startWatchers();
    setTimeout(function () {
      syncDownloadAll();
    }, CONFIG.SYNC_RECONNECT_DELAY);
    setTimeout(function () {
      syncUploadAll();
    }, CONFIG.SYNC_UPLOAD_DELAY);
  }

  function _registerEventListeners() {
    // Re-render on data changes
    Events.on(EVENTS.BOOKINGS_LOADED, function () {
      _renderCurrentPage();
    });
    Events.on(EVENTS.HC_LOADED, function () {
      _renderCurrentPage();
    });
    Events.on(EVENTS.AGENT_LIST_UPDATED, function () {
      _renderCurrentPage();
    });
    Events.on(EVENTS.PAGE_CHANGED, function (page) {
      _renderPage(page);
    });
    Events.on(EVENTS.SYNC_STATUS, function () {
      _updateSyncIndicator();
    });
    Events.on(EVENTS.UI_RENDER, function () {
      _renderCurrentPage();
    });
  }

  function _renderAll() {
    var page = State.get('currentPage') || PAGES.OVERVIEW;
    Router.switchTo(page);
  }

  function _renderCurrentPage() {
    var page = State.get('currentPage');
    if (page) _renderPage(page);
  }

  function _renderPage(page) {
    try {
      switch (page) {
        case PAGES.OVERVIEW:
          if (typeof renderOverview === 'function') renderOverview();
          break;
        case PAGES.CALENDAR:
          if (typeof renderCalendar === 'function') renderCalendar();
          break;
        case PAGES.BOOKING_LIST:
          if (typeof renderBookingList === 'function') renderBookingList();
          break;
        case PAGES.STATS:
          if (typeof renderStats === 'function') renderStats();
          break;
        case PAGES.BOT_LOG:
          if (typeof renderBotLog === 'function') renderBotLog();
          break;
      }
    } catch (err) {
      console.error('[App] Render error for page "' + page + '":', err);
    }
  }

  function _updateSyncIndicator() {
    var el = document.getElementById('sync-status');
    if (!el) return;
    var connected = State.get('syncConnected');
    if (connected) {
      el.className = 'sync-status connected';
      el.title = '已連線';
    } else {
      el.className = 'sync-status disconnected';
      el.title = '未連線';
    }
    var lastSync = State.get('lastSyncTime');
    if (lastSync) {
      var timeStr = new Date(lastSync).toLocaleTimeString('zh-TW');
      var timeEl = document.getElementById('last-sync-time');
      if (timeEl) timeEl.textContent = timeStr;
    }
  }

  function afterLogin() {
    init();
  }

  return {
    init: init,
    afterLogin: afterLogin
  };
})();
