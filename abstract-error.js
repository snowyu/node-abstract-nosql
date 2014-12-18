var Errors        = require('abstract-object/Error')
var AbstractError = Errors.AbstractError
var createError   = Errors.createError

var OpenError       = createError("CanNotOpen", AbstractError.NotOpened)
var CloseError      = createError("CanNotClose", 0x52)
var AlreadyEndError = createError("AlreadyEnd", 0x53)

Errors.OpenError        = OpenError
Errors.CloseError       = CloseError
Errors.AlreadyEndError  = AlreadyEndError

module.exports  = Errors;
