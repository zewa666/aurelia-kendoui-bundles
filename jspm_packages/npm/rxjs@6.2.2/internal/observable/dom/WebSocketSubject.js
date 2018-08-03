/* */ 
"use strict";
var __extends = (this && this.__extends) || (function() {
  var extendStatics = Object.setPrototypeOf || ({__proto__: []} instanceof Array && function(d, b) {
    d.__proto__ = b;
  }) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
  };
  return function(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
  for (var s,
      i = 1,
      n = arguments.length; i < n; i++) {
    s = arguments[i];
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
  }
  return t;
};
Object.defineProperty(exports, "__esModule", {value: true});
var Subject_1 = require('../../Subject');
var Subscriber_1 = require('../../Subscriber');
var Observable_1 = require('../../Observable');
var Subscription_1 = require('../../Subscription');
var ReplaySubject_1 = require('../../ReplaySubject');
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var DEFAULT_WEBSOCKET_CONFIG = {
  url: '',
  deserializer: function(e) {
    return JSON.parse(e.data);
  },
  serializer: function(value) {
    return JSON.stringify(value);
  }
};
var WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT = 'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';
var WebSocketSubject = (function(_super) {
  __extends(WebSocketSubject, _super);
  function WebSocketSubject(urlConfigOrSource, destination) {
    var _this = _super.call(this) || this;
    if (urlConfigOrSource instanceof Observable_1.Observable) {
      _this.destination = destination;
      _this.source = urlConfigOrSource;
    } else {
      var config = _this._config = __assign({}, DEFAULT_WEBSOCKET_CONFIG);
      _this._output = new Subject_1.Subject();
      if (typeof urlConfigOrSource === 'string') {
        config.url = urlConfigOrSource;
      } else {
        for (var key in urlConfigOrSource) {
          if (urlConfigOrSource.hasOwnProperty(key)) {
            config[key] = urlConfigOrSource[key];
          }
        }
      }
      if (!config.WebSocketCtor && WebSocket) {
        config.WebSocketCtor = WebSocket;
      } else if (!config.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }
      _this.destination = new ReplaySubject_1.ReplaySubject();
    }
    return _this;
  }
  WebSocketSubject.prototype.lift = function(operator) {
    var sock = new WebSocketSubject(this._config, this.destination);
    sock.operator = operator;
    sock.source = this;
    return sock;
  };
  WebSocketSubject.prototype._resetState = function() {
    this._socket = null;
    if (!this.source) {
      this.destination = new ReplaySubject_1.ReplaySubject();
    }
    this._output = new Subject_1.Subject();
  };
  WebSocketSubject.prototype.multiplex = function(subMsg, unsubMsg, messageFilter) {
    var self = this;
    return new Observable_1.Observable(function(observer) {
      var result = tryCatch_1.tryCatch(subMsg)();
      if (result === errorObject_1.errorObject) {
        observer.error(errorObject_1.errorObject.e);
      } else {
        self.next(result);
      }
      var subscription = self.subscribe(function(x) {
        var result = tryCatch_1.tryCatch(messageFilter)(x);
        if (result === errorObject_1.errorObject) {
          observer.error(errorObject_1.errorObject.e);
        } else if (result) {
          observer.next(x);
        }
      }, function(err) {
        return observer.error(err);
      }, function() {
        return observer.complete();
      });
      return function() {
        var result = tryCatch_1.tryCatch(unsubMsg)();
        if (result === errorObject_1.errorObject) {
          observer.error(errorObject_1.errorObject.e);
        } else {
          self.next(result);
        }
        subscription.unsubscribe();
      };
    });
  };
  WebSocketSubject.prototype._connectSocket = function() {
    var _this = this;
    var _a = this._config,
        WebSocketCtor = _a.WebSocketCtor,
        protocol = _a.protocol,
        url = _a.url,
        binaryType = _a.binaryType;
    var observer = this._output;
    var socket = null;
    try {
      socket = protocol ? new WebSocketCtor(url, protocol) : new WebSocketCtor(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (e) {
      observer.error(e);
      return;
    }
    var subscription = new Subscription_1.Subscription(function() {
      _this._socket = null;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    });
    socket.onopen = function(e) {
      var openObserver = _this._config.openObserver;
      if (openObserver) {
        openObserver.next(e);
      }
      var queue = _this.destination;
      _this.destination = Subscriber_1.Subscriber.create(function(x) {
        if (socket.readyState === 1) {
          var serializer = _this._config.serializer;
          var msg = tryCatch_1.tryCatch(serializer)(x);
          if (msg === errorObject_1.errorObject) {
            _this.destination.error(errorObject_1.errorObject.e);
            return;
          }
          socket.send(msg);
        }
      }, function(e) {
        var closingObserver = _this._config.closingObserver;
        if (closingObserver) {
          closingObserver.next(undefined);
        }
        if (e && e.code) {
          socket.close(e.code, e.reason);
        } else {
          observer.error(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
        }
        _this._resetState();
      }, function() {
        var closingObserver = _this._config.closingObserver;
        if (closingObserver) {
          closingObserver.next(undefined);
        }
        socket.close();
        _this._resetState();
      });
      if (queue && queue instanceof ReplaySubject_1.ReplaySubject) {
        subscription.add(queue.subscribe(_this.destination));
      }
    };
    socket.onerror = function(e) {
      _this._resetState();
      observer.error(e);
    };
    socket.onclose = function(e) {
      _this._resetState();
      var closeObserver = _this._config.closeObserver;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        observer.complete();
      } else {
        observer.error(e);
      }
    };
    socket.onmessage = function(e) {
      var deserializer = _this._config.deserializer;
      var result = tryCatch_1.tryCatch(deserializer)(e);
      if (result === errorObject_1.errorObject) {
        observer.error(errorObject_1.errorObject.e);
      } else {
        observer.next(result);
      }
    };
  };
  WebSocketSubject.prototype._subscribe = function(subscriber) {
    var _this = this;
    var source = this.source;
    if (source) {
      return source.subscribe(subscriber);
    }
    if (!this._socket) {
      this._connectSocket();
    }
    var subscription = new Subscription_1.Subscription();
    subscription.add(this._output.subscribe(subscriber));
    subscription.add(function() {
      var _socket = _this._socket;
      if (_this._output.observers.length === 0) {
        if (_socket && _socket.readyState === 1) {
          _socket.close();
        }
        _this._resetState();
      }
    });
    return subscription;
  };
  WebSocketSubject.prototype.unsubscribe = function() {
    var _a = this,
        source = _a.source,
        _socket = _a._socket;
    if (_socket && _socket.readyState === 1) {
      _socket.close();
      this._resetState();
    }
    _super.prototype.unsubscribe.call(this);
    if (!source) {
      this.destination = new ReplaySubject_1.ReplaySubject();
    }
  };
  return WebSocketSubject;
}(Subject_1.AnonymousSubject));
exports.WebSocketSubject = WebSocketSubject;
