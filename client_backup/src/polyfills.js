// Browser Compatibility Polyfills
// Import this file in index.js for cross-browser support

// Object.assign polyfill for IE
if (typeof Object.assign !== 'function') {
  Object.assign = function(target, varArgs) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.from polyfill for IE
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

// Array.includes polyfill for IE
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// String.includes polyfill for IE
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Promise polyfill for IE (basic implementation)
if (typeof Promise === 'undefined') {
  window.Promise = function(executor) {
    var self = this;
    self.state = 'pending';
    self.value = undefined;
    self.handlers = [];

    function resolve(result) {
      if (self.state === 'pending') {
        self.state = 'fulfilled';
        self.value = result;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function reject(error) {
      if (self.state === 'pending') {
        self.state = 'rejected';
        self.value = error;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function handle(handler) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(self.value);
        }
      }
    }

    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: function(result) {
            try {
              resolve(onFulfilled ? onFulfilled(result) : result);
            } catch (ex) {
              reject(ex);
            }
          },
          onRejected: function(error) {
            try {
              resolve(onRejected ? onRejected(error) : error);
            } catch (ex) {
              reject(ex);
            }
          }
        });
      });
    };

    executor(resolve, reject);
  };
}

// Fetch polyfill detection (use whatwg-fetch if needed)
if (!window.fetch) {
  console.warn('Fetch API not supported. Consider adding whatwg-fetch polyfill.');
}

// IntersectionObserver polyfill detection
if (!window.IntersectionObserver) {
  console.warn('IntersectionObserver not supported. Consider adding polyfill for lazy loading.');
}

// CSS Custom Properties support detection
function supportsCSSCustomProperties() {
  return window.CSS && CSS.supports && CSS.supports('(--foo: red)');
}

if (!supportsCSSCustomProperties()) {
  document.documentElement.classList.add('no-css-custom-properties');
}

// Flexbox support detection
function supportsFlexbox() {
  var elem = document.createElement('div');
  elem.style.display = 'flex';
  return elem.style.display === 'flex';
}

if (!supportsFlexbox()) {
  document.documentElement.classList.add('no-flexbox');
}

// Grid support detection
function supportsGrid() {
  var elem = document.createElement('div');
  elem.style.display = 'grid';
  return elem.style.display === 'grid';
}

if (!supportsGrid()) {
  document.documentElement.classList.add('no-grid');
}

// Touch events support
function supportsTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

if (supportsTouch()) {
  document.documentElement.classList.add('touch-device');
} else {
  document.documentElement.classList.add('no-touch');
}

// Passive event listeners support
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {}

window.supportsPassive = supportsPassive;

// Console polyfill for IE
if (!window.console) {
  window.console = {
    log: function() {},
    warn: function() {},
    error: function() {},
    info: function() {}
  };
}

export default function initPolyfills() {
  console.log('Browser compatibility polyfills loaded');
}
