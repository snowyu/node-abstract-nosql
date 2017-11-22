var db
var consts            = require('events-ex/consts')
var EVENT_DONE        = consts.DONE
var EVENT_STOPPED     = consts.STOPPED
var Errors            = require("../abstract-error")
var HookedEventError  = Errors.HookedEventError


module.exports.setUp = function (NoSqlDatabase, test, testCommon) {
  test('setUp common', testCommon.setUp)
  test('setUp db', function (t) {
    db = NoSqlDatabase(testCommon.location())
    db.open(t.end.bind(t))
  })
}

module.exports.args = function (NoSqlDatabase, test, testCommon) {
}

module.exports.openSync = function (NoSqlDatabase, test, testCommon) {
  test('test database openSync event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    var opened = 0;
    var opening = 0;
    db.once("opening", function(){
      t.notOk(db.isOpen())
      t.notOk(db.opened)
      ++opening
    })
    db.once("open", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
      ++opened
    })
    db.open()
    t.ok(db.isOpen())
    t.ok(db.opened)
    t.equal(opening, 1)
    t.equal(opened, 1)
    t.end()
  })

  test('test database openSync ready event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    var vIsReady = false
    db.once("ready", function(){
      vIsReady = true
      t.ok(db.isOpen())
      t.ok(db.opened)
    })
    db.open()
    t.ok(db.isOpen())
    t.ok(db.opened)
    t.ok(vIsReady)
    t.end()
  })
}

module.exports.open = function (NoSqlDatabase, test, testCommon) {
  test('test database open event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("open", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
    })
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
        t.end()
      })
  })

  test('test database ready event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("ready", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
    })
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
        t.end()
      })
  })
}

module.exports.putSync = function (test) {
  test('test putSync putting event', function (t) {
    var putting = 0;
    var put = 0;
    db.once('putting', function(key, value, options){
      t.equal(key, 'putfoo1')
      t.equal(value, 'putbar1')
      ++putting
    })
    db.once('put', function(key, value, result, options){
      t.equal(key, 'putfoo1')
      t.equal(value, 'putbar1')
      t.ok(result, 'put ok')
      ++put
    })
    t.ok(db.put('putfoo1', 'putbar1'), 'put ok')
    t.equal(putting, 1)
    t.equal(put, 1)
    t.end()
  })
  test('test sync put event', function (t) {
    var put = 0;
    db.once('put', function(key, value, result, options){
      t.equal(key, 'putfoo12')
      t.equal(value, 'putbar12')
      t.ok(result, 'put ok')
      ++put
    })
    t.ok(db.put('putfoo12', 'putbar12'), 'put ok')
    t.equal(put, 1)
    t.end()
  })
}

module.exports.put = function (test) {
  test('test putting event', function (t) {
    var putting = 0;
    db.once('putting', function(key, value, options){
      t.equal(key, 'putfoo1')
      t.equal(value, 'putbar1')
      t.deepEqual(options, {}, 'no options')
      ++putting
    })
    db.once('put', function(key, value, result, options){
      t.equal(putting, 1)
      t.equal(key, 'putfoo1')
      t.equal(value, 'putbar1')
      t.ok(result, 'put ok')
    })
    db.put('putfoo1', 'putbar1', function (err, result) {
      t.error(err)
      t.end()
    })
  })
  test('test put event', function (t) {
    db.once('put', function(key, value, result, options){
      t.equal(key, 'putfoo12')
      t.equal(value, 'putbar12')
      t.ok(result, 'put ok')
      t.deepEqual(options, {}, 'no options')
    })
    db.put('putfoo12', 'putbar12', function (err, result) {
      t.error(err)
      t.end()
    })
  })
}

