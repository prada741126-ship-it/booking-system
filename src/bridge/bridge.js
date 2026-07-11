/**
 * bridge.js — HTML <-> JS Bridge (Global Functions)
 * Booking System v2.0.0 (v8 spec)
 * All onclick handlers referenced in HTML and page-generated content are defined here.
 * Page-level modules (FeesPage, ArchivesPage, EmployeesPage, HotelConfigPage, ProfitPage)
 * expose their own methods on their module objects, not here.
 */

/* ============================================================
 * Navigation — delegate to Router
 * ============================================================ */

function navigateTo(pageId) {
  if (typeof Router !== 'undefined') Router.navigateTo(pageId);
}

function prevMonth() {
  if (typeof Router !== 'undefined') Router.prevMonth();
}

function nextMonth() {
  if (typeof Router !== 'undefined') Router.nextMonth();
}

/* ============================================================
 * Sidebar toggle — delegate to Router
 * ============================================================ */

function toggleSidebar() {
  if (typeof Router !== 'undefined') Router.toggleSidebar();
}

function closeSidebar() {
  if (typeof Router !== 'undefined') Router.closeSidebar();
}

/* ============================================================
 * Mobile More Nav — toggle popup for additional pages
 * ============================================================ */

function toggleMoreNav() {
  var popup = document.getElementById('more-nav-popup');
  if (popup) popup.classList.toggle('visible');
}

function closeMoreNav(event) {
  if (event && event.target && event.target.id !== 'more-nav-popup') return;
  var popup = document.getElementById('more-nav-popup');
  if (popup) popup.classList.remove('visible');
}

/* ============================================================
 * Booking Modal — Create / Edit / View / Delete
 * v8 fields: guestName, agent, employee, casino, hotel, roomType,
 *            checkIn, checkOut, smoking, feeStatus, currency,
 *            chargeGuest, transfer, pickupName, remark
 * ============================================================ */

var _editingBookingKey = null;

