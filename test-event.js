const tap                  = require('tap')
    , sinon                = require('sinon')
    , testCommon           = require('./testCommon')
    , eventable            = require('events-ex/eventable')
    , FakeDB               = eventable(require('./fake-nosql'))


require('./abstract/event-test').all(FakeDB, tap.test, testCommon)
