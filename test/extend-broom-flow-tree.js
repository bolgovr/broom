var Broom = require('../lib/broom.js').broom;
var assert = require('assert');
describe("#extending", function () {
  var handler, securityHandler;
  beforeEach(function (done) {
    handler = new Broom({
      'fileName': 'index.js',
      'dependenciesName': 'deps',
      'entryName': 'onStart'
    });
    handler.setRootPath(__dirname);
    handler.scan('./fixtures/modulesRoot', done);
  });

  beforeEach(function (done) {
    securityHandler = new Broom({
      'fileName': 'index.js',
      'dependenciesName': 'deps',
      'entryName': 'onStart'
    });
    securityHandler.setRootPath(__dirname);
    securityHandler.scan('./fixtures/extendBy', done);
  });
  it('it should extend main flow with security function', function (done) {
    assert.equal(handler.extend(securityHandler), true);
    handler.testTree(function (err) {
      assert.equal(err, null);
      assert.ok(handler.flowTree['/security']);
      done();
    });
    done();
  });
  it('security function should work ok with other modules', function (done) {
    handler.extend(securityHandler);
    var rootArg = {'test': 1};
    handler.setRootArgs(rootArg);
    handler.run(function (err, results) {
      assert.equal(results['/security'], true);
      done();
    });

  });
});
