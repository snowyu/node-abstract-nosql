var db
  , sourceData      = require('./iterator-test').sourceData
  , transformSource = require('./iterator-test').transformSource

module.exports.setUp = function (leveldown, test, testCommon) {
  test('setUp common', testCommon.setUp)
  test('setUp db', function (t) {
    db = leveldown(testCommon.location())
    db.open(t.end.bind(t))
  })
}

module.exports.iterator = function (leveldown, test, testCommon, collectEntries) {
  test('test simple iterator()', function (t) {
    var data = [
            { type: 'put', key: 'foobatch1', value: 'bar1' }
          , { type: 'put', key: 'foobatch2', value: 'bar2' }
          , { type: 'put', key: 'foobatch3', value: 'bar3' }
        ]
      , idx = 0

    db.batch(data, function (err) {
      t.error(err)
      var iterator = db.iterator()
        , fn = function (err, key, value) {
            t.error(err)
            if (key && value) {
              t.equal(key.toString(), data[idx].key, 'correct key')
              t.equal(value.toString(), data[idx].value, 'correct value')
              process.nextTick(next)
              idx++
            } else { // end
              t.ok(typeof err === 'undefined', 'err argument is undefined')
              t.ok(typeof key === 'undefined', 'key argument is undefined')
              t.ok(typeof value === 'undefined', 'value argument is undefined')
              t.equal(idx, data.length, 'correct number of entries')
              iterator.end(function () {
                t.end()
              })
            }
          }
        , next = function () {
            iterator.next(fn)
          }

      next()
    })
  })

  /** the following tests are mirroring the same series of tests in
    * LevelUP read-stream-test.js
    */

  test('setUp #2', function (t) {
    db.close(function () {
      db = leveldown(testCommon.location())
      db.open(function () {
        db.batch(sourceData, t.end.bind(t))
      })
    })
  })

  test('test full data collection', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.slice().reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test full data collection but skip first one', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt:null}), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length-1, 'correct number of entries')
      var expected = sourceData.map(transformSource)
      expected.splice(0,1)
      t.deepEqual(data, expected)
      t.end()
    })
  })
  test('test full data collection but skip first one with reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt:null, reverse: true}), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length-1, 'correct number of entries')
      var expected = sourceData.slice().reverse().map(transformSource)
      expected.splice(0,1)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range keys: ["15", "03", "99"]', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: ["15", "03", "99"] }), function (err, data) {
      t.error(err)
      t.equal(data.length, 3, 'correct number of entries')
      var all = sourceData.slice().map(transformSource)
      var expected = []
      expected[0] = all[15]
      expected[1] = all[3]
      expected[2] = all[99]
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range: "[50,]"', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '[50, ]' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range: "[50,]" and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '[50, ]', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0,50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range: "(50,]"', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '(50, ]' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice(51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range: "(50,]" and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '(50, ]', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0,49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with rang: "[,50]"', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '[,50]' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "[,50.5]" being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '[,50.5]', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0,51).reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })
  test('test iterator with range [30,70]', function (t) { 
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '[30,70]' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice(30, 71).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "[30,70]" and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range:"[30,70]", reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "(30,70)"', function (t) { 
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '(30,70)' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41-2, 'correct number of entries')
      var expected = sourceData.slice(31, 70).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "(30,70)" and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range:"(30,70)", reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41-2, 'correct number of entries')
      var expected = sourceData.slice(31,70).reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "(30,70]"', function (t) { 
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: '(30,70]' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41-1, 'correct number of entries')
      var expected = sourceData.slice(31, 71).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with range "(30,70]" and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range:"(30,70]", reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41-1, 'correct number of entries')
      var expected = sourceData.slice(31,71).reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start=0', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '00' }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start=50', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start=50 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '50', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start being a midway key (49.5)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '49.5' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start being a midway key (49999)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '49999' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '49.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end=50', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, end: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end being a midway key (50.5)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, end: '50.5' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end being a midway key (50555)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, end: '50555' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, end: '50.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  // end='0', starting key is actually '00' so it should avoid it
  test('test iterator with end=0', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, end: '0' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with start=30 and end=70', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '30', end: '70' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice(30, 71).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start=30 and end=70 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '70', end: '30', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte=0', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '00' }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte=50', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lte=50 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '50', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte being a midway key (49.5)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '49.5' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte being a midway key (49999)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '49999' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '49.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lt being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '49.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lt being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '50', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 50, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(50).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lte=50', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lte being a midway key (50.5)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '50.5' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lte being a midway key (50555)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '50555' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with lt being a midway key (50555)', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '50555' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 51, 'correct number of entries')
      var expected = sourceData.slice(0, 51).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte being a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '50.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gt a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '50.5', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gt a midway key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '50', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gt 50 key and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '50', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 49, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 49).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  // end='0', starting key is actually '00' so it should avoid it
  test('test iterator with lte=0', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '0' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  // end='0', starting key is actually '00' so it should avoid it
  test('test iterator with lt=0', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '0' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with gte=30 and lte=70', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '30', lte: '70' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice(30, 71).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gt=29 and lt=71', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '29', lt: '71' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice(30, 71).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gte=30 and lte=70 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '70', gte: '30', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with gt=29 and lt=71 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '71', gt: '29', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 41, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20 and gte=20', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '20', limit: 20 }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(20, 40).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20 and lte=79 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '79', limit: 20, reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(20, 40).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 20 }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20 and start=20', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '20', limit: 20 }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(20, 40).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 20, reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=20 and start=20 and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '79', limit: 20, reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice().reverse().slice(20, 40).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  // the default limit value from levelup is -1
  test('test iterator with limit=-1 should iterate over whole database', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: -1}), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with limit=0 should not iterate over anything', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 0 }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with end after limit', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 20, lte: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end before limit', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 50, lte: '19' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start after database end', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '9a' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with start after database end', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '9a' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with start after database end and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '9a', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.slice().reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start and end after database and and reverse=true', function (t) {
    collectEntries(db.iterator({ lte: '9b', gte: '9a', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with lt and gt after database and and reverse=true', function (t) {
    collectEntries(db.iterator({ lt: '9b', gt: '9a', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with end after limit', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 20, end: '50' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with end before limit', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, limit: 50, end: '19' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 20, 'correct number of entries')
      var expected = sourceData.slice(0, 20).map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start after database end', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '9a' }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with start after database end and reverse=true', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '9a', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, sourceData.length, 'correct number of entries')
      var expected = sourceData.slice().reverse().map(transformSource)
      t.deepEqual(data, expected)
      t.end()
    })
  })

  test('test iterator with start and end after database and and reverse=true', function (t) {
    collectEntries(db.iterator({ start: '9b', end: '9a', reverse: true }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  test('test iterator with start/gt/gte=new Buffer("9a") and end/lt/lte=new Buffer("9b")', function (t) {
    collectEntries(db.iterator({ keyAsBuffer: true, valueAsBuffer: false, start: new Buffer('9b'), end: new Buffer('9a'), lt: new Buffer('9b'), gt: new Buffer('9a'), gte: new Buffer('9a'), lte: new Buffer('9b') }), function (err, data) {
      t.error(err)
      t.equal(data.length, 0, 'correct number of entries')
      t.end()
    })
  })

  function testIteratorCollectsFullDatabase (name, iteratorOptions) {
    iteratorOptions.keyAsBuffer   = false
    iteratorOptions.valueAsBuffer = false
    test(name, function (t) {
      collectEntries(db.iterator(iteratorOptions), function (err, data) {
        t.error(err)
        t.equal(data.length, 100, 'correct number of entries')
        var expected = sourceData.map(transformSource)
        t.deepEqual(data, expected)
        t.end()
      })
    })
  }
  if (!process.browser) {
    // Can't use buffers as query keys in indexeddb (I think :P)
    testIteratorCollectsFullDatabase(
        'test iterator with start as empty buffer'
      , { start: new Buffer(0) }
    )
    testIteratorCollectsFullDatabase(
        'test iterator with end as empty buffer'
      , { end: new Buffer(0) }
    )
  }
  testIteratorCollectsFullDatabase(
      'test iterator with start as empty string'
    , { start: '' }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with start as null'
    , { start: null }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with end as empty string'
    , { end: '' }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with end as null'
    , { end: null }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with start as empty string'
    , { gte: '' }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with start as null'
    , { gte: null }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with end as empty string'
    , { lte: '' }
  )
  testIteratorCollectsFullDatabase(
      'test iterator with end as null'
    , { lte: null }
  )
}

module.exports.nextSync = function (leveldown, test, testCommon) {
  function collectEntries(iterator) {
    result = []
    while (item = iterator.nextSync()) {
      result.push(item)
    }
    return result
  }
  test('test sync iterator with gte=30 and lte=70', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '30', lte: '70' }))
    t.equal(data.length, 41, 'correct number of entries')
    var expected = sourceData.slice(30, 71).map(transformSource)
    t.deepEqual(data, expected)
    t.end()
  })

  test('test sync iterator with gt=29 and lt=71', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gt: '29', lt: '71' }))
    t.equal(data.length, 41, 'correct number of entries')
    var expected = sourceData.slice(30, 71).map(transformSource)
    t.deepEqual(data, expected)
    t.end()
  })

  test('test sync iterator with gte=30 and lte=70 and reverse=true', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lte: '70', gte: '30', reverse: true }))
    t.equal(data.length, 41, 'correct number of entries')
    var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
    t.deepEqual(data, expected)
    t.end()
  })

  test('test sync iterator with gt=29 and lt=71 and reverse=true', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, lt: '71', gt: '29', reverse: true }))
    t.equal(data.length, 41, 'correct number of entries')
    var expected = sourceData.slice().reverse().slice(29, 70).map(transformSource)
    t.deepEqual(data, expected)
    t.end()
  })

  test('test sync iterator with limit=20 and gte=20', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '20', limit: 20 }))
    t.equal(data.length, 20, 'correct number of entries')
    var expected = sourceData.slice(20, 40).map(transformSource)
    t.deepEqual(data, expected)
    t.end()
  })

  test('test sync iterator with start after database end', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, gte: '9a' }))
    t.equal(data.length, 0, 'correct number of entries')
    t.end()
  })
  test('test sync iterator with range keys: ["15", "03", "99"]', function (t) {
    var data = collectEntries(db.iterator({ keyAsBuffer: false, valueAsBuffer: false, range: ["15", "03", "99"] }))
    t.equal(data.length, 3, 'correct number of entries')
    var all = sourceData.slice().map(transformSource)
    var expected = []
    expected[0] = all[15]
    expected[1] = all[3]
    expected[2] = all[99]
    t.deepEqual(data, expected)
    t.end()
  })
}

module.exports.tearDown = function (test, testCommon) {
  test('tearDown', function (t) {
    db.close(testCommon.tearDown.bind(null, t))
  })
}

module.exports.sync = function (Iterator, test) {
  test('sync', function (t) {
    if (Iterator.prototype._nextSync) {
      delete Iterator.prototype._next
    }
    if (Iterator.prototype._endSync) {
      delete Iterator.prototype._end
    }
    t.end()
  })
}

module.exports.all = function (leveldown, test, testCommon) {
  module.exports.setUp(leveldown, test, testCommon)
  module.exports.iterator(leveldown, test, testCommon, testCommon.collectEntries)
  if (leveldown.prototype._getSync) {
    module.exports.nextSync(leveldown, test, testCommon)
  }
  module.exports.tearDown(test, testCommon)
  var Iterator = leveldown.prototype.IteratorClass
  if (Iterator.prototype._nextSync) {
    module.exports.sync(Iterator, test)
    module.exports.setUp(leveldown, test, testCommon)
    module.exports.iterator(leveldown, test, testCommon, testCommon.collectEntries)
    module.exports.tearDown(test, testCommon)
  }
}
