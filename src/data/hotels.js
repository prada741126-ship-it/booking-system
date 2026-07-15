/**
 * hotels.js — Hotel Configuration CRUD + Preset Data
 * v8: Tree structure (casino -> hotel -> roomType)
 *     6 casino groups, 15 hotels, 6 room types per hotel
 *     Management can CRUD at all three levels via Web backend
 *     HC is a single object synced via syncHCToFirebase()
 */

var PRESET_VERSION = '4';

/* Default room config for new hotels */
function _defaultRoomConfig(baseThreshold) {
  var t = baseThreshold || 300000;
  var config = {};
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    config[ROOM_TYPES[i].value] = { threshold: t, defaultPrice: 0 };
  }
  return config;
}

var PRESET_CASINOS = [
  /* ===== 新濠天地 ===== */
  {
    name: '新濠天地',
    hotels: [
      {
        name: '新濠天地',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '摩珀斯',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 新濠影滙 ===== */
  {
    name: '新濠影滙',
    hotels: [
      {
        name: '新濠影滙',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 金沙 ===== */
  {
    name: '金沙',
    hotels: [
      {
        name: '金沙城中心',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '康萊德',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 600000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 4000000, defaultPrice: 0 }
        }
      },
      {
        name: '瑞吉',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 銀河 ===== */
  {
    name: '銀河',
    hotels: [
      {
        name: '銀河',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      },
      {
        name: '悅榕庄',
        roomConfig: {
          'king':            { threshold: 500000,  defaultPrice: 0 },
          'twin':            { threshold: 500000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 800000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 3000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 6000000, defaultPrice: 0 }
        }
      },
      {
        name: '大倉',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: 'JW萬豪',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 600000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 4000000, defaultPrice: 0 }
        }
      },
      {
        name: '百老匯',
        roomConfig: {
          'king':            { threshold: 200000,  defaultPrice: 0 },
          'twin':            { threshold: 200000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 400000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 800000,  defaultPrice: 0 },
          'two-bedroom':     { threshold: 1500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      },
      {
        name: '麗思卡爾頓',
        roomConfig: {
          'king':            { threshold: 600000,  defaultPrice: 0 },
          'twin':            { threshold: 600000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 1000000, defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 3000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 永利 ===== */
  {
    name: '永利',
    hotels: [
      {
        name: '永利澳門',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1500000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      },
      {
        name: '永利皇宮',
        roomConfig: {
          'king':            { threshold: 400000,  defaultPrice: 0 },
          'twin':            { threshold: 400000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 700000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1200000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2500000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 5000000, defaultPrice: 0 }
        }
      }
    ]
  },
  /* ===== 上葡京 ===== */
  {
    name: '上葡京',
    hotels: [
      {
        name: '上葡京',
        roomConfig: {
          'king':            { threshold: 300000,  defaultPrice: 0 },
          'twin':            { threshold: 300000,  defaultPrice: 0 },
          'mini-suite':      { threshold: 500000,  defaultPrice: 0 },
          'grand-suite':     { threshold: 1000000, defaultPrice: 0 },
          'two-bedroom':     { threshold: 2000000, defaultPrice: 0 },
          'three-bedroom':   { threshold: 3000000, defaultPrice: 0 }
        }
      }
    ]
  }
];

var Hotels = {

  /* ===== Load / Reset ===== */

  /**
   * Load preset configuration (called by App.initHotelConfig)
   * @param {boolean} skipSync - if true, don't push to Firebase (used during init)
   */
  loadPresets: function (skipSync) {
    var config = {
      version: PRESET_VERSION,
      _updatedAt: Date.now(),
      casinos: JSON.parse(JSON.stringify(PRESET_CASINOS))
    };
    State.set('hotelConfig', config);
    Store.saveHotelConfig(config);
    if (!skipSync) {
      try {
        syncHCToFirebase(config);
      } catch (e) {
        console.error('[Hotels] syncHCToFirebase error (non-critical):', e);
      }
    }
    Events.emit(EVENTS.HC_LOADED, config);
    console.log('[Hotels] Presets loaded:', config.casinos.length, 'casinos', skipSync ? '(skipSync)' : '');
    return config;
  },

  /**
   * Reset to preset (user action via Web backend)
   */
  resetToPreset: function () {
    return Hotels.loadPresets();
  },

  /* ===== Casino CRUD ===== */

  addCasino: function (name) {
    if (!name) return null;
    var hc = State.get('hotelConfig');
    if (!hc) hc = { version: PRESET_VERSION, _updatedAt: Date.now(), casinos: [] };

    /* Check duplicate */
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === name) {
        console.warn('[Hotels] Casino already exists:', name);
        return hc.casinos[i];
      }
    }

    var casino = { name: name, hotels: [] };
    hc.casinos.push(casino);
    hc._updatedAt = Date.now();

    State.set('hotelConfig', hc);
    Store.saveHotelConfig(hc);
    syncHCToFirebase(hc);
    Events.emit(EVENTS.HC_CREATED, { type: 'casino', name: name });
    console.log('[Hotels] Casino added:', name);
    return casino;
  },

  removeCasino: function (name) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    hc.casinos = hc.casinos.filter(function (c) {
      if (c.name === name) { found = true; return false; }
      return true;
    });

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_DELETED, { type: 'casino', name: name });
      console.log('[Hotels] Casino removed:', name);
    }
    return found;
  },

  renameCasino: function (oldName, newName) {
    if (!oldName || !newName) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === oldName) {
        hc.casinos[i].name = newName;
        found = true;
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'casino', oldName: oldName, newName: newName });
    }
    return found;
  },

  /* ===== Hotel CRUD ===== */

  addHotel: function (casinoName, hotelName) {
    if (!casinoName || !hotelName) return null;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return null;

    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        /* Check duplicate */
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            console.warn('[Hotels] Hotel already exists:', hotelName);
            return hc.casinos[i].hotels[j];
          }
        }
        var hotel = {
          name: hotelName,
          roomConfig: _defaultRoomConfig()
        };
        hc.casinos[i].hotels.push(hotel);
        hc._updatedAt = Date.now();

        State.set('hotelConfig', hc);
        Store.saveHotelConfig(hc);
        syncHCToFirebase(hc);
        Events.emit(EVENTS.HC_CREATED, { type: 'hotel', casino: casinoName, name: hotelName });
        console.log('[Hotels] Hotel added:', casinoName, hotelName);
        return hotel;
      }
    }
    console.error('[Hotels] Casino not found:', casinoName);
    return null;
  },

  removeHotel: function (casinoName, hotelName) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        hc.casinos[i].hotels = hc.casinos[i].hotels.filter(function (h) {
          if (h.name === hotelName) { found = true; return false; }
          return true;
        });
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_DELETED, { type: 'hotel', casino: casinoName, name: hotelName });
      console.log('[Hotels] Hotel removed:', casinoName, hotelName);
    }
    return found;
  },

  renameHotel: function (casinoName, oldName, newName) {
    if (!casinoName || !oldName || !newName) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === oldName) {
            hc.casinos[i].hotels[j].name = newName;
            found = true;
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'hotel', casino: casinoName, oldName: oldName, newName: newName });
    }
    return found;
  },

  /* ===== Room Config Update ===== */

  updateRoomConfig: function (casinoName, hotelName, roomType, config) {
    if (!casinoName || !hotelName || !roomType) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            if (!hc.casinos[i].hotels[j].roomConfig) {
              hc.casinos[i].hotels[j].roomConfig = _defaultRoomConfig();
            }
            if (!hc.casinos[i].hotels[j].roomConfig[roomType]) {
              hc.casinos[i].hotels[j].roomConfig[roomType] = { threshold: 0, defaultPrice: 0 };
            }
            if (config.threshold !== undefined) {
              hc.casinos[i].hotels[j].roomConfig[roomType].threshold = config.threshold;
            }
            if (config.defaultPrice !== undefined) {
              hc.casinos[i].hotels[j].roomConfig[roomType].defaultPrice = config.defaultPrice;
            }
            found = true;
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'roomConfig', casino: casinoName, hotel: hotelName, roomType: roomType });
    }
    return found;
  },

  /* ===== Room Type Delete / Add ===== */

  removeRoomType: function (casinoName, hotelName, roomType) {
    if (!casinoName || !hotelName || !roomType) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            var rc = hc.casinos[i].hotels[j].roomConfig || {};
            if (rc.hasOwnProperty(roomType)) {
              delete rc[roomType];
              found = true;
            }
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'removeRoomType', casino: casinoName, hotel: hotelName, roomType: roomType });
    }
    return found;
  },

  addRoomType: function (casinoName, hotelName, roomType, threshold) {
    if (!casinoName || !hotelName || !roomType) return false;
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;

    var found = false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            if (!hc.casinos[i].hotels[j].roomConfig) {
              hc.casinos[i].hotels[j].roomConfig = {};
            }
            hc.casinos[i].hotels[j].roomConfig[roomType] = {
              threshold: Number(threshold) || 0,
              defaultPrice: 0
            };
            found = true;
            break;
          }
        }
        break;
      }
    }

    if (found) {
      hc._updatedAt = Date.now();
      State.set('hotelConfig', hc);
      Store.saveHotelConfig(hc);
      syncHCToFirebase(hc);
      Events.emit(EVENTS.HC_UPDATED, { type: 'addRoomType', casino: casinoName, hotel: hotelName, roomType: roomType });
    }
    return found;
  },

  hasRoomType: function (casinoName, hotelName, roomType) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return false;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            var rc = hc.casinos[i].hotels[j].roomConfig || {};
            return rc.hasOwnProperty(roomType);
          }
        }
      }
    }
    return false;
  },

  getAvailableRoomTypes: function (casinoName, hotelName) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return [];
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            var rc = hc.casinos[i].hotels[j].roomConfig || {};
            var available = [];
            for (var k = 0; k < ROOM_TYPES.length; k++) {
              if (!rc.hasOwnProperty(ROOM_TYPES[k].value)) {
                available.push(ROOM_TYPES[k]);
              }
            }
            return available;
          }
        }
      }
    }
    return [];
  },

  getCasinos: function () {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return [];
    return hc.casinos.map(function (c) { return c.name; });
  },

  getHotels: function (casinoName) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return [];
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        return hc.casinos[i].hotels.map(function (h) { return h.name; });
      }
    }
    return [];
  },

  getRoomConfig: function (casinoName, hotelName, roomType) {
    var hc = State.get('hotelConfig');
    if (!hc || !hc.casinos) return null;
    for (var i = 0; i < hc.casinos.length; i++) {
      if (hc.casinos[i].name === casinoName) {
        for (var j = 0; j < hc.casinos[i].hotels.length; j++) {
          if (hc.casinos[i].hotels[j].name === hotelName) {
            var rc = hc.casinos[i].hotels[j].roomConfig || {};
            return rc[roomType] || { threshold: 0, defaultPrice: 0 };
          }
        }
      }
    }
    return null;
  },

  getThreshold: function (casinoName, hotelName, roomType) {
    var rc = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    return rc ? (rc.threshold || 0) : 0;
  },

  getDefaultPrice: function (casinoName, hotelName, roomType) {
    var rc = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    return rc ? (rc.defaultPrice || 0) : 0;
  },

  /* ===== Get All ===== */

  getAll: function () {
    return State.get('hotelConfig');
  },

  getVersion: function () {
    var hc = State.get('hotelConfig');
    return hc ? hc.version : null;
  }
};
