var Broom = require('../lib/broom.js').broom;
var assert = require('assert');
describe("#domain", function () {
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

  it('it should catch error if any function throw it', function (done) {
    handler.flowTree['/blogActions'].pop();
    handler.flowTree['/blogActions'].push(function (callback, data) {
      setTimeout(function () {
        callback(new Error('test'));
      }, 1);
    });
    handler.setRootArgs({'test': 1});
    var domain = handler.run(function () {});
    domain.on('error', function (error) {
      assert.equal(error.message, 'test');
      done();
      domain.dispose();
    });
  });

  it('it should catch error even if any function passes it as first arg', function (done) {
    handler.flowTree['/blogActions'].pop();
    handler.flowTree['/blogActions'].push(function (callback, data) {
      setTimeout(function () {
        callback(new Error('test'));
      }, 1);
    });
    handler.setRootArgs({'test': 1});
    var domain = handler.run(function () {});
    domain.on('error', function (error) {
      assert.equal(error.message, 'test');
      done();
      domain.dispose();
    });
  });
  it('all errors should pass to handlers .on(error) method', function (done) {
    handler.flowTree['/blogActions'].pop();
    handler.flowTree['/blogActions'].push(function (callback, data) {
      setTimeout(function () {
        callback(new Error('test'));
      }, 1);
    });
    handler.setRootArgs({'test': 1});
    handler.run(function () {});
    handler.on('error', function (error) {
      assert.equal(error.message, 'test');
      done();
    });
  });


});
