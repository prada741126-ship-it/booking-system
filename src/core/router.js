/**
 * router.js — Page Router
 * Pattern: reused from v13.0.5
 * Features: page switching, active state, shortcut support
 */
var Router = (function () {
  var _currentPage = null;

  function switchTo(pageId) {
    if (!pageId) return;
    _currentPage = pageId;
    State.set('currentPage', pageId);

    // Hide all pages, show target
    var pages = document.querySelectorAll('.page-content');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
    }

    // Update sidebar active state
    var navItems = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navItems.length; j++) {
      navItems[j].classList.remove('active');
      if (navItems[j].getAttribute('data-page') === pageId) {
        navItems[j].classList.add('active');
      }
    }

    // Update mobile bottom nav
    var bottomItems = document.querySelectorAll('.bottom-nav-item');
    for (var k = 0; k < bottomItems.length; k++) {
      bottomItems[k].classList.remove('active');
      if (bottomItems[k].getAttribute('data-page') === pageId) {
        bottomItems[k].classList.add('active');
      }
    }

    // Trigger page-specific render
    Events.emit(EVENTS.PAGE_CHANGED, pageId);
  }

  function getCurrent() {
    return _currentPage;
  }

  function next() {
    var pages = PAGE_LIST.map(function (p) { return p.id; });
    var idx = pages.indexOf(_currentPage);
    if (idx < pages.length - 1) {
      switchTo(pages[idx + 1]);
    }
  }

  function prev() {
    var pages = PAGE_LIST.map(function (p) { return p.id; });
    var idx = pages.indexOf(_currentPage);
    if (idx > 0) {
      switchTo(pages[idx - 1]);
    }
  }

  return {
    switchTo: switchTo,
    getCurrent: getCurrent,
    next: next,
    prev: prev
  };
})();
