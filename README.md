# Abstract NoSQL Database [![Build Status](https://secure.travis-ci.org/snowyu/node-abstract-nosql.png)](http://travis-ci.org/snowyu/node-abstract-nosql)

[![NPM](https://nodei.co/npm/abstract-nosql.png?downloads=true&downloadRank=true)](https://nodei.co/npm/abstract-nosql/)
[![NPM](https://nodei.co/npm-dl/abstract-nosql.png?months=6&height=3)](https://nodei.co/npm/abstract-nosql/)


Abstract-nosql package is modified from abstract-leveldown to enhance the synchronous methods supports for development a node nosql database quickly and using easily.

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

+ !TODO: Add the stream ability
+ Add the AbstractError and error code supports.
* DB constructor allows no location.
* Add IteratorClass supports.
+ Add synchronous methods supports.
  * Add the synchronous methods support now. You can implement the synchronous methods only.
  * The asynchronous methods will be simulated via these synchronous methods. If you wanna
  * support the asynchronous methods only, just do not implement these synchronous methods.
  * But if you wanna support the synchronous only, you should override the asynchronous methods to disable it.
+ isExists/isExistsSync optional method to test key whether exists.
  * it will use the \_get/\_getSync method if no \_isExists or \_isExistsSync implemented
+ the AbstractNoSQL class supports events now.
  * emit `'open'` and `'ready'` event after the database is opened.
  * emit `'closed'` event after the database is closed.
+ isOpen()/opened to test the database whether opened.

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
var OpenError       = createError("CanNotOpen", 51)
var CloseError      = createError("CanNotClose", 52)
var AlreadyEndError = createError("AlreadyEnd", 53)
```


## Example

A simplistic in-memory LevelDOWN replacement

use sync methods:


```js
var util = require('util')
  , AbstractLevelDOWN = require('./').AbstractLevelDOWN

// constructor, passes through the 'location' argument to the AbstractLevelDOWN constructor
function FakeLevelDOWN (location) {
  AbstractLevelDOWN.call(this, location)
}

// our new prototype inherits from AbstractLevelDOWN
util.inherits(FakeLevelDOWN, AbstractLevelDOWN)

// implement some methods

FakeLevelDOWN.prototype._openSync = function (options) {
  this._store = {}
  return true
}

FakeLevelDOWN.prototype._putSync = function (key, value, options) {
  key = '_' + key // safety, to avoid key='__proto__'-type skullduggery 
  this._store[key] = value
  return true
}

//the isExists is an optional method:
FakeLevelDOWN.prototype._isExistsSync = function (key, options) {
  return this._store.hasOwnProperty('_' + key)
}

FakeLevelDOWN.prototype._getSync = function (key, options) {
  var value = this._store['_' + key]
  if (value === undefined) {
    // 'NotFound' error, consistent with LevelDOWN API
    throw new Error('NotFound')
  }
  return value
}

FakeLevelDOWN.prototype._delSync = function (key, options) {
  delete this._store['_' + key]
  return true
}

//use it directly

var db = new FakeLevelDOWN()

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

// now use it in LevelUP

var levelup = require('levelup')

var db = levelup('/who/cares/', {
  // the 'db' option replaces LevelDOWN
  db: function (location) { return new FakeLevelDOWN(location) }
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
  , AbstractLevelDOWN = require('./').AbstractLevelDOWN

// constructor, passes through the 'location' argument to the AbstractLevelDOWN constructor
function FakeLevelDOWN (location) {
  AbstractLevelDOWN.call(this, location)
}

// our new prototype inherits from AbstractLevelDOWN
util.inherits(FakeLevelDOWN, AbstractLevelDOWN)

// implement some methods

FakeLevelDOWN.prototype._open = function (options, callback) {
  // initialise a memory storage object
  this._store = {}
  // optional use of nextTick to be a nice async citizen
  process.nextTick(function () { callback(null, this) }.bind(this))
}

FakeLevelDOWN.prototype._put = function (key, value, options, callback) {
  key = '_' + key // safety, to avoid key='__proto__'-type skullduggery 
  this._store[key] = value
  process.nextTick(callback)
}

//the isExists is an optional method:
FakeLevelDOWN.prototype._isExists = function (key, options, callback) {
  var value = this._store.hasOwnProperty('_' + key)
  process.nextTick(function () {
    callback(null, value)
  })
}

FakeLevelDOWN.prototype._get = function (key, options, callback) {
  var value = this._store['_' + key]
  if (value === undefined) {
    // 'NotFound' error, consistent with LevelDOWN API
    return process.nextTick(function () { callback(new Error('NotFound')) })
  }
  process.nextTick(function () {
    callback(null, value)
  })
}

FakeLevelDOWN.prototype._del = function (key, options, callback) {
  delete this._store['_' + key]
  process.nextTick(callback)
}

// now use it in LevelUP

var levelup = require('levelup')

var db = levelup('/who/cares/', {
  // the 'db' option replaces LevelDOWN
  db: function (location) { return new FakeLevelDOWN(location) }
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

## Streamable

Once implements the AbstractIterator.\_nextSync() or AbstractIterator.\_next().
the db should be the streamable.



### AbstractLevelDOWN.createReadStream
### AbstractLevelDOWN.readStream

create a readable stream.

* AbstractLevelDOWN.readStream([options])
* AbstractLevelDOWN.createReadStream

__arguments__

* options: the optional options object
  * `'next'` *()*: the raw key data to ensure the readStream return keys is greater than the key. See `'last'` event.
    * note: this will affect the range[gt/gte or lt/lte(reverse)] options.
  * `'filter'` *(function)*: to filter data in the stream
    * function filter(key, value) if return:
      *  0(.FILTER_INCLUDED): include this item
      *  1(.FILTER_EXCLUDED): exclude
      * -1(.FILTER_STOPPED): stop stream.
    * note: the filter function argument 'key' and 'value' may be null, it is affected via keys and values of this options.
  * `'range'` *(string or array)*: the keys are in the give range as the following format:
    * string:
      * "[a, b]": from a to b. a,b included. this means {gte='a', lte = 'b'}
      * "(a, b]": from a to b. b included, a excluded. this means {gt='a', lte='b'}
      * "[, b)"   from begining to b, begining included, b excluded. this means {lt='b'}
      * note: this will affect the gt/gte/lt/lte options.
    * array: the key list to get. eg, ['a', 'b', 'c']
  * `'match'` *(string)*: use the minmatch to match the specified keys.
    * Note: It will affect the range[gt/gte or lt/lte(reverse)] options maybe.
  * `'limit'` *(number, default: `-1`)*: limit the number of results collected by this stream. This number represents a *maximum* number of results and may not be reached if you get to the end of the data first. A value of `-1` means there is no limit. When `reverse=true` the highest keys will be returned instead of the lowest keys.

__return__

* object: the read stream object


#### Events

the standard `'data'`, '`error'`, `'end'` and `'close'` events are emitted.
the `'last'` event will be emitted when the last data arrived, the argument is the last raw key.
if no more data the last key is `undefined`.


## Extensible API

Remember that each of these methods, if you implement them, will receive exactly the number and order of arguments described. Optional arguments will be converted to sensible defaults.

### AbstractLevelDOWN(location)

## Sync Methods

### AbstractLevelDOWN#_openSync(options)
### AbstractLevelDOWN#_getSync(key, options)
### AbstractLevelDOWN#_isExistsSync(key, options)
### AbstractLevelDOWN#_putSync(key, value, options)
### AbstractLevelDOWN#_delSync(key, options)
### AbstractLevelDOWN#_batchSync(array, options)

## Async Methods

### AbstractLevelDOWN#_open(options, callback)
### AbstractLevelDOWN#_close(callback)
### AbstractLevelDOWN#_get(key, options, callback)
### AbstractLevelDOWN#_isExists(key, options, callback)
### AbstractLevelDOWN#_put(key, value, options, callback)
### AbstractLevelDOWN#_del(key, options, callback)
### AbstractLevelDOWN#_batch(array, options, callback)

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

### AbstractLevelDOWN#_chainedBatch()

By default an `batch()` operation without argument returns a blank `AbstractChainedBatch` object. The prototype is available on the main exports for you to extend. If you want to implement chainable batch operations then you should extend the `AbstractChaindBatch` and return your object in the `_chainedBatch()` method.

### AbstractLevelDOWN#_approximateSize(start, end, callback)

### AbstractLevelDOWN#IteratorClass

You can override the `IteratorClass` to your Iterator.
After override this, it is not necessary to implement the `"_iterator()"` method.

### AbstractLevelDOWN#_iterator(options)

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




### AbstractIterator(db)

Provided with the current instance of `AbstractLevelDOWN` by default.

### Sync methods:

#### AbstractIterator#_nextSync()

__return__
 
* if any result: return a two elements of array
  * the first is the key, the first element could be null or undefined if options.keys is false
  * the second is the value, the second element could be null or undefined if options.values is false
* or return false, if no any data yet.


#### AbstractIterator#_endSync()

### Async methods:

#### AbstractIterator#_next(callback)
#### AbstractIterator#_end(callback)

### AbstractChainedBatch

Provided with the current instance of `AbstractLevelDOWN` by default.

### AbstractChainedBatch#_put(key, value)
### AbstractChainedBatch#_del(key)
### AbstractChainedBatch#_clear()
### AbstractChainedBatch#_write(options, callback)

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
