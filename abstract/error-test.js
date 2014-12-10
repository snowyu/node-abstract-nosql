var Errors = require('../abstract-error')
  , AbstractError = Errors.AbstractError

module.exports.setUp = function (leveldown, test, testCommon) {
  test('setUp common', testCommon.setUp)
}

module.exports.args = function (test) {
}

module.exports.error = function (test) {
  test('test AbstractError constants', function (t) {
    t.equal(AbstractError.Ok, 0)
    t.equal(AbstractError.NotFound, 1)
    t.end()
  })

  test('test AbstractError Class Methods', function (t) {
    var err = new AbstractError("", 1)
    t.ok(AbstractError.isNotFound(err), "should be notFound")
    t.notOk(AbstractError.isOk(err), "should not be ok")
    err.code = 0
    t.ok(AbstractError.isOk(err), "should be ok")
    t.end()
  })

  test('test AbstractError Classes', function (t) {
    var err = new Errors.NotFoundError()
    t.ok(AbstractError.isNotFound(err), "should be notFound")
    t.ok(err.notFound(), "should be notFound")
    t.notOk(AbstractError.isOk(err), "should not be ok")
    err.code = 0
    t.ok(AbstractError.isOk(err), "should be ok")
    t.notOk(err.notFound(), "should not be notFound")
    err.code = null
    t.ok(err.notFound(), "should be notFound")
    t.end()
  })

  test('test AbstractError instance', function (t) {
    var err = new Errors.InvalidArgumentError("")
    t.notOk(err.ok(), "should not be ok")
    t.notOk(err.notFound(), "should not be notFound")
    t.ok(err.invalidArgument(), "should be invalidArgument")
    t.equal(err.message, "InvalidArgument")
    err = new Errors.InvalidArgumentError()
    t.equal(err.message, "InvalidArgument")
    t.end()
  })
}

module.exports.all = function (leveldown, test, testCommon) {
  module.exports.setUp(leveldown, test, testCommon)
  module.exports.args(test)
  module.exports.error(test)
}
