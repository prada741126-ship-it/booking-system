/**
 * hotels.js — Hotel Configuration CRUD + Preset Data
 * Pattern: faithfully reused from v13.0.5 hotel-config.js
 * Preset: 6 casino groups, 73 room types (Agent 2.0 thresholds v3)
 */

var PRESET_VERSION = '3';
var PRESET_CONFIG = [
  /* ===== 新濠天地 (15) ===== */
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H1', room:'豪華客房(市景)',     weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H2', room:'豪華客房(表演湖景)', weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H3', room:'皇室豪華客房',       weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H4', room:'天閣',               weekday:0, weekend:0, special:0, threshold:800000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H5', room:'巨星套房',           weekday:0, weekend:0, special:0, threshold:1500000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H6', room:'新濠影滙明星觀景房', weekday:0, weekend:0, special:0, threshold:600000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H7', room:'翠善庭',             weekday:0, weekend:0, special:0, threshold:2000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H8', room:'富豪金鑽套房',       weekday:0, weekend:0, special:0, threshold:3000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H9', room:'御苑豪華別墅',       weekday:0, weekend:0, special:0, threshold:5000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H10',room:'別墅',               weekday:0, weekend:0, special:0, threshold:8000000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H11',room:'環球豪華客房',       weekday:0, weekend:0, special:0, threshold:350000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H12',room:'環球高級客房',       weekday:0, weekend:0, special:0, threshold:250000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H13',room:'迎尚客房',           weekday:0, weekend:0, special:0, threshold:200000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H14',room:'新濠鋒客房',         weekday:0, weekend:0, special:0, threshold:450000 },
  { casino:'新濠天地', hotel:'新濠天地', code:'COD-H15',room:'新濠鋒套房',         weekday:0, weekend:0, special:0, threshold:1200000 },

  /* ===== 新濠影滙 (10) ===== */
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H1',  room:'影滙豪華客房',       weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H2',  room:'影滙豪華套房',       weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H3',  room:'影滙巨星套房',       weekday:0, weekend:0, special:0, threshold:800000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H4',  room:'8字摩天輪觀景房',    weekday:0, weekend:0, special:0, threshold:600000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H5',  room:'星級豪華套房',       weekday:0, weekend:0, special:0, threshold:700000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H6',  room:'豪華客房',           weekday:0, weekend:0, special:0, threshold:200000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H7',  room:'高級客房',           weekday:0, weekend:0, special:0, threshold:250000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H8',  room:'精選套房',           weekday:0, weekend:0, special:0, threshold:1000000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H9',  room:'至尊套房',           weekday:0, weekend:0, special:0, threshold:2000000 },
  { casino:'新濠影滙', hotel:'新濠影滙', code:'SC-H10', room:'別墅',               weekday:0, weekend:0, special:0, threshold:5000000 },

  /* ===== 金沙 (10) ===== */
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H1', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:200000 },
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H2', room:'高級客房',         weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H3', room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H4', room:'金沙套房',         weekday:0, weekend:0, special:0, threshold:800000 },
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H5', room:'御匾套房',         weekday:0, weekend:0, special:0, threshold:1500000 },
  { casino:'金沙',     hotel:'金沙城中心', code:'SAND-H6', room:'總統套房',         weekday:0, weekend:0, special:0, threshold:3000000 },
  { casino:'金沙',     hotel:'康萊德',     code:'SAND-H7', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'金沙',     hotel:'康萊德',     code:'SAND-H8', room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:600000 },
  { casino:'金沙',     hotel:'瑞吉',       code:'SAND-H9', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'金沙',     hotel:'瑞吉',       code:'SAND-H10',room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:1000000 },

  /* ===== 銀河 (25) ===== */
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H1',  room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:200000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H2',  room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H3',  room:'皇家套房',         weekday:0, weekend:0, special:0, threshold:1000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H4',  room:'總統套房',         weekday:0, weekend:0, special:0, threshold:3000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H5',  room:'天際套房',         weekday:0, weekend:0, special:0, threshold:1500000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H6',  room:'至尊套房',         weekday:0, weekend:0, special:0, threshold:2000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H7',  room:'翠綠庭別墅',       weekday:0, weekend:0, special:0, threshold:5000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H8',  room:'藍寶石別墅',       weekday:0, weekend:0, special:0, threshold:6000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H9',  room:'白金別墅',         weekday:0, weekend:0, special:0, threshold:8000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H10', room:'鑽石別墅',         weekday:0, weekend:0, special:0, threshold:10000000 },
  { casino:'銀河',     hotel:'悅榕庄',     code:'GAL-H11', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'銀河',     hotel:'悅榕庄',     code:'GAL-H12', room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:800000 },
  { casino:'銀河',     hotel:'悅榕庄',     code:'GAL-H13', room:'池畔別墅',         weekday:0, weekend:0, special:0, threshold:3000000 },
  { casino:'銀河',     hotel:'大倉',       code:'GAL-H14', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'銀河',     hotel:'大倉',       code:'GAL-H15', room:'高級套房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'銀河',     hotel:'酒店JW',     code:'GAL-H16', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'銀河',     hotel:'酒店JW',     code:'GAL-H17', room:'行政套房',         weekday:0, weekend:0, special:0, threshold:700000 },
  { casino:'銀河',     hotel:'百老匯',     code:'GAL-H18', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:200000 },
  { casino:'銀河',     hotel:'百老匯',     code:'GAL-H19', room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'銀河',     hotel:'麗思卡爾頓', code:'GAL-H20', room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:600000 },
  { casino:'銀河',     hotel:'麗思卡爾頓', code:'GAL-H21', room:'行政套房',         weekday:0, weekend:0, special:0, threshold:1000000 },
  { casino:'銀河',     hotel:'麗思卡爾頓', code:'GAL-H22', room:'總統套房',         weekday:0, weekend:0, special:0, threshold:5000000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H23', room:'星際客房',         weekday:0, weekend:0, special:0, threshold:250000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H24', room:'環球客房',         weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'銀河',     hotel:'銀河',       code:'GAL-H25', room:'水晶宮套房',       weekday:0, weekend:0, special:0, threshold:1800000 },

  /* ===== 永利 (9) ===== */
  { casino:'永利',     hotel:'永利澳門',   code:'WYN-H1',  room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'永利',     hotel:'永利澳門',   code:'WYN-H2',  room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'永利',     hotel:'永利澳門',   code:'WYN-H3',  room:'行政套房',         weekday:0, weekend:0, special:0, threshold:800000 },
  { casino:'永利',     hotel:'永利澳門',   code:'WYN-H4',  room:'永利套房',         weekday:0, weekend:0, special:0, threshold:1500000 },
  { casino:'永利',     hotel:'永利澳門',   code:'WYN-H5',  room:'總統套房',         weekday:0, weekend:0, special:0, threshold:3000000 },
  { casino:'永利',     hotel:'永利皇宮',   code:'WYN-H6',  room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:400000 },
  { casino:'永利',     hotel:'永利皇宮',   code:'WYN-H7',  room:'豪華套房',         weekday:0, weekend:0, special:0, threshold:700000 },
  { casino:'永利',     hotel:'永利皇宮',   code:'WYN-H8',  room:'行政套房',         weekday:0, weekend:0, special:0, threshold:1200000 },
  { casino:'永利',     hotel:'永利皇宮',   code:'WYN-H9',  room:'永利皇宮套房',     weekday:0, weekend:0, special:0, threshold:2500000 },

  /* ===== 上葡京 (4) ===== */
  { casino:'上葡京',   hotel:'上葡京',     code:'LIS-H1',  room:'豪華客房',         weekday:0, weekend:0, special:0, threshold:300000 },
  { casino:'上葡京',   hotel:'上葡京',     code:'LIS-H2',  room:'高級套房',         weekday:0, weekend:0, special:0, threshold:500000 },
  { casino:'上葡京',   hotel:'上葡京',     code:'LIS-H3',  room:'行政套房',         weekday:0, weekend:0, special:0, threshold:1000000 },
  { casino:'上葡京',   hotel:'上葡京',     code:'LIS-H4',  room:'總統套房',         weekday:0, weekend:0, special:0, threshold:3000000 }
];

