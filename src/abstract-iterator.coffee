# Copyright (c) 2013 Rod Vagg, MIT License
# Copyright (c) 2014 Riceball LEE, MIT License
util                  = require("abstract-object/lib/util")
inherits              = util.inherits
Errors                = require("./abstract-error")
AbstractError         = Errors.AbstractError
NotImplementedError   = Errors.NotImplementedError
InvalidArgumentError  = Errors.InvalidArgumentError
AlreadyEndError       = Errors.AlreadyEndError

module.exports = class AbstractIterator
  @AlreadyEndError: AlreadyEndError
  constructor: (@db) ->
    @_ended = false
    @_nexting = false

  _next: (callback) ->
    self = this
    if @_nextSync
      setImmediate ->
        try
          result = self._nextSync()
          self._nexting = false
          if result
            callback null, result[0], result[1]
          else
            callback()
        catch e
          self._nexting = false
          callback e

    else
      setImmediate ->
        self._nexting = false
        callback()


  _end: (callback) ->
    self = this
    if @_endSync
      setImmediate ->
        try
          result = self._endSync()
          callback null, result
        catch e
          callback e
    else
      setImmediate ->
        callback()


  nextSync: ->
    if @_nextSync
      @_nexting = true
      result = @_nextSync()
      @_nexting = false
      return result
    throw new NotImplementedError()

  endSync: ->
    return @_endSync() if @_endSync
    throw new NotImplementedError()

  next: (callback) ->
    throw new InvalidArgumentError("next() requires a callback argument") unless typeof callback is "function"
    return callback(new AlreadyEndError("cannot call next() after end()")) if @_ended
    return callback(new AlreadyEndError("cannot call next() before previous next() has completed")) if @_nexting
    @_nexting = true
    self = this
    @_next ->
      self._nexting = false
      callback.apply null, arguments


  end: (callback) ->
    throw new InvalidArgumentError("end() requires a callback argument")  unless typeof callback is "function"
    return callback(new AlreadyEndError("end() already called on iterator"))  if @_ended
    @_ended = true
    @_end callback