module.exports.getBufferSync = function (test) {
  test('prepare for sync getBuffer test', function (t) {
    db.put('foos', 'bar', function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test sync gettingBuffer event', function (t) {
    var getting = 0
    db.once('gettingBuffer', function(key, options){
      t.equal(key, 'foos')
      ++getting
    })
    t.equal(db.getBuffer('foos'), 3)
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked gettingBuffer event(EVENT_DONE)', function (t) {
    var getting = 0
    db.once('gettingBuffer', function(key, options){
      t.equal(key, 'foos')
      ++getting
      this.result = {
        state: EVENT_DONE,
        result: 'hookedbar'
      }
    })
    t.equal(db.get('foo'), 'hookedbar')
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked getting event(EVENT_STOPPED)', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
      ++getting
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    t.throws(db.get.bind(db, 'foo'), {
      name:'HookedEventError',
      message : 'event stopped by listener'
      }
    )
    t.equal(getting, 1)
    t.end()
  })
  test('test sync get event', function (t) {
    var get = 0
    db.once('get', function(key, value, options){
      t.equal(key, 'foos')
      t.equal(value, 'bar')
      ++get
    })
    t.equal(db.get('foos'), 'bar')
    t.equal(get, 1)
    t.end()
  })
}

module.exports.getSync = function (test) {
  test('prepare put foos bar for sync get test', function (t) {
    db.put('foos', 'bar', function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test sync getting event', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foos')
      ++getting
    })
    t.equal(db.get('foos'), 'bar')
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked getting event(EVENT_DONE)', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
      ++getting
      this.result = {
        state: EVENT_DONE,
        result: 'hookedbar'
      }
    })
    t.equal(db.get('foo'), 'hookedbar')
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked getting event(EVENT_STOPPED)', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
      ++getting
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    t.throws(db.get.bind(db, 'foo'), {
      name:'HookedEventError',
      message : 'event stopped by listener'
      }
    )
    t.equal(getting, 1)
    t.end()
  })
  test('test sync get event', function (t) {
    var get = 0
    db.once('get', function(key, value, options){
      t.equal(key, 'foos')
      t.equal(value, 'bar')
      ++get
    })
    t.equal(db.get('foos'), 'bar')
    t.equal(get, 1)
    t.end()
  })
}