var Hotels = {

  /**
   * Reset hotel config to preset
   */
  resetToPreset: function () {
    var config = PRESET_CONFIG.map(function (item, idx) {
      return {
        _fbKey:     Utils.generateFbKey(),
        _createdAt: Date.now() + idx,
        _updatedAt: Date.now() + idx,
        casino:     item.casino,
        hotel:      item.hotel,
        code:       item.code,
        room:       item.room,
        weekday:    item.weekday,
        weekend:    item.weekend,
        special:    item.special,
        threshold:  item.threshold
      };
    });

    State.set('hotelConfig', config);
    Store.saveHotelConfig(config);
    Store.save(STORAGE_KEYS.HC_PRESET_VER, PRESET_VERSION, false);
    Events.emit(EVENTS.HC_RESET, config);
    console.log('[Hotels] Reset to preset:', config.length, 'items');
    return config;
  },

  /**
   * Create a new hotel config entry
   */
  create: function (data) {
    var now = Date.now();
    var hc = {
      _fbKey:     Utils.generateFbKey(),
      _createdAt: now,
      _updatedAt: now,
      casino:     data.casino || '',
      hotel:      data.hotel || '',
      code:       data.code || '',
      room:       data.room || '',
      weekday:    data.weekday || 0,
      weekend:    data.weekend || 0,
      special:    data.special || 0,
      threshold:  data.threshold || 0
    };

    State.update('hotelConfig', function (list) {
      list.push(hc);
      return list;
    });
    Store.saveHotelConfig(State.get('hotelConfig'));
    syncHCToFirebase(hc);
    Events.emit(EVENTS.HC_CREATED, hc);
    return hc;
  },

  /**
   * Update a hotel config entry
   */
  update: function (fbKey, data) {
    var updated = null;
    State.update('hotelConfig', function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]._fbKey === fbKey) {
          for (var key in data) {
            if (data.hasOwnProperty(key) && key.charAt(0) !== '_') {
              list[i][key] = data[key];
            }
          }
          list[i]._updatedAt = Date.now();
          updated = list[i];
          break;
        }
      }
      return list;
    });

    if (updated) {
      Store.saveHotelConfig(State.get('hotelConfig'));
      syncHCToFirebase(updated);
      Events.emit(EVENTS.HC_UPDATED, updated);
    }
    return updated;
  },

  /**
   * Delete a hotel config entry
   */
  delete: function (fbKey) {
    var deleted = false;
    State.update('hotelConfig', function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i]._fbKey === fbKey) {
          list.splice(i, 1);
          deleted = true;
          break;
        }
      }
      return list;
    });

    if (deleted) {
      Store.saveHotelConfig(State.get('hotelConfig'));
      RecentlyDeleted.track('hotelConfig', fbKey);
      removeHCFromFirebase(fbKey);
      Events.emit(EVENTS.HC_DELETED, fbKey);
    }
    return deleted;
  },

  /**
   * Get hotels by casino
   */
  getHotelsByCasino: function (casino) {
    var list = State.get('hotelConfig');
    if (!casino) return list;
    return list.filter(function (h) { return h.casino === casino; });
  },

  /**
   * Get rooms by hotel
   */
  getRoomsByHotel: function (hotel) {
    var list = State.get('hotelConfig');
    if (!hotel) return list;
    return list.filter(function (h) { return h.hotel === hotel; });
  },

  /**
   * Get rooms by casino + hotel
   */
  getRooms: function (casino, hotel) {
    var list = State.get('hotelConfig');
    return list.filter(function (h) {
      return h.casino === casino && h.hotel === hotel;
    });
  },

  /**
   * Get unique casino list (preserving order)
   */
  getCasinos: function () {
    var list = State.get('hotelConfig');
    var seen = {};
    var result = [];
    for (var i = 0; i < list.length; i++) {
      if (!seen[list[i].casino]) {
        seen[list[i].casino] = true;
        result.push(list[i].casino);
      }
    }
    return result;
  },

  /**
   * Get unique hotel list by casino
   */
  getHotelNames: function (casino) {
    var filtered = Hotels.getHotelsByCasino(casino);
    var seen = {};
    var result = [];
    for (var i = 0; i < filtered.length; i++) {
      if (!seen[filtered[i].hotel]) {
        seen[filtered[i].hotel] = true;
        result.push(filtered[i].hotel);
      }
    }
    return result;
  },

  /**
   * Get room by code
   */
  getByCode: function (code) {
    var list = State.get('hotelConfig');
    for (var i = 0; i < list.length; i++) {
      if (list[i].code === code) return list[i];
    }
    return null;
  },

  /**
   * Get all config
   */
  getAll: function () {
    return State.get('hotelConfig');
  }
};
