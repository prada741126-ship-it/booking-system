/**
 * bot-log.js — Bot Activity Log Page
 * Booking System v1.0.0
 * Renders: Telegram Bot interaction history
 */
var BotLogPage = (function () {

  function render() {
    var container = document.getElementById('page-bot-log');
    if (!container) return;

    var logs = State.get('botLogs') || [];

    var html = '';

    // Page header
    html += '<div class="page-header">';
    html += '  <h3>Bot 操作日誌</h3>';
    html += '  <div class="page-actions">';
    if (logs.length > 0) {
      html += '    <button class="btn btn-secondary" onclick="exportBotLogs()">';
      html += '      <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
      html += '      匯出';
      html += '    </button>';
    }
    html += '  </div>';
    html += '</div>';

    // Summary
    html += '<div class="kpi-grid">';
    html += _kpiCard('kpi-violet', '總日誌數', logs.length, '');
    var todayCount = 0;
    var todayStr = Utils.formatDate(new Date());
    for (var i = 0; i < logs.length; i++) {
      if (logs[i]._createdAt && Utils.formatDate(logs[i]._createdAt) === todayStr) todayCount++;
    }
    html += _kpiCard('kpi-cyan', '今日操作', todayCount, '');
    var uniqueAgents = {};
    for (var j = 0; j < logs.length; j++) {
      uniqueAgents[logs[j].agent || 'unknown'] = true;
    }
    html += _kpiCard('kpi-success', '活躍代理', Object.keys(uniqueAgents).length, '');
    html += '</div>';

    // Log list
    html += '<div class="card">';
    html += '  <div class="card-title">';
    html += '    <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg></div>';
    html += '    操作記錄';
    html += '  </div>';

    if (logs.length === 0) {
      html += _emptyState();
    } else {
      // Sort by createdAt desc
      var sorted = logs.slice().sort(function (a, b) {
        return (b._createdAt || 0) - (a._createdAt || 0);
      });

      for (var k = 0; k < sorted.length; k++) {
        html += _logEntry(sorted[k]);
      }
    }

    html += '</div>';

    container.innerHTML = html;
  }

  function _logEntry(log) {
    var time = log._createdAt ? new Date(log._createdAt) : null;
    var timeStr = time ? time.toLocaleString('zh-TW', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }) : '--';

    var initial = (log.agent || '?').charAt(0).toUpperCase();

    var html = '<div class="bot-log-entry">';
    html += '  <div class="log-avatar">' + Utils.escapeHtml(initial) + '</div>';
    html += '  <div class="log-content">';
    html += '    <div class="log-header">';
    html += '      <span class="log-agent">' + Utils.escapeHtml(log.agent || '未知代理') + '</span>';
    html += '      <span class="log-time">' + timeStr + '</span>';
    html += '    </div>';
    html += '    <div class="log-message">' + Utils.escapeHtml(log.message || log.action || '') + '</div>';
    if (log.action) {
      html += '    <div class="log-action">' + Utils.escapeHtml(log.action) + '</div>';
    }
    html += '  </div>';
    html += '</div>';
    return html;
  }

  function _kpiCard(colorClass, label, value, unit) {
    return '<div class="kpi-card ' + colorClass + '">' +
      '<div class="kpi-header"><span class="kpi-label">' + label + '</span></div>' +
      '<div class="kpi-value tabular-nums">' + value + '</div>' +
      (unit ? '<span class="kpi-sub">' + unit + '</span>' : '') +
      '</div>';
  }

  function _emptyState() {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg></div>' +
      '<div class="empty-title">暫無 Bot 操作日誌</div>' +
      '<div class="empty-desc">當員工通過 Telegram Bot 操作訂房時，日誌將顯示在此</div>' +
      '</div>';
  }

  return { render: render };
})();

// Global alias
function renderBotLog() { BotLogPage.render(); }