function openBookingModal(presetDate) {
  _editingBookingKey = null;

  var casinos = Hotels.getCasinos();
  var agentNames = Agents.getNames();
  var today = Utils.formatDate(new Date());

  var body = '';
  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.guestName) + ' <span class="required">*</span></label><input type="text" class="form-control" id="bk-guestName" placeholder="\u8f38\u5165\u5ba2\u4eba\u59d3\u540d"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.agent) + ' <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-agent">';
  body += '      <option value="">\u8acb\u9078\u64c7</option>';
  for (var i = 0; i < agentNames.length; i++) {
    body += '      <option value="' + Utils.escapeHtml(agentNames[i]) + '">' + Utils.escapeHtml(agentNames[i]) + '</option>';
  }
  body += '    </select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.casino) + ' <span class="required">*</span></label>';
  body += '    <select class="form-control" id="bk-casino" onchange="onCasinoChange()">';
  body += '      <option value="">\u8acb\u9078\u64c7</option>';
  for (var c = 0; c < casinos.length; c++) {
    body += '      <option value="' + Utils.escapeHtml(casinos[c]) + '">' + Utils.escapeHtml(casinos[c]) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.hotel) + '</label>';
  body += '    <select class="form-control" id="bk-hotel" onchange="onHotelChange()" disabled><option value="">\u8acb\u5148\u9078\u64c7\u9ad4\u7cfb</option></select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.roomType) + '</label>';
  body += '    <select class="form-control" id="bk-roomType" onchange="onRoomTypeChange()" disabled><option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option></select></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.checkIn) + ' <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkIn" value="' + (presetDate || today) + '" onchange="onCheckInChange()"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.checkOut) + ' <span class="required">*</span></label><input type="date" class="form-control" id="bk-checkOut" onchange="onCheckInChange()"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.nights) + '</label><input type="text" class="form-control" id="bk-nights" value="0" readonly style="opacity:0.6;"></div>';
  body += '</div>';

  body += '<div class="form-row-3">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.smoking) + '</label>';
  body += '    <select class="form-control" id="bk-smoking">';
  for (var s = 0; s < SMOKING_OPTIONS.length; s++) {
    body += '      <option value="' + SMOKING_OPTIONS[s].value + '"' + (SMOKING_OPTIONS[s].value === 'unspecified' ? ' selected' : '') + '>' + Utils.escapeHtml(SMOKING_OPTIONS[s].label) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.feeType) + '</label>';
  body += '    <select class="form-control" id="bk-feeStatus" onchange="onFeeStatusChange()">';
  body += '      <option value="free">' + Utils.escapeHtml(FEE_TYPE_LABELS.free) + '</option>';
  body += '      <option value="paid">' + Utils.escapeHtml(FEE_TYPE_LABELS.paid) + '</option>';
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.currency) + '</label>';
  body += '    <select class="form-control" id="bk-currency">';
  for (var cu = 0; cu < CURRENCY_OPTIONS.length; cu++) {
    body += '      <option value="' + CURRENCY_OPTIONS[cu].value + '"' + (CURRENCY_OPTIONS[cu].value === CURRENCY_DEFAULT ? ' selected' : '') + '>' + Utils.escapeHtml(CURRENCY_OPTIONS[cu].label) + '</option>';
  }
  body += '    </select></div>';
  body += '</div>';

  body += '<div class="form-row" id="bk-fee-row" style="display:none;">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.chargeGuest) + '</label><input type="number" class="form-control" id="bk-chargeGuest" value="0" min="0"></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.threshold) + '（萬）</label><input type="number" class="form-control" id="bk-threshold" value="0" readonly style="opacity:0.6;"></div>';
  body += '</div>';

  body += '<div class="form-row">';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.transfer) + '</label>';
  body += '    <select class="form-control" id="bk-transfer">';
  for (var t = 0; t < TRANSFER_OPTIONS.length; t++) {
    body += '      <option value="' + TRANSFER_OPTIONS[t].value + '">' + Utils.escapeHtml(TRANSFER_OPTIONS[t].label) + '</option>';
  }
  body += '    </select></div>';
  body += '  <div class="form-group"><label>' + Utils.escapeHtml(TERMS.pickupName) + '</label><input type="text" class="form-control" id="bk-pickupName" placeholder="\u8209\u724c\u540d\u7a31"></div>';
  body += '</div>';

  body += '<div class="form-group"><label>' + Utils.escapeHtml(TERMS.remark) + '</label><textarea class="form-control" id="bk-remark" rows="2" placeholder="\u5099\u8a3b"></textarea>';

  var footer = '<button class="btn btn-secondary" data-modal-close>\u53d6\u6d88</button>';
  footer += '<button class="btn btn-primary" onclick="saveBookingForm()">\u5132\u5b58\u8a02\u623f</button>';

  Modal.open({
    title: '\u65b0\u589e\u8a02\u623f',
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function onCasinoChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotelSelect = document.getElementById('bk-hotel');
  var roomSelect = document.getElementById('bk-roomType');

  roomSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option>';
  roomSelect.disabled = true;

  if (!casino) {
    hotelSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9ad4\u7cfb</option>';
    hotelSelect.disabled = true;
    return;
  }

  var hotelNames = Hotels.getHotels(casino);
  hotelSelect.innerHTML = '<option value="">\u8acb\u9078\u64c7</option>';
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
    roomSelect.innerHTML = '<option value="">\u8acb\u5148\u9078\u64c7\u9152\u5e97</option>';
    roomSelect.disabled = true;
    return;
  }

  roomSelect.innerHTML = '<option value="">\u8acb\u9078\u64c7</option>';
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    if (!Hotels.hasRoomType(casino, hotel, ROOM_TYPES[i].value)) continue;
    var threshold = Hotels.getThreshold(casino, hotel, ROOM_TYPES[i].value);
    roomSelect.innerHTML += '<option value="' + ROOM_TYPES[i].value + '" data-threshold="' + threshold + '">' +
      Utils.escapeHtml(ROOM_TYPES[i].label) + ' (\u9580\u6abbi ' + Utils.formatNumber(Math.round(threshold / 10000)) + '\u842c)</option>';
  }
  roomSelect.disabled = false;
}

