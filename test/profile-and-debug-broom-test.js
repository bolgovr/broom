var Broom = require('../lib/broom.js').broom;
var assert = require('assert');
describe("#debug features", function () {
  var handler;
  beforeEach(function (done) {
    handler = new Broom({
      'fileName': 'index.js',
      'dependenciesName': 'deps',
      'entryName': 'onStart'
    });
    handler.debug = true;
    handler.setRootPath(__dirname);
    handler.scan('./fixtures/modulesRoot', done);
  });

  it('should call all beforeeach and aftereach handlers', function (done) {
    var rootArg = {'test': 1};
    var date = Date.now();
    var afterEachCalled = false;
    handler.beforeEach.push(function (path, args) {
      return {'time': date};
    });
    handler.afterEach.push(function (path, results) {
      afterEachCalled = true;
      assert.equal(results[0].time, date);
    });
    handler.setRootArgs(rootArg);
    handler.run(function (err, results) {
      assert.equal(afterEachCalled, true);
      assert.equal(results['/blogActions'].statsSended, true);
      assert.equal(rootArg.test, 2);
      done();
    });
  });
});
