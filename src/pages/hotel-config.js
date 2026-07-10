/**
 * hotel-config.js — Hotel Configuration Page (Ctrl+7)
 * Booking System v2.0.0 (v8 spec)
 * Tree: casino -> hotel -> roomConfig (6 room types)
 * Management can add/edit/delete at all three levels via Web backend
 * HC synced as single object via syncHCToFirebase()
 */
var HotelConfigPage = (function () {

  function render() {
    var container = document.getElementById('page-hotel-config');
    if (!container) return;

    try {
      var hc = Hotels.getAll();

      /* Auto-load presets if config is empty */
      if (!hc || !hc.casinos || hc.casinos.length === 0) {
        console.log('[HotelConfigPage] Config empty, auto-loading presets...');
        try {
          Hotels.loadPresets();
          hc = Hotels.getAll();
        } catch (e) {
          console.error('[HotelConfigPage] Auto-load presets failed:', e);
        }
      }

      /* If still empty after auto-load, show help */
      if (!hc || !hc.casinos || hc.casinos.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:var(--sp-12) var(--sp-4);">' +
          '<div class="empty-icon"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg></div>' +
          '<div class="empty-title" style="font-size:var(--fs-lg);margin-bottom:var(--sp-2);">尚無酒店配置</div>' +
          '<div class="empty-desc" style="margin-bottom:var(--sp-4);">點擊下方按鈕載入預設的 6 大體系、15 間酒店配置</div>' +
          '<button class="btn btn-primary btn-lg" onclick="HotelConfigPage.loadPresets()" style="font-size:var(--fs-md);padding:var(--sp-3) var(--sp-8);">載入預設配置</button>' +
          '<div style="margin-top:var(--sp-3);font-size:var(--fs-xs);color:var(--text-muted);">載入後即可編輯每家酒店的房型門檻設定</div>' +
          '</div>';
        return;
      }

      var html = '';

      /* Page header */
      html += '<div class="page-header">';
      html += '  <h3>酒店設定 <span style="font-size:var(--fs-sm);color:var(--text-muted);font-weight:400;">v' + Utils.escapeHtml(hc.version || '?') + '</span></h3>';
      html += '  <div class="page-actions">';
      html += '    <button class="btn btn-secondary" onclick="HotelConfigPage.showAddCasino()">';
      html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
      html += '      新增體系';
      html += '    </button>';
      html += '    <button class="btn btn-ghost" onclick="HotelConfigPage.confirmReset()" data-tooltip="重置為預設">重置預設</button>';
      html += '  </div>';
      html += '</div>';

      /* Summary KPI */
      var totalHotels = 0;
      for (var i = 0; i < hc.casinos.length; i++) {
        var c = hc.casinos[i];
        if (c && Array.isArray(c.hotels)) {
          totalHotels += c.hotels.length;
        }
      }
      html += '<div class="kpi-grid">';
      html += _kpiCard('kpi-blue', '酒店體系', hc.casinos.length, '個', '新濠/金沙/銀河等',
        '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');
      html += _kpiCard('kpi-green', '酒店總數', totalHotels, '間', '各體系下酒店',
        '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>');
      html += _kpiCard('kpi-gold', '房型種類', ROOM_TYPES.length, '種', '所有酒店共用',
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>');
      html += '</div>';

      /* Tree view */
      html += '<div class="hc-tree">';

      for (var ci = 0; ci < hc.casinos.length; ci++) {
        var casino = hc.casinos[ci];
        if (casino) {
          html += _casinoBlock(casino);
        }
      }

      html += '</div>';

      container.innerHTML = html;
    } catch (e) {
      console.error('[HotelConfigPage] render error:', e);
      container.innerHTML = '<div class="empty-state"><div class="empty-title">渲染出錯</div><div class="empty-desc">' + Utils.escapeHtml(e.message) + '</div><button class="btn btn-primary" style="margin-top:12px" onclick="HotelConfigPage.loadPresets()">重新載入預設</button></div>';
    }
  }

  function _casinoBlock(casino) {
    if (!casino) return '';
    var hotels = Array.isArray(casino.hotels) ? casino.hotels : [];
    var html = '<div class="hc-casino-block">';
    html += '  <div class="hc-casino-header">';
    html += '    <div style="display:flex;align-items:center;gap:var(--sp-2);">';
    html += '      <svg viewBox="0 0 24 24" style="width:20px;height:20px;color:var(--color-primary);"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    html += '      <h4 style="margin:0;font-size:var(--fs-lg;">' + Utils.escapeHtml(casino.name) + '</h4>';
    html += '      <span class="badge badge-slate">' + casino.hotels.length + ' 間酒店</span>';
    html += '    </div>';
    html += '    <div>';
    html += '      <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.showAddHotel(\'' + Utils.escapeHtml(casino.name) + '\')">新增酒店</button>';
    html += '      <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.renameCasino(\'' + Utils.escapeHtml(casino.name) + '\')">改名</button>';
    html += '      <button class="btn btn-danger btn-sm" onclick="HotelConfigPage.removeCasino(\'' + Utils.escapeHtml(casino.name) + '\')">刪除</button>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="hc-hotel-list">';
    for (var hi = 0; hi < casino.hotels.length; hi++) {
      html += _hotelRow(casino.name, casino.hotels[hi]);
    }
    if (casino.hotels.length === 0) {
      html += '<div style="padding:var(--sp-3);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">此體系下無酒店，點擊「新增酒店」</div>';
    }
    html += '  </div>';

    html += '</div>';
    return html;
  }

  function _hotelRow(casinoName, hotel) {
    var html = '<div class="hc-hotel-row">';
    html += '  <div class="hc-hotel-name">';
    html += '    <svg viewBox="0 0 24 24" style="width:16px;height:16px;color:var(--text-muted);"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>';
    html += '    <span style="font-weight:600;">' + Utils.escapeHtml(hotel.name) + '</span>';
    html += '  </div>';
    html += '  <div class="hc-room-grid">';
    for (var ri = 0; ri < ROOM_TYPES.length; ri++) {
      var rt = ROOM_TYPES[ri];
      var config = (hotel.roomConfig && hotel.roomConfig[rt.value]) || { threshold: 0, defaultPrice: 0 };
      html += _roomCell(casinoName, hotel.name, rt, config);
    }
    html += '  </div>';
    html += '  <div class="hc-hotel-actions">';
    html += '    <button class="btn btn-ghost btn-sm" onclick="HotelConfigPage.renameHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotel.name) + '\')">改名</button>';
    html += '    <button class="btn btn-danger btn-sm" onclick="HotelConfigPage.removeHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotel.name) + '\')">刪除</button>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function _roomCell(casinoName, hotelName, roomType, config) {
    var html = '<div class="hc-room-cell">';
    html += '  <div class="hc-room-label">' + Utils.escapeHtml(roomType.short) + '</div>';
    html += '  <div class="hc-room-threshold" onclick="HotelConfigPage.editThreshold(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotelName) + '\',\'' + roomType.value + '\')" title="點擊編輯門檻">';
    html += '    <span style="font-size:var(--fs-xs);color:var(--text-muted);">門檻(萬)</span>';
    html += '    <span style="font-weight:600;color:var(--color-primary);">' + Utils.formatNumber(Math.round((config.threshold || 0) / 10000)) + '</span>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  /* ===== Casino CRUD ===== */

  function showAddCasino() {
    var body =
      '<div class="form-group"><label>體系名稱</label>' +
      '<input type="text" id="hc-casino-name" placeholder="例如：新濠天地" autocomplete="off"></div>';
    Modal.open({
      title: '新增酒店體系',
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmAddCasino()">確認</button>'
    });
  }

  function confirmAddCasino() {
    var name = document.getElementById('hc-casino-name').value.trim();
    if (!name) { Toast.error('請輸入體系名稱'); return; }
    Hotels.addCasino(name);
    Toast.success('已新增體系: ' + name);
    Modal.close();
    render();
  }

  function renameCasino(oldName) {
    var body =
      '<div class="form-group"><label>新名稱</label>' +
      '<input type="text" id="hc-casino-newname" value="' + Utils.escapeHtml(oldName) + '"></div>';
    Modal.open({
      title: '改名體系: ' + oldName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmRenameCasino(\'' + Utils.escapeHtml(oldName) + '\')">確認</button>'
    });
  }

  function confirmRenameCasino(oldName) {
    var newName = document.getElementById('hc-casino-newname').value.trim();
    if (!newName) { Toast.error('請輸入新名稱'); return; }
    Hotels.renameCasino(oldName, newName);
    Toast.success('已改名為: ' + newName);
    Modal.close();
    render();
  }

  function removeCasino(name) {
    Modal.confirm('確認刪除體系「' + name + '」及其所有酒店？此操作將影響訂房功能。', function () {
      Hotels.removeCasino(name);
      Toast.success('已刪除體系: ' + name);
      render();
    }, { confirmText: '確認刪除', title: '危險操作' });
  }

  /* ===== Hotel CRUD ===== */

  function showAddHotel(casinoName) {
    var body =
      '<div class="form-group"><label>酒店名稱</label>' +
      '<input type="text" id="hc-hotel-name" placeholder="例如：摩珀斯" autocomplete="off"></div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);">新酒店將自動生成6種房型預設門檻。</p>';
    Modal.open({
      title: '新增酒店 — ' + casinoName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmAddHotel(\'' + Utils.escapeHtml(casinoName) + '\')">確認</button>'
    });
  }

  function confirmAddHotel(casinoName) {
    var name = document.getElementById('hc-hotel-name').value.trim();
    if (!name) { Toast.error('請輸入酒店名稱'); return; }
    var hotel = Hotels.addHotel(casinoName, name);
    if (hotel) {
      Toast.success('已新增酒店: ' + name);
      Modal.close();
      render();
    }
  }

  function renameHotel(casinoName, oldName) {
    var body =
      '<div class="form-group"><label>新名稱</label>' +
      '<input type="text" id="hc-hotel-newname" value="' + Utils.escapeHtml(oldName) + '"></div>';
    Modal.open({
      title: '改名酒店: ' + oldName,
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmRenameHotel(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(oldName) + '\')">確認</button>'
    });
  }

  function confirmRenameHotel(casinoName, oldName) {
    var newName = document.getElementById('hc-hotel-newname').value.trim();
    if (!newName) { Toast.error('請輸入新名稱'); return; }
    Hotels.renameHotel(casinoName, oldName, newName);
    Toast.success('已改名為: ' + newName);
    Modal.close();
    render();
  }

  function removeHotel(casinoName, hotelName) {
    Modal.confirm('確認刪除酒店「' + hotelName + '」？', function () {
      Hotels.removeHotel(casinoName, hotelName);
      Toast.success('已刪除酒店: ' + hotelName);
      render();
    }, { confirmText: '確認刪除' });
  }

  /* ===== Room Config Edit ===== */

  function editThreshold(casinoName, hotelName, roomType) {
    var current = Hotels.getRoomConfig(casinoName, hotelName, roomType);
    var rtLabel = '';
    for (var i = 0; i < ROOM_TYPES.length; i++) {
      if (ROOM_TYPES[i].value === roomType) { rtLabel = ROOM_TYPES[i].label; break; }
    }

    var body =
      '<div class="form-group"><label>洗碼門檻（萬）</label>' +
      '<input type="number" id="hc-threshold" value="' + Math.round((current.threshold || 0) / 10000) + '" placeholder="0"></div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);">以萬為單位輸入，例如 30 = 30萬</p>' +
      '<div class="form-group"><label>預設房價</label>' +
      '<input type="number" id="hc-default-price" value="' + (current.defaultPrice || 0) + '" placeholder="0"></div>' +
      '<p style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(casinoName + ' / ' + hotelName + ' / ' + rtLabel) + '</p>';

    Modal.open({
      title: '編輯房型配置',
      body: body,
      footer: '<button class="btn btn-secondary" data-modal-close>取消</button><button class="btn btn-primary" onclick="HotelConfigPage.confirmEditThreshold(\'' + Utils.escapeHtml(casinoName) + '\',\'' + Utils.escapeHtml(hotelName) + '\',\'' + roomType + '\')">確認</button>'
    });
  }

  function confirmEditThreshold(casinoName, hotelName, roomType) {
    var thresholdWan = Number(document.getElementById('hc-threshold').value) || 0;
    var threshold = thresholdWan * 10000;
    var defaultPrice = Number(document.getElementById('hc-default-price').value) || 0;

    Hotels.updateRoomConfig(casinoName, hotelName, roomType, {
      threshold: threshold,
      defaultPrice: defaultPrice
    });

    Toast.success('已更新房型配置');
    Modal.close();
    render();
  }

  /* ===== Reset ===== */

  function confirmReset() {
    Modal.confirm('確認重置所有酒店配置為預設值？所有自定義修改將被覆蓋。', function () {
      Hotels.resetToPreset();
      Toast.success('已重置為預設配置');
      render();
    }, { confirmText: '確認重置', title: '重置預設' });
  }

  function loadPresets() {
    Hotels.loadPresets();
    Toast.success('已載入預設配置');
    render();
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg) {
    var html = '<div class="kpi-card ' + colorClass + '">';
    html += '  <div class="kpi-header"><span class="kpi-label">' + Utils.escapeHtml(label) + '</span><div class="kpi-icon">' + iconSvg + '</div></div>';
    html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
    if (unit || sub) {
      html += '  <span class="kpi-sub">';
      if (unit) html += Utils.escapeHtml(unit);
      if (unit && sub) html += ' — ';
      if (sub) html += Utils.escapeHtml(sub);
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  return {
    render: render,
    showAddCasino: showAddCasino,
    confirmAddCasino: confirmAddCasino,
    renameCasino: renameCasino,
    confirmRenameCasino: confirmRenameCasino,
    removeCasino: removeCasino,
    showAddHotel: showAddHotel,
    confirmAddHotel: confirmAddHotel,
    renameHotel: renameHotel,
    confirmRenameHotel: confirmRenameHotel,
    removeHotel: removeHotel,
    editThreshold: editThreshold,
    confirmEditThreshold: confirmEditThreshold,
    confirmReset: confirmReset,
    loadPresets: loadPresets
  };
})();

function renderHotelConfig() { HotelConfigPage.render(); }
