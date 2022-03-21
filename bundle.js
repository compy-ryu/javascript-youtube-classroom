/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js ***!
  \*********************************************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./src/js/api.js":
/*!***********************!*\
  !*** ./src/js/api.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestYoutubeList": () => (/* binding */ requestYoutubeList),
/* harmony export */   "requestYoutubeSearch": () => (/* binding */ requestYoutubeSearch)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Constants_Setting__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Constants/Setting */ "./src/js/constants/Setting.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");





var request = /*#__PURE__*/function () {
  var _ref = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee(url, option) {
    var response, data;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(url, option);

          case 2:
            response = _context.sent;

            if (response.ok) {
              _context.next = 5;
              break;
            }

            throw new Error('서버 오류가 발생되었습니다.');

          case 5:
            _context.next = 7;
            return response.json();

          case 7:
            data = _context.sent;
            return _context.abrupt("return", data);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function request(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var requestYoutubeSearch = /*#__PURE__*/function () {
  var _ref2 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee2() {
    var keyword,
        nextPageToken,
        url,
        response,
        _args2 = arguments;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            keyword = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : '';
            nextPageToken = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : '';
            _context2.prev = 2;
            url = (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_3__.getUrlSearchParams)('https://www.googleapis.com/youtube/v3/search', {
              part: 'snippet',
              type: 'video',
              q: keyword,
              maxResults: _Constants_Setting__WEBPACK_IMPORTED_MODULE_2__.CLASS_ROOM_SETTING.MAX_VIDEO_NUMBER,
              key: "AIzaSyDnOTzd_488TzF006vvLklP3u1oCDB6pxE",
              pageToken: nextPageToken
            });
            _context2.next = 6;
            return request(url, {
              method: 'GET'
            });

          case 6:
            response = _context2.sent;
            return _context2.abrupt("return", response);

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", {
              error: true
            });

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 10]]);
  }));

  return function requestYoutubeSearch() {
    return _ref2.apply(this, arguments);
  };
}();
var requestYoutubeList = /*#__PURE__*/function () {
  var _ref3 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee3() {
    var list,
        url,
        response,
        _args3 = arguments;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            list = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : [];
            _context3.prev = 1;
            url = (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_3__.getUrlSearchParams)('https://www.googleapis.com/youtube/v3/videos', {
              part: 'snippet',
              id: list.join(','),
              key: "AIzaSyDnOTzd_488TzF006vvLklP3u1oCDB6pxE"
            });
            _context3.next = 5;
            return request(url, {
              method: 'GET'
            });

          case 5:
            response = _context3.sent;
            return _context3.abrupt("return", response);

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](1);
            return _context3.abrupt("return", {
              error: true
            });

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 9]]);
  }));

  return function requestYoutubeList() {
    return _ref3.apply(this, arguments);
  };
}();

/***/ }),

/***/ "./src/js/constants/Selector.js":
/*!**************************************!*\
  !*** ./src/js/constants/Selector.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DOM_NAME": () => (/* binding */ DOM_NAME),
/* harmony export */   "SELECTOR": () => (/* binding */ SELECTOR)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");

var SELECTOR = {
  ID: {
    APP: '#app',
    MODAL_CONTAINER: '#modal',
    SNACKBAR: '#snackbar',
    CLASSROOM_NAVIGATION: '#classroom-navigation',
    NAVIGATION_FILTER_BUTTON: '#classroom-watched-filter-button',
    SEARCH_MODAL_BUTTON: '#search-modal-button',
    SKELETON_LIST: '#skeleton-list',
    VIDEO_LIST: '#video-list',
    VIDEO_RESULT: '#search-video-result',
    SEARCH_FORM: '#search-form',
    SEARCH_INPUT_KEYWORD: '#search-input-keyword',
    SEARCH_BUTTON: '#search-button',
    SEARCH_RESULT_CONTAINER: '#search-result',
    SEARCH_RESULT_SCROLL_OBSERVER: '#search-result-scroll-observer',
    SAVE_LIST_CONTENT: '#save-video-result'
  },
  CLASS: {
    MODAL_DIMMER: '.dimmer',
    SNACKBAR_CONTAINER: '.snackbar-container',
    VIDEO_LIST_SKELETON: '.skeleton',
    VIDEO_ITEM: '.item',
    VIDEO_ITEM_SAVE_BUTTON: '.save-button',
    EMPTY_CONTENT: '.empty-content',
    SAVE_LIST_WATCHED_BUTTON: '.save-item-watched-button',
    SAVE_LIST_REMOVE_BUTTON: '.save-item-remove-button'
  }
};

var removeSelectorSymbol = function removeSelectorSymbol(origin) {
  var output = Object.entries(origin).reduce(function (previous, _ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    previous[key] = value.substring(1);
    return previous;
  }, {});
  return output;
};

var DOM_NAME = {
  ID: removeSelectorSymbol(SELECTOR.ID),
  CLASS: removeSelectorSymbol(SELECTOR.CLASS)
};

/***/ }),

/***/ "./src/js/constants/Setting.js":
/*!*************************************!*\
  !*** ./src/js/constants/Setting.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CLASS_ROOM_SETTING": () => (/* binding */ CLASS_ROOM_SETTING)
/* harmony export */ });
var CLASS_ROOM_SETTING = {
  MAX_VIDEO_NUMBER: 12,
  MAX_SAVE_NUMBER: 100,
  VIDEO_DATA_CACHE_EXPIRE_TIME: 60 * 60 * 24
};

/***/ }),

/***/ "./src/js/constants/String.js":
/*!************************************!*\
  !*** ./src/js/constants/String.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ACTION_TYPE": () => (/* binding */ ACTION_TYPE),
/* harmony export */   "ALERT_MESSAGE": () => (/* binding */ ALERT_MESSAGE),
/* harmony export */   "ERROR_MESSAGE": () => (/* binding */ ERROR_MESSAGE)
/* harmony export */ });
var ERROR_MESSAGE = {
  EMPTY_SEARCH_KEYWORD: '검색어를 입력해주세요.',
  MAX_SAVE_VIDEO: '동영상은 최대 100개까지 저장할 수 있습니다.'
};
var ALERT_MESSAGE = {
  SAVE_LIST_CONFIRM_REMOVE: '정말 해당 동영상을 제거하시겠습니까?',
  SAVE_LIST_REMOVE: '볼 동영상 목록에서 제거되었습니다.',
  SAVE_LIST_ADD: '볼 동영상 목록에 저장되었습니다',
  SAVE_LIST_STATE_UPDATE: '동영상의 상태를 변경하였습니다.'
};
var ACTION_TYPE = {
  UPDATE_SEARCH_KEYWORD: Symbol('사용자가 검색어를 입력하였을 시 발동하는 액션'),
  UPDATE_SEARCH_RESULT: Symbol('검색 시도 후 검색 결과 업데이트가 필요할 때 발동하는 액션'),
  UPDATE_SEARCH_LOADING_STATUS: Symbol('API 서버와 통신 중 로딩 상태로 변경하는 액션'),
  UPDATE_SAVE_LIST: Symbol('저장된 동영상 목록을 갱신하는 액션'),
  UPDATE_SAVE_LIST_FILTER: Symbol('저장된 동영상 목록의 출력 타입을 지정하는 액션')
};

