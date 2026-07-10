/**
 * app.js — Application initialization
 * v8: Initializes all layers, sets up event listeners
 */
var App = (function () {

  function init() {
    console.log('[App] Initializing v' + APP.VERSION + '...');

    /* 1. Load all data from localStorage */
    loadFromStore();

    /* 2. Set default working month */
    if (!State.get('workingMonth')) {
      State.set('workingMonth', Utils.currentMonth());
    }
    Router.updateMonthDisplay();

    /* 3. Initialize hotel config with presets if empty */
    initHotelConfig();

    /* 4. Set up event listeners */
    setupEventListeners();

    /* 5. Initialize UI components */
    Keyboard.init();
    Toast.init();

    /* 6. Navigate to default page */
    Router.navigateTo('overview');

    /* 7. Initialize Firebase sync */
    initFirebase(function () {
      console.log('[App] Firebase ready, starting sync...');
      App.afterFirebaseReady();
    });

    console.log('[App] Initialization complete.');
  }

  function loadFromStore() {
    var data = Store.loadAll();
    State.set('bookings', data.bookings || []);
    State.set('hotelConfig', data.hotelConfig);
    State.set('agentList', data.agentList || []);
    State.set('employeeList', data.employeeList || []);
    State.set('archives', data.archives || []);
    State.set('closedMonths', data.closedMonths || []);
    State.set('settings', data.settings || {});
    if (data.workingMonth) {
      State.set('workingMonth', data.workingMonth);
    }
    console.log('[App] Loaded from store:', {
      bookings: (data.bookings || []).length,
      agents: (data.agentList || []).length,
      employees: (data.employeeList || []).length,
      archives: (data.archives || []).length
    });
  }

  function initHotelConfig() {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos || hc.casinos.length === 0) {
      console.log('[App] Hotel config empty, loading presets...');
      Hotels.loadPresets();
    }
  }

  function setupEventListeners() {
    /* Re-render current page when data changes */
    Events.on(EVENTS.BOOKINGS_LOADED, function () {
      var page = Router.getCurrentPage();
      Events.emit(EVENTS.UI_RENDER, { page: page });
    });

    Events.on(EVENTS.BOOKINGS_SYNCED, function () {
      var page = Router.getCurrentPage();
      Events.emit(EVENTS.UI_RENDER, { page: page });
    });

    /* Sync status updates */
    Events.on(EVENTS.SYNC_CONNECTED, function () {
      State.set('syncConnected', true);
      updateSyncIndicator(true);
    });

    Events.on(EVENTS.SYNC_DISCONNECTED, function () {
      State.set('syncConnected', false);
      updateSyncIndicator(false);
    });

    Events.on(EVENTS.SYNC_DOWNLOAD_DONE, function (data) {
      State.set('lastSyncTime', Date.now());
      updateLastSyncTime();
      Events.emit(EVENTS.UI_TOAST, { type: 'success', message: '同步完成' });
    });

    Events.on(EVENTS.SYNC_UPLOAD_DONE, function () {
      State.set('lastSyncTime', Date.now());
      updateLastSyncTime();
    });

    Events.on(EVENTS.SYNC_ERROR, function (data) {
      console.error('[App] Sync error:', data);
    });

    /* Month changed -> re-render */
    Events.on(EVENTS.MONTH_CHANGED, function () {
      Events.emit(EVENTS.UI_RENDER, {});
    });

    /* Update version label */
    var verEl = document.querySelector('.version-label');
    if (verEl) verEl.textContent = 'v' + APP.VERSION;
  }

  function updateSyncIndicator(connected) {
    var dot = document.getElementById('sync-dot');
    var text = document.getElementById('sync-status-text');
    if (dot) {
      dot.className = 'sync-dot ' + (connected ? 'connected' : 'disconnected');
    }
    if (text) {
      text.textContent = connected ? '已連線' : '未連線';
    }
  }

  function updateLastSyncTime() {
    var el = document.getElementById('last-sync-time');
    if (!el) return;
    var t = State.get('lastSyncTime');
    if (!t) {
      el.textContent = '--';
      return;
    }
    var d = new Date(t);
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    el.textContent = hh + ':' + mm;
  }

  /* Called after Firebase auth success */
  function afterFirebaseReady() {
    console.log('[App] Firebase ready, starting watchers + sync...');
    if (typeof startWatchers === 'function') {
      startWatchers();
    }
    if (typeof syncDownloadAll === 'function') {
      syncDownloadAll();
    }
  }

  return {
    init: init,
    afterFirebaseReady: afterFirebaseReady,
    loadFromStore: loadFromStore,
    updateSyncIndicator: updateSyncIndicator,
    updateLastSyncTime: updateLastSyncTime
  };
})();