function onRoomTypeChange() {
  var casino = document.getElementById('bk-casino').value;
  var hotel = document.getElementById('bk-hotel').value;
  var roomType = document.getElementById('bk-roomType').value;
  var thresholdInput = document.getElementById('bk-threshold');

  if (casino && hotel && roomType) {
    var threshold = Hotels.getThreshold(casino, hotel, roomType);
    if (thresholdInput) thresholdInput.value = Math.round((threshold || 0) / 10000);
  }
}

function onCheckInChange() {
  var checkIn = document.getElementById('bk-checkIn').value;
  var checkOut = document.getElementById('bk-checkOut').value;
  if (checkIn && checkOut) {
    var nights = Utils.calcNights(checkIn, checkOut);
    document.getElementById('bk-nights').value = nights;
  }
}

function onFeeStatusChange() {
  var feeStatus = document.getElementById('bk-feeStatus').value;
  var feeRow = document.getElementById('bk-fee-row');
  if (feeRow) {
    feeRow.style.display = (feeStatus === 'paid') ? '' : 'none';
  }
}

function saveBookingForm() {
  var data = {
    guestName:      document.getElementById('bk-guestName').value.trim(),
    agent:          document.getElementById('bk-agent').value,
    casino:         document.getElementById('bk-casino').value,
    hotel:          document.getElementById('bk-hotel').value,
    roomType:       document.getElementById('bk-roomType').value,
    checkIn:        document.getElementById('bk-checkIn').value,
    checkOut:       document.getElementById('bk-checkOut').value,
    smoking:        document.getElementById('bk-smoking').value,
    feeStatus:      document.getElementById('bk-feeStatus').value,
    currency:       document.getElementById('bk-currency').value,
    transfer:       document.getElementById('bk-transfer').value,
    pickupName:     document.getElementById('bk-pickupName').value.trim(),
    remark:         document.getElementById('bk-remark').value.trim()
  };

  /* Only include fee amounts if paid */
  if (data.feeStatus === 'paid') {
    data.chargeGuest = Number(document.getElementById('bk-chargeGuest').value) || 0;
  }

  /* Get threshold from hidden field */
  var thresholdInput = document.getElementById('bk-threshold');
  if (thresholdInput) {
    data.threshold = (Number(thresholdInput.value) || 0) * 10000;
  }

  /* Validation */
  if (!data.guestName) { Toast.error('\u8acb\u8f38\u5165\u5ba2\u4eba\u59d3\u540d'); return; }
  if (!data.agent) { Toast.error('\u8acb\u9078\u64c7\u4ee3\u7406'); return; }
  if (!data.casino) { Toast.error('\u8acb\u9078\u64c7\u9ad4\u7cfb'); return; }
  if (!data.checkIn || !data.checkOut) { Toast.error('\u8acb\u9078\u64c7\u5165\u4f4f\u548c\u9000\u623f\u65e5\u671f'); return; }

  /* Seal check — prevent saving if the booking's month is sealed */
  if (data.checkOut && State.isMonthClosed(data.checkOut.slice(0, 7))) {
    Toast.warning('此月份已封存，不可新增或修改訂房');
    return;
  }

  /* Check for duplicate (warn only) */
  var dups = Bookings.checkDuplicate(data.guestName, data.checkIn, data.casino);
  if (dups.length > 0 && !_editingBookingKey) {
    if (!confirm('\u8b66\u544ai \u540c\u4e00\u5ba2\u4eba + \u540c\u4e00\u65e5\u671f + \u540c\u4e00\u9ad4\u7cfb \u5df2\u6709\u8a02\u623f\u8a18\u9304\uff0c\u662f\u5426\u7e7c\u7e8c\uff1f')) {
      return;
    }
  }

  if (_editingBookingKey) {
    Bookings.update(_editingBookingKey, data);
    Toast.success('\u8a02\u623f\u5df2\u66f4\u65b0');
  } else {
    Bookings.create(data);
    Toast.success('\u8a02\u623f\u5df2\u5efa\u7acb');
  }

  Modal.close();
  Events.emit(EVENTS.UI_RENDER);
}