/***/ }),

/***/ "./src/js/display/Share/Modal.js":
/*!***************************************!*\
  !*** ./src/js/display/Share/Modal.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Modal)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");







var Modal = /*#__PURE__*/(0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_0__["default"])(function Modal() {
  var _this = this;

  (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, Modal);

  (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$activeModal", void 0);

  (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$modal", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.ID.MODAL_CONTAINER));

  (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$modalDimmer", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.CLASS.MODAL_DIMMER));

  (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleOpenModal", function (_ref) {
    var $target = _ref.target;
    var modalSelector = $target.dataset.openModal;

    _this.$modal.classList.remove('hide');

    !!_this.$activeModal && _this.$activeModal.classList.remove('show');
    _this.$activeModal = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)("".concat(modalSelector));

    _this.$activeModal.classList.add('show');

    document.body.classList.add('scroll-lock');
  });

  (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleCloseModal", function () {
    _this.$modal.classList.add('disappear');

    document.body.classList.remove('scroll-lock');
    (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_5__.addEventOnce)('animationend', _this.$modalDimmer, function () {
      _this.$modal.classList.add('hide');

      _this.$modal.classList.remove('disappear');

      _this.$activeModal.classList.remove('show');

      _this.$activeModal = null;
    });
  });

  this.$container = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.ID.APP);
  (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_5__.addEventDelegate)(this.$modal, _Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.CLASS.MODAL_DIMMER, {
    eventType: 'click',
    handler: this.handleCloseModal
  });
  (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_5__.addEventDelegate)(this.$container, '[data-open-modal]', {
    eventType: 'click',
    handler: this.handleOpenModal
  });
});



/***/ }),

/***/ "./src/js/display/Share/Snackbar.js":
/*!******************************************!*\
  !*** ./src/js/display/Share/Snackbar.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");







var Snackbar = function Snackbar(message) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2500;
  if (!!(0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_2__.SELECTOR.ID.SNACKBAR)) return;
  var isProgressDone = false;
  var $snackbarContainer;
  var $snackbarProgress;

  var close = function close() {
    $snackbarContainer.classList.add('disappear');
    (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_4__.addEventOnce)('animationend', $snackbarContainer, function () {
      $snackbarContainer.remove();
    });
  };

  var createSnackbar = function createSnackbar() {
    $snackbarContainer = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.createElement)('DIV', {
      id: _Constants_Selector__WEBPACK_IMPORTED_MODULE_2__.DOM_NAME.ID.SNACKBAR,
      className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_2__.DOM_NAME.CLASS.SNACKBAR_CONTAINER,
      insertAdjacentHTML: ['afterbegin', " <div class=\"message\"><i class=\"fa-solid fa-circle-check\"></i> ".concat(message, "</div>\n          <div class=\"progress\">\n            <div class=\"percent\"></div>\n          </div>")]
    });
    $snackbarProgress = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)('.percent', $snackbarContainer);
    (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)('#app').append($snackbarContainer);
  };

  var setBindEvents = function setBindEvents() {
    (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_4__.addEventOnce)('click', $snackbarContainer, function () {
      isProgressDone = true;
      close();
    });
  };

  var onProgressStart = /*#__PURE__*/function () {
    var _ref = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee(callback) {
      var startTime, currentTime, percent;
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              startTime = new Date().getTime();

            case 1:
              if (!(isProgressDone === false)) {
                _context.next = 10;
                break;
              }

              _context.next = 4;
              return (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_4__.runAnimation)();

            case 4:
              currentTime = new Date().getTime();
              percent = (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__.getTimeDiffToPercent)(startTime, currentTime, delay);
              $snackbarProgress.style.width = "".concat(percent, "%");
              if (percent >= 100) isProgressDone = true;
              _context.next = 1;
              break;

            case 10:
              callback();

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function onProgressStart(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  createSnackbar();
  setBindEvents();
  onProgressStart(close);
  return {
    close: close
  };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Snackbar);

/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/Navigation.js":
/*!*******************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/Navigation.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navigation)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");
/* harmony import */ var _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Domain/Store/YoutubeSaveListStore */ "./src/js/domain/Store/YoutubeSaveListStore.js");









var Navigation = /*#__PURE__*/function () {
  function Navigation() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Navigation);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$container", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_5__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.ID.CLASSROOM_NAVIGATION));

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleFilterChange", function (_ref) {
      var $target = _ref.target;

      if (!$target.classList.contains('button')) {
        return;
      }

      var listType = $target.dataset.filter;
      var $filterButton = $target.closest(_Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.ID.NAVIGATION_FILTER_BUTTON);
      $filterButton.dataset.focus = listType;
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_4__.ACTION_TYPE.UPDATE_SAVE_LIST_FILTER, listType);
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_4__.ACTION_TYPE.UPDATE_SAVE_LIST);
    });

    this.setBindEvents();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Navigation, [{
    key: "setBindEvents",
    value: function setBindEvents() {
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_6__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_3__.SELECTOR.ID.NAVIGATION_FILTER_BUTTON, {
        eventType: 'click',
        handler: this.handleFilterChange
      });
    }
  }]);

  return Navigation;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/SaveList.js":
/*!*****************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/SaveList.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SaveList)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classPrivateFieldGet */ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldGet.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Domain/YoutubeSaveStorage */ "./src/js/domain/YoutubeSaveStorage.js");
/* harmony import */ var _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Domain/Store/YoutubeSaveListStore */ "./src/js/domain/Store/YoutubeSaveListStore.js");
/* harmony import */ var _Display_Share_Snackbar__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @Display/Share/Snackbar */ "./src/js/display/Share/Snackbar.js");





function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }










var _renderMethodList = /*#__PURE__*/new WeakMap();

var _getVideoElementList = /*#__PURE__*/new WeakSet();

var _getEmptyVideoList = /*#__PURE__*/new WeakSet();

