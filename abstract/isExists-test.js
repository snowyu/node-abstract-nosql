var db
  , verifyNotFoundError = require('./util').verifyNotFoundError
  , isTypedArray        = require('./util').isTypedArray

module.exports.setUp = function (NoSqlDatabase, test, testCommon) {
  test('setUp common', testCommon.setUp)
  test('setUp db', function (t) {
    db = NoSqlDatabase(testCommon.location())
    db.open(t.end.bind(t))
  })
}

module.exports.args = function (test) {
}

module.exports.isExists = function (test) {
  test('test simple isExists()', function (t) {
    db.put('foo', 'bar', function (err) {
      t.error(err)
      db.isExists('foo', function (err, value) {
        t.error(err)
        t.ok(value === true, 'should be exists foo key')

        db.isExists('foo', {}, function (err, value) { // same but with {}
          t.error(err)
          t.ok(value === true, 'should be exists foo key')

  
          db.isExists('foo', { fillCache: false }, function (err, value) {
            t.error(err)
            t.ok(value === true, 'should be exists foo key')
            t.end()
          })
        })
      })
    })
  })

  test('test simultaniously isExists()', function (t) {
    db.put('hello', 'world', function (err) {
      t.error(err)
      var r = 0
        , done = function () {
            if (++r == 20)
              t.end()
          }
        , i = 0
        , j = 0

      for (; i < 10; ++i)
        db.isExists('hello', function(err, value) {
          t.error(err)
          t.strictEqual(value, true)
          done()
        })

      for (; j < 10; ++j)
        db.isExists('not found', function(err, value) {
          t.error(err)
          t.strictEqual(value, false)
          done()
        })
    })
  })
}

module.exports.tearDown = function (test, testCommon) {
  test('tearDown', function (t) {
    db.close(testCommon.tearDown.bind(null, t))
  })
}

module.exports.sync = function (test) {
  test('sync', function (t) {
    if (db._isExistsSync) {
      delete db.__proto__._isExists
    }
    t.end()
  })
}

module.exports.all = function (NoSqlDatabase, test, testCommon) {
  module.exports.setUp(NoSqlDatabase, test, testCommon)
  module.exports.args(test)
  module.exports.isExists(test)
  if (NoSqlDatabase.prototype._isExistsSync) {
    module.exports.sync(test)
    module.exports.isExists(test)
  }
  module.exports.tearDown(test, testCommon)
}