module.exports.get = function (test) {
  test('prepare put foo bar for test', function (t) {
    db.put('foo', 'bar', function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test getting event', function (t) {
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
    })
    db.get('foo', function (err, result) {
      t.error(err)
      t.ok(typeof result === 'string', 'should be string by default')

      t.equal(result, 'bar')
      t.end()
    })
  })
  test('test hooked getting event(EVENT_DONE)', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
      ++getting
      this.result = {
        state: EVENT_DONE,
        result: 'hookedbar'
      }
    })
    db.get('foo', function (err, result) {
      t.error(err)
      t.ok(typeof result === 'string', 'should be string by default')
      t.equal(getting, 1)

      t.equal(result, 'hookedbar')
      t.end()
    })
  })
  test('test hooked getting event(EVENT_STOPPED)', function (t) {
    var getting = 0
    db.once('getting', function(key, options){
      t.equal(key, 'foo')
      ++getting
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    db.get('foo', function (err, result) {
      t.ok(err, 'should err')
      t.type(err, HookedEventError)
      t.equal(getting, 1)
      t.end()
    })
  })
  test('test get event', function (t) {
    db.once('get', function(key, value, options){
      t.equal(key, 'foo')
      t.equal(value, 'bar')
    })
    db.get('foo', function (err, result) {
      t.error(err)
      t.ok(typeof result === 'string', 'should be string by default')

      t.equal(result, 'bar')
      t.end()
    })
  })
}

module.exports.mGetSync = function (test) {
  test('prepare for sync mGet test', function (t) {
    db.batch([
        { type: 'put', key: 'sm1', value: 'bar1' }
      , { type: 'put', key: 'sm2', value: 'bar2' }
      , { type: 'put', key: 'sm3', value: 'bar3' }
    ], function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test sync mGetting event', function (t) {
    var getting = 0
    db.once('mGetting', function(keys, options){
      t.deepEqual(keys, ['sm1', 'sm3'])
      ++getting
    })
    t.deepEqual(db.mGet(['sm1','sm3']), [{key:'sm1', value:'bar1'}, {key:'sm3', value:'bar3'}])
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked mGetting event(EVENT_DONE)', function (t) {
    var getting = 0
    db.once('mGetting', function(keys, options){
      t.deepEqual(keys, ['sm1', 'sm3'])
      ++getting
      this.result = {
        state: EVENT_DONE,
        result: [{key:'sm1', value:'hbar1'}, {key:'sm3', value:'hbar3'}]
      }
    })
    t.deepEqual(db.mGet(['sm1','sm3']), [{key:'sm1', value:'hbar1'}, {key:'sm3', value:'hbar3'}])
    t.equal(getting, 1)
    t.end()
  })
  test('test sync hooked mGetting event(EVENT_STOPPED)', function (t) {
    var getting = 0
    db.once('mGetting', function(keys, options){
      t.deepEqual(keys, ['sm1', 'sm3'])
      ++getting
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    t.throws(db.mGet.bind(db, ['sm1','sm3']), {
      name:'HookedEventError',
      message : 'event stopped by listener'
      }
    )
    t.equal(getting, 1)
    t.end()
  })
  test('test sync mGet event', function (t) {
    var get = 0
    db.once('mGet', function(keys, result, options){
      t.deepEqual(keys, ['sm1', 'sm3'])
      t.deepEqual(result, [{key:'sm1', value:'bar1'}, {key:'sm3', value:'bar3'}])
      ++get
    })
    t.deepEqual(db.mGet(['sm1', 'sm3']),[{key:'sm1', value:'bar1'}, {key:'sm3', value:'bar3'}])
    t.equal(get, 1)
    t.end()
  })
}

module.exports.mGet = function (test) {
  test('prepare for mGet event test', function (t) {
    db.batch([
        { type: 'put', key: 'm1', value: 'bar1' }
      , { type: 'put', key: 'm2', value: 'bar2' }
      , { type: 'put', key: 'm3', value: 'bar3' }
    ], function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test mGetting event', function (t) {
    var done = 0
    db.once('mGetting', function(keys, options){
      ++done
      t.deepEqual(keys, ['m1', 'm3'])
    })
    db.mGet(['m1','m3'], function (err, result) {
      t.error(err)
      t.deepEqual(result, [{key:'m1', value:'bar1'}, {key:'m3', value:'bar3'}])
      t.equal(done,1)
      t.end()
    })
  })
  test('test hooked mGetting event(EVENT_DONE)', function (t) {
    var getting = 0
    db.once('mGetting', function(keys, options){
      t.deepEqual(keys, ['m1', 'm3'])
      ++getting
      this.result = {
        state: EVENT_DONE,
        result: [{key:'m1', value:'hbar1'}, {key:'m3', value:'hbar3'}]
      }
    })
    db.mGet(['m1','m3'], function (err, result) {
      t.error(err)
      t.equal(getting, 1)

      t.deepEqual(result, [{key:'m1', value:'hbar1'}, {key:'m3', value:'hbar3'}])
      t.end()
    })
  })
  test('test hooked mGetting event(EVENT_STOPPED)', function (t) {
    var getting = 0
    db.once('mGetting', function(keys, options){
      t.deepEqual(keys, ['m1', 'm3'])
      ++getting
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    db.mGet(['m1','m3'], function (err, result) {
      t.ok(err, 'should err')
      t.type(err, HookedEventError)
      t.equal(getting, 1)
      t.end()
    })
  })
  test('test mGet event', function (t) {
    var done = 0
    db.once('mGet', function(keys, result, options){
      ++done
      t.deepEqual(keys, ['m1', 'm3'])
      t.deepEqual(result, [{key:'m1', value:'bar1'}, {key:'m3', value:'bar3'}])
    })
    db.mGet(['m1','m3'], function (err, result) {
      t.error(err)
      t.equal(done,1)
      t.deepEqual(result, [{key:'m1', value:'bar1'}, {key:'m3', value:'bar3'}])
      t.end()
    })
  })
}

module.exports.del = function (test) {
  test('prepare for delete event test', function (t) {
    db.batch([
        { type: 'put', key: 'd1', value: 'bar1' }
      , { type: 'put', key: 'd2', value: 'bar2' }
      , { type: 'put', key: 'd3', value: 'bar3' }
      , { type: 'put', key: 'd4', value: 'bar4' }
    ], function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test deleting event', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      ++done
      t.deepEqual(key, 'd1')
    })
    db.del('d1', function (err, result) {
      t.error(err)
      t.ok(result, 'del')
      t.equal(done,1)
      t.end()
    })
  })
  test('test hooked deleting event(EVENT_DONE)', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      t.deepEqual(key, 'd2')
      ++done
      this.result = {
        state: EVENT_DONE,
        result: 123
      }
    })
    db.del('d2', function (err, result) {
      t.error(err)
      t.equal(done, 1)

      t.equal(result, 123)
      t.end()
    })
  })
  test('test hooked deleting event(EVENT_STOPPED)', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      t.equal(key, 'd2')
      ++done
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    db.del('d2', function (err, result) {
      t.ok(err, 'should err')
      t.type(err, HookedEventError)
      t.equal(done, 1)
      t.end()
    })
  })
  test('test delete event', function (t) {
    var done = 0
    db.once('delete', function(key, result, options){
      ++done
      t.equal(key, 'd2')
      t.ok(result, 'del')
    })
    db.del('d2', function (err, result) {
      t.error(err)
      t.equal(done,1)
      t.ok(result, 'del')
      t.end()
    })
  })
}

module.exports.delSync = function (test) {
  test('prepare for delete event test sync', function (t) {
    db.batch([
        { type: 'put', key: 'd1', value: 'bar1' }
      , { type: 'put', key: 'd2', value: 'bar2' }
      , { type: 'put', key: 'd3', value: 'bar3' }
      , { type: 'put', key: 'd4', value: 'bar4' }
    ], function (err) {
      t.error(err)
      t.end()
    })
  })

  test('test sync deleting event', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      ++done
      t.deepEqual(key, 'd1')
    })
    t.ok(db.del('d1'), 'del')
    t.equal(done,1)
    t.end()
  })
  test('test sync hooked deleting event(EVENT_DONE)', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      t.deepEqual(key, 'd2')
      ++done
      this.result = {
        state: EVENT_DONE,
        result: 123
      }
    })
    t.ok(db.del('d2'), 'del d2')
    t.equal(done, 1)
    t.end()
  })
  test('test sync hooked deleting event(EVENT_STOPPED)', function (t) {
    var done = 0
    db.once('deleting', function(key, options){
      t.equal(key, 'd2')
      ++done
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    t.throws(db.del.bind(db, 'd2'), {
        name:'HookedEventError'
      , message : 'event stopped by listener'
    })
    t.equal(done, 1)
    t.end()
  })
  test('test sync delete event', function (t) {
    var done = 0
    db.once('delete', function(key, result, options){
      ++done
      t.equal(key, 'd2')
      t.ok(result, 'del')
    })
    t.ok(db.del('d2'), 'del d2')
    t.equal(done,1)
    t.end()
  })
}

module.exports.batch = function (test) {
  var ops = [
      { type: 'put', key: 'd1', value: 'bar1' }
    , { type: 'put', key: 'd2', value: 'bar2' }
    , { type: 'put', key: 'd3', value: 'bar3' }
    , { type: 'put', key: 'd4', value: 'bar4' }
  ]

  test('test batching event', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      ++done
      t.deepEqual(key, ops)
    })
    db.batch(ops, function (err, result) {
      t.error(err)
      t.equal(done,1)
      t.ok(result, 'batch')
      t.end()
    })
  })
  test('test hooked batching event(EVENT_DONE)', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      t.deepEqual(key, ops)
      ++done
      this.result = {
        state: EVENT_DONE,
        result: 123
      }
    })
    db.batch(ops, function (err, result) {
      t.error(err)
      t.equal(done, 1)

      t.equal(result, 123)
      t.end()
    })
  })
  test('test hooked batching event(EVENT_STOPPED)', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      t.equal(key, ops)
      ++done
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    db.batch(ops, function (err, result) {
      t.ok(err, 'should err')
      t.type(err, HookedEventError)
      t.equal(done, 1)
      t.end()
    })
  })
  test('test batch event', function (t) {
    var done = 0
    db.once('batch', function(key, result, options){
      ++done
      t.equal(key, ops)
      t.ok(result, 'batch')
    })
    db.batch(ops, function (err, result) {
      t.error(err)
      t.equal(done,1)
      t.end()
    })
  })
}

