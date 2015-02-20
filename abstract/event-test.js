var db
var consts            = require('events-ex/consts')
var EVENT_DONE        = consts.DONE
var EVENT_STOPPED     = consts.STOPPED
var Errors            = require("../abstract-error")
var ReadError         = Errors.ReadError


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
    db.once("ready", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
      t.end()
    })
    db.open()
    t.ok(db.isOpen())
    t.ok(db.opened)
  })
}

module.exports.open = function (NoSqlDatabase, test, testCommon) {
  test('test database open event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("open", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
      t.end()
    })
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
    })
  })

  test('test database ready event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("ready", function(){
      t.ok(db.isOpen())
      t.ok(db.opened)
      t.end()
    })
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
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
      t.end()
    })
    db.put('putfoo1', 'putbar1', function (err, result) {
      t.error(err)
    })
  })
  test('test put event', function (t) {
    db.once('put', function(key, value, result, options){
      t.equal(key, 'putfoo12')
      t.equal(value, 'putbar12')
      t.ok(result, 'put ok')
      t.deepEqual(options, {}, 'no options')
      t.end()
    })
    db.put('putfoo12', 'putbar12', function (err, result) {
      t.error(err)
    })
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
      name:'ReadError',
      message : 'Get is halted by listener'
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
      t.end()
    })
    db.get('foo', function (err, result) {
      t.error(err)
      t.ok(typeof result === 'string', 'should be string by default')

      t.equal(result, 'bar')
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
      t.type(err, ReadError)
      t.equal(getting, 1)
      t.end()
    })
  })
  test('test get event', function (t) {
    db.once('get', function(key, value, options){
      t.equal(key, 'foo')
      t.equal(value, 'bar')
      t.end()
    })
    db.get('foo', function (err, result) {
      console.log(err)
      t.error(err)
      t.ok(typeof result === 'string', 'should be string by default')

      t.equal(result, 'bar')
    })
  })
}

module.exports.close = function (NoSqlDatabase, test, testCommon) {
  test('test database close event', function (t) {
    var db = NoSqlDatabase(testCommon.location())
    db.once("closed", function(){
      t.notOk(db.isOpen())
      t.notOk(db.opened)
      t.end()
    })
    db.open(function (err) {
        t.error(err)
        t.ok(db.isOpen())
        t.ok(db.opened)
        db.close(function () {
          t.notOk(db.isOpen())
          t.notOk(db.opened)
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
  module.exports.openSync(NoSqlDatabase, test, testCommon)
  module.exports.open(NoSqlDatabase, test, testCommon)
  module.exports.get(test)
  module.exports.getSync(test)
  module.exports.put(test)
  module.exports.putSync(test)
  module.exports.close(NoSqlDatabase, test, testCommon)
  if (NoSqlDatabase.prototype._closeSync) {
    delete NoSqlDatabase.prototype._close
    module.exports.close(NoSqlDatabase, test, testCommon)
  }
  module.exports.tearDown(test, testCommon)
}
