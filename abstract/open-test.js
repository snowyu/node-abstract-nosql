module.exports.setUp = function (test, testCommon) {
  test('setUp', testCommon.setUp)
}

module.exports.args = function (NoSqlDatabase, test, testCommon) {
}

module.exports.open = function (NoSqlDatabase, test, testCommon) {
  test('test database open, no options', function (t) {
    var db = NoSqlDatabase(testCommon.location())

    // default createIfMissing=true, errorIfExists=false
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
        db.close(function () {
          t.notOk(db.isOpen())
          t.notOk(db.opened)
          t.end()
        })
      })
  })

  test('test database open, options and callback', function (t) {
    var db = NoSqlDatabase(testCommon.location())

    // default createIfMissing=true, errorIfExists=false
    db.open({}, function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
        db.close(function () {
          t.notOk(db.isOpen())
          t.notOk(db.opened)
          t.end()
        })
      })
  })
  test('test database open, close and open', function (t) {
    var db = NoSqlDatabase(testCommon.location())

    db.open(function (err) {
      t.error(err)
      t.ok(db.isOpen())
      db.close(function (err) {
        t.error(err)
        t.notOk(db.isOpen())
        db.open(function (err) {
          t.error(err)
          t.ok(db.isOpen())
          db.close(function () {
            t.notOk(db.isOpen())
            t.end()
          })
        })
      })
    })
  })

}

module.exports.openAdvanced = function (NoSqlDatabase, test, testCommon) {
  test('test database open createIfMissing:false', function (t) {
    var db = NoSqlDatabase(testCommon.location())

    db.open({ createIfMissing: false }, function (err) {
      t.ok(err, 'error')
      t.notOk(db.isOpen())
      t.ok(/does not exist/.test(err.message), 'error is about dir not existing')
      t.end()
    })
  })

  test('test database open errorIfExists:true', function (t) {
    var location = testCommon.location()
      , db       = NoSqlDatabase(location)

    // make a valid database first, then close and dispose
    db.open({}, function (err) {
      t.error(err)
      t.ok(db.isOpen())
      db.close(function (err) {
        t.error(err)
        t.notOk(db.isOpen())

        // open again with 'errorIfExists'
        db = NoSqlDatabase(location)
        db.open({ createIfMissing: false, errorIfExists: true }, function (err) {
          t.ok(err, 'error')
          t.notOk(db.isOpen())
          t.ok(/exists/.test(err.message), 'error is about already existing')
          t.end()
        })
      })
    })
  })
}

module.exports.tearDown = function (test, testCommon) {
  test('tearDown', testCommon.tearDown)
}

module.exports.all = function (NoSqlDatabase, test, testCommon) {
  module.exports.setUp(test, testCommon)
  module.exports.args(NoSqlDatabase, test, testCommon)
  module.exports.open(NoSqlDatabase, test, testCommon)
  module.exports.openAdvanced(NoSqlDatabase, test, testCommon)
  if (NoSqlDatabase.prototype._openSync) {
    delete NoSqlDatabase.prototype._open
    module.exports.open(NoSqlDatabase, test, testCommon)
    module.exports.openAdvanced(NoSqlDatabase, test, testCommon)
  }
  module.exports.tearDown(test, testCommon)
}