module.exports.batchSync = function (test) {
  var ops = [
      { type: 'put', key: 'd1', value: 'bar1' }
    , { type: 'put', key: 'd2', value: 'bar2' }
    , { type: 'put', key: 'd3', value: 'bar3' }
    , { type: 'put', key: 'd4', value: 'bar4' }
  ]

  test('test sync batching event', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      ++done
      t.deepEqual(key, ops)
    })
    t.ok(db.batch(ops), 'batch')
    t.equal(done,1)
    t.end()
  })
  test('test sync hooked batching event(EVENT_DONE)', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      t.deepEqual(key, ops)
      ++done
      this.result = {
        state: EVENT_DONE,
        result: 123
      }
    })
    t.equal(db.batch(ops), 123)
    t.equal(done, 1)
    t.end()
  })
  test('test sync hooked batching event(EVENT_STOPPED)', function (t) {
    var done = 0
    db.once('batching', function(key, options){
      t.equal(key, ops)
      ++done
      this.stopped = true
      this.result = {
        state: EVENT_STOPPED,
      }
    })
    t.throws(db.batch.bind(db, ops), {
      name:'HookedEventError'
    , message : 'event stopped by listener'
    })
    t.equal(done, 1)
    t.end()
  })
  test('test sync batch event', function (t) {
    var done = 0
    db.once('batch', function(key, result, options){
      ++done
      t.equal(key, ops)
      t.ok(result, 'batch')
    })
    t.ok(db.batch(ops), 'batch')
    t.equal(done,1)
    t.end()
  })
}

