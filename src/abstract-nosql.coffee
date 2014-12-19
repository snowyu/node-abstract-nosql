# Copyright (c) 2013 Rod Vagg, MIT License
# Copyright (c) 2014 Riceball LEE, MIT License
xtend                 = require("xtend")
AbstractObject        = require("abstract-object")
util                  = require("abstract-object/lib/util")
inherits              = util.inherits
Errors                = require("./abstract-error")
AbstractIterator      = require("./abstract-iterator")
AbstractChainedBatch  = require("./abstract-chained-batch")
setImmediate          = global.setImmediate or process.nextTick

AbstractError         = Errors.AbstractError
NotImplementedError   = Errors.NotImplementedError
InvalidArgumentError  = Errors.InvalidArgumentError
OpenError             = Errors.OpenError
CloseError            = Errors.CloseError

module.exports.AbstractNoSQL = class AbstractNoSQL
  inherits AbstractNoSQL, AbstractObject

  constructor: ->
    super
  init:(location) ->
    #not all database have the location argument.
    throw new InvalidArgumentError("constructor requires a location string argument")  if location and typeof location isnt "string"
    @location = location

  @::__defineGetter__ "opened", ->
    !!@_opened

  setOpened: (aValue)->
    if aValue
      @_opened = true
      @emit "ready"
      @emit "open"
    else
      @_opened = false
      @emit "closed"
      
  #the optimal low-level sync functions:
  isExistsSync: (key, options) ->
    options = {} unless options?
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

  getSync: (key, options) ->
    if @_getSync
      options = {} unless options?
      result = @_getSync(key, options)
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
      result = @_batchSync(operations, options)
      return result
    throw new NotImplementedError()

  approximateSizeSync: (start, end) ->
    if @_approximateSizeSync
      result = @_approximateSizeSync(start, end)
      return result
    throw new NotImplementedError()

  openSync: (options) ->
    if @_openSync
      options = {} unless options?
      result = @_openSync(options)
      @setOpened true if result
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
  #the derived class can override these methods to implement the real async methods for better performance.
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
  open: (options, callback) ->
    callback = options  if typeof options is "function"
    options = {}  unless typeof options is "object"
    options.createIfMissing = options.createIfMissing isnt false
    options.errorIfExists = !!options.errorIfExists
    if callback
      that = this
      @_open options, (err, result) ->
        that.setOpened true if not err?
        callback err, result

    else
      @openSync options

  close: (callback) ->
    if callback
      if typeof callback is "function"
        that = this
        @_close (err, result) ->
          that.setOpened false if not err?
          callback err, result

      else
        throw new Error("close() requires callback function argument")
    else
      @closeSync()

  isExists: (key, options, callback) ->
    if typeof options is "function"
      callback = options
      options = {}
    else
      options = {} unless options?
    key = String(key)  unless @_isBuffer(key)
    if callback
      @_isExists key, options, callback
    else
      @isExistsSync key, options

  get: (key, options, callback) ->
    err = undefined
    callback = options  if typeof options is "function"
    if err = @_checkKey(key, "key", @_isBuffer)
      if callback
        return callback(err)
      else
        throw err
    key = String(key)  unless @_isBuffer(key)
    options = {}  unless typeof options is "object"
    options.asBuffer = options.asBuffer isnt false
    if callback
      @_get key, options, callback
    else
      @getSync key, options

  put: (key, value, options, callback) ->
    err = undefined
    if typeof options is "function"
      callback = options
      options = {}
    else
      options = {} unless options?
    if err = @_checkKey(key, "key", @_isBuffer)
      if callback
        return callback(err)
      else
        throw err
    key = String(key)  unless @_isBuffer(key)
  
    # coerce value to string in node, don't touch it in browser
    # (indexeddb can store any JS type)
    value = String(value)  if value? and not @_isBuffer(value) and not process.browser
    if callback
      @_put key, value, options, callback
    else
      @putSync key, value, options

  del: (key, options, callback) ->
    err = undefined
    if typeof options is "function"
      callback = options
      options = {}
    else
      options = {} unless options?
    if err = @_checkKey(key, "key", @_isBuffer)
      if callback
        return callback(err)
      else
        throw err
    key = String(key)  unless @_isBuffer(key)
    if callback
      @_del key, options, callback
    else
      @delSync key, options

  batch: (array, options, callback) ->
    return @_chainedBatch()  unless arguments.length
    if typeof options is "function"
      callback = options
      options = {}
    else
      options = {} unless options?
    callback = array  if typeof array is "function"
    unless Array.isArray(array)
      vError = new Error("batch(array) requires an array argument")
      if callback
        return callback(vError)
      else
        throw vError
    for e in array
      continue unless typeof e is "object"
      if err = @_checkKey(e.type, "type", @_isBuffer)
        if callback
          return callback(err)
        else
          throw err
      if err = @_checkKey(e.key, "key", @_isBuffer)
        if callback
          return callback(err)
        else
          throw err
    if callback
      @_batch array, options, callback
    else
      @batchSync array, options


  #TODO: remove from here, not a necessary primitive
  approximateSize: (start, end, callback) ->
    throw new Error("approximateSize() requires valid `start`, `end` and `callback`(for async) arguments")  if not start? or not end? or typeof start is "function" or typeof end is "function"
    start = String(start)  unless @_isBuffer(start)
    end = String(end)  unless @_isBuffer(end)
    if callback
      @_approximateSize start, end, callback
    else
      @approximateSizeSync start, end

  _setupIteratorOptions: (options) ->
    self = this
    options = xtend(options)
    ["start", "end", "gt", "gte", "lt", "lte"].forEach (o) ->
      delete options[o]  if options[o] and self._isBuffer(options[o]) and options[o].length is 0

    options.reverse = !!options.reverse
    options.keys = options.keys isnt false
    options.values = options.values isnt false
    options.limit = (if "limit" of options then options.limit else -1)
    options.keyAsBuffer = options.keyAsBuffer is true
    options.valueAsBuffer = options.valueAsBuffer is true
    options


  #should override this to test sync or if you do not wanna implement the _iterator function.
  IteratorClass: AbstractIterator
  iterator: (options) ->
    options = {}  unless typeof options is "object"
    options = @_setupIteratorOptions(options)
    return @_iterator(options)  if typeof @_iterator is "function"
    new @IteratorClass(this, options)

  _chainedBatch: ->
    new AbstractChainedBatch(this)

  _isBuffer: (obj) ->
    Buffer.isBuffer obj

  _checkKey: (obj, type) ->
    if not obj?
      return new InvalidArgumentError(type + " cannot be `null` or `undefined`")
    if @_isBuffer(obj)
      return new InvalidArgumentError(type + " cannot be an empty Buffer")  if obj.length is 0
    else
      return new InvalidArgumentError(type + " cannot be an empty String")  if String(obj) is ""

  isOpen: ->
    !!@_opened

module.exports.AbstractLevelDOWN = AbstractNoSQL
module.exports.AbstractIterator = AbstractIterator
module.exports.AbstractChainedBatch = AbstractChainedBatch