function editBooking(fbKey) {
  var booking = Bookings.getByKey(fbKey);
  if (!booking) { Toast.error('\u627e\u4e0d\u5230\u8a02\u623f\u8a18\u9304'); return; }

  /* Seal check — prevent editing if the booking's month is sealed */
  if (booking.checkOut && State.isMonthClosed(booking.checkOut.slice(0, 7))) {
    Toast.warning('此月份已封存，不可修改訂房');
    return;
  }

  /* Check edit permission */
  var rules = STATUS_RULES[booking.status] || { canEdit: true };
  if (!rules.canEdit) {
    Toast.warning('\u6b64\u8a02\u623f\u5df2\u9396\u5b9a\uff0c\u4e0d\u53ef\u7de8\u8f2f');
    return;
  }

  _editingBookingKey = fbKey;
  openBookingModal();

  /* Fill form with existing data */
  setTimeout(function () {
    document.getElementById('bk-guestName').value = booking.guestName || '';
    document.getElementById('bk-agent').value = booking.agent || '';
    document.getElementById('bk-casino').value = booking.casino || '';
    onCasinoChange();
    document.getElementById('bk-hotel').value = booking.hotel || '';
    onHotelChange();
    document.getElementById('bk-roomType').value = booking.roomType || '';
    onRoomTypeChange();
    document.getElementById('bk-checkIn').value = booking.checkIn || '';
    document.getElementById('bk-checkOut').value = booking.checkOut || '';
    onCheckInChange();
    document.getElementById('bk-smoking').value = booking.smoking || 'unspecified';
    document.getElementById('bk-feeStatus').value = booking.feeStatus || 'free';
    onFeeStatusChange();
    document.getElementById('bk-currency').value = booking.currency || 'HKD';
    if (booking.feeStatus === 'paid') {
      document.getElementById('bk-chargeGuest').value = booking.chargeGuest || 0;
    }
    document.getElementById('bk-transfer').value = booking.transfer || 'none';
    document.getElementById('bk-pickupName').value = booking.pickupName || '';
    document.getElementById('bk-remark').value = booking.remark || '';
  }, 50);
}

function viewBookingDetail(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) { Toast.error('\u627e\u4e0d\u5230\u8a02\u623f\u8a18\u9304'); return; }

  var body = '';
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);">';

  body += _detailField('訂單編號', b.bookingNo || b._fbKey || '--');
  body += _detailField(TERMS.guestName, b.guestName);
  body += _detailField(TERMS.agent, b.agent);
  body += _detailField(TERMS.casino, b.casino);
  body += _detailField(TERMS.hotel, b.hotel);
  body += _detailField(TERMS.roomType, _roomTypeLabel(b.roomType));
  body += _detailField(TERMS.checkIn, Utils.formatDateDisplay(b.checkIn));
  body += _detailField(TERMS.checkOut, Utils.formatDateDisplay(b.checkOut));
  body += _detailField(TERMS.nights, b.nights + ' \u665a');
  body += _detailField(TERMS.smoking, _smokingLabel(b.smoking));
  body += _detailField(TERMS.status, BOOKING_STATUS_LABELS[b.status] || b.status);
  body += _detailField(TERMS.confirmNo, b.confirmNo || '--');
  body += _detailField(TERMS.feeType, FEE_TYPE_LABELS[b.feeStatus] || b.feeStatus);
  body += _detailField(TERMS.currency, b.currency || 'HKD');
  body += _detailField(TERMS.chargeGuest, b.feeStatus === 'paid' ? Utils.formatCurrency(b.chargeGuest, b.currency) : '--');
  body += _detailField(TERMS.profit, b.feeStatus === 'paid' ? Utils.formatCurrency(b.profit, b.currency) : '--');
  body += _detailField(TERMS.threshold, Utils.formatNumber(Math.round((b.threshold || 0) / 10000)) + ' 萬');
  body += _detailField(TERMS.transfer, _transferLabel(b.transfer));
  body += _detailField(TERMS.pickupName, b.pickupName || '--');
  body += _detailField(TERMS.employee, b.employee || '--');

  body += '</div>';

  if (b.remark) {
    body += '<div class="form-group" style="margin-top:var(--sp-4);"><label>' + Utils.escapeHtml(TERMS.remark) + '</label>';
    body += '<div style="padding:var(--sp-3);background:var(--bg-input);border-radius:var(--radius-md);">' + Utils.escapeHtml(b.remark) + '</div></div>';
  }

  var footer = '<button class="btn btn-secondary" data-modal-close>\u95dc\u9589</button>';
  var rules = STATUS_RULES[b.status] || { canEdit: true };
  if (rules.canEdit) {
    footer += '<button class="btn btn-danger" onclick="deleteBooking(\'' + fbKey + '\')">\u522a\u9664</button>';
    footer += '<button class="btn btn-primary" onclick="Modal.close();editBooking(\'' + fbKey + '\')">\u7de8\u8f2f</button>';
  }

  Modal.open({
    title: '\u8a02\u623f\u8a73\u60c5 \u2014 ' + (b.guestName || ''),
    body: body,
    footer: footer,
    size: 'lg'
  });
}

