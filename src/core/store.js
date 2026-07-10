/**
 * store.js — localStorage persistence layer
 * Encrypts sensitive data, stores all collections
 * Pattern: faithfully reused from v13.0.5
 */
var Store = (function () {

  function _encrypt(data) {
    try {
      var json = JSON.stringify(data);
      if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.AES.encrypt(json, 'bookinghub_v2').toString();
      }
      return json;
    } catch (e) {
      console.error('[Store] Encrypt error:', e);
      return JSON.stringify(data);
    }
  }

  function _decrypt(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    try {
      if (typeof CryptoJS !== 'undefined' && raw.charAt(0) === 'U') {
        var bytes = CryptoJS.AES.decrypt(raw, 'bookinghub_v2');
        var json = bytes.toString(CryptoJS.enc.Utf8);
        if (json) return JSON.parse(json);
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('[Store] Decrypt error:', e);
      try { return JSON.parse(raw); } catch (e2) { return null; }
    }
  }

  function save(key, data) {
    try {
      var raw = _encrypt(data);
      localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      console.error('[Store] Save error for key "' + key + '":', e);
      return false;
    }
  }

  function load(key) {
    try {
      var raw = localStorage.getItem(key);
      return _decrypt(raw);
    } catch (e) {
      console.error('[Store] Load error for key "' + key + '":', e);
      return null;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[Store] Remove error for key "' + key + '":', e);
    }
  }

  /* ===== Collection-specific helpers ===== */

  function saveBookings(bookings) {
    return save(STORAGE_KEYS.BOOKINGS, bookings);
  }

  function loadBookings() {
    return load(STORAGE_KEYS.BOOKINGS) || [];
  }

  function saveHotelConfig(config) {
    return save(STORAGE_KEYS.HOTEL_CONFIG, config);
  }

  function loadHotelConfig() {
    return load(STORAGE_KEYS.HOTEL_CONFIG);
  }

  function saveAgentList(list) {
    return save(STORAGE_KEYS.AGENT_LIST, list);
  }

  function loadAgentList() {
    return load(STORAGE_KEYS.AGENT_LIST) || [];
  }

  function saveEmployeeList(list) {
    return save(STORAGE_KEYS.EMPLOYEE_LIST, list);
  }

  function loadEmployeeList() {
    return load(STORAGE_KEYS.EMPLOYEE_LIST) || [];
  }

  function saveArchives(archives) {
    return save(STORAGE_KEYS.ARCHIVES, archives);
  }

  function loadArchives() {
    return load(STORAGE_KEYS.ARCHIVES) || [];
  }

  function saveClosedMonths(months) {
    return save(STORAGE_KEYS.CLOSED_MONTHS, months);
  }

  function loadClosedMonths() {
    return load(STORAGE_KEYS.CLOSED_MONTHS) || [];
  }

  function saveSettings(settings) {
    return save(STORAGE_KEYS.SETTINGS, settings);
  }

  function loadSettings() {
    return load(STORAGE_KEYS.SETTINGS) || {};
  }

  function saveAuth(auth) {
    return save(STORAGE_KEYS.AUTH, auth);
  }

  function loadAuth() {
    return load(STORAGE_KEYS.AUTH);
  }

  function saveWorkingMonth(month) {
    return save(STORAGE_KEYS.WORKING_MONTH, month);
  }

  function loadWorkingMonth() {
    return load(STORAGE_KEYS.WORKING_MONTH);
  }

  function saveDraft(draft) {
    return save(STORAGE_KEYS.DRAFT, draft);
  }

  function loadDraft() {
    return load(STORAGE_KEYS.DRAFT);
  }

  function clearDraft() {
    remove(STORAGE_KEYS.DRAFT);
  }

  function saveRecentlyDeleted(list) {
    return save(STORAGE_KEYS.RECENTLY_DELETED, list);
  }

  function loadRecentlyDeleted() {
    return load(STORAGE_KEYS.RECENTLY_DELETED) || [];
  }

  function saveBotLogs(logs) {
    return save(STORAGE_KEYS.BOT_LOGS, logs);
  }

  function loadBotLogs() {
    return load(STORAGE_KEYS.BOT_LOGS) || [];
  }

  /* ===== Load all at once ===== */
  function loadAll() {
    return {
      bookings: loadBookings(),
      hotelConfig: loadHotelConfig(),
      agentList: loadAgentList(),
      employeeList: loadEmployeeList(),
      archives: loadArchives(),
      closedMonths: loadClosedMonths(),
      settings: loadSettings(),
      auth: loadAuth(),
      workingMonth: loadWorkingMonth(),
      draft: loadDraft()
    };
  }

  /* ===== Clear all (except agent list per v13 pattern) ===== */
  function clearAll(keepAgentList) {
    var keysToClear = [
      STORAGE_KEYS.BOOKINGS,
      STORAGE_KEYS.HOTEL_CONFIG,
      STORAGE_KEYS.EMPLOYEE_LIST,
      STORAGE_KEYS.ARCHIVES,
      STORAGE_KEYS.DRAFT,
      STORAGE_KEYS.CLOSED_MONTHS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.RECENTLY_DELETED,
      STORAGE_KEYS.WORKING_MONTH,
      STORAGE_KEYS.BOT_LOGS
    ];
    if (!keepAgentList) {
      keysToClear.push(STORAGE_KEYS.AGENT_LIST);
    }
    for (var i = 0; i < keysToClear.length; i++) {
      remove(keysToClear[i]);
    }
  }

  return {
    save: save,
    load: load,
    remove: remove,
    /* Collections */
    saveBookings: saveBookings,
    loadBookings: loadBookings,
    saveHotelConfig: saveHotelConfig,
    loadHotelConfig: loadHotelConfig,
    saveAgentList: saveAgentList,
    loadAgentList: loadAgentList,
    saveEmployeeList: saveEmployeeList,
    loadEmployeeList: loadEmployeeList,
    saveArchives: saveArchives,
    loadArchives: loadArchives,
    saveClosedMonths: saveClosedMonths,
    loadClosedMonths: loadClosedMonths,
    saveSettings: saveSettings,
    loadSettings: loadSettings,
    saveAuth: saveAuth,
    loadAuth: loadAuth,
    saveWorkingMonth: saveWorkingMonth,
    loadWorkingMonth: loadWorkingMonth,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
    saveRecentlyDeleted: saveRecentlyDeleted,
    loadRecentlyDeleted: loadRecentlyDeleted,
    saveBotLogs: saveBotLogs,
    loadBotLogs: loadBotLogs,
    loadAll: loadAll,
    clearAll: clearAll
  };
})();
