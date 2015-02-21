AbstractNoSql   = require './'
sinon           = require 'sinon'
inherits        = require 'inherits-ex/lib/inherits'
isObject        = require 'util-ex/lib/is/type/object'
errors          = require 'abstract-error'
FakeIterator    = require './fake-iterator'


NotFoundError   = errors.NotFoundError

module.exports = class FakeDB
  inherits FakeDB, AbstractNoSql
  constructor: ->
    return new FakeDB if not (this instanceof FakeDB)
    super
  IteratorClass: FakeIterator
  _openSync: sinon.spy ->
    @data = {}
    true
  _closeSync: sinon.spy ->
    @data = {}
    true
  _isExistsSync: sinon.spy (key)->
    @data.hasOwnProperty key
  _mGetSync: sinon.spy ->
    AbstractNoSql::_mGetSync.apply this, arguments
  _getBufferSync: sinon.spy ->
    AbstractNoSql::_getBufferSync.apply this, arguments
  _getSync: sinon.spy (key, opts)->
    if @data.hasOwnProperty key
      @data[key]
    else
      throw new NotFoundError("NotFound:"+key)
  _putSync: sinon.spy (key,value)->
    @data[key]=value
  _delSync: sinon.spy (key)->delete @data[key]
  _batchSync: sinon.spy (operations, options)->
    for op in operations
      continue unless isObject op
      if op.type is 'del'
        delete @data[op.key]
      else
        @data[op.key] = op.value
    true
