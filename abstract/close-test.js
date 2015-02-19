module.exports.close = function (NoSqlDatabase, test, testCommon) {
  test('test close()', function (t) {
    var db = NoSqlDatabase(testCommon.location())

    db.open(function (err) {
      t.error(err)
      t.doesNotThrow(
          db.close.bind(db, 'foo')
        , 'non-callback close()'
      )

      db.close(function (err) {
        t.error(err)
        t.end()
      })
    })
  })
}