var SaveList = /*#__PURE__*/function () {
  function SaveList() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SaveList);

    _classPrivateMethodInitSpec(this, _getEmptyVideoList);

    _classPrivateMethodInitSpec(this, _getVideoElementList);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$container", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.SELECTOR.ID.SAVE_LIST_CONTENT));

    _classPrivateFieldInitSpec(this, _renderMethodList, {
      writable: true,
      value: []
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "render", function (state) {
      (0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__["default"])(_this, _renderMethodList).forEach(function (renderMethod) {
        renderMethod(state);
      });
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleToggleWatched", function (_ref) {
      var $target = _ref.target;
      var _$target$closest$data = $target.closest(_Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.SELECTOR.CLASS.VIDEO_ITEM).dataset,
          videoId = _$target$closest$data.videoId,
          state = _$target$closest$data.state;
      var isUpdateState = state === 'unwatched';
      _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_9__["default"].watched(videoId, isUpdateState);
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_10__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_7__.ACTION_TYPE.UPDATE_SAVE_LIST);
      (0,_Display_Share_Snackbar__WEBPACK_IMPORTED_MODULE_11__["default"])(_Constants_String__WEBPACK_IMPORTED_MODULE_7__.ALERT_MESSAGE.SAVE_LIST_STATE_UPDATE);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleRemoveItem", function (_ref2) {
      var $target = _ref2.target;

      if (!confirm(_Constants_String__WEBPACK_IMPORTED_MODULE_7__.ALERT_MESSAGE.SAVE_LIST_CONFIRM_REMOVE)) {
        return;
      }

      var videoId = $target.closest(_Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.SELECTOR.CLASS.VIDEO_ITEM).dataset.videoId;
      _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_9__["default"].remove(videoId);
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_10__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_7__.ACTION_TYPE.UPDATE_SAVE_LIST);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "drawVideoList", function (_ref3) {
      var items = _ref3.items,
          listType = _ref3.listType;

      if (items.length === 0) {
        _this.$container.replaceChildren(_classPrivateMethodGet(_this, _getEmptyVideoList, _getEmptyVideoList2).call(_this, listType));

        return;
      }

      var $videoList = _classPrivateMethodGet(_this, _getVideoElementList, _getVideoElementList2).call(_this, items, listType);

      _this.$container.replaceChildren($videoList);
    });

    this.setBindEvents();
    this.setRenderList();
    this.setSubscribeStores();
    _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_10__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_7__.ACTION_TYPE.UPDATE_SAVE_LIST);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SaveList, [{
    key: "addRenderMethod",
    value: function addRenderMethod(renderMethod) {
      (0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__["default"])(this, _renderMethodList).push(renderMethod);
    }
  }, {
    key: "setSubscribeStores",
    value: function setSubscribeStores() {
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_10__["default"].addSubscriber(this.render);
    }
  }, {
    key: "setRenderList",
    value: function setRenderList() {
      this.addRenderMethod(this.drawVideoList);
    }
  }, {
    key: "setBindEvents",
    value: function setBindEvents() {
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_6__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.SELECTOR.CLASS.SAVE_LIST_WATCHED_BUTTON, {
        eventType: 'click',
        handler: this.handleToggleWatched
      });
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_6__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.SELECTOR.CLASS.SAVE_LIST_REMOVE_BUTTON, {
        eventType: 'click',
        handler: this.handleRemoveItem
      });
    }
  }]);

  return SaveList;
}();

function _getVideoElementList2(items, listType) {
  return items.reduce(function ($previous, video) {
    var watchedText = listType === 'watched' ? '추가' : '완료';
    var videoId = video.id,
        content = video.content;
    var $list = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('LI', {
      dataset: {
        'video-id': videoId,
        state: listType
      },
      className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.DOM_NAME.CLASS.VIDEO_ITEM,
      insertAdjacentHTML: ['afterbegin', " <img src=\"".concat(content.snippet.thumbnails.medium.url, "\"\n              alt=\"").concat(content.snippet.title, " \uC378\uB124\uC77C\" class=\"thumbnail\">\n            <h4 class=\"title\">").concat(content.snippet.title, "</h4>\n            <p class=\"channel-name\">").concat(content.snippet.channelTitle, "</p>\n            <p class=\"published-date\">").concat((0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__.getParsedTime)(content.snippet.publishedAt), "</p>\n            <div class=\"button-group\">\n              <button class=\"button save-item-watched-button ").concat(listType, "\">").concat(watchedText, "</button>\n              <button class=\"button save-item-remove-button\">\uC81C\uAC70</button>\n            </div>")]
    });
    $previous.append($list);
    return $previous;
  }, document.createDocumentFragment());
}

function _getEmptyVideoList2(listType) {
  var listText = listType === 'unwatched' ? '볼 영상' : '이미 본 영상';
  return (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('DIV', {
    className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_8__.DOM_NAME.CLASS.EMPTY_CONTENT,
    insertAdjacentHTML: ['afterbegin', " <i class=\"fa-solid fa-video-slash\"></i>\n          <p class=\"title\">".concat(listText, "\uC73C\uB85C \uC800\uC7A5\uB41C \uB3D9\uC601\uC0C1\uC774 \uC5C6\uC5B4\uC694!</p>\n          <p class=\"description\">\uD654\uBA74 \uC6B0\uCE21 \uC0C1\uB2E8\uC758 \uAC80\uC0C9 \uBC84\uD2BC\uC744 \uB20C\uB7EC \uB3D9\uC601\uC0C1\uC744 \uCD94\uAC00\uD574\uC8FC\uC138\uC694.</p>")]
  });
}



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/SearchForm.js":
/*!*******************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/SearchForm.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SearchForm)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _Utils_ElementControl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/ElementControl */ "./src/js/utils/ElementControl.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");
/* harmony import */ var _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Domain/Store/YoutubeSearchStore */ "./src/js/domain/Store/YoutubeSearchStore.js");
/* harmony import */ var _Utils_Validator__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Utils/Validator */ "./src/js/utils/Validator.js");











