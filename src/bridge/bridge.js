/**
 * bridge.js — HTML ↔ JS Bridge (Global Functions)
 * Booking System v1.0.0
 * All onclick handlers referenced in HTML are defined here
 */

/* ============================================================
 * Navigation
 * ============================================================ */

function navigateTo(pageId) {
  Router.switchTo(pageId);
}

function prevMonth() {
  var month = State.get('workingMonth');
  if (!month) return;
  var parts = month.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10) - 1;
  if (m === 0) { m = 12; y--; }
  var newMonth = y + '-' + Utils.pad(m);
  State.set('workingMonth', newMonth);
  Store.saveWorkingMonth(newMonth);
  Events.emit(EVENTS.MONTH_CHANGED, newMonth);
  Events.emit(EVENTS.UI_RENDER);
}

function nextMonth() {
  var month = State.get('workingMonth');
  if (!month) return;
  var parts = month.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10) + 1;
  if (m === 13) { m = 1; y++; }
  var newMonth = y + '-' + Utils.pad(m);
  State.set('workingMonth', newMonth);
  Store.saveWorkingMonth(newMonth);
  Events.emit(EVENTS.MONTH_CHANGED, newMonth);
  Events.emit(EVENTS.UI_RENDER);
}

/* ============================================================
 * Mobile sidebar toggle
 * ============================================================ */

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('visible');
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('visible');
}

/* ============================================================
 * Booking Modal — Create / Edit / View / Delete
 * ============================================================ */

var _editingBookingKey = null;

