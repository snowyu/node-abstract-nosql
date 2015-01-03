module.exports.close = function (leveldown, test, testCommon) {
  test('test close()', function (t) {
    var db = leveldown(testCommon.location())

    db.open(function (err) {
      t.error(err)
      t.throws(
          db.close.bind(db, 'foo')
        , { name: 'InvalidArgumentError', message: 'close() requires callback function argument' }
        , 'non-callback close() throws'
      )

      db.close(function (err) {
        t.error(err)
        t.end()
      })
    })
  })
  test('test database close event', function (t) {
    var db = leveldown(testCommon.location())
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
