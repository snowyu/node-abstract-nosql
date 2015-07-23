# Copyright (c) 2013 Rod Vagg, MIT License
# Copyright (c) 2014 Riceball LEE, MIT License
xtend                 = require("xtend")
AbstractObject        = require("abstract-object")
Codec                 = require("buffer-codec")
utf8ByteLength        = Codec.getByteLen
Errors                = require("./abstract-error")
try AbstractIterator  = require("abstract-iterator")
AbstractChainedBatch  = require("./abstract-chained-batch")
setImmediate          = global.setImmediate or process.nextTick

AbstractError         = Errors.AbstractError
NotImplementedError   = Errors.NotImplementedError
InvalidArgumentError  = Errors.InvalidArgumentError
OpenError             = Errors.OpenError
CloseError            = Errors.CloseError
inherits              = require("inherits-ex/lib/inherits")
isString              = require("util-ex/lib/is/type/string")
isFunction            = require("util-ex/lib/is/type/function")
isArray               = require("util-ex/lib/is/type/array")

module.exports = class AbstractNoSQL
  inherits AbstractNoSQL, AbstractObject

  constructor: ->
    super
  initialize:(location) ->
    #not all database have the location argument.
    if location and typeof location isnt "string"
      throw new InvalidArgumentError("constructor requires a location string argument")
    @location = location
  finalize: ->
    if @_opened
      if @_closeSync then @closeSync()
      else @closeAsync()
    @_options = null

  @::__defineGetter__ "opened", ->
    !!@_opened

  setOpened: (aValue, options)->
    if aValue
      @_opened = true
      @_options = options if options
    else
      @_opened = false

  #the optimal low-level sync functions:
  isExistsSync: (key, options) ->
    options = {} unless options?
    key = String(key)  unless @_isBuffer(key)
    if @_isExistsSync
      result = @_isExistsSync(key, options)
      return result
    else if @_getSync
      try
        @_getSync key, options
        return true
      catch err
        if AbstractError.isNotFound(err)
          return false
        else
          throw err
    throw new NotImplementedError()
  isExistSync: @::isExistsSync

  getSync: (key, options) ->
    if @_getSync
      options = {} unless options?
      throw err if err = @_checkKey(key, "key")
      key = String(key)  unless @_isBuffer(key) #TODO should move to low-level db.
      result = @_getSync(key, options)
      return result
    throw new NotImplementedError()

  getBufferSync: (key, destBuffer, options) ->
    if @_getBufferSync
      options = {} unless options?
      options.offset = 0 unless options.offset?
      result = @_getBufferSync(key, destBuffer, options)
      return result
    throw new NotImplementedError()

  mGetSync: (keys, options) ->
    if @_mGetSync
      options = {} unless options?
      options.raiseError = options.raiseError isnt false
      needKeyName = options.keys
      arr = @_mGetSync(keys, options)
      i = 0
      result = []
      while i < arr.length
        if needKeyName isnt false
          result.push
            key: arr[i]
            value: arr[++i]
        else
          result.push arr[i]
        i++
      return result
    throw new NotImplementedError()

  putSync: (key, value, options) ->
    if @_putSync
      options = {} unless options?
      result = @_putSync(key, value, options)
      return result
    throw new NotImplementedError()

  delSync: (key, options) ->
    if @_delSync
      options = {} unless options?
      result = @_delSync(key, options)
      return result
    throw new NotImplementedError()

  batchSync: (operations, options) ->
    if @_batchSync
      options = {} unless options?
      unless isArray(operations)
        throw new InvalidArgumentError("batch(operations) requires an array argument")
      for e in operations
        continue unless typeof e is "object"
        throw err if err = @_checkKey(e.type, "type")
        throw err if err = @_checkKey(e.key, "key")
      result = @_batchSync(operations, options)
      return result
    throw new NotImplementedError()

  approximateSizeSync: (start, end) ->
    if @_approximateSizeSync
      if not start? or not end?
        throw new InvalidArgumentError "
        approximateSize() requires valid `start`, `end` arguments"
      start = String(start)  unless @_isBuffer(start)
      end = String(end)  unless @_isBuffer(end)
      result = @_approximateSizeSync(start, end)
      return result
    throw new NotImplementedError()

  openSync: (options) ->
    if @_openSync
      options = @_options || {} unless options?
      options.createIfMissing = options.createIfMissing isnt false
      options.errorIfExists = !!options.errorIfExists
      result = @_openSync(options)
      @setOpened true, options if result
      result = @ if result
      return result
    throw new NotImplementedError()


  #if successful should return true.
  closeSync: ->
    if @_closeSync
      result = @_closeSync()
      @setOpened false if result
      return result
    throw new NotImplementedError()


  #the async methods simulated by sync methods:
  #the derived class can override these methods to implement
  #the real async methods for better performance.
  _open: (options, callback) ->
    that = this
    if @_openSync
      setImmediate ->
        result = undefined
        try
          result = that._openSync(options)
        catch err
          callback err
          return
        if result
          callback null, result
        else
          callback new OpenError("can not open database.")

    else
      setImmediate callback

  _close: (callback) ->
    that = this
    if @_closeSync
      setImmediate ->
        result = undefined
        try
          result = that._closeSync()
        catch err
          callback err
          return
        if result
          callback null, result
        else
          callback new CloseError("can not close database.")

    else
      setImmediate callback

  _isExists: (key, options, callback) ->
    that = this
    if @_isExistsSync
      setImmediate ->
        result = undefined
        try
          result = that._isExistsSync(key, options)
        catch err
          callback err
          return
        callback null, result

    else
      @_get key, options, (err, value) ->
        if err
          if AbstractError.isNotFound(err)
            callback null, false
          else
            callback err
        else
          callback null, true

  _getBuffer: (key, destBuffer, options, callback) ->
    that = this
    if @_getSync or @_getBufferSync isnt AbstractNoSQL::_getBufferSync
      setImmediate ->
        result = undefined
        try
          result = that._getBufferSync(key, destBuffer, options)
        catch err
          callback err
          return
        callback null, result
    else if @_get
      @_get key, options, (err, value)->
        return callback(err) if err
        result = utf8ByteLength(value)
        if destBuffer
          result = Math.min(result, destBuffer.length)
          result = destBuffer.write(value, options.offset, result) if result
        callback null, result
    else
      setImmediate callback

  _getBufferSync: (key, destBuffer, options) ->
    if @_getSync
      value = @_getSync(key, options)
      result = utf8ByteLength(value)
      if destBuffer
        result = Math.min(result, destBuffer.length)
        result = destBuffer.write(value, options.offset, result) if result
      return result
    else
      throw new NotImplementedError('_mGetSync: _getSync is not implemented.')

  _mGetSync: (keys, options) ->
    if @_getSync
      result = []
      needKeyName = options.keys
      raiseError  = options.raiseError
      options.asBuffer = options.asBuffer is true
      for key in keys
        try
          value = @_getSync(key, options)
        catch err
          throw err if raiseError
          value = undefined
        if needKeyName isnt false
          result.push key, value
        else
          result.push value
      return result
    else
      throw new NotImplementedError('_mGetSync: _getSync is not implemented.')

  _mGet: (keys, options, callback) ->
    that = this
    if @_getSync or @_mGetSync isnt AbstractNoSQL::_mGetSync
      setImmediate ->
        result = undefined
        try
          result = that._mGetSync keys, options
        catch err
          callback err
          return
        callback null, result
    else if keys.length > 0 and @_get
      result = []
      i = 0
      needKeyName = options.keys
      raiseError  = options.raiseError

      readNext = (err, value)->
        return callback(err) if err and raiseError

        if needKeyName isnt false
          result.push keys[i], value
        else
          result.push value
        i++
        return callback(null, result) if i >= keys.length
        that._get keys[i], options, readNext
      @_get keys[i], options, readNext
    else
      setImmediate callback

  _get: (key, options, callback) ->
    that = this
    if @_getSync
      setImmediate ->
        result = undefined
        try
          result = that._getSync(key, options)
        catch err
          callback err
          return
        callback null, result

    else
      setImmediate callback

  _put: (key, value, options, callback) ->
    that = this
    if @_putSync
      setImmediate ->
        result = undefined
        try
          result = that._putSync(key, value, options)
        catch err
          callback err
          return
        callback null, result

    else
      setImmediate callback

  _del: (key, options, callback) ->
    that = this
    if @_delSync
      setImmediate ->
        result = undefined
        try
          result = that._delSync(key, options)
        catch err
          callback err
          return
        callback null, result

    else
      setImmediate callback

  _batch: (array, options, callback) ->
    that = this
    if @_batchSync
      setImmediate ->
        result = undefined
        try
          result = that._batchSync(array, options)
        catch err
          callback err
          return
        callback null, result

    else
      setImmediate callback


  #TODO: remove from here, not a necessary primitive
  _approximateSize: (start, end, callback) ->
    that = this
    if @_approximateSizeSync
      setImmediate ->
        result = undefined
        try
          result = that._approximateSizeSync(start, end)
        catch err
          callback err
          return
        callback null, result
    else
      setImmediate callback


  #slower impl:
  #
  #_exec: (fn, args, callback) ->
  #  that = this
  #  if fn then setImmediate ->
  #      result
  #    try
  #      result = fn.apply(that, args)
  #    catch (err)
  #      callback(err)
  #      return
  #
  #    callback(null, result)
  #  else
  #    setImmediate(callback)
  #
  #_open: (options, callback) ->
  #  this._exec(this._openSync, [options], callback)
  #
  #
  openAsync: (options, callback) ->
    options = {} unless options?
    options.createIfMissing = options.createIfMissing isnt false
    options.errorIfExists = !!options.errorIfExists
    that = this
    @_open options, (err, result) ->
      that.setOpened true, options if not err?
      callback err, result
  open: (options, callback) ->
    if isFunction options
      callback = options
      options = undefined
    if callback
      @openAsync options, callback
    else
      @openSync options

  closeAsync: (callback) ->
    that = this
    callback = undefined unless isFunction callback
    @_close (err, result) ->
      return callback err if err
      that.setOpened false
      callback null, result if callback
  close: (callback) ->
    if callback
      @closeAsync callback
    else
      @closeSync()

  isExistsAsync: (key, options, callback) ->
    options = {} unless options?
    key = String(key)  unless @_isBuffer(key)
    @_isExists key, options, callback
  isExists: (key, options, callback) ->
    if isFunction options
      callback = options
      options = {}
    else
    if callback
      @isExistsAsync key, options, callback
    else
      @isExistsSync key, options
  isExist: @::isExists

  getBufferAsync: (key, destBuffer, options, callback) ->
    options = {} unless options?
    options.offset = 0 unless options.offset?
    @_getBuffer key, destBuffer, options, callback
  getBuffer: (key, destBuffer, options, callback) ->
    err = undefined
    if isFunction options
      callback = options
      options = {}
    if callback
      @getBufferAsync key, destBuffer, options, callback
    else
      @getBufferSync key, destBuffer, options

  mGetAsync: (keys, options, callback) ->
    options = {} unless options?
    options.asBuffer = options.asBuffer is true
    options.raiseError = options.raiseError isnt false
    needKeyName = options.keys isnt false
    @_mGet keys, options, (err, arr)->
      return callback(err) if err
      if needKeyName
        i = 0
        result = []
        while i < arr.length
          result.push
            key: arr[i]
            value: arr[++i]
          i++
      else
        result = arr
      callback null, result
  mGet: (keys, options, callback) ->
    err = undefined
    if isFunction options
      callback = options
      options = {}
    else
    if callback
      @mGetAsync keys, options, callback
    else
      @mGetSync keys, options

  getAsync: (key, options, callback) ->
    options = {} unless options?
    return callback(err) if err = @_checkKey(key, "key")
    key = String(key)  unless @_isBuffer(key)
    options.asBuffer = options.asBuffer is true
    @_get key, options, callback
  get: (key, options, callback) ->
    err = undefined
    if isFunction options
      callback = options
      options = {}
    if callback
      @getAsync key, options, callback
    else
      @getSync key, options

  putAsync: (key, value, options, callback) ->
    options = {} unless options?
    return callback(err) if err = @_checkKey(key, "key", @_isBuffer)
    key = String(key)  unless @_isBuffer(key)
    # coerce value to string in node, don't touch it in browser
    # (indexeddb can store any JS type)
    value = String(value)  if value? and not @_isBuffer(value) and not process.browser
    @_put key, value, options, callback

  put: (key, value, options, callback) ->
    err = undefined
    if isFunction options
      callback = options
      options = {}
    if callback
      @putAsync key, value, options, callback
    else
      @putSync key, value, options

  delAsync: (key, options, callback) ->
    options = {} unless options?
    return callback(err) if err = @_checkKey(key, "key", @_isBuffer)
    key = String(key)  unless @_isBuffer(key)
    @_del key, options, callback
  del: (key, options, callback) ->
    err = undefined
    if isFunction options
      callback = options
      options = {}
    if callback
      @delAsync key, options, callback
    else
      @delSync key, options

  batchAsync: (array, options, callback) ->
    options = {} unless options?
    unless isArray(array)
      vError = new InvalidArgumentError("batch(array) requires an array argument")
      return callback(vError)
    for e in array
      continue unless typeof e is "object"
      return callback(err) if err = @_checkKey(e.type, "type")
      return callback(err) if err = @_checkKey(e.key, "key")
    @_batch array, options, callback
  batch: (array, options, callback) ->
    return @_chainedBatch()  unless arguments.length
    if isFunction options
      callback = options
      options = {}
    callback = array if isFunction array
    if callback
      @batchAsync array, options, callback
    else
      @batchSync array, options


  #TODO: remove from here, not a necessary primitive
  approximateSizeAsync: (start, end, callback) ->
    start = String(start)  unless @_isBuffer(start)
    end = String(end)  unless @_isBuffer(end)
    @_approximateSize start, end, callback
  approximateSize: (start, end, callback) ->
    if not start? or not end? or isFunction(start) or isFunction(end)
      throw new InvalidArgumentError "
      approximateSize() requires valid `start`, `end` and `callback`(for async) arguments"
    if callback
      @approximateSizeAsync start, end, callback
    else
      @approximateSizeSync start, end

  #should override this to test sync or if you do not wanna
  #implement the _iterator function.
  IteratorClass: AbstractIterator
  iterator: (options) ->
    options = {}  unless typeof options is "object"
    if @IteratorClass
      return new @IteratorClass(this, options)
    else if isFunction @_iterator
      console.error "_iterator is deprecated. please use the IteratorClass instead."
      return @_iterator(options)
    throw new NotImplementedError()

  _chainedBatch: ->
    new AbstractChainedBatch(this)

  _isBuffer: (obj) ->
    Buffer.isBuffer obj

  _checkKey: (obj, type) ->
    if not obj?
      return new InvalidArgumentError(type + " cannot be `null` or `undefined`")
    if @_isBuffer(obj)
      if obj.length is 0
        return new InvalidArgumentError(type + " cannot be an empty Buffer")
    else if String(obj) is ""
      return new InvalidArgumentError(type + " cannot be an empty String")

  isOpen: ->
    !!@_opened

module.exports.AbstractNoSQL = AbstractNoSQL
module.exports.__defineGetter__ "AbstractLevelDOWN", ->
  console.error "AbstractLevelDOWN is deprecated. use AbstractNoSQL instead."
  AbstractNoSQL
module.exports.__defineGetter__ "AbstractIterator", ->
  console.error "AbstractIterator is deprecated. it's moved to abstract-iterator."
  console.error "first `npm install abstract-iterator`" unless AbstractIterator
  AbstractIterator
#module.exports.AbstractIterator = AbstractIterator
module.exports.AbstractChainedBatch = AbstractChainedBatch
