/**
 * router.js — Page routing
 * v8: 7 pages (总览/利润结算/费用收取/代理业绩/历史核账/员工管理/酒店设定)
 * v2.1.7: Skeleton screen on page switch to eliminate flash
 */
var Router = (function () {

  /* Timer for deferred render (prevents rapid-click duplicate renders) */
  var _navTimer = null;

  /* Build skeleton placeholder HTML for a page */
  function _buildSkeleton(pageId) {
    var html = '<div class="skeleton-page">';

    /* Title placeholder */
    html += '<div class="skeleton-header"><div class="skeleton"></div></div>';

    /* Pages with KPI cards: overview, profit, fees, agent-performance */
    var hasKpi = (pageId === 'overview' || pageId === 'profit' ||
                   pageId === 'fees' || pageId === 'agent-performance');
    if (hasKpi) {
      html += '<div class="skeleton-kpi-grid">';
      for (var i = 0; i < 4; i++) {
        html += '<div class="skeleton-kpi-card">';
        html += '  <div class="skeleton skeleton-bar label"></div>';
        html += '  <div class="skeleton skeleton-bar value"></div>';
        html += '</div>';
      }
      html += '</div>';
    }

    /* Pages with table: overview, profit, fees, agent-performance, archives */
    var hasTable = (pageId !== 'employees' && pageId !== 'hotel-config');
    if (hasTable) {
      html += '<div class="skeleton-table">';
      html += '  <div class="skeleton-table-head">';
      for (var j = 0; j < 5; j++) {
        html += '  <div class="skeleton skeleton-bar"></div>';
      }
      html += '  </div>';
      for (var r = 0; r < 6; r++) {
        html += '  <div class="skeleton-table-row">';
        for (var c = 0; c < 5; c++) {
          html += '  <div class="skeleton skeleton-bar"></div>';
        }
        html += '  </div>';
      }
      html += '</div>';
    }

    /* Pages with card list: employees, hotel-config */
    if (pageId === 'employees' || pageId === 'hotel-config') {
      html += '<div class="skeleton-card-list">';
      for (var e = 0; e < 5; e++) {
        html += '<div class="skeleton-card-item">';
        html += '  <div class="skeleton skeleton-bar"></div>';
        html += '  <div class="skeleton skeleton-bar"></div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function navigateTo(pageId) {
    if (!pageId) return;
    /* Cancel any pending deferred render (rapid page switching) */
    if (_navTimer) {
      clearTimeout(_navTimer);
      _navTimer = null;
    }
    /* Hide all pages */
    var pages = document.querySelectorAll('.page-content');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    /* Show target page with skeleton placeholder */
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
      /* Inject skeleton immediately to prevent flash of old content */
      target.innerHTML = _buildSkeleton(pageId);
    }
    /* Update nav items */
    var navItems = document.querySelectorAll('.nav-item[data-page]');
    for (var n = 0; n < navItems.length; n++) {
      navItems[n].classList.remove('active');
      if (navItems[n].getAttribute('data-page') === pageId) {
        navItems[n].classList.add('active');
      }
    }
    /* Update bottom nav */
    var bottomItems = document.querySelectorAll('.bottom-nav-item[data-page]');
    for (var b = 0; b < bottomItems.length; b++) {
      bottomItems[b].classList.remove('active');
      if (bottomItems[b].getAttribute('data-page') === pageId) {
        bottomItems[b].classList.add('active');
      }
    }
    /* Update topbar title */
    var pageDef = PAGE_LIST.find(function (p) { return p.id === pageId; });
    if (pageDef) {
      var titleEl = document.getElementById('topbar-page-title');
      if (titleEl) titleEl.textContent = pageDef.label;
    }
    /* Update state */
    State.set('currentPage', pageId);
    /* Defer render by one event loop tick so skeleton is painted first */
    /* This eliminates the flash of old/stale content during page switch */
    _navTimer = setTimeout(function () {
      _navTimer = null;
      Events.emit(EVENTS.PAGE_CHANGED, { page: pageId });
    }, 0);
    /* Close mobile sidebar */
    closeSidebar();
  }

  function getCurrentPage() {
    return State.get('currentPage') || 'overview';
  }

  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('sidebar-backdrop');
    if (sb) sb.classList.remove('open');
    if (bd) bd.classList.remove('show');
  }

  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('sidebar-backdrop');
    if (sb) sb.classList.toggle('open');
    if (bd) bd.classList.toggle('show');
  }

  /* Month navigation */
  function prevMonth() {
    var m = State.get('workingMonth');
    if (!m) m = Utils.currentMonth();
    var parts = m.split('-');
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1;
    if (month < 1) { month = 12; year--; }
    var newMonth = year + '-' + String(month).padStart(2, '0');
    State.set('workingMonth', newMonth);
    Store.saveWorkingMonth(newMonth);
    Events.emit(EVENTS.MONTH_CHANGED, { month: newMonth });
    updateMonthDisplay(newMonth);
  }

  function nextMonth() {
    var m = State.get('workingMonth');
    if (!m) m = Utils.currentMonth();
    var parts = m.split('-');
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) + 1;
    if (month > 12) { month = 1; year++; }
    var newMonth = year + '-' + String(month).padStart(2, '0');
    State.set('workingMonth', newMonth);
    Store.saveWorkingMonth(newMonth);
    Events.emit(EVENTS.MONTH_CHANGED, { month: newMonth });
    updateMonthDisplay(newMonth);
  }

  function updateMonthDisplay(month) {
    if (!month) month = State.get('workingMonth') || Utils.currentMonth();
    var parts = month.split('-');
    var display = parts[0] + ' / ' + parts[1];
    var el = document.getElementById('month-display');
    if (el) el.textContent = display;
  }

  return {
    navigateTo: navigateTo,
    getCurrentPage: getCurrentPage,
    closeSidebar: closeSidebar,
    toggleSidebar: toggleSidebar,
    prevMonth: prevMonth,
    nextMonth: nextMonth,
    updateMonthDisplay: updateMonthDisplay
  };
})();
