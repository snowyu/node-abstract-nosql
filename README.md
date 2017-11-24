### Abstract NoSQL Database [![Build Status](https://secure.travis-ci.org/snowyu/abstract-nosql.png?branch=master)](http://travis-ci.org/snowyu/abstract-nosql)

[![NPM](https://nodei.co/npm/abstract-nosql.png?downloads=true&downloadRank=true)](https://nodei.co/npm/abstract-nosql/)
[![NPM](https://nodei.co/npm-dl/abstract-nosql.png?months=6&height=3)](https://nodei.co/npm/abstract-nosql/)


Abstract-nosql package is modified from abstract-leveldown to enhance the synchronous methods supports for development a node nosql database quickly and using easily. And it make abstract-nosql modularization become possible.

[abstract-nosql](https://github.com/snowyu/abstract-nosql) database can be extended its capabilities by adding different feature
addin. and you(database developer) almost have nothing to do, can have these features. The database user can be free to decide whether to add this feature.

* [nosql-stream](https://github.com/snowyu/node-nosql-stream): streamable ability. you need implement the [AbstractIterator](https://github.com/snowyu/node-abstract-iterator).
* [nosql-encoding](https://github.com/snowyu/node-nosql-encoding): key/value encoding ability.
* [events-ex](https://github.com/snowyu/events-ex.js): hooked eventable ability.

abstract-nosql Interface is neutral. There is no bias neither synchronous bias nor asynchronous bias. So that more people choose according to their own manner. For myself, I am not very concerned about the performance of javascript, I am more concerned about the efficiency of its development, as well as through functional programming (functions, closures such a simple concept) extend out of the rich and wonderful world. I still can not help but to think about performance issues. Asynchronous itself produces a small gap, because javascript reason this gap is magnified.

just saying that the asynchronous and synchronous consideration, if a function is only 1% of the opportunity to visit the IO, most of the time (99%) are in memory access. I want to different considerations, have different choices. And this decision is unlikely that done by the interface instead.

Synchronous operation converts into asynchronous operation is easy, and almost no performance loss, in turn, may not. Conversion are many ways, setImmediate is not the best, but it is the simplest one.
ES6 generator or [node-fibers](https://github.com/laverdet/node-fibers) could be a better way. the coroutine/fiber is lighter and more efficient than thread.

The setImmediate package could be extended to use different implementation(setImmediate, nextTick, ES6 generator, node-fiber) in different environment.
So the simulated asynchronous uses this way, if you do not implement the asynchronous methods.


## AbstractError Classes

see [abstract-error](https://github.com/snowyu/abstract-error.js)

## Eventable Ability

make it event-able so easy, install it first:

    npm install events-ex

add the eventable ability to a database:

```coffee
eventable = require 'events-ex/eventable'
MyDB = eventable require '...' # derived from AbstractNoSQL
```
Now the following events added(before and after events):

* open events: opening, opened/open/ready
* close events: closing, closed/close
* get events: getting, get
* getBuffer events: gettingBuffer, getBuffer
* mGet events: mGetting, mGet
* put events: putting, put
* del events: deleting, delete
* batch events: batching, batch

**NOTE:** the async callback will be executed after event.

and you can choose which ones are added via this way:

```coffee
eventable = require 'events-ex/eventable'
MyDB = eventable MyDB,
  include: ['open', 'close'] # only include 'open' and 'close' events
```

or:

```coffee
eventable = require 'events-ex/eventable'
MyDB = require '...'
MyDB = eventable MyDB,
  # only include 'open' and 'close' events
  exclude: ['mGet', 'getBuffer', 'put', 'get', 'del', 'batch']
```

usage:

```coffee
MyDB = eventable MyDB
mydb = new MyDB(location)
mydb.once 'opening', ->
  console.log 'db is opening.'
mydb.on 'ready', ->
  console.log 'db is opened.'
mydb.open()

```
hooked events usage:

```js
var eventable         = require 'events-ex/eventable'
var consts            = require('events-ex/consts')
var EVENT_DONE        = consts.DONE
var EVENT_STOPPED     = consts.STOPPED
var MyDB              = eventable(require('...'))

mydb = new MyDB(location)

mydb.cache = {
  'cached_foo': 'bar'
}
mydb.on 'getting', (key, options)->
  if (key === 'stoppedKey') {
    return {
      state: EVENT_STOPPED,
      result: 'halted via stoppedKey found.'
    }
  } else if (this.cache.hasOwnProperty(key))
    return {
      state: EVENT_DONE,
      // this is as get result.
      result: this.cache[key]
    }

console.log(mydb.get('cached_foo');
//print 'bar'

mydb.get('stoppedKey');
//throw HookedEventError: 'halted via stoppedKey found.'
```

## Streamable Ability

Once implements the [AbstractIterator](https://github.com/snowyu/node-abstract-iterator):

* `AbstractIterator._nextSync()` or `AbstractIterator._next()`.
* `AbstractIterator._endSync()` or `AbstractIterator._end()`.

the db should be the streamable.

But, you should install the [nosql-stream](https://github.com/snowyu/node-nosql-stream) package first.

    npm install nosql-stream

```js
var streamable = require('nosql-stream')
var LevelDB = streamable(require('nosql-leveldb'))
```

see [nosql-stream](https://github.com/snowyu/node-nosql-stream) for more details

## Encoding-able Ability

[nosql-encoding](https://github.com/snowyu/node-nosql-encoding) add the encoding
ability to the abstract-nosql database.

    npm install nosql-encoding


add the encoding ability to a database:

```js
var encodingable = require 'nosql-encoding'
var MyDB = encodingable(require('...')) # derived from AbstractNoSQL
```
you can use the encoding ability now:

```js
var db = MyDB('location')
// that's all.
db.open({keyEncoding: 'text', valueEncoding: 'json'})
```

see [nosql-encoding](https://github.com/snowyu/node-nosql-encoding) for more details

## Extensible API

Remember that each of these methods, if you implement them, will receive exactly the number and order of arguments described. Optional arguments will be converted to sensible defaults.

### AbstractNoSql(location)

## Sync Methods

### AbstractNoSql#`_isExistsSync`(key, options)

this is an optional method for performance.

### AbstractNoSql#`_mGetSync`(keys, options)

this is an optional method for performance.

__arguments__

* keys *(array)*: the keys array to get.
* options *(object)*: the options for get.

__return__

* array: [key1, value1, key2, value2, ...]

### AbstractNoSql#`_openSync`(options)
### AbstractNoSql#`_getSync`(key, options)
### AbstractNoSql#`_putSync`(key, value, options)
### AbstractNoSql#`_delSync`(key, options)
### AbstractNoSql#`_batchSync`(array, options)


## Async Methods

### AbstractNoSql#`_isExists`(key, options, callback)

this is an optional method for performance.

### AbstractNoSql#`_mGet`(keys, options, callback)

this is an optional method for performance.

__arguments__

* keys *(array)*: the keys array to get.
* options *(object)*: the options for get.
* callback *(function)*: the callback function
  * function(err, items)
    * items: [key1, value1, key2, value2, ...]

### AbstractNoSql#`_open`(options, callback)
### AbstractNoSql#`_close`(callback)
### AbstractNoSql#`_get`(key, options, callback)
### AbstractNoSql#`_put`(key, value, options, callback)
### AbstractNoSql#`_del`(key, options, callback)
### AbstractNoSql#`_batch`(array, options, callback)

If `batch()` is called without argument or with only an options object then it should return a `Batch` object with chainable methods. Otherwise it will invoke a classic batch operation.

the batch should be rename to transact more accurate.

<code>batch()</code> can be used for very fast bulk-write operations (both *put* and *delete*). The `array` argument should contain a list of operations to be executed sequentially, although as a whole they are performed as an atomic operation inside LevelDB. Each operation is contained in an object having the following properties: `type`, `key`, `value`, where the *type* is either `'put'` or `'del'`. In the case of `'del'` the `'value'` property is ignored. Any entries with a `'key'` of `null` or `undefined` will cause an error to be returned on the `callback` and any `'type': 'put'` entry with a `'value'` of `null` or `undefined` will return an error.

```js
var ops = [
    { type: 'del', key: 'father' }
  , { type: 'put', key: 'name', value: 'Yuri Irsenovich Kim' }
  , { type: 'put', key: 'dob', value: '16 February 1941' }
  , { type: 'put', key: 'spouse', value: 'Kim Young-sook' }
  , { type: 'put', key: 'occupation', value: 'Clown' }
]

db.batch(ops, function (err) {
  if (err) return console.log('Ooops!', err)
  console.log('Great success dear leader!')
})
```

### AbstractNoSql#`_chainedBatch`()

By default an `batch()` operation without argument returns a blank `AbstractChainedBatch` object. The prototype is available on the main exports for you to extend. If you want to implement chainable batch operations then you should extend the `AbstractChaindBatch` and return your object in the `_chainedBatch()` method.

### AbstractNoSql#`_approximateSize`(start, end, callback)

### AbstractNoSql#IteratorClass

You can override the `IteratorClass` to your Iterator.
After override this, it is not necessary to implement the `"_iterator()"` method.

### AbstractNoSql#`_iterator`(options)

By default an `iterator()` operation returns a blank `AbstractIterator` object. The prototype is available on the main exports for you to extend. If you want to implement iterator operations then you should extend the `AbstractIterator` and return your object in the `_iterator(options)` method.

`AbstractIterator` implements the basic state management found in LevelDOWN. It keeps track of when a `next()` is in progress and when an `end()` has been called so it doesn't allow concurrent `next()` calls, it does it allow `end()` while a `next()` is in progress and it doesn't allow either `next()` or `end()` after `end()` has been called.

__arguments__

* options *(obeject)*: optional object with the following options:
  * `'gt'` (greater than), `'gte'` (greater than or equal) define the lower bound of the range to be streamed. Only records where the key is greater than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.
  * `'lt'` (less than), `'lte'` (less than or equal) define the higher bound of the range to be streamed. Only key/value pairs where the key is less than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.
  * `'reverse'` *(boolean, default: `false`)*: a boolean, set true and the stream output will be reversed. Beware that due to the way LevelDB works, a reverse seek will be slower than a forward seek.
  * `'keys'` *(boolean, default: `true`)*: whether contain keys.
  * `'values'` *(boolean, default: `true`)*: whether contain values.
  * `'limit'` *(number, default: `-1`)*: limit the number of results collected by this stream. This number represents a *maximum* number of results and may not be reached if you get to the end of the data first. A value of `-1` means there is no limit. When `reverse=true` the highest keys will be returned instead of the lowest keys.
  * `'fillCache'` *(boolean, default: `false`)*: wheather LevelDB's LRU-cache should be filled with data read.


### AbstractChainedBatch

Provided with the current instance of `AbstractNoSql` by default.

### AbstractChainedBatch#`_put`(key, value)
### AbstractChainedBatch#`_del`(key)
### AbstractChainedBatch#`_clear`()
### AbstractChainedBatch#`_write`(options, callback)

## Example

A simplistic in-memory LevelDOWN replacement

use sync methods will be very simple:

the coffee-script implementation is more natural:

```coffee
inherits = require('inherits-ex')
AbstractNoSql = require('abstract-nosql')

class FakeNoSqlDatabase
  inherits FakeNoSqlDatabase, AbstractNoSql
  _openSync: (options)-> @_store = {}
  _putSync: (key, value, options)->
    key = '%' + key # safety, to avoid key='__proto__'-type skullduggery
    @_store[key] = value
    true
  _getSync: (key, options)->
    result = @_store['%' + key]
    throw new Error('NotFound') if result is undefined
    result
  _delSync: (key, options)->delete @_store['%' + key]
  #the _isExistsSync is optional:
  _isExistsSync: (key, options)->@_store.hasOwnProperty('%' + key)
```
the js implementation:

```js
var inherits = require('inherits-ex')
  , AbstractNoSql = require('abstract-nosql')

// constructor, passes through the 'location' argument to the AbstractNoSql constructor
function FakeNoSqlDatabase (location) {
  AbstractNoSql.call(this, location)
}

// our new prototype inherits from AbstractNoSql
inherits(FakeNoSqlDatabase, AbstractNoSql)

// implement some methods

FakeNoSqlDatabase.prototype._openSync = function (options) {
  this._store = {}
  return true
}

FakeNoSqlDatabase.prototype._putSync = function (key, value, options) {
  key = '%' + key // safety, to avoid key='__proto__'-type skullduggery
  this._store[key] = value
  return true
}

//the isExists is an optional method:
FakeNoSqlDatabase.prototype._isExistsSync = function (key, options) {
  return this._store.hasOwnProperty('%' + key)
}

FakeNoSqlDatabase.prototype._getSync = function (key, options) {
  var value = this._store['%' + key]
  if (value === undefined) {
    // 'NotFound' error, consistent with LevelDOWN API
    throw new Error('NotFound')
  }
  return value
}

FakeNoSqlDatabase.prototype._delSync = function (key, options) {
  delete this._store['%' + key]
  return true
}

//use it directly

var db = new FakeNoSqlDatabase()

//sync:
db.put('foo', 'bar')
var result = db.get('foo')

//async:
db.put('foo', 'bar', function (err) {
  if (err) throw err
  db.get('foo', function (err, value) {
    if (err) throw err
    console.log('Got foo =', value)
    db.isExists('foo', function(err, isExists){
      if (err) throw err
      console.log('isExists foo =', isExists)
    })
  })
})

//stream:

db.readStream().on('data', function(data){
})

// Or use it in LevelUP

var levelup = require('levelup')

var db = levelup('/who/cares/', {
  // the 'db' option replaces LevelDOWN
  db: function (location) { return new FakeNoSqlDatabase(location) }
})

//async:
db.put('foo', 'bar', function (err) {
  if (err) throw err
  db.get('foo', function (err, value) {
    if (err) throw err
    console.log('Got foo =', value)
    db.isExists('foo', function(err, isExists){
      if (err) throw err
      console.log('isExists foo =', isExists)
    })
  })
})

//sync:
db.put('foo', 'bar')
console.log(db.get('foo'))
console.log(db.isExists('foo'))
```

use async methods(no sync supports):


```js
var util = require('util')
  , AbstractNoSql = require('./').AbstractNoSql

// constructor, passes through the 'location' argument to the AbstractNoSql constructor
function FakeNoSqlDatabase (location) {
  AbstractNoSql.call(this, location)
}

// our new prototype inherits from AbstractNoSql
util.inherits(FakeNoSqlDatabase, AbstractNoSql)

// implement some methods

FakeNoSqlDatabase.prototype._open = function (options, callback) {
  // initialise a memory storage object
  this._store = {}
  // optional use of nextTick to be a nice async citizen
  process.nextTick(function () { callback(null, this) }.bind(this))
}

FakeNoSqlDatabase.prototype._put = function (key, value, options, callback) {
  key = '_' + key // safety, to avoid key='__proto__'-type skullduggery
  this._store[key] = value
  process.nextTick(callback)
}

//the isExists is an optional method:
FakeNoSqlDatabase.prototype._isExists = function (key, options, callback) {
  var value = this._store.hasOwnProperty('_' + key)
  process.nextTick(function () {
    callback(null, value)
  })
}

FakeNoSqlDatabase.prototype._get = function (key, options, callback) {
  var value = this._store['_' + key]
  if (value === undefined) {
    // 'NotFound' error, consistent with LevelDOWN API
    return process.nextTick(function () { callback(new Error('NotFound')) })
  }
  process.nextTick(function () {
    callback(null, value)
  })
}

FakeNoSqlDatabase.prototype._del = function (key, options, callback) {
  delete this._store['_' + key]
  process.nextTick(callback)
}

// now use it in LevelUP

var levelup = require('levelup')

var db = levelup('/who/cares/', {
  // the 'db' option replaces LevelDOWN
  db: function (location) { return new FakeNoSqlDatabase(location) }
})

db.put('foo', 'bar', function (err) {
  if (err) throw err
  db.get('foo', function (err, value) {
    if (err) throw err
    console.log('Got foo =', value)
  })
})
```

See [nosql-memdb](https://github.com/snowyu/node-nosql-memdb/) if you are looking for a complete in-memory replacement for AbstractNoSql database.

## Changes(diference from abstract-leveldown)

### v2.1.x

* **<broken change>**: separate event-able ability from AbstractNoSql
+ add the eventable to open, close, put, get, mGet, del, batch methods
  * can hook the 'putting', 'getting, 'mGetting', 'deleting' events.

### v2.x.x

* the modularization(feature plugin) with abstract-nosql
  * [nosql-encoding](https://github.com/snowyu/node-nosql-encoding)
  * [nosql-stream](https://github.com/snowyu/node-nosql-stream)
* Let the user decide whether to use these features.
* (`broken changes`) remove the streamable feature from buildin. this is a plugin now.
* (`broken changes`) defaults to disable asBuffer option.
  * pls use the `getBuffer` method to get as buffer.


### V1.x.x

+ Can add the encoding key/value ability via two ways:
  * see the [nosql-encoding](https://github.com/snowyu/node-nosql-encoding) package.
  * see the [encoding-iterator](https://github.com/snowyu/node-encoding-iterator) package.
+ getBuffer/getBufferSync(key, destBuffer, options) optional method.
  * the key's value will be put into the destBuffer if destBuffer is not null.
  * the options.offset added, write to the destBuffer at offset position. offset defaults to 0.
  * the value will be truncated if the destBuffer.length is less than value's.
  * return the byte size of value.
  * the will use the get/getSync to simulate if no `_getBuffer` implemented.
- Remove the AbstractIterator to [abstract-iterator](https://github.com/snowyu/node-abstract-iterator) package
+ Add the stream ability
  * You should install [nosql-stream](https://github.com/snowyu/node-nosql-stream) package first to use this feature.
+ Add the AbstractError and error code supports.
* DB constructor allows no location.
* Add IteratorClass supports.
+ Add synchronous methods supports.
  * Add the synchronous methods support now. You can implement the synchronous methods only.
  * The asynchronous methods will be simulated via these synchronous methods. If you wanna
  * support the asynchronous methods only, just do not implement these synchronous methods.
  * But if you wanna support the synchronous only, you should override the asynchronous methods to disable it.
+ Add isExists/isExistsSync optional method to test key whether exists.
  * it will use the `_get`/`_getSync` method if no `_isExists` or `_isExistsSync` implemented
  * iExist/iExistSync is the alias of iExists/iExistsSync.
+ the AbstractNoSQL class supports events now.
  * emit `'open'` and `'ready'` event after the database is opened.
  * emit `'closed'` event after the database is closed.
+ Add isOpen()/opened to test the database whether opened.
+ Add mGetSync()/mGet() multi get keys method for the range(Array) option of the Iterator
  * it will use the `_get`/`_getSync` method if no `_mGet` or `_mGetSync` implemented.
  * Note: mGet/mGetSync return the array of object: [{key:key,value:value}, ...]
    * But the `_mGet`/`_mGetSync` return the plain array: [key1, value1, key2, value2, ...]
    + keys *(bool, default true)* option to return keys or not
      * return the values array if keys is false
    + raiseError *(bool, default true)* option to raise or ignore error
      * some elements will be undefined for the value error if keys is false
+ Add Iterator.nextSync
  * note: nextSync return the object: {key:key, value:value}, return false if ending.
    * But the `_nextSync` return the array: [key, value]


<a name="contributing"></a>
Contributing
------------

Abstract LevelDOWN is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/rvagg/node-levelup/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

Abstract LevelDOWN/NoSQL is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Riceball LEE</th><td><a href="https://github.com/snowyu">GitHub/snowyu</a></td><td>&nbsp;</td></tr>
<tr><th align="left">Rod Vagg</th><td><a href="https://github.com/rvagg">GitHub/rvagg</a></td><td><a href="http://twitter.com/rvagg">Twitter/@rvagg</a></td></tr>
<tr><th align="left">John Chesley</th><td><a href="https://github.com/chesles/">GitHub/chesles</a></td><td><a href="http://twitter.com/chesles">Twitter/@chesles</a></td></tr>
<tr><th align="left">Jake Verbaten</th><td><a href="https://github.com/raynos">GitHub/raynos</a></td><td><a href="http://twitter.com/raynos2">Twitter/@raynos2</a></td></tr>
<tr><th align="left">Dominic Tarr</th><td><a href="https://github.com/dominictarr">GitHub/dominictarr</a></td><td><a href="http://twitter.com/dominictarr">Twitter/@dominictarr</a></td></tr>
<tr><th align="left">Max Ogden</th><td><a href="https://github.com/maxogden">GitHub/maxogden</a></td><td><a href="http://twitter.com/maxogden">Twitter/@maxogden</a></td></tr>
<tr><th align="left">Lars-Magnus Skog</th><td><a href="https://github.com/ralphtheninja">GitHub/ralphtheninja</a></td><td><a href="http://twitter.com/ralphtheninja">Twitter/@ralphtheninja</a></td></tr>
<tr><th align="left">David Björklund</th><td><a href="https://github.com/kesla">GitHub/kesla</a></td><td><a href="http://twitter.com/david_bjorklund">Twitter/@david_bjorklund</a></td></tr>
<tr><th align="left">Julian Gruber</th><td><a href="https://github.com/juliangruber">GitHub/juliangruber</a></td><td><a href="http://twitter.com/juliangruber">Twitter/@juliangruber</a></td></tr>
<tr><th align="left">Paolo Fragomeni</th><td><a href="https://github.com/hij1nx">GitHub/hij1nx</a></td><td><a href="http://twitter.com/hij1nx">Twitter/@hij1nx</a></td></tr>
<tr><th align="left">Anton Whalley</th><td><a href="https://github.com/No9">GitHub/No9</a></td><td><a href="https://twitter.com/antonwhalley">Twitter/@antonwhalley</a></td></tr>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="https://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
<tr><th align="left">Pedro Teixeira</th><td><a href="https://github.com/pgte">GitHub/pgte</a></td><td><a href="https://twitter.com/pgte">Twitter/@pgte</a></td></tr>
<tr><th align="left">James Halliday</th><td><a href="https://github.com/substack">GitHub/substack</a></td><td><a href="https://twitter.com/substack">Twitter/@substack</a></td></tr>
<tr><th align="left">Thomas Watson Steen</th><td><a href="https://github.com/watson">GitHub/watson</a></td><td><a href="https://twitter.com/wa7son">Twitter/@wa7son</a></td></tr>
</tbody></table>

<a name="license"></a>
License &amp; copyright
-------------------

Copyright (c) 2012-2015 Abstract LevelDown/NoSQL contributors (listed above).

Abstract NoSQL is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
