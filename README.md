# Abstract NoSQL Database [![Build Status](https://secure.travis-ci.org/snowyu/node-abstract-nosql.png?branch=master)](http://travis-ci.org/snowyu/node-abstract-nosql)

[![NPM](https://nodei.co/npm/abstract-nosql.png?downloads=true&downloadRank=true)](https://nodei.co/npm/abstract-nosql/)
[![NPM](https://nodei.co/npm-dl/abstract-nosql.png?months=6&height=3)](https://nodei.co/npm/abstract-nosql/)


Abstract-nosql package is modified from abstract-leveldown to enhance the synchronous methods supports for development a node nosql database quickly and using easily.
And streamable ability is added to abstract-nosql.

abstract-nosql Interface is neutral. There is no bias neither synchronous bias nor asynchronous bias. So that more people choose according to their own manner. For myself, I am not very concerned about the performance of javascript, I am more concerned about the efficiency of its development, as well as through functional programming (functions, closures such a simple concept) extend out of the rich and wonderful world. I still can not help but to think about performance issues. Asynchronous itself produces a small gap, because javascript reason this gap is magnified.

just saying that the asynchronous and synchronous consideration, if a function is only 1% of the opportunity to visit the IO, most of the time (99%) are in memory access. I want to different considerations, have different choices. And this decision is unlikely that done by the interface instead.

Synchronous operation converts into asynchronous operation is easy, and almost no performance loss, in turn, may not. Conversion are many ways, setImmediate is not the best, but it is the simplest one.
ES6 generator or [node-fibers](https://github.com/laverdet/node-fibers) could be a better way. the coroutine/fiber is lighter and more efficient than thread.

The setImmediate package could be extended to use different implementation(setImmediate, nextTick, ES6 generator, node-fiber) in different environment.
So the simulated asynchronous uses this way, if you do not implement the asynchronous methods.

## About LevelDOWN

An abstract prototype matching the **[LevelDOWN](https://github.com/rvagg/node-leveldown/)** API. Useful for extending **[LevelUP](https://github.com/rvagg/node-levelup)** functionality by providing a replacement to LevelDOWN.

As of version 0.7, LevelUP allows you to pass a `'db'` option when you create a new instance. This will override the default LevelDOWN store with a LevelDOWN API compatible object.

**Abstract LevelDOWN** provides a simple, operational *noop* base prototype that's ready for extending. By default, all operations have sensible "noops" (operations that essentially do nothing). For example, simple operations such as `.open(callback)` and `.close(callback)` will simply invoke the callback (on a *next tick*). More complex operations  perform sensible actions, for example: `.get(key, callback)` will always return a `'NotFound'` `Error` on the callback.

You add functionality by implementing the underscore versions of the operations. For example, to implement a `put()` operation you add a `_put()` method to your object. Each of these underscore methods override the default *noop* operations and are always provided with **consistent arguments**, regardless of what is passed in by the client.

Additionally, all methods provide argument checking and sensible defaults for optional arguments. All bad-argument errors are compatible with LevelDOWN (they pass the LevelDOWN method arguments tests). For example, if you call `.open()` without a callback argument you'll get an `Error('open() requires a callback argument')`. Where optional arguments are involved, your underscore methods will receive sensible defaults. A `.get(key, callback)` will pass through to a `._get(key, options, callback)` where the `options` argument is an empty object.


## Changes(diference from abstract-leveldown)

+ getBuffer/getBufferSync(key, destBuffer, options) optional method.
  * the key's value will be put into the destBuffer if destBuffer is not null.
  * the options.offset added, write to the destBuffer at offset position. offset defaults to 0.
  * the value will be truncated if the destBuffer.length is less than value's.
  * return the byte size of value.
  * the will use the get/getSync to simulate if no \_getBuffer implemented.
- Remove the AbstractIterator to [abstract-iterator](https://github.com/snowyu/node-abstract-iterator) package
+ Add the stream ability
  * You should install [nosql-stream](https://github.com/snowyu/nosql-stream) package first to use this feature.
+ Add the AbstractError and error code supports.
* DB constructor allows no location.
* Add IteratorClass supports.
+ Add synchronous methods supports.
  * Add the synchronous methods support now. You can implement the synchronous methods only.
  * The asynchronous methods will be simulated via these synchronous methods. If you wanna
  * support the asynchronous methods only, just do not implement these synchronous methods.
  * But if you wanna support the synchronous only, you should override the asynchronous methods to disable it.
+ Add isExists/isExistsSync optional method to test key whether exists.
  * it will use the \_get/\_getSync method if no \_isExists or \_isExistsSync implemented
+ the AbstractNoSQL class supports events now.
  * emit `'open'` and `'ready'` event after the database is opened.
  * emit `'closed'` event after the database is closed.
+ Add isOpen()/opened to test the database whether opened.
+ Add mGetSync()/mGet() multi get keys method for the range(Array) option of the Iterator
  * it will use the \_get/\_getSync method if no \_mGet or \_mGetSync implemented.
  * Note: mGet/mGetSync return the array of object: [{key:key,value:value}, ...]
    * But the \_mGet/\_mGetSync return the plain array: [key1, value1, key2, value2, ...]
    + keys *(bool, default true)* option to return keys or not
      * return the values array if keys is false
    + raiseError *(bool, default true)* option to raise or ignore error
      * some elements will be undefined for the value error if keys is false
+ Add Iterator.nextSync
  * note: nextSync return the object: {key:key, value:value}, return false if ending.
    * But the \_nextSync return the array: [key, value]

## AbstractError Classes

see [abstract-object](https://github.com/snowyu/abstract-object)

### AbstractError

All Errors are derived from the AbstractError.

* Members:
  * message: the error message.
  * code: the error code.
* Methods:
  * ok()
  * notFound()
  * ....
  * invalidFormat()
* Class Methods:
  * AbstractError.isOk(err)
  * AbstractError.isNotFound(err)
  * ...

the error codes:

* AbstractError.Ok              = 0
* AbstractError.NotFound        = 1
* AbstractError.Corruption      = 2
* AbstractError.NotSupported    = 3
* AbstractError.InvalidArgument = 4
* AbstractError.IO              = 5
* AbstractError.NotOpened       = 6
* AbstractError.InvalidType     = 7
* AbstractError.InvalidFormat   = 8


### Other Error Classes:

* NotFoundError
* CorruptionError
* NotSupportedError/NotImplementedError
* InvalidArgumentError
* IOError
* NotOpenedError
* InvalidTypeError
* InvalidFormatError
* OpenError
* CloseError
* AlreadyEndError


```js
var OpenError       = createError("CanNotOpen", NotOpened)
var CloseError      = createError("CanNotClose", 52)
var AlreadyEndError = createError("AlreadyEnd", 53)
```



## Streamable

Once implements the AbstractIterator:

* AbstractIterator.\_nextSync() or AbstractIterator.\_next().
* AbstractIterator.\_endSync() or AbstractIterator.\_end().

the db should be the streamable.

But, you should install the [nosql-stream](https://github.com/snowyu/nosql-stream) package first.

    npm install nosql-stream

see [nosql-stream](https://snowyu/github.com/nosql-stream) for more details 


### AbstractNoSql.keyStream(createKeyStream)

create a readable stream.

the data item is key.

### AbstractNoSql.valueStream(createValueStream)

create a readable stream.

the data item is value.

### AbstractNoSql.readStream(createReadStream)

create a readable stream.

the data item is an object: {key:key, value:value}.

* AbstractNoSql.readStream([options])
* AbstractNoSql.createReadStream

__arguments__

* options: the optional options object(note: some options depend on the implementation of the Iterator)
  * `'next'`: the raw key data to ensure the readStream return keys is greater than the key. See `'last'` event.
    * note: this will affect the range[gt/gte or lt/lte(reverse)] options.
  * `'filter'` *(function)*: to filter data in the stream
    * function filter(key, value) if return:
      *  0(consts.FILTER_INCLUDED): include this item(default)
      *  1(consts.FILTER_EXCLUDED): exclude this item.
      * -1(consts.FILTER_STOPPED): stop stream.
    * note: the filter function argument 'key' and 'value' may be null, it is affected via keys and values of this options.
  * `'range'` *(string or array)*: the keys are in the give range as the following format:
    * string:
      * "[a, b]": from a to b. a,b included. this means {gte='a', lte = 'b'}
      * "(a, b]": from a to b. b included, a excluded. this means {gt='a', lte='b'}
      * "[, b)"   from begining to b, begining included, b excluded. this means {lt='b'}
      * note: this will affect the gt/gte/lt/lte options.
    * array: the key list to get. eg, ['a', 'b', 'c']
  * `'gt'` (greater than), `'gte'` (greater than or equal) define the lower bound of the range to be streamed. Only records where the key is greater than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.
  * `'lt'` (less than), `'lte'` (less than or equal) define the higher bound of the range to be streamed. Only key/value pairs where the key is less than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.
  * `'start', 'end'` legacy ranges - instead use `'gte', 'lte'`
  * `'match'` *(string)*: use the minmatch to match the specified keys.
    * Note: It will affect the range[gt/gte or lt/lte(reverse)] options maybe.
  * `'limit'` *(number, default: `-1`)*: limit the number of results collected by this stream. This number represents a *maximum* number of results and may not be reached if you get to the end of the data first. A value of `-1` means there is no limit. When `reverse=true` the highest keys will be returned instead of the lowest keys.
  * `'reverse'` *(boolean, default: `false`)*: a boolean, set true and the stream output will be reversed. 
  * `'keys'` *(boolean, default: `true`)*: whether the `'data'` event should contain keys. If set to `true` and `'values'` set to `false` then `'data'` events will simply be keys, rather than objects with a `'key'` property. Used internally by the `createKeyStream()` method.
  * `'values'` *(boolean, default: `true`)*: whether the `'data'` event should contain values. If set to `true` and `'keys'` set to `false` then `'data'` events will simply be values, rather than objects with a `'value'` property. Used internally by the `createValueStream()` method.

__return__

* object: the read stream object


#### Events

the standard `'data'`, '`error'`, `'end'` and `'close'` events are emitted.
the `'last'` event will be emitted when the last data arrived, the argument is the last raw key.
if no more data the last key is `undefined`.

```js
var MemDB = require("memdown-sync")


var db1 = MemDB("db1")
var db2 = MemDB("db2")

var ws = db1.writeStream()
var ws2 = db2.createWriteStream()

ws.on('error', function (err) {
  console.log('Oh my!', err)
})
ws.on('finish', function () {
  console.log('Write Stream finish')
  //read all data through the ReadStream
  db1.readStream().on('data', function (data) {
    console.log(data.key, '=', data.value)
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream closed')
  })
  .pipe(ws2) //copy Database db1 to db2:
})

ws.write({ key: 'name', value: 'Yuri Irsenovich Kim' })
ws.write({ key: 'dob', value: '16 February 1941' })
ws.write({ key: 'spouse', value: 'Kim Young-sook' })
ws.write({ key: 'occupation', value: 'Clown' })
ws.end()
```

filter usage:

```js
db.createReadStream({filter: function(key, value){
    if (/^hit/.test(key))
        return db.FILTER_INCLUDED
    else key == 'endStream'
        return db.FILTER_STOPPED
    else
        return db.FILTER_EXCLUDED
}})
  .on('data', function (data) {
    console.log(data.key, '=', data.value)
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream closed')
  })
```

next and last usage for paged data demo:

``` js

var callbackStream = require('callback-stream')

var lastKey = null;

function nextPage(db, aLastKey, aPageSize, cb) {
  var stream = db.readStream({next: aLastKey, limit: aPageSize})
  stream.on('last', function(aLastKey){
    lastKey = aLastKey;
  });

  stream.pipe(callbackStream(function(err, data){
    cb(data, lastKey)
  }))

}

var pageNo = 1;
dataCallback = function(data, lastKey) {
    console.log("page:", pageNo);
    console.log(data);
    ++pageNo;
    if (lastKey) {
      nextPage(db, lastKey, 10, dataCallback);
    }
    else
      console.log("no more data");
}
nextPage(db, lastKey, 10, dataCallback);
```

## Extensible API

Remember that each of these methods, if you implement them, will receive exactly the number and order of arguments described. Optional arguments will be converted to sensible defaults.

### AbstractNoSql(location)

## Sync Methods

### AbstractNoSql#_isExistsSync(key, options)

this is an optional method for performance.

### AbstractNoSql#_mGetSync(keys, options)

this is an optional method for performance.

__arguments__

* keys *(array)*: the keys array to get.
* options *(object)*: the options for get.

__return__

* array: [key1, value1, key2, value2, ...]

### AbstractNoSql#_openSync(options)
### AbstractNoSql#_getSync(key, options)
### AbstractNoSql#_putSync(key, value, options)
### AbstractNoSql#_delSync(key, options)
### AbstractNoSql#_batchSync(array, options)


## Async Methods

### AbstractNoSql#_isExists(key, options, callback)

this is an optional method for performance.

### AbstractNoSql#_mGet(keys, options, callback)

this is an optional method for performance.

__arguments__

* keys *(array)*: the keys array to get.
* options *(object)*: the options for get.
* callback *(function)*: the callback function
  * function(err, items)
    * items: [key1, value1, key2, value2, ...]

### AbstractNoSql#_open(options, callback)
### AbstractNoSql#_close(callback)
### AbstractNoSql#_get(key, options, callback)
### AbstractNoSql#_put(key, value, options, callback)
### AbstractNoSql#_del(key, options, callback)
### AbstractNoSql#_batch(array, options, callback)

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

### AbstractNoSql#_chainedBatch()

By default an `batch()` operation without argument returns a blank `AbstractChainedBatch` object. The prototype is available on the main exports for you to extend. If you want to implement chainable batch operations then you should extend the `AbstractChaindBatch` and return your object in the `_chainedBatch()` method.

### AbstractNoSql#_approximateSize(start, end, callback)

### AbstractNoSql#IteratorClass

You can override the `IteratorClass` to your Iterator.
After override this, it is not necessary to implement the `"_iterator()"` method.

### AbstractNoSql#_iterator(options)

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

### AbstractChainedBatch#_put(key, value)
### AbstractChainedBatch#_del(key)
### AbstractChainedBatch#_clear()
### AbstractChainedBatch#_write(options, callback)

## Example

A simplistic in-memory LevelDOWN replacement

use sync methods:


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

FakeNoSqlDatabase.prototype._openSync = function (options) {
  this._store = {}
  return true
}

FakeNoSqlDatabase.prototype._putSync = function (key, value, options) {
  key = '_' + key // safety, to avoid key='__proto__'-type skullduggery 
  this._store[key] = value
  return true
}

//the isExists is an optional method:
FakeNoSqlDatabase.prototype._isExistsSync = function (key, options) {
  return this._store.hasOwnProperty('_' + key)
}

FakeNoSqlDatabase.prototype._getSync = function (key, options) {
  var value = this._store['_' + key]
  if (value === undefined) {
    // 'NotFound' error, consistent with LevelDOWN API
    throw new Error('NotFound')
  }
  return value
}

FakeNoSqlDatabase.prototype._delSync = function (key, options) {
  delete this._store['_' + key]
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

See [MemDOWN](https://github.com/rvagg/memdown/) if you are looking for a complete in-memory replacement for LevelDOWN.


<a name="contributing"></a>
Contributing
------------

Abstract LevelDOWN is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/rvagg/node-levelup/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

Abstract LevelDOWN is only possible due to the excellent work of the following contributors:

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

Copyright (c) 2012-2014 Abstract LevelDOWN contributors (listed above).

Abstract LevelDOWN is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