module.exports.close = function (NoSqlDatabase, test, testCommon) {
  test('test database close event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("closed", function(){
      t.notOk(db.isOpen())
      t.notOk(db.opened)
    })
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
}

module.exports.tearDown = function (test, testCommon) {
  test('tearDown', function (t) {
    db.close(testCommon.tearDown.bind(null, t))
  })
}

module.exports.all = function (NoSqlDatabase, test, testCommon) {
  module.exports.setUp(NoSqlDatabase, test, testCommon)
  module.exports.args(NoSqlDatabase, test, testCommon)
  module.exports.open(NoSqlDatabase, test, testCommon)
  module.exports.get(test)
  module.exports.mGet(test)
  module.exports.put(test)
  module.exports.del(test)
  module.exports.batch(test)
  module.exports.close(NoSqlDatabase, test, testCommon)
  if (NoSqlDatabase.prototype._openSync)
    module.exports.openSync(NoSqlDatabase, test, testCommon)
  if (NoSqlDatabase.prototype._getSync)
    module.exports.getSync(test)
  if (NoSqlDatabase.prototype._mGetSync)
    module.exports.mGetSync(test)
  if (NoSqlDatabase.prototype._putSync)
    module.exports.putSync(test)
  if (NoSqlDatabase.prototype._delSync)
    module.exports.delSync(test)
  if (NoSqlDatabase.prototype._batchSync)
    module.exports.batchSync(test)
  if (NoSqlDatabase.prototype._closeSync) {
    delete NoSqlDatabase.prototype._close
    module.exports.close(NoSqlDatabase, test, testCommon)
  }
  module.exports.tearDown(test, testCommon)
}
