/**
 * recently-deleted.js — Track recently deleted items for anti-resurrection
 * Pattern: faithfully reused from v13.0.5
 * Prevents deleted items from being "resurrected" by sync download
 */
var RecentlyDeleted = (function () {
  var _list = [];

  function _load() {
    _list = Store.loadRecentlyDeleted() || [];
  }

  function _save() {
    Store.saveRecentlyDeleted(_list);
  }

  function track(type, fbKey) {
    if (!type || !fbKey) return;
    _list.push({
      type: type,
      fbKey: fbKey,
      deletedAt: Date.now()
    });

    // Trim to limit
    if (_list.length > CONFIG.RECENTLY_DELETED_LIMIT) {
      _list = _list.slice(-CONFIG.RECENTLY_DELETED_LIMIT);
    }
    _save();
  }

  function contains(type, fbKey) {
    for (var i = 0; i < _list.length; i++) {
      if (_list[i].type === type && _list[i].fbKey === fbKey) {
        return true;
      }
    }
    return false;
  }

  function remove(fbKey) {
    _list = _list.filter(function (item) {
      return item.fbKey !== fbKey;
    });
    _save();
  }

  function getByType(type) {
    return _list.filter(function (item) {
      return item.type === type;
    });
  }

  function clear() {
    _list = [];
    _save();
  }

  function getAll() {
    return _list.slice();
  }

  function cleanExpired() {
    var now = Date.now();
    var before = _list.length;
    _list = _list.filter(function (item) {
      return (now - item.deletedAt) < CONFIG.TOMBSTONE_TTL_MS;
    });
    if (_list.length !== before) {
      _save();
    }
  }

  _load();

  return {
    track: track,
    contains: contains,
    remove: remove,
    getByType: getByType,
    clear: clear,
    getAll: getAll,
    cleanExpired: cleanExpired
  };
})();
