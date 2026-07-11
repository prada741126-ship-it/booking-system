/**
 * overview.js — Overview / Dashboard Page
 * Booking System v2.0.0 (v8 spec)
 * Renders: KPI cards (bookings/nights/threshold/profit) + status distribution + recent bookings + fee breakdown
 */
var OverviewPage = (function () {

  function render() {
    var container = document.getElementById('page-overview');
    if (!container) return;

    var month = State.get('workingMonth') || Utils.currentMonth();
    var allBookings = Bookings.getAll();

    /* KPI stats: still filtered by check-in month */
    var monthBookings = Filters.filterBookings(allBookings, { month: month });
    var summ = Stats.summary(monthBookings);
    var monthlyKPIs = Stats.calcMonthlyNights(monthBookings, month);
    var total = summ.totalBookings; /* used for status distribution percentages */

    /* Recent bookings: filtered by check-in month (original logic), but show creation date */
    var recent = Filters.sortBookings(monthBookings, '_createdAt', false).slice(0, 8);

    var html = '';

    /* Page header */
    var sealLabel = _buildSealLabel(month);
    html += '<div class="page-header">';
    html += '  <h3>總覽 — ' + month + sealLabel + '</h3>';
    html += '  <div class="page-actions">';
    html += '    <button class="btn btn-secondary" onclick="window.print()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
    html += '      列印';
    html += '    </button>';
    html += '    <button class="btn btn-primary" onclick="openBookingModal()">';
    html += '      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    html += '      新增訂房';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    /* KPI Cards — 2 large cards, fixed 50% each */
    html += '<div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr);">';

    html += _kpiCard('kpi-blue', '本月房晚數', monthlyKPIs.nights, '晚', '本月入住總房晚數（1間房=1晚）',
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>', true);

    html += _kpiCard('kpi-gold', '總洗碼門檻', Utils.formatNumber(Math.round(monthlyKPIs.thresholdNights / 10000)), '萬', '本月入住門檻×晚數總和',
      '<svg viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>', true);

    html += '</div>';

    /* Second row: status distribution + recent bookings */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-4);">';

    /* Status distribution */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>';
    html += '    狀態分佈';
    html += '  </div>';
    var sc = summ.byStatus;
    html += _statusRow('待確認', sc.pending || 0, total, UI_COLORS.statusPending);
    html += _statusRow('已確認', sc.confirmed || 0, total, UI_COLORS.statusConfirmed);
    html += _statusRow('已入住', sc['checked-in'] || 0, total, UI_COLORS.statusCheckedIn);
    html += _statusRow('已退房', sc['checked-out'] || 0, total, UI_COLORS.statusCheckedOut);
    html += _statusRow('已取消', sc.cancelled || 0, total, UI_COLORS.statusCancelled);
    html += '</div>';

    /* Fee breakdown */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>';
    html += '    費用分佈';
    html += '  </div>';
    var fs = summ.feeStats;
    html += _feeDonut(fs.free.count, fs.paid.count);
    if (fs.paid.count > 0) {
      html += '<div style="border-top:1px solid var(--border-default);margin-top:var(--sp-3);padding-top:var(--sp-3);">';
      html += _statRow('向客人收', Utils.formatCurrency(fs.paid.chargeGuest, CURRENCY_DEFAULT), '');
      html += _statRow('交公司', Utils.formatCurrency(fs.paid.chargeCompany, CURRENCY_DEFAULT), '');
      var profitColor = fs.paid.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
      html += '<div class="stat-row"><span class="stat-label">利潤</span><span class="stat-value" style="color:' + profitColor + ';">' + Utils.formatCurrency(fs.paid.profit, CURRENCY_DEFAULT) + '</span></div>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';

    /* Recent bookings */
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>';
    html += '    最近訂房';
    html += '  </div>';

    if (recent.length === 0) {
      html += _emptyStateMini('暫無訂房記錄，點擊「新增訂房」開始');
    } else {
      html += '<div class="data-table-wrap"><div class="data-table-scroll scroll-hint' + (recent.length > 0 ? ' scrollable' : '') + '">';
      html += '<table class="data-table"><thead><tr>';
      html += '<th>客人</th><th>體系</th><th>入住</th><th>退房</th><th>晚</th><th>代理</th><th>費用</th><th>狀態</th><th>創建日期</th><th>登錄人</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < recent.length; i++) {
        html += _recentRow(recent[i]);
      }
      html += '</tbody></table></div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  /* ===== Build seal/unseal label for the page header ===== */
  /* Current month: no label */
  /* Past month not sealed: gray "封存" clickable label */
  /* Sealed month: green "已封存" + "解封" link */
  function _buildSealLabel(month) {
    var currentMonth = Utils.currentMonth();
    if (month === currentMonth) return '';

    if (State.isMonthClosed(month)) {
      /* Sealed: green badge + unseal link */
      return ' <span style="display:inline-block;padding:2px 8px;border-radius:var(--radius-full);' +
        'background:rgba(22,163,74,0.1);color:#16a34a;font-size:var(--fs-xs);font-weight:600;' +
        'margin-left:var(--sp-2);vertical-align:middle;">已封存</span>' +
        ' <a href="javascript:void(0)" onclick="unsealMonthAction(\'' + month + '\')" ' +
        'style="font-size:var(--fs-xs);color:var(--text-muted);margin-left:4px;text-decoration:underline;">解封</a>';
    }

    /* Past month not sealed: gray "封存" clickable label */
    return ' <a href="javascript:void(0)" onclick="sealMonthAction(\'' + month + '\')" ' +
      'style="display:inline-block;padding:2px 8px;border-radius:var(--radius-full);' +
      'background:var(--bg-base);color:var(--text-muted);font-size:var(--fs-xs);font-weight:500;' +
      'margin-left:var(--sp-2);vertical-align:middle;text-decoration:none;">封存</a>';
  }

  function _kpiCard(colorClass, label, value, unit, sub, iconSvg, large) {
    var cls = 'kpi-card ' + colorClass + (large ? ' kpi-large' : '');
    var html = '<div class="' + cls + '">';
    if (large) {
      html += '  <div class="kpi-icon">' + iconSvg + '</div>';
      html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
      html += '  <div class="kpi-label">' + Utils.escapeHtml(label) + '</div>';
      if (sub) {
        html += '  <div class="kpi-sub">' + Utils.escapeHtml(sub) + '</div>';
      }
    } else {
      html += '  <div class="kpi-header">';
      html += '    <span class="kpi-label">' + Utils.escapeHtml(label) + '</span>';
      html += '    <div class="kpi-icon">' + iconSvg + '</div>';
      html += '  </div>';
      html += '  <div class="kpi-value tabular-nums">' + value + '</div>';
      if (unit || sub) {
        html += '  <span class="kpi-sub">';
        if (unit) html += Utils.escapeHtml(unit);
        if (unit && sub) html += ' — ';
        if (sub) html += Utils.escapeHtml(sub);
        html += '</span>';
      }
    }
    html += '</div>';
    return html;
  }

  function _statusRow(label, count, total, color) {
    var pct = total > 0 ? (count / total * 100) : 0;
    var html = '<div class="stat-row" style="flex-direction:column;align-items:stretch;gap:4px;">';
    html += '  <div style="display:flex;justify-content:space-between;align-items:center;">';
    html += '    <span class="stat-label" style="display:flex;align-items:center;gap:6px;">';
    html += '      <span style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></span>';
    html += '      ' + Utils.escapeHtml(label);
    html += '    </span>';
    html += '    <span class="stat-value">' + count + ' <span style="color:var(--text-muted);font-weight:400;font-size:var(--fs-xs);">(' + pct.toFixed(0) + '%)</span></span>';
    html += '  </div>';
    html += '  <div style="height:6px;background:var(--bg-base);border-radius:var(--radius-full);overflow:hidden;">';
    html += '    <div style="height:100%;width:' + pct.toFixed(1) + '%;background:' + color + ';border-radius:var(--radius-full);transition:width 0.6s var(--tr-smooth);"></div>';
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function _statRow(label, value, badgeClass) {
    var valHtml = badgeClass ? '<span class="' + badgeClass + '">' + value + '</span>' : value;
    return '<div class="stat-row"><span class="stat-label">' + Utils.escapeHtml(label) + '</span><span class="stat-value">' + valHtml + '</span></div>';
  }

  /* Donut chart for fee distribution (CSS conic-gradient) */
  function _feeDonut(freeCount, paidCount) {
    var total = freeCount + paidCount;
    if (total === 0) {
      return '<div style="text-align:center;padding:var(--sp-6);color:var(--text-muted);font-size:var(--fs-sm);">暫無數據</div>';
    }
    var freePct = total > 0 ? (freeCount / total * 100) : 0;
    var paidPct = total > 0 ? (paidCount / total * 100) : 0;
    var freeColor = '#16a34a';
    var paidColor = '#f59e0b';

    var html = '<div style="display:flex;align-items:center;gap:var(--sp-4);">';
    /* Donut chart using conic-gradient */
    html += '<div style="width:110px;height:110px;border-radius:50%;';
    html += 'background:conic-gradient(' + freeColor + ' 0% ' + freePct.toFixed(1) + '%, ' + paidColor + ' ' + freePct.toFixed(1) + '% 100%);';
    html += 'display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    html += 'box-shadow:0 2px 8px rgba(0,0,0,0.08);">';
    html += '<div style="width:72px;height:72px;border-radius:50%;background:var(--bg-elevated);display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<span style="font-size:var(--fs-xl);font-weight:var(--fw-extrabold);color:var(--text-primary);">' + total + '</span>';
    html += '<span style="font-size:var(--fs-xs);color:var(--text-muted);">總房數</span>';
    html += '</div></div>';
    /* Legend */
    html += '<div style="flex:1;">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:var(--sp-2);">';
    html += '<span style="width:10px;height:10px;border-radius:2px;background:' + freeColor + ';flex-shrink:0;"></span>';
    html += '<span style="font-size:var(--fs-sm);color:var(--text-secondary);">免費房 ' + freeCount + ' (' + freePct.toFixed(0) + '%)</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="width:10px;height:10px;border-radius:2px;background:' + paidColor + ';flex-shrink:0;"></span>';
    html += '<span style="font-size:var(--fs-sm);color:var(--text-secondary);">收費房 ' + paidCount + ' (' + paidPct.toFixed(0) + '%)</span>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  function _recentRow(b) {
    var html = '<tr style="cursor:pointer;" onclick="viewBookingDetail(\'' + b._fbKey + '\')">';
    html += '<td style="font-weight:600;">' + Utils.escapeHtml(b.guestName || '-') + '</td>';
    html += '<td>' + Utils.escapeHtml(b.casino || '-') + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkIn) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.formatDateDisplay(b.checkOut) + '</td>';
    html += '<td class="num-cell">' + (b.nights || 0) + '</td>';
    html += '<td>' + Utils.escapeHtml(b.agent || '-') + '</td>';
    html += '<td><span class="fee-badge ' + (b.feeStatus || 'free') + '">' + (FEE_TYPE_LABELS[b.feeStatus] || '免費') + '</span></td>';
    html += '<td>' + _statusBadge(b.status) + '</td>';
    html += '<td style="font-size:var(--fs-sm);white-space:nowrap;">' + _fmtTimestamp(b._createdAt) + '</td>';
    html += '<td style="font-size:var(--fs-sm);">' + Utils.escapeHtml(b.createdBy || b.employee || '-') + '</td>';
    html += '</tr>';
    return html;
  }

  /* Format timestamp (Date.now) to MM/DD */
  function _fmtTimestamp(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    return (mm < 10 ? '0' : '') + mm + '/' + (dd < 10 ? '0' : '') + dd;
  }

  function _statusBadge(status) {
    return '<span class="status-badge status-' + status + '">' + Utils.escapeHtml(BOOKING_STATUS_LABELS[status] || status) + '</span>';
  }

  function _emptyStateMini(text) {
    return '<div style="padding:var(--sp-6);text-align:center;color:var(--text-muted);font-size:var(--fs-sm);">' +
           Utils.escapeHtml(text) + '</div>';
  }

  return { render: render };
})();

function renderOverview() { OverviewPage.render(); }
