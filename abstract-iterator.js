/* Copyright (c) 2013 Rod Vagg, MIT License */

function AbstractIterator (db) {
  this.db = db
  this._ended = false
  this._nexting = false
}

AbstractIterator.prototype._next = function(callback) {
  var self = this
  if (this._nextSync) setImmediate(function(){
    try {
      var result = self._nextSync()
      self._nexting = false
      if (result) {
        callback(null, result[0], result[1])
      } else
        callback()
    } catch(e) {
      self._nexting = false
      callback(e)
    }
  })
  else
    setImmediate(function () {
      self._nexting = false
      callback()
    })
}

AbstractIterator.prototype._end = function(callback) {
  var self = this
  if (this._endSync) setImmediate(function(){
    try {
      var result = self._endSync()
      callback(null, result)
    } catch(e) {
      callback(e)
    }
  })
  setImmediate(function () {
    callback()
  })
}

AbstractIterator.prototype.nextSync = function () {
  if (this._nextSync) {
    this._nexting = true
    var result = this._nextSync()
    this._nexting = false
    return result
  }
  throw new Error("NotImplementation")
}

AbstractIterator.prototype.endSync = function () {
  if (this._endSync) return this._endSync()
  throw new Error("NotImplementation")
}

AbstractIterator.prototype.next = function (callback) {
  var self = this

  if (typeof callback != 'function')
    throw new Error('next() requires a callback argument')

  if (self._ended)
    return callback(new Error('cannot call next() after end()'))
  if (self._nexting)
    return callback(new Error('cannot call next() before previous next() has completed'))

  self._nexting = true
  return self._next(function () {
    self._nexting = false
    callback.apply(null, arguments)
  })
}

AbstractIterator.prototype.end = function (callback) {
  if (typeof callback != 'function')
    throw new Error('end() requires a callback argument')

  if (this._ended)
    return callback(new Error('end() already called on iterator'))

  this._ended = true

  return this._end(callback)
}

module.exports = AbstractIterator
