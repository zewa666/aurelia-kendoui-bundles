/* */ 
(function(Buffer) {
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
  Object.defineProperty(exports, "__esModule", {value: true});
  var Subscription_1 = require('../Subscription');
  var tryCatch_1 = require('../util/tryCatch');
  var errorObject_1 = require('../util/errorObject');
  var OuterSubscriber_1 = require('../OuterSubscriber');
  var subscribeToResult_1 = require('../util/subscribeToResult');
  function bufferWhen(closingSelector) {
    return function(source) {
      return source.lift(new BufferWhenOperator(closingSelector));
    };
  }
  exports.bufferWhen = bufferWhen;
  var BufferWhenOperator = (function() {
    function BufferWhenOperator(closingSelector) {
      this.closingSelector = closingSelector;
    }
    BufferWhenOperator.prototype.call = function(subscriber, source) {
      return source.subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
    };
    return BufferWhenOperator;
  }());
  var BufferWhenSubscriber = (function(_super) {
    __extends(BufferWhenSubscriber, _super);
    function BufferWhenSubscriber(destination, closingSelector) {
      var _this = _super.call(this, destination) || this;
      _this.closingSelector = closingSelector;
      _this.subscribing = false;
      _this.openBuffer();
      return _this;
    }
    BufferWhenSubscriber.prototype._next = function(value) {
      this.buffer.push(value);
    };
    BufferWhenSubscriber.prototype._complete = function() {
      var buffer = this.buffer;
      if (buffer) {
        this.destination.next(buffer);
      }
      _super.prototype._complete.call(this);
    };
    BufferWhenSubscriber.prototype._unsubscribe = function() {
      this.buffer = null;
      this.subscribing = false;
    };
    BufferWhenSubscriber.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
      this.openBuffer();
    };
    BufferWhenSubscriber.prototype.notifyComplete = function() {
      if (this.subscribing) {
        this.complete();
      } else {
        this.openBuffer();
      }
    };
    BufferWhenSubscriber.prototype.openBuffer = function() {
      var closingSubscription = this.closingSubscription;
      if (closingSubscription) {
        this.remove(closingSubscription);
        closingSubscription.unsubscribe();
      }
      var buffer = this.buffer;
      if (this.buffer) {
        this.destination.next(buffer);
      }
      this.buffer = [];
      var closingNotifier = tryCatch_1.tryCatch(this.closingSelector)();
      if (closingNotifier === errorObject_1.errorObject) {
        this.error(errorObject_1.errorObject.e);
      } else {
        closingSubscription = new Subscription_1.Subscription();
        this.closingSubscription = closingSubscription;
        this.add(closingSubscription);
        this.subscribing = true;
        closingSubscription.add(subscribeToResult_1.subscribeToResult(this, closingNotifier));
        this.subscribing = false;
      }
    };
    return BufferWhenSubscriber;
  }(OuterSubscriber_1.OuterSubscriber));
})(require('buffer').Buffer);