const tap                  = require('tap')
    , sinon                = require('sinon')
    , testCommon           = require('./testCommon')
    , eventable            = require('events-ex/eventable')
    , FakeDB               = eventable(require('./fake-nosql'))


function factory (location) {
  return new FakeDB(location)
}

require('./abstract/event-test').all(factory, tap.test, testCommon)
