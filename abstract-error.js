/* Copyright (c) 2013 Rod Vagg, MIT License */
var xtend                = require('xtend')
  , inherits             = require('util').inherits
  , setImmediate         = global.setImmediate || process.nextTick

var kOk = 0
  , kNotFound = 1
  , kCorruption = 2
  , kNotSupported = 3
  , kInvalidArgument = 4
  , kIOError = 5
  , kNotOpened = 6
  , kInvalidType = 7
  , kInvalidFormat = 8


var
  errors = [
      "Ok"
    , "NotFound"
    , "Corruption"
    , "NotSupported"
    , "InvalidArgument"
    , "IO"
    , "NotOpened"
    , "InvalidType"
    , "InvalidFormat"
  ]

function firstLower(s) {
  return s[0].toLowerCase()+s.substring(1)
}

function AbstractError(msg, errno) {
  Error.call(this, msg)
  this.code = errno
  this.message = msg
  if (Error.captureStackTrace)
    Error.captureStackTrace(this, arguments.callee)
}

inherits(AbstractError, Error)


function NotImplementedError() {
  AbstractError.call(this, "NotImplemented", kNotSupported)
}

inherits(NotImplementedError, AbstractError)

for (var i=0; i < errors.length; i++) {
  AbstractError[errors[i]] = i
  //generate AbstractError.isNotFound(err) class methods:
  AbstractError["is"+errors[i]] = (function(i, aType) {
    return function(err) {
      return err.code === i || (err.code == null && err.message && err.message.substring(0, aType.length) === aType)
    }
  })(i, errors[i])
  //generate AbstractError.notFound() instance methods:
  AbstractError.prototype[firstLower(errors[i])] = (function(aType) {
    return function() {
      return AbstractError[aType](this)
    }
  })("is"+errors[i])
  if (i>0) {
    var Err = (function(i, aType){
      return function(msg) {
        if (msg == null || msg == "") msg = aType
        AbstractError.call(this, msg, i)
      }
    })(i, errors[i])

    inherits(Err, AbstractError)
    //generate NotFoundError Classes
    module.exports[errors[i]+"Error"] = Err
  }
}

module.exports.AbstractError        = AbstractError
module.exports.NotImplementedError  = NotImplementedError

