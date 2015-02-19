Errors            = require("./abstract-error")
extend            = require 'util-ex/lib/_extend'
isArray           = require 'util-ex/lib/is/type/array'
isFunction        = require 'util-ex/lib/is/type/function'
eventable         = require 'events-ex/eventable'
consts            = require 'events-ex/consts'
EVENT_DONE        = consts.DONE
EVENT_STOPPED     = consts.STOPPED
filter            = eventable.filter

AbstractError         = Errors.AbstractError
NotImplementedError   = Errors.NotImplementedError
InvalidArgumentError  = Errors.InvalidArgumentError
OpenError             = Errors.OpenError
CloseError            = Errors.CloseError
ReadError             = Errors.ReadError
WriteError            = Errors.WriteError

module.exports = (aOptions)->
  aOptions = {} unless aOptions
  aOptions.methods = {} unless aOptions.methods
  vIncludes = aOptions.include
  if vIncludes
    vIncludes = [vIncludes] if not isArray vIncludes
  else
    vIncludes = []
  vExcludes = aOptions.exclude
  if vExcludes
    vExcludes = [vExcludes] if not isArray vExcludes
  else
    vExcludes = []
  if not filter('open', vIncludes, vExcludes)
    vExcludes.push 'openAsync'
    vExcludes.push 'openSync'
  if not filter('close', vIncludes, vExcludes)
    vExcludes.push 'closeAsync'
    vExcludes.push 'closeSync'
  if not filter('get', vIncludes, vExcludes)
    vExcludes.push 'getAsync'
    vExcludes.push 'getSync'
  if not filter('mGet', vIncludes, vExcludes)
    vExcludes.push 'mGetAsync'
    vExcludes.push 'mGetSync'
  if not filter('put', vIncludes, vExcludes)
    vExcludes.push 'putAsync'
    vExcludes.push 'putSync'
  if not filter('batch', vIncludes, vExcludes)
    vExcludes.push 'batchAsync'
    vExcludes.push 'batchSync'
  if not filter('del', vIncludes, vExcludes)
    vExcludes.push 'delAsync'
    vExcludes.push 'delSync'

  extend aOptions.methods,
    # override methods:
    openSync: (options) ->
      inherited = @super
      ((options)->
        @emit 'opening', options
        result = inherited.call @, options
        @emit 'ready', result
        @emit 'open', result
        result = @ if result
        return result
      ).apply(@self, arguments)
    openAsync: (options, callback) ->
      inherited = @super
      ((options, callback)->
        @emit 'opening', options
        inherited.call @, options, (err, result) =>
          return @dispatchError err, callback if err
          @emit 'ready', result
          @emit 'open', result
          callback err, result
      ).apply(@self, arguments)
    closeSync: ->
      inherited = @super
      (->
        @emit 'closing'
        result = inherited.apply @
        @emit 'closed', result
        @emit 'close', result
        return result
      ).apply(@self)
    closeAsync: (callback) ->
      callback = undefined unless isFunction callback
      inherited = @super
      (->
        @emit 'closing'
        inherited.call @, (err, result) =>
          return @dispatchError err, callback if err
          @emit 'closed', result
          @emit 'close', result
          callback null, result if callback
      ).apply(@self)
    getAsync: (key, options, callback) ->
      inherited = @super
      ((key, options, callback)->
        result = @emit 'getting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return callback null, result.result
          else if vState is EVENT_STOPPED
            err = new ReadError('Get is halted by listener')
            return @dispatchError err, callback
        inherited.call @, key, options, (err, result)=>
          return @dispatchError err, callback if err
          @emit 'get', key, result, options
          callback null, result
      ).apply(@self, arguments)
    getSync: (key, options) ->
      inherited = @super
      ((key, options)->
        result = @emit 'getting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return result.result
          else if vState is EVENT_STOPPED
            throw new ReadError('Get is halted by listener')
        result = inherited.apply @, arguments
        @emit 'get', key, result, options
        return result
      ).apply(@self, arguments)
    mGetAsync: (key, options, callback) ->
      inherited = @super
      ((key, options, callback)->
        result = @emit 'mGetting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return callback null, result.result
          else if vState is EVENT_STOPPED
            err = new ReadError('mGet is halted by listener')
            return @dispatchError err, callback
        inherited.call @, key, options, (err, result)=>
          return @dispatchError err, callback if err
          @emit 'mGet', key, result, options
          callback null, result
      ).apply(@self, arguments)
    mGetSync: (key, options) ->
      inherited = @super
      ((key, options)->
        result = @emit 'mGetting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return result.result
          else if vState is EVENT_STOPPED
            throw new ReadError('mGet is halted by listener')
        result = inherited.apply @, arguments
        @emit 'mGet', key, result, options
        return result
      ).apply(@self, arguments)
    putAsync: (key, value, options, callback) ->
      inherited = @super
      ((key, value, options, callback)->
        result = @emit 'putting', key, value, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return callback null, result.result
          else if vState is EVENT_STOPPED
            err = new ReadError('put is halted by listener')
            return @dispatchError err, callback
        inherited.call @, key, value, options, (err, result)=>
          return @dispatchError err, callback if err
          @emit 'put', key, value, result, options
          callback null, result
      ).apply(@self, arguments)
    putSync: (key, value, options) ->
      inherited = @super
      ((key, value, options)->
        result = @emit 'putting', key, value, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return result.result
          else if vState is EVENT_STOPPED
            throw new ReadError('put is halted by listener')
        result = inherited.apply @, arguments
        @emit 'put', key, value, result, options
        return result
      ).apply(@self, arguments)
    delAsync: (key, options, callback) ->
      inherited = @super
      ((key, options, callback)->
        result = @emit 'deleting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return callback null, result.result
          else if vState is EVENT_STOPPED
            err = new ReadError('Get is halted by listener')
            return @dispatchError err, callback
        inherited.call @, key, options, (err, result)=>
          return @dispatchError err, callback if err
          @emit 'delete', key, result, options
          callback null, result
      ).apply(@self, arguments)
    delSync: (key, options) ->
      inherited = @super
      ((key, options)->
        result = @emit 'deleting', key, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return result.result
          else if vState is EVENT_STOPPED
            throw new ReadError('Get is halted by listener')
        result = inherited.apply @, arguments
        @emit 'delete', key, result, options
        return result
      ).apply(@self, arguments)
    batchAsync: (operations, options, callback) ->
      inherited = @super
      ((operations, options, callback)->
        result = @emit 'batching', operations, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return callback null, result.result
          else if vState is EVENT_STOPPED
            err = new ReadError('Get is halted by listener')
            return @dispatchError err, callback
        inherited.call @, operations, options, (err, result)=>
          return @dispatchError err, callback if err
          @emit 'batch', operations, result, options
          callback null, result
      ).apply(@self, arguments)
    batchSync: (operations, options) ->
      inherited = @super
      ((operations, options)->
        result = @emit 'batching', operations, options
        if result and (vState = result.state)
          if vState is EVENT_DONE
            return result.result
          else if vState is EVENT_STOPPED
            throw new ReadError('Get is halted by listener')
        result = inherited.apply @, arguments
        @emit 'batch', operations, result, options
        return result
      ).apply(@self, arguments)
  aOptions