var SearchForm = /*#__PURE__*/function () {
  function SearchForm() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SearchForm);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$container", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_4__.SELECTOR.ID.SEARCH_FORM));

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleInputValue", function (_ref) {
      var $target = _ref.target;
      var $searchButton = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_4__.SELECTOR.ID.SEARCH_BUTTON, _this.$container);
      (0,_Utils_ElementControl__WEBPACK_IMPORTED_MODULE_6__.onEnableButton)($searchButton, function () {
        return $target.value.length > 0;
      });
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleSubmitForm", function () {
      var newKeyword = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_3__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_4__.SELECTOR.ID.SEARCH_INPUT_KEYWORD, _this.$container).value;

      var _YoutubeSearchStore$g = _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].getState(),
          isLoading = _YoutubeSearchStore$g.isLoading,
          beforeKeyword = _YoutubeSearchStore$g.searchKeyword;

      if ((0,_Utils_Validator__WEBPACK_IMPORTED_MODULE_9__.isEmptyString)(newKeyword)) {
        alert(_Constants_String__WEBPACK_IMPORTED_MODULE_5__.ERROR_MESSAGE.EMPTY_SEARCH_KEYWORD);
        return;
      }

      if ((0,_Utils_Validator__WEBPACK_IMPORTED_MODULE_9__.isSameKeyword)(beforeKeyword, newKeyword)) {
        return;
      }

      if (isLoading) {
        return;
      }

      _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_5__.ACTION_TYPE.UPDATE_SEARCH_KEYWORD, newKeyword);
      _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_5__.ACTION_TYPE.UPDATE_SEARCH_RESULT);
    });

    this.setBindEvents();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SearchForm, [{
    key: "setBindEvents",
    value: function setBindEvents() {
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_7__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_4__.SELECTOR.ID.SEARCH_INPUT_KEYWORD, {
        eventType: 'keyup',
        handler: this.handleInputValue
      });
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_7__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_4__.SELECTOR.ID.SEARCH_FORM, {
        eventType: 'submit',
        handler: this.handleSubmitForm,
        defaultEvent: true
      });
    }
  }]);

  return SearchForm;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/SearchResult.js":
/*!*********************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/SearchResult.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SearchResult)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classPrivateFieldGet */ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldGet.js");
/* harmony import */ var _Utils_Dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/Dom */ "./src/js/utils/Dom.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");
/* harmony import */ var _Utils_ElementControl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/ElementControl */ "./src/js/utils/ElementControl.js");
/* harmony import */ var _Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Utils/CustomEvent */ "./src/js/utils/CustomEvent.js");
/* harmony import */ var _Constants_Setting__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Constants/Setting */ "./src/js/constants/Setting.js");
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Constants/Selector */ "./src/js/constants/Selector.js");
/* harmony import */ var _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @Domain/Store/YoutubeSearchStore */ "./src/js/domain/Store/YoutubeSearchStore.js");
/* harmony import */ var _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @Domain/Store/YoutubeSaveListStore */ "./src/js/domain/Store/YoutubeSaveListStore.js");
/* harmony import */ var _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @Domain/YoutubeSaveStorage */ "./src/js/domain/YoutubeSaveStorage.js");
/* harmony import */ var _Display_Share_Snackbar__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @Display/Share/Snackbar */ "./src/js/display/Share/Snackbar.js");





function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }













var _renderMethodList = /*#__PURE__*/new WeakMap();

var _getResultNotFound = /*#__PURE__*/new WeakSet();

var _getResultServerError = /*#__PURE__*/new WeakSet();

var _getVideoElementList = /*#__PURE__*/new WeakSet();

var SearchResult = /*#__PURE__*/function () {
  function SearchResult() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SearchResult);

    _classPrivateMethodInitSpec(this, _getVideoElementList);

    _classPrivateMethodInitSpec(this, _getResultServerError);

    _classPrivateMethodInitSpec(this, _getResultNotFound);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "$container", (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.ID.SEARCH_RESULT_CONTAINER));

    _classPrivateFieldInitSpec(this, _renderMethodList, {
      writable: true,
      value: []
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "render", function (state) {
      (0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__["default"])(_this, _renderMethodList).forEach(function (renderMethod) {
        renderMethod(state);
      });
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleToggleSaveButton", function (_ref) {
      var $target = _ref.target;

      var _YoutubeSearchStore$g = _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__["default"].getState(),
          videoList = _YoutubeSearchStore$g.items;

      var _$target$closest$data = $target.closest(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.CLASS.VIDEO_ITEM).dataset,
          videoId = _$target$closest$data.videoId,
          primaryKey = _$target$closest$data.primaryKey;

      if (_Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__["default"].has(videoId)) {
        _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__["default"].remove(videoId);
        _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_12__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SAVE_LIST);
        $target.textContent = '⬇ 저장';
        (0,_Display_Share_Snackbar__WEBPACK_IMPORTED_MODULE_14__["default"])(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ALERT_MESSAGE.SAVE_LIST_REMOVE);
        return;
      }

      var saveItemsCount = _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__["default"].get().length;

      if (saveItemsCount >= _Constants_Setting__WEBPACK_IMPORTED_MODULE_8__.CLASS_ROOM_SETTING.MAX_SAVE_NUMBER) {
        alert(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ERROR_MESSAGE.MAX_SAVE_VIDEO);
        return;
      }

      _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__["default"].add(videoId, videoList[primaryKey]);
      _Domain_Store_YoutubeSaveListStore__WEBPACK_IMPORTED_MODULE_12__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SAVE_LIST);
      $target.textContent = '🗑 저장 취소';
      (0,_Display_Share_Snackbar__WEBPACK_IMPORTED_MODULE_14__["default"])(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ALERT_MESSAGE.SAVE_LIST_ADD);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "drawSkeletonList", function () {
      var $fragment = document.createDocumentFragment();
      Array.from({
        length: _Constants_Setting__WEBPACK_IMPORTED_MODULE_8__.CLASS_ROOM_SETTING.MAX_VIDEO_NUMBER
      }).map(function () {
        var $skeleton = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('LI', {
          className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.DOM_NAME.CLASS.VIDEO_LIST_SKELETON,
          insertAdjacentHTML: ['afterbegin', " <div class=\"image\"></div>\n            <p class=\"line\"></p>\n            <p class=\"line\"></p>"]
        });
        $fragment.append($skeleton);
      });

      _this.$skeletonList.replaceChildren($fragment);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "drawVideoList", function (_ref2) {
      var items = _ref2.items,
          searchKeyword = _ref2.searchKeyword,
          isLoaded = _ref2.isLoaded,
          error = _ref2.error;

      if (error) {
        _this.$videoResult.replaceChildren(_classPrivateMethodGet(_this, _getResultServerError, _getResultServerError2).call(_this));

        return;
      }

      if (items.length === 0 && isLoaded === true) {
        _this.$videoResult.replaceChildren(_classPrivateMethodGet(_this, _getResultNotFound, _getResultNotFound2).call(_this, searchKeyword));

        return;
      }

      if (items.length === 0 && isLoaded === false) {
        _this.$videoResult.replaceChildren('');

        _this.$videoResult.closest(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.ID.VIDEO_LIST).scrollTo({
          top: 0
        });

        return;
      }

      var $videoList = _classPrivateMethodGet(_this, _getVideoElementList, _getVideoElementList2).call(_this, items);

      _this.$videoResult.replaceChildren($videoList);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "drawLoadingStatus", function (_ref3) {
      var searchKeyword = _ref3.searchKeyword,
          isLoading = _ref3.isLoading;

      _this.$scrollObserver.classList.toggle('enable', !!searchKeyword);

      _this.$container.classList.toggle('loading', isLoading);
    });

    this.setDefaultElements();
    this.setBindEvents();
    this.setRenderList();
    this.setSubscribeStores();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SearchResult, [{
    key: "addRenderMethod",
    value: function addRenderMethod(renderMethod) {
      (0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_3__["default"])(this, _renderMethodList).push(renderMethod);
    }
  }, {
    key: "setSubscribeStores",
    value: function setSubscribeStores() {
      _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__["default"].addSubscriber(this.render);
    }
  }, {
    key: "setRenderList",
    value: function setRenderList() {
      this.addRenderMethod(this.drawVideoList);
      this.addRenderMethod(this.drawLoadingStatus);
    }
  }, {
    key: "setDefaultElements",
    value: function setDefaultElements() {
      this.$videoResult = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.ID.VIDEO_RESULT, this.$container);
      this.$scrollObserver = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.ID.SEARCH_RESULT_SCROLL_OBSERVER, this.$container);
      this.$skeletonList = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.$)(_Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.ID.SKELETON_LIST, this.$container);
      this.drawSkeletonList();
    }
  }, {
    key: "setBindEvents",
    value: function setBindEvents() {
      (0,_Utils_ElementControl__WEBPACK_IMPORTED_MODULE_6__.onObserveElement)(this.$scrollObserver, function () {
        var _YoutubeSearchStore$g2 = _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__["default"].getState(),
            previousNextPageToken = _YoutubeSearchStore$g2.nextPageToken;

        if (!previousNextPageToken) return;
        _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SEARCH_LOADING_STATUS);
        _Domain_Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_11__["default"].dispatch(_Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SEARCH_RESULT);
      });
      (0,_Utils_CustomEvent__WEBPACK_IMPORTED_MODULE_7__.addEventDelegate)(this.$container, _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.SELECTOR.CLASS.VIDEO_ITEM_SAVE_BUTTON, {
        eventType: 'click',
        handler: this.handleToggleSaveButton
      });
    }
  }]);

  return SearchResult;
}();

