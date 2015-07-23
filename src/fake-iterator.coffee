sinon             = require 'sinon'
AbstractIterator  = require 'abstract-iterator'
inherits          = require 'inherits-ex/lib/inherits'

module.exports =  class FakeIterator
  inherits FakeIterator, AbstractIterator
  getIndexGreaterThan = (arr, name)->
    i = -1
    while ++i < arr.length
      return i if name <= arr[i]
    return -1
  getIndexLessThan = (arr, name)->
    i = arr.length
    while --i >= 0
      return i if name >= arr[i]
    return -1
  constructor: ->
    super
    @keys = Object.keys @db.data
    @keys.sort()
    @start      = 0
    @notReverse = @options.reverse isnt true
    @end        = @keys.length
    @limit      = @options.limit unless isNaN @options.limit
    @end        = @limit if @limit > 0 and @limit < @end
    if @options.lt
      index = getIndexLessThan(@keys, @options.lt)
      index = @keys.length if index < 0
      if @notReverse
        @end = index
      else
        @start = index
    else if @options.lte
      index = getIndexLessThan(@keys, @options.lte)
      if index < 0
        index = @keys.length
      else
        index++
      if @notReverse
        @end = index
      else
        @start = index
    if @options.gt
      index = getIndexGreaterThan(@keys, @options.gt) + 1
      if @notReverse
        @start = index
      else
        @end = index
    else if @options.gte
      index = getIndexGreaterThan(@keys, @options.gte)
      if @notReverse
        @start = index
      else
        @end = index
  _nextSync: sinon.spy ->
    result  = @start < @end
    if result
      key   = @keys[@start]
      result= [key, @db.data[key]]
      ++@start
    result

