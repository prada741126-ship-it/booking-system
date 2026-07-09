/**
 * events.js — Event Bus (Pub/Sub)
 * Pattern: faithfully reused from v13.0.5
 * Features: on/off/emit/once, per-handler try-catch, debug, reset
 */
var Events = (function () {
  var _listeners = {};
  var _debug = false;

  function on(event, handler) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(handler);
    return function unsubscribe() {
      off(event, handler);
    };
  }

  function off(event, handler) {
    if (!_listeners[event]) return;
    var idx = _listeners[event].indexOf(handler);
    if (idx !== -1) {
      _listeners[event].splice(idx, 1);
    }
  }

  function emit(event, data) {
    if (_debug) {
      console.log('[EventBus] emit:', event, data);
    }
    if (!_listeners[event]) return;
    // Clone array to prevent mutation during iteration
    var handlers = _listeners[event].slice();
    for (var i = 0; i < handlers.length; i++) {
      try {
        handlers[i](data);
      } catch (err) {
        console.error('[EventBus] Handler error for "' + event + '":', err);
      }
    }
  }

  function once(event, handler) {
    var unsub = on(event, function (data) {
      unsub();
      handler(data);
    });
    return unsub;
  }

  function debug(flag) {
    if (typeof flag === 'boolean') {
      _debug = flag;
    }
    return _debug;
  }

  function listAll() {
    var result = {};
    for (var key in _listeners) {
      if (_listeners.hasOwnProperty(key)) {
        result[key] = _listeners[key].length;
      }
    }
    return result;
  }

  function reset() {
    _listeners = {};
  }

  return {
    on: on,
    off: off,
    emit: emit,
    once: once,
    debug: debug,
    listAll: listAll,
    reset: reset
  };
})();