function openBookingModal(presetDate) {
  _editingBookingKey = null;

  var casinos = Hotels.getCasinos();
  var agentNames = Agents.getNames();
  var today = Utils.formatDate(new Date());

  var body = '';
  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>客人姓名 <span class="required">*</span></label><input type="text" class="form-control" id="bk-guestName" placeholder="輸入客人姓名"></div>';
  body += '  <div class="form-group"><label>客人數量</label><input type="number" class="form-control" id="bk-guestCount" value="1" min="1"></div>';
  body += '</div>';

  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>代理 <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-agent">';
  body += '      <option value="">請選擇</option>';
  for (var i = 0; i < agentNames.length; i++) {
    body += '      <option value="' + Utils.escapeHtml(agentNames[i]) + '">' + Utils.escapeHtml(agentNames[i]) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>操作人員</label><input type="text" class="form-control" id="bk-operator" placeholder="操作人員"></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>體系 <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-casino" onchange="onCasinoChange()">';
  body += '      <option value="">請選擇</option>';
  for (var c = 0; c < casinos.length; c++) {
    body += '      <option value="' + Utils.escapeHtml(casinos[c]) + '">' + Utils.escapeHtml(casinos[c]) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>酒店</label>';
  body += '    <select class="form-control" id="bk-hotel" onchange="onHotelChange()" disabled><option value="">請先選擇體系</option></select></div>';
  body += '  <div class="form-group"><label>房型</label>';
  body += '    <select class="form-control" id="bk-roomType" disabled><option value="">請先選擇酒店</option></select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>入住日期 <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkIn" value="' + (presetDate || today) + '" onchange="onCheckInChange()"></div>';
  body += '  <div class="form-group"><label>退房日期 <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkOut"></div>';
  body += '  <div class="form-group"><label>晚數</label><input type="text" class="form-control" id="bk-nights" value="0" readonly style="opacity:0.6;"></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>房間數</label><input type="number" class="form-control" id="bk-roomCount" value="1" min="1"></div>';
  body += '  <div class="form-group"><label>補償類型</label>';
  body += '    <select class="form-control" id="bk-compType">';
  body += '      <option value="free-room">免費房</option>';
  body += '      <option value="discount">折扣房</option>';
  body += '      <option value="paid">付費房</option>';
  body += '    </select></div>';
  body += '  <div class="form-group"><label>狀態</label>';
  body += '    <select class="form-control" id="bk-status">';
  body += '      <option value="pending">待確認</option>';
  body += '      <option value="confirmed">已確認</option>';
  body += '      <option value="checked-in">已入住</option>';
  body += '      <option value="checked-out">已退房</option>';
  body += '      <option value="cancelled">已取消</option>';
  body += '    </select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>洗碼門檻</label><input type="number" class="form-control" id="bk-threshold" value="0" readonly style="opacity:0.6;"></div>';
  body += '  <div class="form-group"><label>洗碼量</label><input type="number" class="form-control" id="bk-volume" value="0"></div>';
  body += '  <div class="form-group"><label>每晚房價</label><input type="number" class="form-control" id="bk-pricePerNight" value="0"></div>';
  body += '</div>';

  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>接送安排</label>';
  body += '    <select class="form-control" id="bk-transfer">';
  body += '      <option value="none">無</option>';
  body += '      <option value="airport">機場接送</option>';
  body += '      <option value="ferry">碼頭接送</option>';
  body += '      <option value="both">機場+碼頭</option>';
  body += '      <option value="custom">自定義</option>';
  body += '    </select></div>';
  body += '  <div class="form-group"><label>航班號碼</label><input type="text" class="form-control" id="bk-flightNo" placeholder="航班號"></div>';
  body += '</div>';

  body += '<div class="form-group"><label>手機號碼</label><input type="text" class="form-control" id="bk-phone" placeholder="聯絡電話"></div>';
  body += '<div class="form-group"><label>特殊需求</label><textarea class="form-control" id="bk-specialRequest" placeholder="特殊需求/備註"></textarea>';

  var footer = '<button class="btn btn-secondary" data-modal-close>取消</button>';
  footer += '<button class="btn btn-primary" onclick="saveBookingForm()">儲存訂房</button>';

  Modal.open({
    title: '新增訂房',
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function onCasinoChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotelSelect = document.getElementById('bk-hotel');
  var roomSelect = document.getElementById('bk-roomType');

  roomSelect.innerHTML = '<option value="">請先選擇酒店</option>';
  roomSelect.disabled = true;

  if (!casino) {
    hotelSelect.innerHTML = '<option value="">請先選擇體系</option>';
    hotelSelect.disabled = true;
    return;
  }

  var hotelNames = Hotels.getHotelNames(casino);
  hotelSelect.innerHTML = '<option value="">請選擇</option>';
  for (var i = 0; i < hotelNames.length; i++) {
    hotelSelect.innerHTML += '<option value="' + Utils.escapeHtml(hotelNames[i]) + '">' + Utils.escapeHtml(hotelNames[i]) + '</option>';
  }
  hotelSelect.disabled = false;
}

function onHotelChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotel = document.getElementById('bk-hotel').value;
  var roomSelect = document.getElementById('bk-roomType');

  if (!casino || !hotel) {
    roomSelect.innerHTML = '<option value="">請先選擇酒店</option>';
    roomSelect.disabled = true;
    return;
  }

  var rooms = Hotels.getRooms(casino, hotel);
  roomSelect.innerHTML = '<option value="">請選擇</option>';
  for (var i = 0; i < rooms.length; i++) {
    roomSelect.innerHTML += '<option value="' + Utils.escapeHtml(rooms[i].room) + '" data-code="' + Utils.escapeHtml(rooms[i].code) + '" data-threshold="' + rooms[i].threshold + '">' + Utils.escapeHtml(rooms[i].room) + ' (門檻: ' + Utils.formatNumber(rooms[i].threshold) + ')</option>';
  }
  roomSelect.disabled = false;

  // Auto-fill threshold on room change
  roomSelect.onchange = function () {
    var selected = roomSelect.options[roomSelect.selectedIndex];
    var threshold = selected ? selected.getAttribute('data-threshold') : 0;
    document.getElementById('bk-threshold').value = threshold || 0;
    _updateThresholdTotal();
  };
}

function onCheckInChange() {
  var checkIn = document.getElementById('bk-checkIn').value;
  var checkOut = document.getElementById('bk-checkOut').value;
  if (checkIn && checkOut) {
    var nights = Utils.calcNights(checkIn, checkOut);
    document.getElementById('bk-nights').value = nights;
  }
}

function _updateThresholdTotal() {
  // Could show per-room threshold * room count
  var threshold = parseInt(document.getElementById('bk-threshold').value, 10) || 0;
  var roomCount = parseInt(document.getElementById('bk-roomCount').value, 10) || 1;
  // Just update display if needed
}

function saveBookingForm() {
  var data = {
    guestName: document.getElementById('bk-guestName').value.trim(),
    guestCount: parseInt(document.getElementById('bk-guestCount').value, 10) || 1,
    agent: document.getElementById('bk-agent').value,
    operator: document.getElementById('bk-operator').value.trim(),
    casino: document.getElementById('bk-casino').value,
    hotel: document.getElementById('bk-hotel').value,
    roomType: document.getElementById('bk-roomType').value,
    roomCount: parseInt(document.getElementById('bk-roomCount').value, 10) || 1,
    checkIn: document.getElementById('bk-checkIn').value,
    checkOut: document.getElementById('bk-checkOut').value,
    compType: document.getElementById('bk-compType').value,
    status: document.getElementById('bk-status').value,
    threshold: parseInt(document.getElementById('bk-threshold').value, 10) || 0,
    volume: parseInt(document.getElementById('bk-volume').value, 10) || 0,
    pricePerNight: parseInt(document.getElementById('bk-pricePerNight').value, 10) || 0,
    transfer: document.getElementById('bk-transfer').value,
    flightNo: document.getElementById('bk-flightNo').value.trim(),
    phone: document.getElementById('bk-phone').value.trim(),
    specialRequest: document.getElementById('bk-specialRequest').value.trim()
  };

  // Validation
  if (!data.guestName) { Toast.error('請輸入客人姓名'); return; }
  if (!data.agent) { Toast.error('請選擇代理'); return; }
  if (!data.casino) { Toast.error('請選擇體系'); return; }
  if (!data.checkIn || !data.checkOut) { Toast.error('請選擇入住和退房日期'); return; }

  if (_editingBookingKey) {
    Bookings.update(_editingBookingKey, data);
    Toast.success('訂房已更新');
  } else {
    Bookings.create(data);
    Toast.success('訂房已建立');
  }

  Modal.close();
  Events.emit(EVENTS.UI_RENDER);
}

function editBooking(fbKey) {
  var booking = Bookings.getByKey(fbKey);
  if (!booking) { Toast.error('找不到訂房記錄'); return; }

  _editingBookingKey = fbKey;
  openBookingModal();

  // Fill form with existing data
  setTimeout(function () {
    document.getElementById('bk-guestName').value = booking.guestName || '';
    document.getElementById('bk-guestCount').value = booking.guestCount || 1;
    document.getElementById('bk-agent').value = booking.agent || '';
    document.getElementById('bk-operator').value = booking.operator || '';
    document.getElementById('bk-casino').value = booking.casino || '';
    onCasinoChange();
    document.getElementById('bk-hotel').value = booking.hotel || '';
    onHotelChange();
    document.getElementById('bk-roomType').value = booking.roomType || '';
    document.getElementById('bk-roomCount').value = booking.roomCount || 1;
    document.getElementById('bk-checkIn').value = booking.checkIn || '';
    document.getElementById('bk-checkOut').value = booking.checkOut || '';
    onCheckInChange();
    document.getElementById('bk-compType').value = booking.compType || 'free-room';
    document.getElementById('bk-status').value = booking.status || 'pending';
    document.getElementById('bk-threshold').value = booking.threshold || 0;
    document.getElementById('bk-volume').value = booking.volume || 0;
    document.getElementById('bk-pricePerNight').value = booking.pricePerNight || 0;
    document.getElementById('bk-transfer').value = booking.transfer || 'none';
    document.getElementById('bk-flightNo').value = booking.flightNo || '';
    document.getElementById('bk-phone').value = booking.phone || '';
    document.getElementById('bk-specialRequest').value = booking.specialRequest || '';
  }, 50);
}

function viewBookingDetail(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) { Toast.error('找不到訂房記錄'); return; }

  var body = '';
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);">';

  body += _detailField('客人姓名', b.guestName);
  body += _detailField('客人數量', b.guestCount);
  body += _detailField('代理', b.agent);
  body += _detailField('操作人員', b.operator);
  body += _detailField('體系', b.casino);
  body += _detailField('酒店', b.hotel);
  body += _detailField('房型', b.roomType);
  body += _detailField('房間數', b.roomCount);
  body += _detailField('入住日期', Utils.formatDateDisplay(b.checkIn));
  body += _detailField('退房日期', Utils.formatDateDisplay(b.checkOut));
  body += _detailField('晚數', b.nights + ' 晚');
  body += _detailField('補償類型', COMP_TYPE_LABELS[b.compType] || b.compType);
  body += _detailField('洗碼門檻', Utils.formatNumber(b.threshold));
  body += _detailField('洗碼量', Utils.formatNumber(b.volume));
  body += _detailField('每晚房價', Utils.formatCurrency(b.pricePerNight));
  body += _detailField('總費用', Utils.formatCurrency(b.totalCost));
  body += _detailField('接送', _transferLabel(b.transfer));
  body += _detailField('航班號碼', b.flightNo);
  body += _detailField('手機號碼', b.phone);

  body += '</div>';

  if (b.specialRequest) {
    body += '<div class="form-group" style="margin-top:var(--sp-4);"><label>特殊需求</label><div style="padding:var(--sp-3);background:var(--bg-input);border-radius:var(--radius-md);">' + Utils.escapeHtml(b.specialRequest) + '</div></div>';
  }

  var footer = '<button class="btn btn-secondary" data-modal-close>關閉</button>';
  footer += '<button class="btn btn-danger" onclick="deleteBooking(\'' + fbKey + '\')">刪除</button>';
  footer += '<button class="btn btn-primary" onclick="Modal.close();editBooking(\'' + fbKey + '\')">編輯</button>';

  Modal.open({
    title: '訂房詳情 — ' + (b.guestName || ''),
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function deleteBooking(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) return;

  Modal.confirm(
    '確認刪除「' + (b.guestName || '') + '」的訂房記錄？此操作不可撤銷。',
    function () {
      Bookings.delete(fbKey);
      Toast.success('訂房已刪除');
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '刪除確認', confirmText: '確認刪除' }
  );
}

function _detailField(label, value) {
  return '<div><div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:2px;">' + Utils.escapeHtml(label) + '</div>' +
         '<div style="font-size:var(--fs-sm);font-weight:500;">' + (value !== undefined && value !== null && value !== '' ? Utils.escapeHtml(String(value)) : '-') + '</div></div>';
}

function _transferLabel(val) {
  var labels = { none: '無', airport: '機場接送', ferry: '碼頭接送', both: '機場+碼頭', custom: '自定義' };
  return labels[val] || val || '無';
}

/* ============================================================
 * Agent Management
 * ============================================================ */

function openAgentModal() {
  var agents = Agents.getAll();
  var body = '<div id="agent-list-container">';

  if (agents.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">暫無代理</div><div class="empty-desc">點擊下方按鈕新增代理</div></div>';
  } else {
    body += '<div class="data-table-wrap"><div class="data-table-scroll"><table class="data-table"><thead><tr><th>代理名稱</th><th>手機號碼</th><th>操作</th></tr></thead><tbody>';
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var name = typeof a === 'object' ? (a.name || '') : a;
      var phone = typeof a === 'object' ? (a.phone || '') : '';
      body += '<tr><td>' + Utils.escapeHtml(name) + '</td><td>' + Utils.escapeHtml(phone || '-') + '</td>';
      body += '<td class="action-cell"><button class="btn btn-danger btn-sm" onclick="removeAgent(\'' + Utils.escapeHtml(name) + '\')">刪除</button></td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  body += '</div>';
  body += '<div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2);">';
  body += '<input type="text" class="form-control" id="new-agent-name" placeholder="代理名稱" style="flex:1;">';
  body += '<input type="text" class="form-control" id="new-agent-phone" placeholder="手機號碼" style="flex:1;">';
  body += '<button class="btn btn-primary" onclick="addAgentFromModal()">新增</button>';
  body += '</div>';

  Modal.open({
    title: '代理名單管理',
    body: body,
    size: 'md'
  });
}

function addAgentFromModal() {
  var name = document.getElementById('new-agent-name').value.trim();
  var phone = document.getElementById('new-agent-phone').value.trim();
  if (!name) { Toast.error('請輸入代理名稱'); return; }
  Agents.add(name, phone);
  Toast.success('代理已新增: ' + name);
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

function removeAgent(name) {
  Modal.confirm('確認刪除代理「' + name + '」？', function () {
    Agents.remove(name);
    Toast.success('代理已刪除');
    Modal.close();
    openAgentModal();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '刪除代理', confirmText: '確認刪除' });
}

/* ============================================================
 * Sync Actions
 * ============================================================ */

function manualSync() {
  Toast.info('正在同步...');
  if (typeof syncUploadAll === 'function') {
    syncUploadAll(function () {
      Toast.success('同步完成');
    });
  }
}

/* ============================================================
 * Backup Actions
 * ============================================================ */

function openBackupModal() {
  var backups = Backup.list();
  var body = '';

  body += '<div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-4);">';
  body += '<button class="btn btn-primary" onclick="createBackup()">建立備份</button>';
  body += '<button class="btn btn-secondary" onclick="exportJSON()">匯出 JSON</button>';
  body += '<label class="btn btn-secondary" style="cursor:pointer;">匯入 JSON<input type="file" accept=".json" style="display:none;" onchange="importJSON(event)"></label>';
  body += '</div>';

  if (backups.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">暫無備份</div></div>';
  } else {
    body += '<div class="data-table-wrap"><div class="data-table-scroll"><table class="data-table"><thead><tr><th>標籤</th><th>時間</th><th>操作</th></tr></thead><tbody>';
    for (var i = 0; i < backups.length; i++) {
      body += '<tr><td>' + Utils.escapeHtml(backups[i].label) + '</td>';
      body += '<td>' + new Date(backups[i].timestamp).toLocaleString('zh-TW') + '</td>';
      body += '<td class="action-cell">';
      body += '<button class="btn btn-secondary btn-sm" onclick="restoreBackup(\'' + backups[i].id + '\')">還原</button>';
      body += '<button class="btn btn-danger btn-sm" onclick="deleteBackup(\'' + backups[i].id + '\')">刪除</button>';
      body += '</td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  Modal.open({ title: '備份與還原', body: body, size: 'md' });
}

function createBackup() {
  var label = '備份 ' + new Date().toLocaleString('zh-TW');
  Backup.create(label);
  Toast.success('備份已建立');
  Modal.close();
  openBackupModal();
}

function restoreBackup(id) {
  Modal.confirm('確認還原此備份？當前資料將被覆蓋。', function () {
    Backup.restore(id);
    Toast.success('備份已還原');
    Modal.close();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '還原確認', confirmText: '確認還原' });
}

function deleteBackup(id) {
  Modal.confirm('確認刪除此備份？', function () {
    Backup.remove(id);
    Toast.success('備份已刪除');
    Modal.close();
    openBackupModal();
  }, { title: '刪除確認', confirmText: '確認刪除' });
}

function exportJSON() {
  Backup.exportJSON();
  Toast.success('JSON 已匯出');
}

function importJSON(event) {
  var file = event.target.files[0];
  if (!file) return;
  Backup.importJSON(file, function (err) {
    if (err) {
      Toast.error('匯入失敗: ' + err);
    } else {
      Toast.success('匯入成功');
      Modal.close();
      Events.emit(EVENTS.UI_RENDER);
    }
  });
}

/* ============================================================
 * Bot Log Export
 * ============================================================ */

function exportBotLogs() {
  var logs = State.get('botLogs') || [];
  var data = {
    exportedAt: new Date().toISOString(),
    count: logs.length,
    logs: logs
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'bot-logs-' + Utils.formatDate(new Date()) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  Toast.success('日誌已匯出');
}

/* ============================================================
 * Auth Actions
 * ============================================================ */

function handleLogin(event) {
  if (event && event.key !== 'Enter') return;
  var input = document.getElementById('login-password');
  var errorEl = document.getElementById('login-error');
  var password = input ? input.value : '';

  if (!password) {
    if (errorEl) errorEl.textContent = '請輸入密碼';
    return;
  }

  if (Auth.login(password)) {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
    App.afterLogin();
  } else {
    if (errorEl) errorEl.textContent = '密碼錯誤';
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function handleLogout() {
  Auth.logout();
  location.reload();
}

/* ============================================================
 * Clear Data
 * ============================================================ */

function clearAllData() {
  Modal.confirm(
    '確認清除所有本地和雲端資料？此操作將刪除所有訂房記錄（保留代理名單），不可撤銷！',
    function () {
      Store.clearLocalData();
      if (typeof clearFirebaseData === 'function') {
        clearFirebaseData();
      }
      Toast.success('所有資料已清除');
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '⚠️ 危險操作', confirmText: '確認清除全部' }
  );
}
