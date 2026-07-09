/**
 * store.js — localStorage Persistence Layer
 * Pattern: faithfully reused from v13.0.5
 * Features: AES encryption, save/load per-key, saveAll/loadAll, clearLocalData
 */
var Store = (function () {
  var _isAvailable = false;

  function _checkAvailable() {
    try {
      var test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      _isAvailable = true;
    } catch (e) {
      _isAvailable = false;
      console.warn('[Store] localStorage not available:', e.message);
    }
    return _isAvailable;
  }

  function _encrypt(data) {
    try {
      if (typeof CryptoJS === 'undefined') return JSON.stringify(data);
      return CryptoJS.AES.encrypt(JSON.stringify(data), 'booking-system-v1').toString();
    } catch (e) {
      console.error('[Store] Encrypt failed:', e);
      return JSON.stringify(data);
    }
  }

  function _decrypt(str) {
    try {
      // Try JSON first (fallback mode)
      if (str.charAt(0) === '{' || str.charAt(0) === '[') {
        return JSON.parse(str);
      }
      if (typeof CryptoJS === 'undefined') return JSON.parse(str);
      var bytes = CryptoJS.AES.decrypt(str, 'booking-system-v1');
      var decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (e) {
      console.error('[Store] Decrypt failed:', e);
      return null;
    }
  }

  function save(key, data, encrypt) {
    if (!_isAvailable) _checkAvailable();
    if (!_isAvailable) return false;
    try {
      var str = encrypt ? _encrypt(data) : JSON.stringify(data);
      localStorage.setItem(key, str);
      return true;
    } catch (e) {
      console.error('[Store] Save failed for key "' + key + '":', e);
      return false;
    }
  }

  function load(key, decrypt) {
    if (!_isAvailable) _checkAvailable();
    if (!_isAvailable) return null;
    try {
      var str = localStorage.getItem(key);
      if (str === null) return null;
      return decrypt ? _decrypt(str) : JSON.parse(str);
    } catch (e) {
      console.error('[Store] Load failed for key "' + key + '":', e);
      return null;
    }
  }

  function remove(key) {
    if (!_isAvailable) _checkAvailable();
    if (!_isAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[Store] Remove failed for key "' + key + '":', e);
    }
  }

  /* ===== Booking-specific methods ===== */
  function saveBookings(bookings) {
    return save(STORAGE_KEYS.BOOKINGS, bookings, true);
  }

  function loadBookings() {
    return load(STORAGE_KEYS.BOOKINGS, true) || [];
  }

  function saveHotelConfig(config) {
    return save(STORAGE_KEYS.HOTEL_CONFIG, config, true);
  }

  function loadHotelConfig() {
    return load(STORAGE_KEYS.HOTEL_CONFIG, true) || [];
  }

  function saveAgentList(list) {
    return save(STORAGE_KEYS.AGENT_LIST, list, true);
  }

  function loadAgentList() {
    return load(STORAGE_KEYS.AGENT_LIST, true) || [];
  }

  function saveBotLogs(logs) {
    return save(STORAGE_KEYS.BOT_LOGS, logs, true);
  }

  function loadBotLogs() {
    return load(STORAGE_KEYS.BOT_LOGS, true) || [];
  }

  function saveWorkingMonth(month) {
    return save(STORAGE_KEYS.WORKING_MONTH, month, false);
  }

  function loadWorkingMonth() {
    return load(STORAGE_KEYS.WORKING_MONTH, false);
  }

  function saveAuth(auth) {
    return save(STORAGE_KEYS.AUTH, auth, true);
  }

  function loadAuth() {
    return load(STORAGE_KEYS.AUTH, true);
  }

  function saveRecentlyDeleted(data) {
    return save(STORAGE_KEYS.RECENTLY_DELETED, data, true);
  }

  function loadRecentlyDeleted() {
    return load(STORAGE_KEYS.RECENTLY_DELETED, true) || [];
  }

  /* ===== Batch operations ===== */
  function saveAll() {
    saveBookings(State.get('bookings'));
    saveHotelConfig(State.get('hotelConfig'));
    saveAgentList(State.get('agentList'));
    saveBotLogs(State.get('botLogs'));
    var month = State.get('workingMonth');
    if (month) saveWorkingMonth(month);
    save(STORAGE_KEYS.APP_VERSION, APP.VERSION, false);
  }

  function loadAll() {
    var bookings = loadBookings();
    var hotelConfig = loadHotelConfig();
    var agentList = loadAgentList();
    var botLogs = loadBotLogs();
    var workingMonth = loadWorkingMonth();

    State.batchSet([
      { key: 'bookings',    value: bookings    },
      { key: 'hotelConfig', value: hotelConfig },
      { key: 'agentList',   value: agentList   },
      { key: 'botLogs',     value: botLogs     },
      { key: 'workingMonth',value: workingMonth }
    ]);

    return {
      bookings: bookings.length,
      hotelConfig: hotelConfig.length,
      agentList: agentList.length,
      botLogs: botLogs.length,
      workingMonth: workingMonth
    };
  }

  function clearLocalData() {
    if (!_isAvailable) _checkAvailable();
    if (!_isAvailable) return;
    // Preserve AGENT_LIST (same pattern as v13.0.5)
    var keysToClear = [
      STORAGE_KEYS.BOOKINGS,
      STORAGE_KEYS.HOTEL_CONFIG,
      STORAGE_KEYS.DRAFT,
      STORAGE_KEYS.ARCHIVES,
      STORAGE_KEYS.SAVED_FILTERS,
      STORAGE_KEYS.BACKUP_LIST,
      STORAGE_KEYS.WORKING_MONTH,
      STORAGE_KEYS.RECENTLY_DELETED,
      STORAGE_KEYS.BOT_LOGS,
      STORAGE_KEYS.LAST_SYNC_TIME
    ];
    // Also clear any backup entries
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(STORAGE_KEYS.BACKUP_PREFIX) === 0) {
        keysToClear.push(key);
      }
    }
    for (var j = 0; j < keysToClear.length; j++) {
      try {
        localStorage.removeItem(keysToClear[j]);
      } catch (e) {
        console.error('[Store] Failed to clear key:', keysToClear[j], e);
      }
    }
  }

  _checkAvailable();

  return {
    save: save,
    load: load,
    remove: remove,
    saveBookings: saveBookings,
    loadBookings: loadBookings,
    saveHotelConfig: saveHotelConfig,
    loadHotelConfig: loadHotelConfig,
    saveAgentList: saveAgentList,
    loadAgentList: loadAgentList,
    saveBotLogs: saveBotLogs,
    loadBotLogs: loadBotLogs,
    saveWorkingMonth: saveWorkingMonth,
    loadWorkingMonth: loadWorkingMonth,
    saveAuth: saveAuth,
    loadAuth: loadAuth,
    saveRecentlyDeleted: saveRecentlyDeleted,
    loadRecentlyDeleted: loadRecentlyDeleted,
    saveAll: saveAll,
    loadAll: loadAll,
    clearLocalData: clearLocalData,
    isAvailable: function () { return _isAvailable; }
  };
})();
