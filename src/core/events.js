/**
 * events.js — Event Bus (pub/sub)
 * Decouples modules: no direct calls, only events
 * Pattern: faithfully reused from v13.0.5
 */
var Events = (function () {
  var _listeners = {};

  function on(event, callback) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(callback);
    return function () { off(event, callback); };
  }

  function off(event, callback) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(function (fn) {
      return fn !== callback;
    });
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    var list = _listeners[event].slice();
    for (var i = 0; i < list.length; i++) {
      try {
        list[i](data || {});
      } catch (e) {
        console.error('[Events] Error in listener for "' + event + '":', e);
      }
    }
  }

  function once(event, callback) {
    var wrapper = function (data) {
      off(event, wrapper);
      callback(data);
    };
    on(event, wrapper);
  }

  function clear(event) {
    if (event) {
      delete _listeners[event];
    } else {
      _listeners = {};
    }
  }

  return {
    on: on,
    off: off,
    emit: emit,
    once: once,
    clear: clear
  };
})();
