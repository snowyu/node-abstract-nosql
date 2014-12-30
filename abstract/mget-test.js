var db
  , verifyNotFoundError = require('./util').verifyNotFoundError
  , isTypedArray        = require('./util').isTypedArray
  , sourceData = (function () {
    var d = []
      , i = 0
      , k
    for (; i < 100; i++) {
      k = (i < 10 ? '0' : '') + i
      d.push({
          type  : 'put'
        , key   : k
        , value : Math.random()
      })
    }
    d.push({
        type  : 'put'
      , key   : "foo"
      , value : "bar"
    })
    return d
  }())
  , transformSource = function (d) {
    return { key: d.key, value: String(d.value) }
  }
  , valueTransformSource = function (d) {
    return String(d.value)
  }
  

module.exports.setUp = function (NoSqlDatabase, test, testCommon) {
  test('setUp common', testCommon.setUp)
  test('setUp db', function (t) {
    db = NoSqlDatabase(testCommon.location())
    db.open(function () {
      db.batch(sourceData, t.end.bind(t))
    })
  })
}

module.exports.args = function (test) {
}

module.exports.mgetSync = function (test) {
  test('test mGet() keys=false sync', function (t) {
    var arr = db.mGetSync(["01","02","03",'foo'], {keys: false})
    t.equal(arr.length, 4)
    var expected = sourceData.slice(1, 4).map(valueTransformSource)
    expected.push("bar")
    t.deepEqual(arr, expected)
    t.end()
  })
}

module.exports.mget = function (test) {
  test('test simple mGet() with default options', function (t) {
    db.mGet(['foo'], function (err, arr) {
      t.error(err)
      t.deepEqual(arr, [{key:'foo', value:'bar'}])
      t.end()
    })
  })

  test('test simple mGet() with asBuffer option', function (t) {
    db.mGet(['foo'], {asBuffer: true}, function (err, arr) {
      t.error(err)
      t.type(arr, 'Array')
      t.equal(arr.length, 1)
      value = arr[0].value
      t.ok(typeof value !== 'string', 'should not be string by default')

      var result
      if (isTypedArray(value)) {
        result = String.fromCharCode.apply(null, new Uint16Array(value))
      } else {
        t.ok(typeof Buffer != 'undefined' && value instanceof Buffer)
        try {
          result = value.toString()
        } catch (e) {
          t.error(e, 'should not throw when converting value to a string')
        }
      }
      t.equal(result, 'bar')
      t.end()
    })
  })

  test('test simple mGet() with specified keys', function (t) {
    db.mGet(["01","02","03",'foo'], function (err, arr) {
      t.error(err)
      t.equal(arr.length, 4)
      var expected = sourceData.slice(1, 4).map(transformSource)
      expected.push({key:"foo", value:"bar"})
      t.deepEqual(arr, expected)
      t.end()
    })
  })
  test('test mGet() raiseError', function (t) {
    db.mGet(["01","02","03",'foo', 'Not Found'], {raiseError: true}, function (err, arr) {
      t.ok(err, "should err")
      t.ok((/NotFound/i).test(err))
      t.ok(arr == null)
      t.end()
    })
  })
  test('test mGet() raiseError=false', function (t) {
    db.mGet(["01","02","03",'foo', 'Not Found'], {raiseError: false}, function (err, arr) {
      t.error(err)
      t.equal(arr.length, 5)
      var expected = sourceData.slice(1, 4).map(transformSource)
      expected.push({key:"foo", value:"bar"})
      expected.push({key:"Not Found", value:undefined})
      t.deepEqual(arr, expected)
      t.end()
    })
  })
  test('test mGet() keys=false', function (t) {
    db.mGet(["01","02","03",'foo'], {keys: false}, function (err, arr) {
      t.error(err)
      t.equal(arr.length, 4)
      var expected = sourceData.slice(1, 4).map(valueTransformSource)
      expected.push("bar")
      t.deepEqual(arr, expected)
      t.end()
    })
  })

  test('test simultaniously mGet()', function (t) {
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
        db.mGet(['hello'], function(err, arr) {
          t.error(err)
          t.deepEqual(arr, [{key:'hello', value:'world'}])
          done()
        })

      for (; j < 10; ++j)
        db.mGet(['not found'], function(err, value) {
          t.ok(err, 'should error')
          t.ok(verifyNotFoundError(err), 'should have correct error message')
          t.ok(typeof value == 'undefined', 'value is undefined')
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
    if (db._mGetSync) {
      delete db.__proto__._mGet
    }
    t.end()
  })
}

module.exports.all = function (NoSqlDatabase, test, testCommon) {
  module.exports.setUp(NoSqlDatabase, test, testCommon)
  module.exports.args(test)
  module.exports.mget(test)
  module.exports.mgetSync(test)
  if (NoSqlDatabase.prototype._mGetSync) {
    module.exports.sync(test)
    module.exports.mget(test)
  }
  module.exports.tearDown(test, testCommon)
}
