# Copyright (c) 2013 Rod Vagg, MIT License
# Copyright (c) 2014 Riceball LEE, MIT License
util                  = require("abstract-object/lib/util")
inherits              = util.inherits
isArray               = util.isArray
Errors                = require("./abstract-error")
AbstractError         = Errors.AbstractError
NotImplementedError   = Errors.NotImplementedError
InvalidArgumentError  = Errors.InvalidArgumentError
AlreadyEndError       = Errors.AlreadyEndError
AlreadyRunError       = Errors.AlreadyRunError

module.exports = class AbstractIterator
  @AlreadyEndError: AlreadyEndError
  @AlreadyRunError: AlreadyRunError

  constructor: (@db, @options) ->
    @_ended = false
    @_nexting = false

    isKeysIterator = options and isArray options.range
    if isKeysIterator
      @_resultOfKeys = options.range
      @_indexOfKeys = -1

    return not isKeysIterator

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


  nextKeysSync: ->
    @_nexting = true
    if @_indexOfKeys is -1
      @_resultOfKeys = @db._mGetSync @_resultOfKeys, @options
      @_indexOfKeys++
    result = @_indexOfKeys >= 0 and @_indexOfKeys < @_resultOfKeys.length
    if result
      result =
        key: @_resultOfKeys[@_indexOfKeys]
        value: @_resultOfKeys[++@_indexOfKeys]
      @_indexOfKeys++
    @_nexting = false
    return result

  nextSync: ->
    return throw new AlreadyEndError("cannot call next() after end()") if @_ended
    return throw new AlreadyRunError("cannot call next() before previous next() has completed") if @_nexting
    if @_indexOfKeys?
      return @nextKeysSync()
    else if @_nextSync
      @_nexting = true
      result = @_nextSync()
      if result isnt false
        result =
          key: result[0]
          value: result[1]
      @_nexting = false
      return result
    else
      throw new NotImplementedError()

  _endKeys: ->
    delete @_resultOfKeys
    @_indexOfKeys = -2
    @_ended = true

  endSync: ->
    if @_indexOfKeys?
      return @_endKeys()
    else if @_endSync
      @_ended = true
      return @_endSync()
    else
      throw new NotImplementedError()

  nextKeys: (callback) ->
    @_nexting = true
    if @_indexOfKeys is -1
      self = this
      @db._mGet @_resultOfKeys, @options, (err, arr)->
        self._nexting = false
        return callback(err) if err
        self._resultOfKeys = arr
        self._indexOfKeys++
        self.next(callback)
      return @
    else if @_indexOfKeys >= 0 and @_indexOfKeys < @_resultOfKeys.length
      result = @_resultOfKeys.slice(@_indexOfKeys, @_indexOfKeys+=2)
      @_nexting = false
    else
      result = false
    @_nexting = false
    if result is false
      callback()
    else
      callback(undefined, result[0], result[1])
    @

  next: (callback) ->
    throw new InvalidArgumentError("next() requires a callback argument") unless typeof callback is "function"
    return callback(new AlreadyEndError("cannot call next() after end()")) if @_ended
    return callback(new AlreadyRunError("cannot call next() before previous next() has completed")) if @_nexting
    if @_indexOfKeys?
      @nextKeys callback
    else
      @_nexting = true
      self = this
      @_next ->
        self._nexting = false
        callback.apply null, arguments
    @

  end: (callback) ->
    throw new InvalidArgumentError("end() requires a callback argument")  unless typeof callback is "function"
    return callback(new AlreadyEndError("end() already called on iterator"))  if @_ended
    if @_indexOfKeys?
      @_endKeys()
      setImmediate callback
    else
      @_ended = true
      @_end callback
