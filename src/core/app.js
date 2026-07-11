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

    /* 3.5 Initialize agent list with presets if empty */
    initAgentList();

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
    try {
      var hc = State.get('hotelConfig');
      if (!hc || !hc.casinos || hc.casinos.length === 0) {
        console.log('[App] Hotel config empty, loading presets...');
        Hotels.loadPresets();
      } else {
        console.log('[App] Hotel config loaded: ' + hc.casinos.length + ' casinos');
      }
    } catch (e) {
      console.error('[App] initHotelConfig error:', e);
      /* Last resort: try loading presets directly */
      try {
        Hotels.loadPresets();
        console.log('[App] Hotel presets loaded after error recovery');
      } catch (e2) {
        console.error('[App] Hotel presets load also failed:', e2);
      }
    }
  }

  function initAgentList() {
    var list = State.get('agentList');
    if (!list || list.length === 0) {
      console.log('[App] Agent list empty - user will add agents manually or via sync');
      return;
    }
    /* Clean up any duplicates that may have accumulated from old sync issues */
    try {
      var cleaned = Agents.deduplicate ? Agents.deduplicate() : list;
      if (cleaned && cleaned.length !== list.length) {
        console.log('[App] Cleaned duplicate agents:', list.length, '->', cleaned.length);
        State.set('agentList', cleaned);
        Store.saveAgentList(cleaned);
        syncAgentListToFirebase(cleaned);
      }
    } catch (e) {
      console.error('[App] Agent deduplication error:', e);
    }
  }

  function setupEventListeners() {
    /* Page changed -> render */
    Events.on(EVENTS.PAGE_CHANGED, function (data) {
      _renderPage(data.page);
    });

    /* UI render request -> render current page */
    Events.on(EVENTS.UI_RENDER, function (data) {
      _renderPage(data.page || Router.getCurrentPage());
    });

    /* Re-render current page when data changes */
    Events.on(EVENTS.BOOKINGS_LOADED, function () {
      Events.emit(EVENTS.UI_RENDER, { page: Router.getCurrentPage() });
    });

    Events.on(EVENTS.BOOKINGS_SYNCED, function () {
      Events.emit(EVENTS.UI_RENDER, { page: Router.getCurrentPage() });
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

    /* Settings changed -> sync to Firebase */
    Events.on(EVENTS.SYNC_SETTINGS, function (settings) {
      syncSettingsToFirebase(settings, function (err) {
        if (err) console.error('[App] Settings sync error:', err);
      });
    });

    /* Loading overlay control */
    Events.on(EVENTS.UI_LOADING, function (data) {
      if (data && data.show) {
        App.showLoading(data.text || '載入中...');
      } else {
        App.hideLoading();
      }
    });

    /* Show loading during sync upload */
    Events.on(EVENTS.SYNC_UPLOAD_START, function () {
      App.showLoading('同步中...');
    });

    Events.on(EVENTS.SYNC_UPLOAD_DONE, function () {
      App.hideLoading();
    });

    /* Month changed -> re-render */
    Events.on(EVENTS.MONTH_CHANGED, function () {
      Events.emit(EVENTS.UI_RENDER, {});
    });

    /* Update version label */
    var verEl = document.querySelector('.version-label');
    if (verEl) verEl.textContent = 'v' + APP.VERSION;
  }

  /* Render a page by ID */
  function _renderPage(pageId) {
    var map = {
      overview: 'renderOverview',
      profit: 'renderProfit',
      fees: 'renderFees',
      'agent-performance': 'renderAgentPerformance',
      archives: 'renderArchives',
      employees: 'renderEmployees',
      'hotel-config': 'renderHotelConfig'
    };
    var fn = map[pageId];
    if (fn && typeof window[fn] === 'function') {
      window[fn]();
    } else {
      console.warn('[App] No render function for page:', pageId);
    }
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
    /* Toggle offline indicator in topbar */
    var offlineEl = document.getElementById('offline-indicator');
    if (offlineEl) {
      if (connected) {
        offlineEl.classList.remove('visible');
      } else {
        offlineEl.classList.add('visible');
      }
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

  /* Loading overlay control */
  function showLoading(text) {
    var overlay = document.getElementById('loading-overlay');
    var textEl = document.getElementById('loading-text');
    if (textEl) textEl.textContent = text || '載入中...';
    if (overlay) overlay.classList.add('visible');
  }

  function hideLoading() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('visible');
  }

  return {
    init: init,
    afterFirebaseReady: afterFirebaseReady,
    loadFromStore: loadFromStore,
    updateSyncIndicator: updateSyncIndicator,
    updateLastSyncTime: updateLastSyncTime,
    showLoading: showLoading,
    hideLoading: hideLoading
  };
})();