function _getResultNotFound2(searchKeyword) {
  return (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('DIV', {
    className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.DOM_NAME.CLASS.EMPTY_CONTENT,
    insertAdjacentHTML: ['afterbegin', " <i class=\"fa-solid fa-face-rolling-eyes\"></i>\n          <p class=\"title\">\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694!</p>\n          <p class=\"description\">".concat(searchKeyword, " \uD0A4\uC6CC\uB4DC\uC758 \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uD0A4\uC6CC\uB4DC\uB85C \uAC80\uC0C9\uD574\uBCF4\uC544\uC8FC\uC138\uC694!</p>")]
  });
}

function _getResultServerError2() {
  return (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('DIV', {
    className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.DOM_NAME.CLASS.EMPTY_CONTENT,
    insertAdjacentHTML: ['afterbegin', " <i class=\"fa-solid fa-face-sad-tear\"></i>\n          <p class=\"title\">\uC5C7! \uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694!</p>\n          <p class=\"description\">\uB124\uD2B8\uC6CC\uD06C \uD658\uACBD\uC744 \uD655\uC778\uD558\uC2DC\uAC70\uB098, \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.</p>"]
  });
}

function _getVideoElementList2(items) {
  return items.reduce(function ($previous, video, index) {
    var buttonText = _Domain_YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_13__["default"].has(video.id.videoId) ? '🗑 저장 취소' : '⬇ 저장';
    var $list = (0,_Utils_Dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('LI', {
      dataset: {
        'video-id': video.id.videoId,
        'primary-key': index
      },
      className: _Constants_Selector__WEBPACK_IMPORTED_MODULE_10__.DOM_NAME.CLASS.VIDEO_ITEM,
      insertAdjacentHTML: ['afterbegin', " <img src=\"".concat(video.snippet.thumbnails.medium.url, "\"\n              alt=\"").concat(video.snippet.title, " \uC378\uB124\uC77C\" class=\"thumbnail\">\n            <h4 class=\"title\">").concat(video.snippet.title, "</h4>\n            <p class=\"channel-name\">").concat(video.snippet.channelTitle, "</p>\n            <p class=\"published-date\">").concat((0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__.getParsedTime)(video.snippet.publishedAt), "</p>\n            <button class=\"save-button button\">").concat(buttonText, "</button>")]
    });
    $previous.append($list);
    return $previous;
  }, document.createDocumentFragment());
}



/***/ }),

/***/ "./src/js/domain/Store/Abstract.js":
/*!*****************************************!*\
  !*** ./src/js/domain/Store/Abstract.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Store)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");




var Store = /*#__PURE__*/function () {
  function Store(initialState) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Store);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "state", {});

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "reducers", {});

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "subscribers", []);

    if ((this instanceof Store ? this.constructor : void 0) === Store) {
      throw new Error('추상 클래스는 인스턴스화 할 수 없습니다.');
    }

    this.state = initialState;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Store, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
  }, {
    key: "setState",
    value: function setState(newState) {
      var _this = this;

      this.state = newState;
      this.subscribers.forEach(function (subscriber) {
        return subscriber(_this.state);
      });
    }
  }, {
    key: "getReducer",
    value: function getReducer(type) {
      return this.reducers[type];
    }
  }, {
    key: "dispatch",
    value: function dispatch(type, data) {
      this.getReducer(type)(data);
    }
  }, {
    key: "addSubscriber",
    value: function addSubscriber(subscriber) {
      this.subscribers.push(subscriber);
    }
  }]);

  return Store;
}();



/***/ }),

/***/ "./src/js/domain/Store/YoutubeSaveListStore.js":
/*!*****************************************************!*\
  !*** ./src/js/domain/Store/YoutubeSaveListStore.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _Constants_Setting__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Constants/Setting */ "./src/js/constants/Setting.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../api */ "./src/js/api.js");
/* harmony import */ var _Abstract__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Abstract */ "./src/js/domain/Store/Abstract.js");
/* harmony import */ var _YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../YoutubeSaveStorage */ "./src/js/domain/YoutubeSaveStorage.js");










function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_7__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }








var _getExpireVideoList = /*#__PURE__*/new WeakSet();

var _updateVideoData = /*#__PURE__*/new WeakSet();

