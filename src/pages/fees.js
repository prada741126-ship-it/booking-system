/**
 * fees.js — Fee Collection Page (Ctrl+3)
 * Booking System v2.0.0 (v8 spec)
 * Accountant fills in charge amounts; employees only select free/paid
 * Renders: KPI (free/paid counts) + fee status table + inline edit for amounts
 */
var FeesPage = (function () {

  var _filterFee = '';  /* '', 'free', 'paid' */

  function render() {
    var container = document.getElementById('page-fees');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);

    var html = '';

    /* Page header */
    html += '<div class="page-header">';
    html += '  <h3>費用收取 — ' + month + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards */
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-green', '免費房', feeCounts.free, '間', '無需收費',
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    html += _kpiCard('kpi-amber', '收費房', feeCounts.paid, '間', '需填入金額',
      '<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>');
    if (feeStatsData.paid.count > 0) {
      html += _kpiCard('kpi-blue', '向客人收合計', Utils.formatCurrency(feeStatsData.paid.chargeGuest, CURRENCY_DEFAULT), '', '收費房',
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>');
      html += _kpiCard('kpi-gold', '利潤合計', Utils.formatCurrency(feeStatsData.paid.profit, CURRENCY_DEFAULT), '', '客人收 - 公司',
        '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>');
    }
    html += '</div>';

    /* Quick filter */
    html += '<div class="quick-filters" style="margin-bottom:var(--sp-4);">';
    html += '<button class="quick-filter' + (_filterFee === '' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'\')">全部 (' + monthBookings.length + ')</button>';
    html += '<button class="quick-filter' + (_filterFee === 'free' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'free\')">免費 (' + feeCounts.free + ')</button>';
    html += '<button class="quick-filter' + (_filterFee === 'paid' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'paid\')">收費 (' + feeCounts.paid + ')</button>';
    html += '</div>';

    /* Fee table */
    var filtered = _filterFee ? monthBookings.filter(function (b) { return b.feeStatus === _filterFee; }) : monthBookings;
    var sorted = Filters.sortBookings(filtered, 'checkIn', true);

    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>費用明細</div>';

    if (sorted.length === 0) {
      html += _emptyStateMini('暫無記錄');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>客人</th><th>代理</th><th>體系</th><th>酒店/房型</th><th>入住</th><th>退房</th>';
      html += '<th>費用</th><th>幣別</th><th class="num-cell">向客人收</th><th class="num-cell">交公司</th><th class="num-cell">利潤</th><th>操作</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < sorted.length; i++) {
        html += _feeRow(sorted[i]);
      }

      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function _feeRow(b) {
    var curr = b.currency || CURRENCY_DEFAULT;
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var rules = STATUS_RULES[b.status] || { canEdit: true };

    var html = '<tr>';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
    html += '<td><div style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.hotel || '-') + '</div><div style="font-size:var(--fs-xs);color:var(--text-muted);">' + Utils.escapeHtml(_roomTypeLabel(b.roomType)) + '</div></td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkOut) + '</td>';
    html += '<td><span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span></td>';
    html += '<td><span class="currency-badge">' + Utils.escapeHtml(curr) + '</span></td>';

    if (isPaid) {
      /* Editable amounts for paid bookings */
      if (rules.canEdit) {
        html += '<td class="num-cell"><input type="number" class="fee-input" value="' + (b.chargeGuest || 0) + '" onchange="FeesPage.updateAmount(\'' + b._fbKey + '\',\'chargeGuest\',this.value)" style="width:80px;"></td>';
        html += '<td class="num-cell"><input type="number" class="fee-input" value="' + (b.chargeCompany || 0) + '" onchange="FeesPage.updateAmount(\'' + b._fbKey + '\',\'chargeCompany\',this.value)" style="width:80px;"></td>';
      } else {
        html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeGuest, curr) + '</td>';
        html += '<td class="num-cell">' + Utils.formatCurrency(b.chargeCompany, curr) + '</td>';
      }
      html += '<td class="num-cell" style="font-weight:700;color:var(--color-warning);">' + Utils.formatCurrency(b.profit, curr) + '</td>';
    } else {
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
      html += '<td class="num-cell" style="color:var(--text-muted);">-</td>';
    }

    /* Action: toggle free/paid */
    html += '<td>';
    if (rules.canEdit) {
      if (isPaid) {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + b._fbKey + '\',\'free\')">改免費</button>';
      } else {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + b._fbKey + '\',\'paid\')">改收費</button>';
      }
    } else {
      html += '<span style="color:var(--text-muted);font-size:var(--fs-xs);">已鎖定</span>';
    }
    html += '</td>';

    html += '</tr>';
    return html;
  }

  function updateAmount(fbKey, field, value) {
    var num = Number(value) || 0;
    var data = {};
    data[field] = num;
    var updated = Bookings.update(fbKey, data);
    if (updated) {
      Toast.success('已更新 ' + (field === 'chargeGuest' ? '向客人收' : '交公司') + ': ' + Utils.formatCurrency(num, updated.currency));
      render();
    }
  }

  function toggleFee(fbKey, newFee) {
    var data = { feeStatus: newFee };
    if (newFee === FEE_TYPES.FREE) {
      data.chargeGuest = 0;
      data.chargeCompany = 0;
    }
    var updated = Bookings.update(fbKey, data);
    if (updated) {
      Toast.success('已更改為' + (FEE_TYPE_LABELS[newFee] || newFee));
      render();
    }
  }

  function setFilter(fee) {
    _filterFee = fee;
    render();
  }

  function _roomTypeLabel(value) {
    for (var i = 0; i < ROOM_TYPES.length; i++) {
      if (ROOM_TYPES[i].value === value) return ROOM_TYPES[i].label;
    }
    return value || '';
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

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' + Utils.escapeHtml(text) + '</div>';
  }

  return {
    render: render,
    updateAmount: updateAmount,
    toggleFee: toggleFee,
    setFilter: setFilter
  };
})();

function renderFees() { FeesPage.render(); }
