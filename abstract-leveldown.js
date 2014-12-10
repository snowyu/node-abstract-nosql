/* Copyright (c) 2013 Rod Vagg, MIT License */
var xtend                = require('xtend')
  , Errors               = require('./abstract-error')
  , AbstractError        = Errors.AbstractError
  , NotImplementedError  = Errors.NotImplementedError
  , AbstractIterator     = require('./abstract-iterator')
  , AbstractChainedBatch = require('./abstract-chained-batch')
  , setImmediate         = global.setImmediate || process.nextTick


function AbstractNoSQL (location) {
  //not all database have the location argument.
  if (location && typeof location != 'string')
    throw new Error('constructor requires a location string argument')
  this.location = location
}

//the optimal low-level sync functions:
AbstractNoSQL.prototype.isExistsSync = function (key, options) {
  if (this._isExistsSync) {
    var result = this._isExistsSync(key, options)
    return result
  } else if (this._getSync) try {
    this._getSync(key, options)
    return true
  } catch(err) {
    //if (/^NotFound/.test(err.message))
    if (AbstractError.isNotFound(err))
      return false
    else
      throw err
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.getSync = function (key, options) {
  if (this._getSync) {
    var result = this._getSync(key, options)
    return result
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.putSync = function (key, value, options) {
  if (this._putSync) {
    var result = this._putSync(key, value, options)
    return result
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.delSync = function (key, options) {
  if (this._delSync) {
    var result = this._delSync(key, options)
    return result
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.batchSync = function (operations, options) {
  if (this._batchSync) {
    var result = this._batchSync(operations, options)
    return result
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.approximateSizeSync = function (start, end) {
  if (this._approximateSizeSync) {
    var result = this._approximateSizeSync(start, end)
    return result
  }
  throw new NotImplementedError()
}

AbstractNoSQL.prototype.openSync = function (options) {
  if (this._openSync) {
    var result = this._openSync(options)
    return result
  }
  throw new NotImplementedError()
}

//if successful should return true.
AbstractNoSQL.prototype.closeSync = function () {
  if (this._closeSync) {
    var result = this._closeSync()
    return result
  }
  throw new NotImplementedError()
}

//the async methods simulated by sync methods:
//the derived class can override these methods to implement the real async methods for better performance.
AbstractNoSQL.prototype._open = function (options, callback) {
  var that = this
  if (this._openSync) setImmediate(function() {
    var result
    try {
      result = that._openSync(options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
AbstractNoSQL.prototype._close = function (callback) {
  var that = this
  if (this._closeSync) setImmediate(function() {
    var result
    try {
      result = that._closeSync()
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
AbstractNoSQL.prototype._isExists = function (key, options, callback) {
  var that = this
  if (this._isExistsSync) setImmediate(function() {
    var result
    try {
      result = that._isExistsSync(key, options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else this._get(key, options, function(err, value){
    if (err) {
      if (AbstractError.isNotFound(err))
        callback(null, false)
      else
        callback(err)
    } else
      callback(null, true)
  })
}
AbstractNoSQL.prototype._get = function (key, options, callback) {
  var that = this
  if (this._getSync) setImmediate(function() {
    var result
    try {
      result = that._getSync(key, options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
AbstractNoSQL.prototype._put = function (key, value, options, callback) {
  var that = this
  if (this._putSync) setImmediate(function() {
    var result
    try {
      result = that._putSync(key, value, options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
AbstractNoSQL.prototype._del = function (key, options, callback) {
  var that = this
  if (this._delSync) setImmediate(function() {
    var result
    try {
      result = that._delSync(key, options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
AbstractNoSQL.prototype._batch = function (array, options, callback) {
  var that = this
  if (this._batchSync) setImmediate(function() {
    var result
    try {
      result = that._batchSync(array, options)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
//TODO: remove from here, not a necessary primitive
AbstractNoSQL.prototype._approximateSize = function (start, end, callback) {
  var that = this
  if (this._approximateSizeSync) setImmediate(function() {
    var result
    try {
      result = that._approximateSizeSync(start, end)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  else
    setImmediate(callback)
}
//slower impl:
/*
AbstractNoSQL.prototype._exec = function (fn, args, callback) {
  var that = this
  if (fn) setImmediate(function() {
    var result
    try {
      result = fn.apply(that, args)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, result)
  })
  setImmediate(callback)
}
AbstractNoSQL.prototype._open = function (options, callback) {
  this._exec(this._openSync, [options], callback)
}
*/
AbstractNoSQL.prototype.open = function (options, callback) {
  if (typeof options == 'function')
    callback = options

  if (typeof options != 'object')
    options = {}

  options.createIfMissing = options.createIfMissing != false
  options.errorIfExists = !!options.errorIfExists

  if (callback)
    this._open(options, callback)
  else
    return this.openSync(options)
}

AbstractNoSQL.prototype.close = function (callback) {
  if (callback) {
    if (typeof callback === 'function')
      this._close(callback)
    else
      throw new Error('close() requires callback function argument')
  }
  else
    return this.closeSync()
}

AbstractNoSQL.prototype.isExists = function (key, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  if (!this._isBuffer(key))
    key = String(key)

  if (callback) {
    this._isExists(key, options, callback)
  } else {
    return this.isExistsSync(key, options)
  }
}

AbstractNoSQL.prototype.get = function (key, options, callback) {
  var err

  if (typeof options == 'function')
    callback = options

  if (err = this._checkKey(key, 'key', this._isBuffer)) {
    if (callback)
      return callback(err)
    else
      throw err
  }

  if (!this._isBuffer(key))
    key = String(key)

  if (typeof options != 'object')
    options = {}

  options.asBuffer = options.asBuffer != false

  if (callback) {
    this._get(key, options, callback)
  } else {
    return this.getSync(key, options)
  }
}

AbstractNoSQL.prototype.put = function (key, value, options, callback) {
  var err

  if (typeof options == 'function')
    callback = options

  if (err = this._checkKey(key, 'key', this._isBuffer)) {
    if (callback)
      return callback(err)
    else
      throw err
  }

  if (!this._isBuffer(key))
    key = String(key)

  // coerce value to string in node, don't touch it in browser
  // (indexeddb can store any JS type)
  if (value != null && !this._isBuffer(value) && !process.browser)
    value = String(value)

  if (typeof options != 'object')
    options = {}

  if (callback) {
    this._put(key, value, options, callback)
  } else {
    return this.putSync(key, value, options)
  }
}

AbstractNoSQL.prototype.del = function (key, options, callback) {
  var err

  if (typeof options == 'function')
    callback = options

  if (err = this._checkKey(key, 'key', this._isBuffer)) {
    if (callback)
      return callback(err)
    else
      throw err
  }

  if (!this._isBuffer(key))
    key = String(key)

  if (typeof options != 'object')
    options = {}

  if (callback) {
    this._del(key, options, callback)
  }
  else {
    return this.delSync(key, options)
  }
}

AbstractNoSQL.prototype.batch = function (array, options, callback) {
  if (!arguments.length)
    return this._chainedBatch()

  if (typeof options == 'function')
    callback = options

  if (typeof array == 'function')
    callback = array

  if (!Array.isArray(array)) {
    var vError = new Error('batch(array) requires an array argument')
    if (callback)
      return callback(vError)
    else
      throw vError
  }

  if (!options || typeof options != 'object')
    options = {}

  var i = 0
    , l = array.length
    , e
    , err

  for (; i < l; i++) {
    e = array[i]
    if (typeof e != 'object')
      continue

    if (err = this._checkKey(e.type, 'type', this._isBuffer)) {
      if (callback)
        return callback(err)
      else
        throw err
    }

    if (err = this._checkKey(e.key, 'key', this._isBuffer))
      if (callback)
        return callback(err)
      else
        throw err
  }

  if (callback) {
    this._batch(array, options, callback)
  } else {
    return this.batchSync(array, options)
  }
}

//TODO: remove from here, not a necessary primitive
AbstractNoSQL.prototype.approximateSize = function (start, end, callback) {
  if (   start == null
      || end == null
      || typeof start == 'function'
      || typeof end == 'function') {
    throw new Error('approximateSize() requires valid `start`, `end` and `callback`(for async) arguments')
  }

  if (!this._isBuffer(start))
    start = String(start)

  if (!this._isBuffer(end))
    end = String(end)

  if(callback)
    this._approximateSize(start, end, callback)
  else
    return this.approximateSize(start, end)
}

AbstractNoSQL.prototype._setupIteratorOptions = function (options) {
  var self = this

  options = xtend(options)

  ;[ 'start', 'end', 'gt', 'gte', 'lt', 'lte' ].forEach(function (o) {
    if (options[o] && self._isBuffer(options[o]) && options[o].length === 0)
      delete options[o]
  })

  options.reverse = !!options.reverse
  options.keys = options.keys != false
  options.values = options.values != false
  options.limit = 'limit' in options ? options.limit : -1
  options.keyAsBuffer = options.keyAsBuffer != false
  options.valueAsBuffer = options.valueAsBuffer != false

  return options
}

//should override this to test sync
AbstractNoSQL.prototype.IteratorClass = AbstractIterator

AbstractNoSQL.prototype.iterator = function (options) {
  if (typeof options != 'object')
    options = {}

  options = this._setupIteratorOptions(options)

  if (typeof this._iterator == 'function')
    return this._iterator(options)

  return new this.IteratorClass(this)
}

AbstractNoSQL.prototype._chainedBatch = function () {
  return new AbstractChainedBatch(this)
}

AbstractNoSQL.prototype._isBuffer = function (obj) {
  return Buffer.isBuffer(obj)
}

AbstractNoSQL.prototype._checkKey = function (obj, type) {

  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')

  if (this._isBuffer(obj)) {
    if (obj.length === 0)
      return new Error(type + ' cannot be an empty Buffer')
  } else if (String(obj) === '')
    return new Error(type + ' cannot be an empty String')
}

module.exports.AbstractLevelDOWN    = AbstractNoSQL
module.exports.AbstractNoSQL        = AbstractNoSQL
module.exports.AbstractIterator     = AbstractIterator
module.exports.AbstractChainedBatch = AbstractChainedBatch
