var Errors        = require('abstract-error')
var AbstractError = Errors.AbstractError
var createError   = Errors.createError

var OpenError       = createError("CanNotOpen", AbstractError.NotOpened)
var CloseError      = createError("CanNotClose", 0x52)
var ReadError       = createError("ReadError", 0x53)
var WriteError      = createError("WriteError", 0x54)

Errors.OpenError        = OpenError
Errors.CloseError       = CloseError
Errors.ReadError        = ReadError
Errors.WriteError       = WriteError 

module.exports  = Errors;