var YoutubeSaveListStore = /*#__PURE__*/function (_Store) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__["default"])(YoutubeSaveListStore, _Store);

  var _super = _createSuper(YoutubeSaveListStore);

  function YoutubeSaveListStore(initialState) {
    var _this$reducers;

    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, YoutubeSaveListStore);

    _this = _super.call(this, initialState);

    _classPrivateMethodInitSpec((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), _updateVideoData);

    _classPrivateMethodInitSpec((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), _getExpireVideoList);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), "state", {
      listType: 'unwatched',
      items: []
    });

    _this.reducers = (_this$reducers = {}, (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_7__["default"])(_this$reducers, _Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SAVE_LIST, (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8___default().mark(function _callee() {
      var expireVideoList, isWatched, filterItems;
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8___default().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              expireVideoList = _classPrivateMethodGet((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), _getExpireVideoList, _getExpireVideoList2).call((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), _YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_14__["default"].get());

              _classPrivateMethodGet((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), _updateVideoData, _updateVideoData2).call((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_3__["default"])(_this), expireVideoList);

              isWatched = _this.state.listType === 'watched';
              filterItems = _YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_14__["default"].get().filter(function (videoState) {
                return videoState.watched === isWatched;
              });

              _this.setState(_objectSpread(_objectSpread({}, _this.state), {}, {
                items: filterItems
              }));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_7__["default"])(_this$reducers, _Constants_String__WEBPACK_IMPORTED_MODULE_9__.ACTION_TYPE.UPDATE_SAVE_LIST_FILTER, function (listType) {
      _this.setState(_objectSpread(_objectSpread({}, _this.state), {}, {
        listType: listType
      }));
    }), _this$reducers);
    return _this;
  }

  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(YoutubeSaveListStore);
}(_Abstract__WEBPACK_IMPORTED_MODULE_13__["default"]);

function _getExpireVideoList2(videoList) {
  var expireTime = (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_11__.getTimeStamp)() - _Constants_Setting__WEBPACK_IMPORTED_MODULE_10__.CLASS_ROOM_SETTING.VIDEO_DATA_CACHE_EXPIRE_TIME;
  return videoList.reduce(function (previous, value, index) {
    if (value.updateTime < expireTime) {
      previous.push({
        primaryKey: index,
        videoId: value.id
      });
    }

    return previous;
  }, []);
}

function _updateVideoData2(_x) {
  return _updateVideoData3.apply(this, arguments);
}

function _updateVideoData3() {
  _updateVideoData3 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8___default().mark(function _callee2(expireVideoList) {
    var _yield$requestYoutube, updateVideoList;

    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_8___default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (expireVideoList.length) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            _context2.next = 4;
            return (0,_api__WEBPACK_IMPORTED_MODULE_12__.requestYoutubeList)(expireVideoList.map(function (_ref2) {
              var videoId = _ref2.videoId;
              return videoId;
            }));

          case 4:
            _yield$requestYoutube = _context2.sent;
            updateVideoList = _yield$requestYoutube.items;
            updateVideoList.forEach(function (videoData, index) {
              var videoId = expireVideoList[index].videoId;
              _YoutubeSaveStorage__WEBPACK_IMPORTED_MODULE_14__["default"].update(videoId, videoData);
            });

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _updateVideoData3.apply(this, arguments);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new YoutubeSaveListStore());

/***/ }),

/***/ "./src/js/domain/Store/YoutubeSearchStore.js":
/*!***************************************************!*\
  !*** ./src/js/domain/Store/YoutubeSearchStore.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _Constants_String__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Constants/String */ "./src/js/constants/String.js");
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../api */ "./src/js/api.js");
/* harmony import */ var _Abstract__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Abstract */ "./src/js/domain/Store/Abstract.js");











function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_7__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_7__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }





var _isLastItem = /*#__PURE__*/new WeakSet();

var YoutubeSearchStore = /*#__PURE__*/function (_Store) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(YoutubeSearchStore, _Store);

  var _super = _createSuper(YoutubeSearchStore);

  function YoutubeSearchStore(initialState) {
    var _this$reducers;

    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__["default"])(this, YoutubeSearchStore);

    _this = _super.call(this, initialState);

    _classPrivateMethodInitSpec((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4__["default"])(_this), _isLastItem);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4__["default"])(_this), "state", {
      searchKeyword: '',
      isLoading: false,
      isLoaded: false,
      items: [],
      totalResults: Number.MAX_SAFE_INTEGER,
      nextPageToken: '',
      error: false
    });

    _this.reducers = (_this$reducers = {}, (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(_this$reducers, _Constants_String__WEBPACK_IMPORTED_MODULE_10__.ACTION_TYPE.UPDATE_SEARCH_KEYWORD, function (keyword) {
      _this.setState(_objectSpread(_objectSpread({}, _this.state), {}, {
        searchKeyword: keyword,
        isLoading: true,
        isLoaded: false,
        items: [],
        totalResults: Number.MAX_SAFE_INTEGER,
        nextPageToken: '',
        error: false
      }));
    }), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(_this$reducers, _Constants_String__WEBPACK_IMPORTED_MODULE_10__.ACTION_TYPE.UPDATE_SEARCH_LOADING_STATUS, function () {
      _this.setState(_objectSpread(_objectSpread({}, _this.state), {}, {
        isLoading: true
      }));
    }), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(_this$reducers, _Constants_String__WEBPACK_IMPORTED_MODULE_10__.ACTION_TYPE.UPDATE_SEARCH_RESULT, (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_9___default().mark(function _callee() {
      var _yield$requestYoutube, _yield$requestYoutube2, items, _yield$requestYoutube3, pageInfo, _yield$requestYoutube4, nextPageToken, _yield$requestYoutube5, error;

      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_9___default().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0,_api__WEBPACK_IMPORTED_MODULE_11__.requestYoutubeSearch)(_this.state.searchKeyword, _this.state.nextPageToken);

            case 2:
              _yield$requestYoutube = _context.sent;
              _yield$requestYoutube2 = _yield$requestYoutube.items;
              items = _yield$requestYoutube2 === void 0 ? [] : _yield$requestYoutube2;
              _yield$requestYoutube3 = _yield$requestYoutube.pageInfo;
              pageInfo = _yield$requestYoutube3 === void 0 ? {
                totalResults: 0
              } : _yield$requestYoutube3;
              _yield$requestYoutube4 = _yield$requestYoutube.nextPageToken;
              nextPageToken = _yield$requestYoutube4 === void 0 ? '' : _yield$requestYoutube4;
              _yield$requestYoutube5 = _yield$requestYoutube.error;
              error = _yield$requestYoutube5 === void 0 ? false : _yield$requestYoutube5;

              _this.setState(_objectSpread(_objectSpread({}, _this.state), {}, {
                isLoading: false,
                isLoaded: true,
                items: [].concat((0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_this.state.items), (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(items)),
                totalResults: pageInfo.totalResults,
                error: error,
                nextPageToken: nextPageToken
              }));

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))), _this$reducers);
    return _this;
  }

  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(YoutubeSearchStore);
}(_Abstract__WEBPACK_IMPORTED_MODULE_12__["default"]);

function _isLastItem2() {
  return this.state.items.length >= this.state.totalResults;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new YoutubeSearchStore());

/***/ }),

