/**
 * router.js — Page routing
 * v8: 7 pages (总览/利润结算/费用收取/代理业绩/历史核账/员工管理/酒店设定)
 */
var Router = (function () {

  function navigateTo(pageId) {
    if (!pageId) return;
    /* Hide all pages */
    var pages = document.querySelectorAll('.page-content');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    /* Show target page */
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
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
    /* Emit event for pages to render */
    Events.emit(EVENTS.PAGE_CHANGED, { page: pageId });
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
