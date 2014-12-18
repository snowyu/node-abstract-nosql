var Errors      = require('abstract-object/Error')
var createError = Errors.createError

var OpenError       = createError("CanNotOpen", 51)
var CloseError      = createError("CanNotClose", 52)
var AlreadyEndError = createError("AlreadyEnd", 53)

Errors.OpenError        = OpenError
Errors.CloseError       = CloseError
Errors.AlreadyEndError  = AlreadyEndError

module.exports  = Errors;