/***/ "./src/js/domain/YoutubeSaveStorage.js":
/*!*********************************************!*\
  !*** ./src/js/domain/YoutubeSaveStorage.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_classPrivateFieldSet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classPrivateFieldSet */ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldSet.js");
/* harmony import */ var _babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/classPrivateFieldGet */ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldGet.js");
/* harmony import */ var _Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/ManageData */ "./src/js/utils/ManageData.js");






function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }



var _STORAGE_NAME = /*#__PURE__*/new WeakMap();

var _cacheData = /*#__PURE__*/new WeakMap();

var _getVideoIdToIndex = /*#__PURE__*/new WeakSet();

var YoutubeSaveStorage = /*#__PURE__*/function () {
  function YoutubeSaveStorage() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, YoutubeSaveStorage);

    _classPrivateMethodInitSpec(this, _getVideoIdToIndex);

    _classPrivateFieldInitSpec(this, _STORAGE_NAME, {
      writable: true,
      value: 'YOUTUBE_CLASSROOM_SAVE_VIDEO_LIST'
    });

    _classPrivateFieldInitSpec(this, _cacheData, {
      writable: true,
      value: void 0
    });
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(YoutubeSaveStorage, [{
    key: "get",
    value: function get() {
      if (!(0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_4__["default"])(this, _cacheData)) {
        var _JSON$parse;

        (0,_babel_runtime_helpers_classPrivateFieldSet__WEBPACK_IMPORTED_MODULE_3__["default"])(this, _cacheData, (_JSON$parse = JSON.parse(localStorage.getItem((0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_4__["default"])(this, _STORAGE_NAME)))) !== null && _JSON$parse !== void 0 ? _JSON$parse : []);
      }

      return (0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_4__["default"])(this, _cacheData);
    }
  }, {
    key: "set",
    value: function set(updateItems) {
      (0,_babel_runtime_helpers_classPrivateFieldSet__WEBPACK_IMPORTED_MODULE_3__["default"])(this, _cacheData, updateItems);

      localStorage.setItem((0,_babel_runtime_helpers_classPrivateFieldGet__WEBPACK_IMPORTED_MODULE_4__["default"])(this, _STORAGE_NAME), JSON.stringify(updateItems));
    }
  }, {
    key: "add",
    value: function add(videoId, videoData) {
      var insertItem = {
        id: videoId,
        content: videoData,
        watched: false,
        updateTime: (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__.getTimeStamp)()
      };
      this.set([].concat((0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(this.get()), [insertItem]));
    }
  }, {
    key: "has",
    value: function has(videoId) {
      return _classPrivateMethodGet(this, _getVideoIdToIndex, _getVideoIdToIndex2).call(this, videoId) !== -1;
    }
  }, {
    key: "remove",
    value: function remove(videoId) {
      var videoIndex = _classPrivateMethodGet(this, _getVideoIdToIndex, _getVideoIdToIndex2).call(this, videoId);

      var updateList = this.get();
      updateList.splice(videoIndex, 1);
      this.set(updateList);
    }
  }, {
    key: "update",
    value: function update(videoId, videoData) {
      var videoIndex = _classPrivateMethodGet(this, _getVideoIdToIndex, _getVideoIdToIndex2).call(this, videoId);

      var updateList = this.get();
      updateList[videoIndex].content = videoData;
      updateList[videoIndex].updateTime = (0,_Utils_ManageData__WEBPACK_IMPORTED_MODULE_5__.getTimeStamp)();
      this.set(updateList);
    }
  }, {
    key: "watched",
    value: function watched(videoId, isWatched) {
      var videoIndex = _classPrivateMethodGet(this, _getVideoIdToIndex, _getVideoIdToIndex2).call(this, videoId);

      var updateList = this.get();
      updateList[videoIndex].watched = isWatched;
      this.set(updateList);
    }
  }]);

  return YoutubeSaveStorage;
}();

function _getVideoIdToIndex2(target) {
  var videoIdList = this.get().map(function (_ref) {
    var videoId = _ref.id;
    return videoId;
  });
  return videoIdList.indexOf(target);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new YoutubeSaveStorage());

/***/ }),

/***/ "./src/js/utils/CustomEvent.js":
/*!*************************************!*\
  !*** ./src/js/utils/CustomEvent.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addEventDelegate": () => (/* binding */ addEventDelegate),
/* harmony export */   "addEventOnce": () => (/* binding */ addEventOnce),
/* harmony export */   "runAnimation": () => (/* binding */ runAnimation)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");

var runAnimation = function runAnimation() {
  return new Promise(function (resolve) {
    requestAnimationFrame(resolve);
  });
};
var addEventDelegate = function addEventDelegate(container, selector, _ref) {
  var eventType = _ref.eventType,
      handler = _ref.handler,
      _ref$defaultEvent = _ref.defaultEvent,
      defaultEvent = _ref$defaultEvent === void 0 ? false : _ref$defaultEvent;

  var children = (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(container.querySelectorAll(selector));

  var isTarget = function isTarget(target) {
    return children.includes(target) || target.closest(selector);
  };

  container.addEventListener(eventType, function (event) {
    if (defaultEvent === true) event.preventDefault();
    if (!isTarget(event.target)) return false;
    handler(event);
  });
};
var addEventOnce = function addEventOnce(eventType, $element, callback) {
  if ($element instanceof HTMLElement === false) {
    return;
  }

  $element.addEventListener(eventType, callback, {
    once: true
  });
};

/***/ }),

/***/ "./src/js/utils/Dom.js":
/*!*****************************!*\
  !*** ./src/js/utils/Dom.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$": () => (/* binding */ $),
/* harmony export */   "$$": () => (/* binding */ $$),
/* harmony export */   "createElement": () => (/* binding */ createElement)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");


var createElement = function createElement(tagName) {
  var property = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var $create = document.createElement(tagName);
  Object.entries(property).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    if (key === 'dataset') {
      Object.entries(value).forEach(function (_ref3) {
        var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
            datasetId = _ref4[0],
            datasetValue = _ref4[1];

        return $create.setAttribute("data-".concat(datasetId), datasetValue);
      });
    }

    if (typeof $create[key] === 'string') {
      $create[key] = value;
    }

    if (typeof $create[key] === 'function') {
      $create[key].apply($create, (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(value));
    }
  });
  return $create;
};
var $ = function $(selector) {
  var parentElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return parentElement.querySelector(selector);
};
var $$ = function $$(selector) {
  var parentElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return parentElement.querySelectorAll(selector);
};

/***/ }),

/***/ "./src/js/utils/ElementControl.js":
/*!****************************************!*\
  !*** ./src/js/utils/ElementControl.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onEnableButton": () => (/* binding */ onEnableButton),
