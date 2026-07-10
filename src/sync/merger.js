/**
 * merger.js — Conflict Resolution via Timestamp
 * v8: Supports bookings, hotelConfig (object), agentList, employeeList, archives
 * Rule: _updatedAt larger wins (including tombstones)
 * Does NOT filter tombstones — that is the caller's responsibility
 */
var Merger = {

  /**
   * Merge two arrays by _fbKey (generic for bookings, archives, etc.)
   */
  mergeArray: function (local, remote) {
    local = local || [];
    remote = remote || [];
    var map = {};
    var merged = [];
    var i;

    for (i = 0; i < local.length; i++) {
      var item = local[i];
      if (item && item._fbKey) {
        map[item._fbKey] = item;
      }
    }

    for (i = 0; i < remote.length; i++) {
      var rItem = remote[i];
      if (!rItem || !rItem._fbKey) continue;
      var lItem = map[rItem._fbKey];

      if (!lItem) {
        map[rItem._fbKey] = rItem;
      } else {
        var lTs = lItem._updatedAt || 0;
        var rTs = rItem._updatedAt || 0;
        if (rTs > lTs) {
          map[rItem._fbKey] = rItem;
        }
      }
    }

    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        merged.push(map[key]);
      }
    }

    return merged;
  },

  /* Alias for backward compatibility */
  mergeBookings: function (local, remote) {
    return Merger.mergeArray(local, remote);
  },

  /**
   * Merge hotel config (single object, not array)
   * Remote wins if _updatedAt is newer
   */
  mergeHotelConfig: function (local, remote) {
    if (!local && !remote) return null;
    if (!local) return remote;
    if (!remote) return local;

    var lTs = (local._updatedAt || 0);
    var rTs = (remote._updatedAt || 0);

    if (rTs > lTs) {
      return remote;
    }
    return local;
  },

  /**
   * Merge agent list (union by id/name, remote wins on conflict)
   */
  mergeAgentList: function (local, remote) {
    local = local || [];
    remote = remote || [];
    var map = {};
    var merged = [];

    for (var i = 0; i < local.length; i++) {
      var id = local[i].id || local[i].name || String(local[i]);
      map[id] = local[i];
    }

    for (var j = 0; j < remote.length; j++) {
      var rId = remote[j].id || remote[j].name || String(remote[j]);
      if (!map[rId]) {
        map[rId] = remote[j];
      } else {
        var lTs = map[rId]._updatedAt || 0;
        var rTs = remote[j]._updatedAt || 0;
        if (rTs > lTs) {
          map[rId] = remote[j];
        }
      }
    }

    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        merged.push(map[key]);
      }
    }

    return merged;
  },

  /**
   * Merge employee list (same as agent list)
   */
  mergeEmployeeList: function (local, remote) {
    return Merger.mergeAgentList(local, remote);
  },

  /**
   * Clean tombstones older than TTL
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
      return item && !item._deleted;
    });
  }
};
