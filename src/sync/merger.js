/**
 * merger.js — Conflict Resolution via Timestamp
 * Pattern: faithfully reused from v13.0.5
 * Rule: _updatedAt larger wins (including tombstones)
 * Does NOT filter tombstones — that is the caller's responsibility
 */
var Merger = {
  /**
   * Merge two booking arrays by _fbKey
   * @param {Array} local - local bookings
   * @param {Array} remote - remote bookings from Firebase
   * @returns {Array} merged array (may contain tombstones)
   */
  mergeBookings: function (local, remote) {
    local = local || [];
    remote = remote || [];
    var map = {};
    var merged = [];
    var i;

    // Index local items
    for (i = 0; i < local.length; i++) {
      var item = local[i];
      if (item && item._fbKey) {
        map[item._fbKey] = item;
      }
    }

    // Merge remote items (remote wins if newer)
    for (i = 0; i < remote.length; i++) {
      var rItem = remote[i];
      if (!rItem || !rItem._fbKey) continue;
      var lItem = map[rItem._fbKey];

      if (!lItem) {
        // Remote only — add it
        map[rItem._fbKey] = rItem;
      } else {
        // Both exist — timestamp decides
        var lTs = lItem._updatedAt || 0;
        var rTs = rItem._updatedAt || 0;
        if (rTs > lTs) {
          map[rItem._fbKey] = rItem;
        }
        // else keep local
      }
    }

    // Convert map to array
    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        merged.push(map[key]);
      }
    }

    return merged;
  },

  /**
   * Generic merge for any array with _fbKey and _updatedAt
   */
  mergeArray: function (local, remote) {
    return Merger.mergeBookings(local, remote);
  },

  /**
   * Merge hotel config (same logic as bookings)
   */
  mergeHotelConfig: function (local, remote) {
    return Merger.mergeBookings(local, remote);
  },

  /**
   * Clean tombstones older than TTL
   * @param {Array} arr - array potentially containing tombstones
   * @param {number} ttlMs - TTL in milliseconds
   * @returns {Array} cleaned array (tombstones removed)
   */
  cleanOldTombstones: function (arr, ttlMs) {
    if (!arr || !arr.length) return arr || [];
    var now = Date.now();
    return arr.filter(function (item) {
      if (item && item._deleted) {
        var age = now - (item._updatedAt || 0);
        return age < (ttlMs || CONFIG.TOMBSTONE_TTL_MS);
      }
      return true;
    });
  },

  /**
   * Filter out tombstones (deleted items)
   */
  filterAlive: function (arr) {
    if (!arr) return [];
    return arr.filter(function (item) {
      return !item || !item._deleted;
    });
  }
};
