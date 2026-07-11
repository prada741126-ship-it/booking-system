/**
 * fees.js — Fee Collection Page (Ctrl+3)
 * Booking System v2.0.8
 * Accountant fills volume → auto-calc discount/remaining → auto-determine fee status → fill charge amount
 * Silent save: updates DOM in-place without full page re-render
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
    html += '<div class="kpi-grid" id="fee-kpi-grid">';
    html += _buildKPIs(monthBookings, feeCounts, feeStatsData);
    html += '</div>';

    /* Quick filter */
    html += '<div class="quick-filters" style="margin-bottom:var(--sp-4);">';
    html += '<button class="quick-filter-btn' + (_filterFee === '' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'\')">全部 (' + monthBookings.length + ')</button>';
    html += '<button class="quick-filter-btn' + (_filterFee === 'free' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'free\')">免費 (' + feeCounts.free + ')</button>';
    html += '<button class="quick-filter-btn' + (_filterFee === 'paid' ? ' active' : '') + '" onclick="FeesPage.setFilter(\'paid\')">收費 (' + feeCounts.paid + ')</button>';
    html += '</div>';

    /* Fee table */
    var filtered = _filterFee ? monthBookings.filter(function (b) { return b.feeStatus === _filterFee; }) : monthBookings;
    var sorted = _sortBookings(filtered);

    html += '<div class="card">';
    html += '  <div class="card-title"><div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V9H7z"/></svg></div>費用明細</div>';

    /* Formula hint */
    html += '<div style="margin-bottom:var(--sp-2);color:var(--text-muted);font-size:var(--fs-xs);">';
    html += '折抵天數 = 客戶轉碼 ÷ 每晚門檻（無條件退位）。剩餘天數 > 0 → 自動設為收費房；剩餘 = 0 → 自動設為免費房。可手動覆蓋。<br>';
    html += '向客人收 = (剩餘天數 × 每晚門檻 ÷ 10萬) × ' + State.getRoomFeeRate() + ' 元（自動帶入，可手動修改）。';
    html += '</div>';

    if (sorted.length === 0) {
      html += _emptyStateMini('暫無記錄');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint scrollable">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>代理</th><th>客人</th><th>酒店</th><th>入住</th>';
      html += '<th style="text-align:center;width:45px;">天數</th>';
      html += '<th style="text-align:right;width:50px;">每晚<br>(萬)</th>';
      html += '<th style="text-align:right;width:60px;">總門檻<br>(萬)</th>';
      html += '<th style="text-align:right;width:85px;">客戶轉碼<br>(萬)</th>';
      html += '<th style="text-align:center;width:45px;">折抵<br>(天)</th>';
      html += '<th style="text-align:center;width:45px;">剩餘<br>(天)</th>';
      html += '<th style="width:50px;">費用</th>';
      html += '<th style="text-align:right;width:80px;">向客人收</th>';
      html += '<th style="width:65px;">操作</th>';
      html += '</tr></thead><tbody id="fee-table-body">';

      for (var i = 0; i < sorted.length; i++) {
        html += _feeRow(sorted[i]);
      }

      /* Summary row */
      html += _summaryRow(sorted);

      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  /* ===== Sort by agent first, then checkIn ===== */
  function _sortBookings(bookings) {
    return bookings.slice().sort(function (a, b) {
      var agentA = (a.agent || '').toLowerCase();
      var agentB = (b.agent || '').toLowerCase();
      if (agentA !== agentB) return agentA < agentB ? -1 : 1;
      return (a.checkIn || '') < (b.checkIn || '') ? -1 : 1;
    });
  }

  /* ===== Row builder ===== */
  function _feeRow(b) {
    var curr = b.currency || CURRENCY_DEFAULT;
    var th = Number(b.threshold) || 0;
    var n = Number(b.nights) || 0;
    var totalTh = th * n;
    var thWan = Math.round(th / 10000);
    var totalThWan = Math.round(totalTh / 10000);
    var vol = Number(b.volume) || 0;
    var volWan = vol > 0 ? Math.round(vol / 10000) : '';
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var rules = STATUS_RULES[b.status] || { canEdit: true };

    /* Calculate discount & remaining */
    var discountDays = _calcDiscount(vol, th);
    var remaining = n - discountDays;

    var html = '<tr data-fbkey="' + Utils.escapeHtml(b._fbKey || '') + '">';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.hotel || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td class="num-cell cell-nights">' + n + '</td>';
    html += '<td class="num-cell cell-th-night">' + thWan + '</td>';
    html += '<td class="num-cell cell-th-total">' + totalThWan + '</td>';

    /* Volume input */
    html += '<td class="num-cell cell-vol">';
    if (rules.canEdit) {
      html += '<input type="number" min="0" step="1" class="fee-input" value="' + volWan + '" ';
      html += 'onchange="FeesPage.updateVolume(this,\'' + Utils.escapeHtml(b._fbKey || '') + '\')" ';
      html += 'placeholder="萬" style="width:60px;text-align:right;padding:2px 4px;font-size:var(--fs-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--text-primary);">';
    } else {
      html += (volWan || '<span style="color:var(--text-muted);">-</span>');
    }
    html += '</td>';

    /* Discount */
    html += '<td class="num-cell cell-disc">' + (discountDays === 0 ? '<span style="color:var(--text-muted);">0</span>' : discountDays) + '</td>';

    /* Remaining */
    html += '<td class="num-cell cell-rem">' + _remainingHTML(remaining) + '</td>';

    /* Fee status badge */
    html += '<td class="cell-fee"><span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span></td>';

    /* Charge guest */
    html += '<td class="num-cell cell-cg">';
    if (isPaid) {
      if (rules.canEdit) {
        html += '<input type="number" min="0" class="fee-input" value="' + (b.chargeGuest || 0) + '" ';
        html += 'onchange="FeesPage.updateChargeGuest(this,\'' + Utils.escapeHtml(b._fbKey || '') + '\')" ';
        html += 'style="width:65px;text-align:right;padding:2px 4px;font-size:var(--fs-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--text-primary);">';
      } else {
        html += Utils.formatCurrency(b.chargeGuest, curr);
      }
    } else {
      html += '<span style="color:var(--text-muted);">-</span>';
    }
    html += '</td>';

    /* Action: toggle free/paid */
    html += '<td class="cell-action">';
    if (rules.canEdit) {
      if (isPaid) {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + Utils.escapeHtml(b._fbKey || '') + '\',\'free\')">改免費</button>';
      } else {
        html += '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + Utils.escapeHtml(b._fbKey || '') + '\',\'paid\')">改收費</button>';
      }
    } else {
      html += '<span style="color:var(--text-muted);font-size:var(--fs-xs);">已鎖定</span>';
    }
    html += '</td>';

    html += '</tr>';
    return html;
  }

  /* ===== Helpers ===== */

  function _calcDiscount(vol, th) {
    if (vol > 0 && th > 0) return Math.floor(vol / th);
    return 0;
  }

  /* ===== Auto-calc room fee: (remainingNights × threshold / 100000) × rate ===== */
  function _calcRoomFee(remainingNights, threshold) {
    if (remainingNights <= 0 || threshold <= 0) return 0;
    var rate = State.getRoomFeeRate();
    var units = (remainingNights * threshold) / ROOM_FEE_UNIT;
    return Math.round(units * rate);
  }

  function _remainingHTML(remaining) {
    if (remaining <= 0) {
      return '<span style="color:var(--color-success);font-weight:700;">達標</span>';
    }
    return '<span style="color:var(--color-danger);font-weight:700;">' + remaining + '</span>';
  }

  function _summaryRow(bookings) {
    var totals = _calcTotals(bookings);

    var html = '<tr id="fee-summary-row" style="background:var(--bg-base);font-weight:700;border-top:2px solid var(--border-default);">';
    html += '<td colspan="4">合計</td>';
    html += '<td class="num-cell">' + totals.nights + '</td>';
    html += '<td></td>';
    html += '<td></td>';
    html += '<td></td>';
    html += '<td class="num-cell">' + totals.discount + '</td>';
    html += '<td class="num-cell" style="color:var(--color-danger);">' + totals.remaining + '</td>';
    html += '<td></td>';
    html += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeGuest, CURRENCY_DEFAULT) + '</td>';
    html += '<td></td>';
    html += '</tr>';
    return html;
  }

  function _calcTotals(bookings) {
    var nights = 0, discount = 0, remaining = 0, chargeGuest = 0, profit = 0;
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var n = Number(b.nights) || 0;
      var th = Number(b.threshold) || 0;
      var vol = Number(b.volume) || 0;
      var disc = _calcDiscount(vol, th);
      var rem = n - disc;
      nights += n;
      discount += disc;
      if (rem > 0) remaining += rem;
      if (b.feeStatus === 'paid') {
        chargeGuest += Number(b.chargeGuest) || 0;
        profit += Number(b.profit) || 0;
      }
    }
    return { nights: nights, discount: discount, remaining: remaining, chargeGuest: chargeGuest, profit: profit };
  }

  function _buildKPIs(monthBookings, feeCounts, feeStatsData) {
    var html = '';
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
    return html;
  }

  /* ===== Silent update: volume ===== */
  function updateVolume(inputEl, fbKey) {
    try {
      var wanValue = Number(inputEl.value) || 0;
      if (wanValue < 0) wanValue = 0;
      var volume = wanValue * 10000;
      var updated = Bookings.update(fbKey, { volume: volume });
      if (updated) {
        var tr = inputEl.closest('tr');
        if (tr) _recalcRow(tr, updated, true);
        _updateSummary();
        _updateKPIs();
      }
    } catch (e) {
      console.error('[FeesPage] updateVolume error:', e);
      Toast.show('更新失敗', 'error');
    }
  }

  /* ===== Silent update: chargeGuest ===== */
  function updateChargeGuest(inputEl, fbKey) {
    try {
      var num = Number(inputEl.value) || 0;
      var updated = Bookings.update(fbKey, { chargeGuest: num });
      if (updated) {
        _updateSummary();
        _updateKPIs();
      }
    } catch (e) {
      console.error('[FeesPage] updateChargeGuest error:', e);
      Toast.show('更新失敗', 'error');
    }
  }

  /* ===== Recalculate and update a row's DOM in-place ===== */
  function _recalcRow(tr, b, autoDetermine) {
    var th = Number(b.threshold) || 0;
    var n = Number(b.nights) || 0;
    var vol = Number(b.volume) || 0;
    var curr = b.currency || CURRENCY_DEFAULT;
    var rules = STATUS_RULES[b.status] || { canEdit: true };

    /* Recalculate discount & remaining */
    var discountDays = _calcDiscount(vol, th);
    var remaining = n - discountDays;

    /* Update discount cell */
    var discCell = tr.querySelector('.cell-disc');
    if (discCell) {
      discCell.innerHTML = discountDays === 0 ? '<span style="color:var(--text-muted);">0</span>' : discountDays;
    }

    /* Update remaining cell */
    var remCell = tr.querySelector('.cell-rem');
    if (remCell) {
      remCell.innerHTML = _remainingHTML(remaining);
    }

    /* Auto-determine fee status (only when volume > 0 and autoDetermine is true) */
    if (autoDetermine && vol > 0) {
      var newFeeStatus = remaining > 0 ? FEE_TYPES.PAID : FEE_TYPES.FREE;
      if (b.feeStatus !== newFeeStatus) {
        var updateData = { feeStatus: newFeeStatus };
        if (newFeeStatus === FEE_TYPES.FREE) {
          updateData.chargeGuest = 0;
          updateData.chargeCompany = 0;
        } else {
          /* Auto-calc room fee for paid room */
          updateData.chargeGuest = _calcRoomFee(remaining, th);
        }
        var updated = Bookings.update(b._fbKey, updateData);
        if (updated) b = updated;
      } else if (newFeeStatus === FEE_TYPES.PAID) {
        /* Already paid, but volume changed → recalc chargeGuest */
        var newFee = _calcRoomFee(remaining, th);
        if (newFee !== (Number(b.chargeGuest) || 0)) {
          var updated2 = Bookings.update(b._fbKey, { chargeGuest: newFee });
          if (updated2) b = updated2;
        }
      }
    }

    /* Refresh fee-dependent cells */
    _refreshFeeCells(tr, b, rules, curr);
  }

  /* ===== Refresh fee badge, charge guest input, action button ===== */
  function _refreshFeeCells(tr, b, rules, curr) {
    var isPaid = b.feeStatus === FEE_TYPES.PAID;
    var fbKey = Utils.escapeHtml(b._fbKey || '');

    /* Fee badge */
    var feeCell = tr.querySelector('.cell-fee');
    if (feeCell) {
      feeCell.innerHTML = '<span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span>';
    }

    /* Charge guest cell */
    var cgCell = tr.querySelector('.cell-cg');
    if (cgCell) {
      if (isPaid) {
        if (rules.canEdit) {
          cgCell.innerHTML = '<input type="number" min="0" class="fee-input" value="' + (b.chargeGuest || 0) + '" ';
          cgCell.innerHTML += 'onchange="FeesPage.updateChargeGuest(this,\'' + fbKey + '\')" ';
          cgCell.innerHTML += 'style="width:65px;text-align:right;padding:2px 4px;font-size:var(--fs-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--text-primary);">';
        } else {
          cgCell.textContent = Utils.formatCurrency(b.chargeGuest, curr);
        }
      } else {
        cgCell.innerHTML = '<span style="color:var(--text-muted);">-</span>';
      }
    }

    /* Action button */
    var actionCell = tr.querySelector('.cell-action');
    if (actionCell) {
      if (rules.canEdit) {
        if (isPaid) {
          actionCell.innerHTML = '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + fbKey + '\',\'free\')">改免費</button>';
        } else {
          actionCell.innerHTML = '<button class="btn btn-ghost btn-sm" onclick="FeesPage.toggleFee(\'' + fbKey + '\',\'paid\')">改收費</button>';
        }
      } else {
        actionCell.innerHTML = '<span style="color:var(--text-muted);font-size:var(--fs-xs);">已鎖定</span>';
      }
    }
  }

  /* ===== Update summary row in-place ===== */
  function _updateSummary() {
    var tbody = document.getElementById('fee-table-body');
    if (!tbody) return;
    var summaryRow = document.getElementById('fee-summary-row');
    if (!summaryRow) return;

    /* Recalculate from all visible booking rows */
    var dataRows = tbody.querySelectorAll('tr[data-fbkey]');
    var totals = { nights: 0, discount: 0, remaining: 0, chargeGuest: 0 };

    for (var i = 0; i < dataRows.length; i++) {
      var fbKey = dataRows[i].getAttribute('data-fbkey');
      var b = Bookings.getByKey(fbKey);
      if (!b) continue;
      var n = Number(b.nights) || 0;
      var th = Number(b.threshold) || 0;
      var vol = Number(b.volume) || 0;
      var disc = _calcDiscount(vol, th);
      var rem = n - disc;
      totals.nights += n;
      totals.discount += disc;
      if (rem > 0) totals.remaining += rem;
      if (b.feeStatus === 'paid') {
        totals.chargeGuest += Number(b.chargeGuest) || 0;
      }
    }

    summaryRow.innerHTML = '<td colspan="4">合計</td>';
    summaryRow.innerHTML += '<td class="num-cell">' + totals.nights + '</td>';
    summaryRow.innerHTML += '<td></td>';
    summaryRow.innerHTML += '<td></td>';
    summaryRow.innerHTML += '<td></td>';
    summaryRow.innerHTML += '<td class="num-cell">' + totals.discount + '</td>';
    summaryRow.innerHTML += '<td class="num-cell" style="color:var(--color-danger);">' + totals.remaining + '</td>';
    summaryRow.innerHTML += '<td></td>';
    summaryRow.innerHTML += '<td class="num-cell">' + Utils.formatCurrency(totals.chargeGuest, CURRENCY_DEFAULT) + '</td>';
    summaryRow.innerHTML += '<td></td>';
  }

  /* ===== Update KPI cards in-place ===== */
  function _updateKPIs() {
    var kpiGrid = document.getElementById('fee-kpi-grid');
    if (!kpiGrid) return;
    var month = State.get('workingMonth') || Utils.currentMonth();
    var monthBookings = Filters.filterBookings(Bookings.getAll(), { month: month });
    var feeCounts = Stats.countByFeeStatus(monthBookings);
    var feeStatsData = Stats.feeStats(monthBookings);
    kpiGrid.innerHTML = _buildKPIs(monthBookings, feeCounts, feeStatsData);

    /* Also update filter buttons */
    var filterButtons = document.querySelectorAll('.quick-filter-btn');
    if (filterButtons.length >= 3) {
      filterButtons[0].textContent = '全部 (' + monthBookings.length + ')';
      filterButtons[1].textContent = '免費 (' + feeCounts.free + ')';
      filterButtons[2].textContent = '收費 (' + feeCounts.paid + ')';
    }
  }

  /* ===== Manual toggle fee status (no auto-determine) ===== */
  function toggleFee(fbKey, newFee) {
    var data = { feeStatus: newFee };
    if (newFee === FEE_TYPES.FREE) {
      data.chargeGuest = 0;
      data.chargeCompany = 0;
    }
    var updated = Bookings.update(fbKey, data);
    if (updated) {
      var tr = document.querySelector('tr[data-fbkey="' + fbKey + '"]');
      if (tr) {
        var rules = STATUS_RULES[updated.status] || { canEdit: true };
        var curr = updated.currency || CURRENCY_DEFAULT;
        _refreshFeeCells(tr, updated, rules, curr);
      }
      _updateSummary();
      _updateKPIs();
      Toast.show('已更改為' + (FEE_TYPE_LABELS[newFee] || newFee));
    }
  }

  function setFilter(fee) {
    _filterFee = fee;
    render();
  }

  /* ===== Private helpers ===== */
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
    updateVolume: updateVolume,
    updateChargeGuest: updateChargeGuest,
    toggleFee: toggleFee,
    setFilter: setFilter
  };
})();

function renderFees() { FeesPage.render(); }
