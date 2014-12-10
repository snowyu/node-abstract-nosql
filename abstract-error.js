/* Copyright (c) 2013 Rod Vagg, MIT License */
var inherits             = require('util').inherits

var kOk = 0
  , kNotFound = 1
  , kCorruption = 2
  , kNotSupported = 3
  , kInvalidArgument = 4
  , kIOError = 5
  , kNotOpened     = 101
  , kInvalidType   = 102
  , kInvalidFormat = 103


var errors = {
  "Ok": kOk
  , "NotFound": kNotFound
  , "Corruption": kCorruption
  , "NotSupported": kNotSupported
  , "InvalidArgument": kInvalidArgument
  , "IO": kIOError
  , "NotOpened": kNotOpened
  , "InvalidType": kInvalidType
  , "InvalidFormat": kInvalidFormat
}

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

for (var k in errors) {
  AbstractError[k] = errors[k]
  //generate AbstractError.isNotFound(err) class methods:
  AbstractError["is"+k] = (function(i, aType) {
    return function(err) {
      return err.code === i || (err.code == null && err.message && err.message.substring(0, aType.length) === aType)
    }
  })(errors[k], k)
  //generate AbstractError.notFound() instance methods:
  AbstractError.prototype[firstLower(k)] = (function(aType) {
    return function() {
      return AbstractError[aType](this)
    }
  })("is"+k)
  if (errors[k]>0) {
    var Err = (function(i, aType){
      return function(msg) {
        if (msg == null || msg == "") msg = aType
        AbstractError.call(this, msg, i)
      }
    })(errors[k], k)

    inherits(Err, AbstractError)
    //generate NotFoundError Classes
    module.exports[k+"Error"] = Err
  }
}

module.exports.AbstractError        = AbstractError
module.exports.NotImplementedError  = NotImplementedError