function deleteBooking(fbKey) {
  var b = Bookings.getByKey(fbKey);
  if (!b) return;

  /* Seal check — prevent deletion if the booking's month is sealed */
  if (b.checkOut && State.isMonthClosed(b.checkOut.slice(0, 7))) {
    Toast.warning('此月份已封存，不可刪除訂房');
    return;
  }

  Modal.confirm(
    '\u78ba\u8a8d\u522a\u9664\u300c' + (b.guestName || '') + '\u300d\u7684\u8a02\u623f\u8a18\u9304\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u92b7\u3002',
    function () {
      Bookings.delete(fbKey);
      Toast.success('\u8a02\u623f\u5df2\u522a\u9664');
      Modal.close();
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '\u522a\u9664\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u522a\u9664' }
  );
}

/* ----- helpers ----- */

function _detailField(label, value) {
  return '<div><div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:2px;">' + Utils.escapeHtml(label) + '</div>' +
         '<div style="font-size:var(--fs-sm);font-weight:500;">' + (value !== undefined && value !== null && value !== '' ? Utils.escapeHtml(String(value)) : '--') + '</div></div>';
}

function _roomTypeLabel(val) {
  for (var i = 0; i < ROOM_TYPES.length; i++) {
    if (ROOM_TYPES[i].value === val) return ROOM_TYPES[i].label;
  }
  return val || '--';
}

function _smokingLabel(val) {
  return SMOKING_LABELS[val] || '\u672a\u6307\u5b9a';
}

function _transferLabel(val) {
  for (var i = 0; i < TRANSFER_OPTIONS.length; i++) {
    if (TRANSFER_OPTIONS[i].value === val) return TRANSFER_OPTIONS[i].label;
  }
  return val || '\u7121';
}

/* ============================================================
 * Agent Management — v8: active/deactivate support
 * ============================================================ */

