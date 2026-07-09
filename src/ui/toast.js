/**
 * toast.js — Toast Notification System
 * Booking System v1.0.0
 * Pattern: reused from v13.0.5
 * Types: success / error / warning / info
 */
var Toast = (function () {
  var _container = null;
  var _toastCount = 0;
  var MAX_TOASTS = 5;
  var DEFAULT_DURATION = 3000;

  function _ensureContainer() {
    if (_container) return _container;
    _container = document.getElementById('toast-container');
    if (!_container) {
      _container = document.createElement('div');
      _container.id = 'toast-container';
      document.body.appendChild(_container);
    }
    return _container;
  }

  function _getIcon(type) {
    var icons = {
      success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
      error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
      warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
      info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
    };
    return icons[type] || icons.info;
  }

  function show(message, type, duration) {
    type = type || 'info';
    duration = duration || DEFAULT_DURATION;

    var container = _ensureContainer();

    // Limit number of toasts
    while (container.children.length >= MAX_TOASTS) {
      container.removeChild(container.firstChild);
    }

    // Create toast element
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<div class="toast-icon">' +
      '  <svg viewBox="0 0 24 24">' + _getIcon(type) + '</svg>' +
      '</div>' +
      '<div class="toast-message">' + Utils.escapeHtml(message) + '</div>';

    container.appendChild(toast);
    _toastCount++;

    // Auto dismiss
    var timer = setTimeout(function () {
      _dismiss(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', function () {
      clearTimeout(timer);
      _dismiss(toast);
    });

    return toast;
  }

  function _dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-out');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  function success(message, duration) {
    return show(message, 'success', duration);
  }

  function error(message, duration) {
    return show(message, 'error', duration || 5000);
  }

  function warning(message, duration) {
    return show(message, 'warning', duration);
  }

  function info(message, duration) {
    return show(message, 'info', duration);
  }

  function clear() {
    var container = _ensureContainer();
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  return {
    show: show,
    success: success,
    error: error,
    warning: warning,
    info: info,
    clear: clear
  };
})();

// Global alias for convenience
function showToast(message, type, duration) {
  Toast.show(message, type, duration);
}
