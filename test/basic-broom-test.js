var Broom = require('../lib/broom.js').broom;
var assert = require('assert');
describe("#basic", function () {
  var handler;
  beforeEach(function (done) {
    handler = new Broom({
      'fileName': 'index.js',
      'dependenciesName': 'deps',
      'entryName': 'onStart'
    });
    handler.setRootPath(__dirname);
    handler.scan('./fixtures/modulesRoot', done);
  });

  it('it should contain directory structure', function (done) {
    assert.ok(handler.flowTree['/blogActions']);
    assert.ok(handler.flowTree['/getUser']);
    assert.ok(handler.flowTree['/saveUser']);
    assert.ok(handler.flowTree['/blogActions/setPageView']);
    assert.ok(handler.flowTree['/blogActions/sendStats']);
    done();
  });
  it('it should run and return results to a final callback', function (done) {
    var rootArg = {'test': 1};
    handler.setRootArgs(rootArg);
    handler.run(function (err, results) {
      assert.equal(err, null);
      assert.equal(results['/blogActions'].statsSended, true);
      assert.equal(rootArg.test, 2);
      done();
    });
  });
  it('should handle concurrent requests without messing agruments', function (done) {
    for (var i = 0; i < 10; i++) {
      (function (arg) {
        var rootArg = {'test': arg, 'random': Math.random()};
        handler.setRootArgs(rootArg);
        handler.run(function (err, results) {
          assert.equal(rootArg.test, arg + 1);
          assert.equal(results['/'].random, rootArg.random);
          if (arg === 9) {
            done();
          }
        });
      }(i));
    }
  });
});
describe('#scanning', function () {
  it("should not return error", function (done) {
    var handler = new Broom();
    handler.setRootPath(__dirname);
    handler.scan('./fixtures/modulesRoot', function (err, result) {
      assert.equal(false, err instanceof Error);
      done();
    });
  });
});