function openAgentModal() {
  var agents = Agents.getAll();
  var body = '<div id="agent-list-container">';

  if (agents.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">\u66ab\u7121\u4ee3\u7406</div><div class="empty-desc">\u9ede\u64ca\u4e0b\u65b9\u6309\u9215\u65b0\u589e\u4ee3\u7406</div></div>';
  } else {
    body += '<div class="data-table-wrap" style="max-height: 50vh; overflow-y: auto;"><div class="data-table-scroll"><table class="data-table"><thead style="position:sticky;top:0;background:var(--bg-surface);z-index:1;"><tr><th>\u4ee3\u7406\u540d\u7a31</th><th>\u72c0\u614b</th><th style="min-width:120px;">\u64cd\u4f5c</th></tr></thead><tbody>';
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var name = a.name || '';
      var isActive = a.active !== false;
      body += '<tr><td>' + Utils.escapeHtml(name) + '</td>';
      body += '<td>' + (isActive ? '<span class="status-badge status-active">\u5553\u7528</span>' : '<span class="status-badge status-inactive">\u505c\u7528</span>') + '</td>';
      body += '<td class="action-cell">';
      if (isActive) {
        body += '<button class="btn btn-ghost btn-sm" onclick="deactivateAgent(\'' + Utils.escapeHtml(name) + '\')">\u505c\u7528</button>';
      } else {
        body += '<button class="btn btn-ghost btn-sm" onclick="activateAgent(\'' + Utils.escapeHtml(name) + '\')">\u5553\u7528</button>';
      }
      body += '<button class="btn btn-danger btn-sm" onclick="removeAgent(\'' + Utils.escapeHtml(name) + '\')">\u522a\u9664</button>';
      body += '</td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  body += '</div>';
  body += '<div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2);">';
  body += '<input type="text" class="form-control" id="new-agent-name" placeholder="\u4ee3\u7406\u540d\u7a31" style="flex:1;">';
  body += '<input type="text" class="form-control" id="new-agent-phone" placeholder="\u624b\u6a5f\u865f\u78bc" style="flex:1;">';
  body += '<button class="btn btn-primary" onclick="addAgentFromModal()">\u65b0\u589e</button>';
  body += '</div>';

  Modal.open({
    title: '\u4ee3\u7406\u540d\u55ae\u7ba1\u7406',
    body: body,
    size: 'lg'
  });
}

function addAgentFromModal() {
  var name = document.getElementById('new-agent-name').value.trim();
  var phone = document.getElementById('new-agent-phone').value.trim();
  if (!name) { Toast.error('\u8acb\u8f38\u5165\u4ee3\u7406\u540d\u7a31'); return; }
  Agents.add(name, phone);
  Toast.success('\u4ee3\u7406\u5df2\u65b0\u589e: ' + name);
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

function removeAgent(name) {
  Modal.confirm('\u78ba\u8a8d\u522a\u9664\u4ee3\u7406\u300c' + name + '\u300d\uff1f', function () {
    Agents.remove(name);
    Toast.success('\u4ee3\u7406\u5df2\u522a\u9664');
    Modal.close();
    openAgentModal();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '\u522a\u9664\u4ee3\u7406', confirmText: '\u78ba\u8a8d\u522a\u9664' });
}

function activateAgent(name) {
  Agents.activate(name);
  Toast.success('\u4ee3\u7406\u5df2\u5553\u7528');
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

function deactivateAgent(name) {
  Agents.deactivate(name);
  Toast.success('\u4ee3\u7406\u5df2\u505c\u7528');
  Modal.close();
  openAgentModal();
  Events.emit(EVENTS.UI_RENDER);
}

/* ============================================================
 * Sync Actions
 * ============================================================ */

function manualSync() {
  Toast.info('\u6b63\u5728\u540c\u6b65...');
  if (typeof syncUploadAll === 'function') {
    syncUploadAll(function () {
      Toast.success('\u540c\u6b65\u5b8c\u6210');
    });
  }
}

/* ============================================================
 * Backup Actions — v8: no export/import JSON
 * ============================================================ */

function openBackupModal() {
  var backups = Backup.list();
  var body = '';

  body += '<div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-4);">';
  body += '<button class="btn btn-primary" onclick="createBackup()">\u5efa\u7acb\u5099\u4efd</button>';
  body += '</div>';

  if (backups.length === 0) {
    body += '<div class="empty-state"><div class="empty-title">\u66ab\u7121\u5099\u4efd</div></div>';
  } else {
    body += '<div class="data-table-wrap"><div class="data-table-scroll"><table class="data-table"><thead><tr><th>\u6a19\u7c64</th><th>\u6642\u9593</th><th>\u64cd\u4f5c</th></tr></thead><tbody>';
    for (var i = 0; i < backups.length; i++) {
      body += '<tr><td>' + Utils.escapeHtml(backups[i].label) + '</td>';
      body += '<td>' + new Date(backups[i].timestamp).toLocaleString('zh-TW') + '</td>';
      body += '<td class="action-cell">';
      body += '<button class="btn btn-secondary btn-sm" onclick="restoreBackup(\'' + backups[i].id + '\')">\u9084\u539f</button>';
      body += '<button class="btn btn-danger btn-sm" onclick="deleteBackup(\'' + backups[i].id + '\')">\u522a\u9664</button>';
      body += '</td></tr>';
    }
    body += '</tbody></table></div></div>';
  }

  Modal.open({ title: '\u5099\u4efd\u8207\u9084\u539f', body: body, size: 'md' });
}

function createBackup() {
  var label = '\u5099\u4efd ' + new Date().toLocaleString('zh-TW');
  Backup.create(label);
  Toast.success('\u5099\u4efd\u5df2\u5efa\u7acb');
  Modal.close();
  openBackupModal();
}

function restoreBackup(id) {
  Modal.confirm('\u78ba\u8a8d\u9084\u539f\u6b64\u5099\u4efd\uff1f\u7576\u524d\u8cc7\u6599\u5c07\u88ab\u8986\u84cb\u3002', function () {
    Backup.restore(id);
    Toast.success('\u5099\u4efd\u5df2\u9084\u539f');
    Modal.close();
    Events.emit(EVENTS.UI_RENDER);
  }, { title: '\u9084\u539f\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u9084\u539f' });
}

function deleteBackup(id) {
  Modal.confirm('\u78ba\u8a8d\u522a\u9664\u6b64\u5099\u4efd\uff1f', function () {
    Backup.remove(id);
    Toast.success('\u5099\u4efd\u5df2\u522a\u9664');
    Modal.close();
    openBackupModal();
  }, { title: '\u522a\u9664\u78ba\u8a8d', confirmText: '\u78ba\u8a8d\u522a\u9664' });
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
    if (errorEl) errorEl.textContent = '\u8acb\u8f38\u5165\u5bc6\u78bc';
    return;
  }

  if (Auth.login(password)) {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
    if (typeof App !== 'undefined') App.init();
  } else {
    if (errorEl) errorEl.textContent = '\u5bc6\u78bc\u932f\u8aa4';
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
 * Clear Data — v8: keep agentList + employeeList
 * ============================================================ */

function clearAllData() {
  Modal.confirm(
    '\u78ba\u8a8d\u6e05\u9664\u6240\u6709\u8a02\u623f\u8cc7\u6599\uff1f\u6b64\u64cd\u4f5c\u5c07\u522a\u9664\u6240\u6709\u8a02\u623f\u8a18\u9304\uff08\u4fdd\u7559\u4ee3\u7406\u540d\u55ae\u53ca\u54e1\u5de5\u540d\u55ae\uff09\uff0c\u4e0d\u53ef\u64a4\u92b7\uff01',
    function () {
      if (typeof Store !== 'undefined' && Store.clearLocalData) {
        Store.clearLocalData();
      }
      if (typeof clearFirebaseData === 'function') {
        clearFirebaseData();
      }
      Toast.success('\u6240\u6709\u8cc7\u6599\u5df2\u6e05\u9664');
      Events.emit(EVENTS.UI_RENDER);
    },
    { title: '\u26a0\ufe0f \u5371\u96aa\u64cd\u4f5c', confirmText: '\u78ba\u8a8d\u6e05\u9664\u5168\u90e8' }
  );
}

/* ============================================================
 * Month Seal / Unseal Actions (v2.1.6)
 * ============================================================ */

function sealMonthAction(monthStr) {
  Modal.confirm(
    '\u78ba\u8a8d\u5c01\u5b58\u300c' + monthStr + '\u300d\u6708\u7d50\u8cc7\u6599\uff1f\u5c01\u5b58\u5f8c\u8a72\u6708\u4efd\u8a02\u623f\u5c07\u9396\u5b9a\uff0c\u4e0d\u53ef\u65b0\u589e\u3001\u4fee\u6539\u6216\u522a\u9664\u3002',
    function () {
      State.sealMonth(monthStr);
      Toast.success(monthStr + ' \u5df2\u5c01\u5b58');
    },
    { title: '\u6708\u7d50\u5c01\u5b58', confirmText: '\u78ba\u8a8d\u5c01\u5b58' }
  );
}

function unsealMonthAction(monthStr) {
  Modal.confirm(
    '\u26a0\ufe0f \u78ba\u8a8d\u89e3\u5c01\u300c' + monthStr + '\u300d\u6708\u7d50\u8cc7\u6599\uff1f\u89e3\u5c01\u5f8c\u8a72\u6708\u4efd\u8a02\u623f\u5c07\u53ef\u4ee5\u88ab\u4fee\u6539\uff0c\u8acb\u78ba\u8a8d\u662f\u5426\u771f\u7684\u9700\u8981\u89e3\u5c01\u3002',
    function () {
      State.unsealMonth(monthStr);
      Toast.success(monthStr + ' \u5df2\u89e3\u5c01');
    },
    { title: '\u89e3\u5c01\u6708\u7d50', confirmText: '\u78ba\u8a8d\u89e3\u5c01' }
  );
}
