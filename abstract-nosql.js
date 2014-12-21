// Generated by CoffeeScript 1.8.0
(function() {
  var AbstractChainedBatch, AbstractError, AbstractIterator, AbstractNoSQL, AbstractObject, CloseError, Errors, InvalidArgumentError, NoSqlStream, NotImplementedError, OpenError, ReadStream, WriteStream, inherits, isString, setImmediate, util, xtend;

  xtend = require("xtend");

  try {
    NoSqlStream = require("nosql-stream");
  } catch (_error) {}

  if (NoSqlStream) {
    ReadStream = NoSqlStream.ReadStream;
  }

  if (NoSqlStream) {
    WriteStream = NoSqlStream.WriteStream;
  }

  AbstractObject = require("abstract-object");

  util = require("abstract-object/lib/util");

  Errors = require("./abstract-error");

  AbstractIterator = require("./abstract-iterator");

  AbstractChainedBatch = require("./abstract-chained-batch");

  setImmediate = global.setImmediate || process.nextTick;

  AbstractError = Errors.AbstractError;

  NotImplementedError = Errors.NotImplementedError;

  InvalidArgumentError = Errors.InvalidArgumentError;

  OpenError = Errors.OpenError;

  CloseError = Errors.CloseError;

  inherits = util.inherits;

  isString = util.isString;

  module.exports.AbstractNoSQL = AbstractNoSQL = (function() {
    inherits(AbstractNoSQL, AbstractObject);

    function AbstractNoSQL() {
      AbstractNoSQL.__super__.constructor.apply(this, arguments);
    }

    AbstractNoSQL.prototype.init = function(location) {
      if (location && typeof location !== "string") {
        throw new InvalidArgumentError("constructor requires a location string argument");
      }
      return this.location = location;
    };

    AbstractNoSQL.prototype.__defineGetter__("opened", function() {
      return !!this._opened;
    });

    AbstractNoSQL.prototype.setOpened = function(aValue, options) {
      if (aValue) {
        this._opened = true;
        if (options) {
          this._options = options;
        }
        this.emit("ready");
        return this.emit("open");
      } else {
        this._opened = false;
        return this.emit("closed");
      }
    };

    AbstractNoSQL.prototype.isExistsSync = function(key, options) {
      var err, result;
      if (options == null) {
        options = {};
      }
      if (this._isExistsSync) {
        result = this._isExistsSync(key, options);
        return result;
      } else if (this._getSync) {
        try {
          this._getSync(key, options);
          return true;
        } catch (_error) {
          err = _error;
          if (AbstractError.isNotFound(err)) {
            return false;
          } else {
            throw err;
          }
        }
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.getSync = function(key, options) {
      var result;
      if (this._getSync) {
        if (options == null) {
          options = {};
        }
        result = this._getSync(key, options);
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.mGetSync = function(keys, options) {
      var arr, i, result;
      if (this._mGetSync) {
        if (options == null) {
          options = {};
        }
        arr = this._mGetSync(key, options);
        i = 0;
        result = [];
        while (i < arr.length) {
          result.push({
            key: arr[i],
            value: arr[++i]
          });
          i++;
        }
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.putSync = function(key, value, options) {
      var result;
      if (this._putSync) {
        if (options == null) {
          options = {};
        }
        result = this._putSync(key, value, options);
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.delSync = function(key, options) {
      var result;
      if (this._delSync) {
        if (options == null) {
          options = {};
        }
        result = this._delSync(key, options);
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.batchSync = function(operations, options) {
      var result;
      if (this._batchSync) {
        if (options == null) {
          options = {};
        }
        result = this._batchSync(operations, options);
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.approximateSizeSync = function(start, end) {
      var result;
      if (this._approximateSizeSync) {
        result = this._approximateSizeSync(start, end);
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.openSync = function(options) {
      var result;
      if (this._openSync) {
        if (options == null) {
          options = this._options || {};
        }
        options.createIfMissing = options.createIfMissing !== false;
        options.errorIfExists = !!options.errorIfExists;
        result = this._openSync(options);
        if (result) {
          this.setOpened(true, options);
        }
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype.closeSync = function() {
      var result;
      if (this._closeSync) {
        result = this._closeSync();
        if (result) {
          this.setOpened(false);
        }
        return result;
      }
      throw new NotImplementedError();
    };

    AbstractNoSQL.prototype._open = function(options, callback) {
      var that;
      that = this;
      if (this._openSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._openSync(options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          if (result) {
            return callback(null, result);
          } else {
            return callback(new OpenError("can not open database."));
          }
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._close = function(callback) {
      var that;
      that = this;
      if (this._closeSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._closeSync();
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          if (result) {
            return callback(null, result);
          } else {
            return callback(new CloseError("can not close database."));
          }
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._isExists = function(key, options, callback) {
      var that;
      that = this;
      if (this._isExistsSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._isExistsSync(key, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return this._get(key, options, function(err, value) {
          if (err) {
            if (AbstractError.isNotFound(err)) {
              return callback(null, false);
            } else {
              return callback(err);
            }
          } else {
            return callback(null, true);
          }
        });
      }
    };

    AbstractNoSQL.prototype._mGetSync = function(keys, options) {
      var key, result, value, _i, _len;
      if (this._getSync) {
        result = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          key = keys[_i];
          value = this._getSync(key, options);
          result.push(key, value);
        }
        return result;
      } else {
        throw new NotImplementedError('_mGetSync: _getSync is not implemented.');
      }
    };

    AbstractNoSQL.prototype._mGet = function(keys, options, callback) {
      var i, readNext, result, that;
      that = this;
      if (this._getSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._mGetSync(keys, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else if (keys.length > 0) {
        result = [];
        i = 0;
        readNext = function(err, value) {
          if (err) {
            return callback(err);
          }
          result.push(keys[i], value);
          i++;
          if (i >= keys.length) {
            return callback(null, result);
          }
          return this._get(key[i], options, readNext);
        };
        return this._get(keys[i], options, readNext);
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._get = function(key, options, callback) {
      var that;
      that = this;
      if (this._getSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._getSync(key, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._put = function(key, value, options, callback) {
      var that;
      that = this;
      if (this._putSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._putSync(key, value, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._del = function(key, options, callback) {
      var that;
      that = this;
      if (this._delSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._delSync(key, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._batch = function(array, options, callback) {
      var that;
      that = this;
      if (this._batchSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._batchSync(array, options);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype._approximateSize = function(start, end, callback) {
      var that;
      that = this;
      if (this._approximateSizeSync) {
        return setImmediate(function() {
          var err, result;
          result = void 0;
          try {
            result = that._approximateSizeSync(start, end);
          } catch (_error) {
            err = _error;
            callback(err);
            return;
          }
          return callback(null, result);
        });
      } else {
        return setImmediate(callback);
      }
    };

    AbstractNoSQL.prototype.open = function(options, callback) {
      var that;
      if (typeof options === "function") {
        callback = options;
      }
      if (typeof options !== "object") {
        options = this._options || {};
      }
      options.createIfMissing = options.createIfMissing !== false;
      options.errorIfExists = !!options.errorIfExists;
      if (callback) {
        that = this;
        return this._open(options, function(err, result) {
          if (err == null) {
            that.setOpened(true, options);
          }
          return callback(err, result);
        });
      } else {
        return this.openSync(options);
      }
    };

    AbstractNoSQL.prototype.close = function(callback) {
      var that;
      if (callback) {
        if (typeof callback === "function") {
          that = this;
          return this._close(function(err, result) {
            if (err == null) {
              that.setOpened(false);
            }
            return callback(err, result);
          });
        } else {
          throw new Error("close() requires callback function argument");
        }
      } else {
        return this.closeSync();
      }
    };

    AbstractNoSQL.prototype.isExists = function(key, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (!this._isBuffer(key)) {
        key = String(key);
      }
      if (callback) {
        return this._isExists(key, options, callback);
      } else {
        return this.isExistsSync(key, options);
      }
    };

    AbstractNoSQL.prototype.mGet = function(keys, options, callback) {
      var err;
      err = void 0;
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (callback) {
        return this._mGet(keys, options, function(err, arr) {
          var i, result;
          if (err) {
            return callback(err);
          }
          i = 0;
          result = [];
          while (i < arr.length) {
            result.push({
              key: arr[i],
              value: arr[++i]
            });
            i++;
          }
          return callback(null, result);
        });
      } else {
        return this.mGetSync(keys, options);
      }
    };

    AbstractNoSQL.prototype.get = function(key, options, callback) {
      var err;
      err = void 0;
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (err = this._checkKey(key, "key", this._isBuffer)) {
        if (callback) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (!this._isBuffer(key)) {
        key = String(key);
      }
      options.asBuffer = options.asBuffer !== false;
      if (callback) {
        return this._get(key, options, callback);
      } else {
        return this.getSync(key, options);
      }
    };

    AbstractNoSQL.prototype.put = function(key, value, options, callback) {
      var err;
      err = void 0;
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (err = this._checkKey(key, "key", this._isBuffer)) {
        if (callback) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (!this._isBuffer(key)) {
        key = String(key);
      }
      if ((value != null) && !this._isBuffer(value) && !process.browser) {
        value = String(value);
      }
      if (callback) {
        return this._put(key, value, options, callback);
      } else {
        return this.putSync(key, value, options);
      }
    };

    AbstractNoSQL.prototype.del = function(key, options, callback) {
      var err;
      err = void 0;
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (err = this._checkKey(key, "key", this._isBuffer)) {
        if (callback) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (!this._isBuffer(key)) {
        key = String(key);
      }
      if (callback) {
        return this._del(key, options, callback);
      } else {
        return this.delSync(key, options);
      }
    };

    AbstractNoSQL.prototype.batch = function(array, options, callback) {
      var e, err, vError, _i, _len;
      if (!arguments.length) {
        return this._chainedBatch();
      }
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        if (options == null) {
          options = {};
        }
      }
      if (typeof array === "function") {
        callback = array;
      }
      if (!Array.isArray(array)) {
        vError = new Error("batch(array) requires an array argument");
        if (callback) {
          return callback(vError);
        } else {
          throw vError;
        }
      }
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        e = array[_i];
        if (typeof e !== "object") {
          continue;
        }
        if (err = this._checkKey(e.type, "type", this._isBuffer)) {
          if (callback) {
            return callback(err);
          } else {
            throw err;
          }
        }
        if (err = this._checkKey(e.key, "key", this._isBuffer)) {
          if (callback) {
            return callback(err);
          } else {
            throw err;
          }
        }
      }
      if (callback) {
        return this._batch(array, options, callback);
      } else {
        return this.batchSync(array, options);
      }
    };

    AbstractNoSQL.prototype.approximateSize = function(start, end, callback) {
      if ((start == null) || (end == null) || typeof start === "function" || typeof end === "function") {
        throw new Error("approximateSize() requires valid `start`, `end` and `callback`(for async) arguments");
      }
      if (!this._isBuffer(start)) {
        start = String(start);
      }
      if (!this._isBuffer(end)) {
        end = String(end);
      }
      if (callback) {
        return this._approximateSize(start, end, callback);
      } else {
        return this.approximateSizeSync(start, end);
      }
    };

    AbstractNoSQL.prototype._setupIteratorOptions = function(options) {
      var end, endOp, range, self, skipEnd, skipStart, start, startOp;
      self = this;
      options = xtend(options);
      ["start", "end", "gt", "gte", "lt", "lte"].forEach(function(o) {
        if (options[o] && self._isBuffer(options[o]) && options[o].length === 0) {
          return delete options[o];
        }
      });
      options.reverse = !!options.reverse;
      range = options.range;
      if (isString(range)) {
        range = range.trim();
        if (range.length >= 2) {
          skipStart = !options.reverse ? range[0] === "(" : range[range.length - 1] === ")";
          skipEnd = !options.reverse ? range[range.length - 1] === ")" : range[0] === "(";
          range = range.substring(1, range.length - 1);
          range = range.split(",").map(function(item) {
            item = item.trim();
            if (item === "") {
              item = null;
            }
            return item;
          });
          if (!options.reverse) {
            start = range[0], end = range[1];
            startOp = 'gt';
            endOp = 'lt';
          } else {
            end = range[0], start = range[1];
            startOp = 'lt';
            endOp = 'gt';
          }
          if (!skipStart) {
            startOp = startOp + 'e';
          }
          if (!skipEnd) {
            endOp = endOp + 'e';
          }
          options[startOp] = start;
          options[endOp] = end;
        }
      }
      options.keys = options.keys !== false;
      options.values = options.values !== false;
      options.limit = ("limit" in options ? options.limit : -1);
      options.keyAsBuffer = options.keyAsBuffer === true;
      options.valueAsBuffer = options.valueAsBuffer === true;
      return options;
    };

    AbstractNoSQL.prototype.IteratorClass = AbstractIterator;

    AbstractNoSQL.prototype.iterator = function(options) {
      if (typeof options !== "object") {
        options = {};
      }
      options = this._setupIteratorOptions(options);
      if (typeof this._iterator === "function") {
        return this._iterator(options);
      }
      return new this.IteratorClass(this, options);
    };

    AbstractNoSQL.prototype._chainedBatch = function() {
      return new AbstractChainedBatch(this);
    };

    AbstractNoSQL.prototype._isBuffer = function(obj) {
      return Buffer.isBuffer(obj);
    };

    AbstractNoSQL.prototype._checkKey = function(obj, type) {
      if (obj == null) {
        return new InvalidArgumentError(type + " cannot be `null` or `undefined`");
      }
      if (this._isBuffer(obj)) {
        if (obj.length === 0) {
          return new InvalidArgumentError(type + " cannot be an empty Buffer");
        }
      } else {
        if (String(obj) === "") {
          return new InvalidArgumentError(type + " cannot be an empty String");
        }
      }
    };

    AbstractNoSQL.prototype.isOpen = function() {
      return !!this._opened;
    };

    AbstractNoSQL.prototype.readStream = function(options, makeData) {
      var opt;
      if (ReadStream) {
        opt = xtend(this._options, options);
        return ReadStream(this, opt, makeData);
      } else {
        return console.error("please `npm install nosql-stream` first");
      }
    };

    AbstractNoSQL.prototype.createReadStream = AbstractNoSQL.prototype.readStream;

    AbstractNoSQL.prototype.valueStream = function(options, makeData) {
      var opt;
      opt = xtend(options);
      opt.keys = false;
      return this.readStream(opt, makeData);
    };

    AbstractNoSQL.prototype.createValueStream = AbstractNoSQL.prototype.valueStream;

    AbstractNoSQL.prototype.keyStream = function(options, makeData) {
      var opt;
      opt = xtend(options);
      opt.values = false;
      return this.readStream(opt, makeData);
    };

    AbstractNoSQL.prototype.createKeyStream = AbstractNoSQL.prototype.keyStream;

    AbstractNoSQL.prototype.writeStream = function(options) {
      var opt;
      if (WriteStream) {
        opt = xtend(this._options, options);
        return WriteStream(this, opt);
      } else {
        return console.error("please `npm install nosql-stream` first");
      }
    };

    AbstractNoSQL.prototype.createWriteStream = AbstractNoSQL.prototype.writeStream;

    return AbstractNoSQL;

  })();

  module.exports.AbstractLevelDOWN = AbstractNoSQL;

  module.exports.AbstractIterator = AbstractIterator;

  module.exports.AbstractChainedBatch = AbstractChainedBatch;

}).call(this);