/* harmony export */   "onObserveElement": () => (/* binding */ onObserveElement)
/* harmony export */ });
var isNotHTMLElement = function isNotHTMLElement($element) {
  return $element instanceof HTMLElement === false;
};

var onEnableButton = function onEnableButton($eventTarget, condition) {
  if (isNotHTMLElement($eventTarget)) {
    return;
  }

  $eventTarget.disabled = !condition($eventTarget);
};
var onObserveElement = function onObserveElement($element, handler) {
  var scrollObserver = new IntersectionObserver(function (entry) {
    if (entry[0].isIntersecting) {
      handler();
    }
  }, {
    threshold: 0.5
  });
  scrollObserver.observe($element);
};

/***/ }),

/***/ "./src/js/utils/ManageData.js":
/*!************************************!*\
  !*** ./src/js/utils/ManageData.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getParsedTime": () => (/* binding */ getParsedTime),
/* harmony export */   "getTimeDiffToPercent": () => (/* binding */ getTimeDiffToPercent),
/* harmony export */   "getTimeStamp": () => (/* binding */ getTimeStamp),
/* harmony export */   "getUrlSearchParams": () => (/* binding */ getUrlSearchParams)
/* harmony export */ });
var getParsedTime = function getParsedTime(timeString) {
  var time = new Date(timeString);
  return "".concat(time.getFullYear(), "\uB144 ").concat(time.getMonth() + 1, "\uC6D4 ").concat(time.getDate(), "\uC77C");
};
var getTimeStamp = function getTimeStamp() {
  var targetDate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
  return Math.round(targetDate.getTime() / 1000);
};
var getUrlSearchParams = function getUrlSearchParams(url, params) {
  return "".concat(url, "?").concat(new URLSearchParams(params).toString());
};
var getTimeDiffToPercent = function getTimeDiffToPercent(startTime, currentTime) {
  var totalTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
  return Math.ceil((currentTime - startTime) * (100 / totalTime));
};

/***/ }),

/***/ "./src/js/utils/Validator.js":
/*!***********************************!*\
  !*** ./src/js/utils/Validator.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isEmptyString": () => (/* binding */ isEmptyString),
/* harmony export */   "isSameKeyword": () => (/* binding */ isSameKeyword)
/* harmony export */ });
var isEmptyString = function isEmptyString(value) {
  return value.length === 0;
};
var isSameKeyword = function isSameKeyword(beforeKeyword, newKeyword) {
  return beforeKeyword === newKeyword;
};

/***/ }),

/***/ "./src/styles/App.scss":
/*!*****************************!*\
  !*** ./src/styles/App.scss ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/styles/YoutubeClassRoom.scss":
/*!******************************************!*\
  !*** ./src/styles/YoutubeClassRoom.scss ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithoutHoles)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _assertThisInitialized)
/* harmony export */ });
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _asyncToGenerator)
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorGet.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorGet.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classApplyDescriptorGet)
/* harmony export */ });
function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorSet.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorSet.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classApplyDescriptorSet)
/* harmony export */ });
function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classExtractFieldDescriptor.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classExtractFieldDescriptor.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classExtractFieldDescriptor)
/* harmony export */ });
function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldGet.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classPrivateFieldGet.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classPrivateFieldGet)
/* harmony export */ });
/* harmony import */ var _classApplyDescriptorGet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classApplyDescriptorGet.js */ "./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorGet.js");
/* harmony import */ var _classExtractFieldDescriptor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classExtractFieldDescriptor.js */ "./node_modules/@babel/runtime/helpers/esm/classExtractFieldDescriptor.js");


function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = (0,_classExtractFieldDescriptor_js__WEBPACK_IMPORTED_MODULE_1__["default"])(receiver, privateMap, "get");
  return (0,_classApplyDescriptorGet_js__WEBPACK_IMPORTED_MODULE_0__["default"])(receiver, descriptor);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classPrivateFieldSet.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classPrivateFieldSet.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classPrivateFieldSet)
/* harmony export */ });
/* harmony import */ var _classApplyDescriptorSet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classApplyDescriptorSet.js */ "./node_modules/@babel/runtime/helpers/esm/classApplyDescriptorSet.js");
/* harmony import */ var _classExtractFieldDescriptor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classExtractFieldDescriptor.js */ "./node_modules/@babel/runtime/helpers/esm/classExtractFieldDescriptor.js");


function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = (0,_classExtractFieldDescriptor_js__WEBPACK_IMPORTED_MODULE_1__["default"])(receiver, privateMap, "set");
  (0,_classApplyDescriptorSet_js__WEBPACK_IMPORTED_MODULE_0__["default"])(receiver, descriptor, value);
  return value;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _defineProperty)
/* harmony export */ });
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _getPrototypeOf)
/* harmony export */ });
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!*************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _inherits)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(subClass, superClass);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArray)
/* harmony export */ });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableSpread)
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _possibleConstructorReturn)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(self, call) {
  if (call && ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return (0,_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(self);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _setPrototypeOf)
/* harmony export */ });
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toConsumableArray)
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Display_YoutubeClassRoom_Navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Display/YoutubeClassRoom/Navigation */ "./src/js/display/YoutubeClassRoom/Navigation.js");
/* harmony import */ var _Display_Share_Modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Display/Share/Modal */ "./src/js/display/Share/Modal.js");
/* harmony import */ var _Display_YoutubeClassRoom_SearchForm__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Display/YoutubeClassRoom/SearchForm */ "./src/js/display/YoutubeClassRoom/SearchForm.js");
/* harmony import */ var _Display_YoutubeClassRoom_SearchResult__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Display/YoutubeClassRoom/SearchResult */ "./src/js/display/YoutubeClassRoom/SearchResult.js");
/* harmony import */ var _Display_YoutubeClassRoom_SaveList__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Display/YoutubeClassRoom/SaveList */ "./src/js/display/YoutubeClassRoom/SaveList.js");
/* harmony import */ var _Style_App_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Style/App.scss */ "./src/styles/App.scss");
/* harmony import */ var _Style_YoutubeClassRoom_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Style/YoutubeClassRoom.scss */ "./src/styles/YoutubeClassRoom.scss");







document.addEventListener('DOMContentLoaded', function () {
  new _Display_Share_Modal__WEBPACK_IMPORTED_MODULE_1__["default"]();
  new _Display_YoutubeClassRoom_Navigation__WEBPACK_IMPORTED_MODULE_0__["default"]();
  new _Display_YoutubeClassRoom_SaveList__WEBPACK_IMPORTED_MODULE_4__["default"]();
  new _Display_YoutubeClassRoom_SearchForm__WEBPACK_IMPORTED_MODULE_2__["default"]();
  new _Display_YoutubeClassRoom_SearchResult__WEBPACK_IMPORTED_MODULE_3__["default"]();
});
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map