# Copyright (c) 2013 Rod Vagg, MIT License
setImmediate          = global.setImmediate or process.nextTick
Errors                = require("./abstract-error")
InvalidArgumentError  = Errors.InvalidArgumentError

module.exports = class AbstractChainedBatch
  constructor: (db) ->
    @_db = db
    @_operations = []
    @_written = false

  _checkWritten: ->
    throw new Error("write() already called on this batch")  if @_written

  put: (key, value) ->
    @_checkWritten()
    err = @_db._checkKey(key, "key", @_db._isBuffer)
    throw err  if err
    key = String(key)  unless @_db._isBuffer(key)
    value = String(value)  unless @_db._isBuffer(value)
    if typeof @_put is "function"
      @_put key, value
    else
      @_operations.push
        type: "put"
        key: key
        value: value

    this

  del: (key) ->
    @_checkWritten()
    err = @_db._checkKey(key, "key", @_db._isBuffer)
    throw err  if err
    key = String(key)  unless @_db._isBuffer(key)
    if typeof @_del is "function"
      @_del key
    else
      @_operations.push
        type: "del"
        key: key

    this

  clear: ->
    @_checkWritten()
    @_operations = []
    @_clear() if typeof @_clear is "function"
    this

  _write: (options, callback) ->
    that = this
    if @_writeSync
      setImmediate ->
        result = undefined
        try
          result = that._writeSync(options)
        catch err
          callback err
          return
        callback null, result
    else if typeof @_db._batch is "function"
      @_db._batch(@_operations, options, callback)
    else
      setImmediate callback

  writeSync: (options) ->
    @_checkWritten()
    @_written = true
    if @_writeSync
      result = @_writeSync(options)
    else if typeof @_db._batchSync is "function"
      result = @_db._batchSync(@_operations, options)
    result

  writeAsync: (options, callback) ->
    @_checkWritten()
    callback = options if typeof options is "function"
    options = {} unless typeof options is "object"
    unless typeof callback is "function"
      throw new InvalidArgumentError("write() requires a callback argument")
    @_written = true
    return @_write(options, callback) if typeof @_write is "function"
    setImmediate callback

  write: (options, callback) ->
    callback = options if typeof options is "function"
    options = {} unless typeof options is "object"
    if typeof callback is "function"
      @writeAsync(options, callback)
    else
      @writeSync options
